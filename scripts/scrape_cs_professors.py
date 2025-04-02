import requests
from bs4 import BeautifulSoup
import re
import csv
import time
from multiprocessing import Pool, cpu_count
from functools import lru_cache
from openai import OpenAI
import os
from typing import Optional
from dotenv import load_dotenv
import json

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
if not client.api_key:
    raise ValueError("Please set the OPENAI_API_KEY environment variable in your .env file")

# Quick test to ensure OpenAI endpoint is working
def test_openai_api():
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # using "4o-mini" as requested
            messages=[{
                "role": "system", "content": "You are a helpful assistant.",
                "role": "user", "content": "Say hello"
            }],
            max_tokens=20,
            temperature=0.1,
        )
        test_response = response.choices[0].message.content
        print("OpenAI endpoint test successful. Response:")
        print(test_response)
    except Exception as e:
        print("OpenAI endpoint test failed:", e)
        exit(1)

# Reference data for validation
cs_courses = [
    "CS 10100", "CS 15900", "CS 17600", "CS 17700", "CS 18000", "CS 18200",
    "CS 19000-IP1", "CS 19000-IP2", "CS 19300", "CS 19700", "CS 21100", "CS 23500",
    "CS 24000", "CS 24200", "CS 25000", "CS 25100", "CS 25200", "CS 25300",
    "CS 30700", "CS 31100", "CS 33400", "CS 34800", "CS 35100", "CS 35200",
    "CS 35400", "CS 35500", "CS 36100", "CS 37300", "CS 38003", "CS 38100",
    "CS 39000-ATA", "CS 40700", "CS 40800", "CS 41100", "CS 42200", "CS 42600",
    "CS 44000", "CS 44100", "CS 44800", "CS 47100", "CS 47500", "CS 48900",
    "CS 49000-IOS", "CS 49000-NSQ", "CS 49700"
]

departments_list = [
    "Agriculture", "Arts", "Business", "Education", "Engineering",
    "Health Sciences", "Liberal Arts", "Science", "Veterinary Medicine", "Computer Science"
]

majors_list = [
    "Computer Science", "Electrical Engineering", "Data Science", "Mathematics",
    "Information Technology", "Software Engineering", "Cybersecurity", "Biology",
    "Chemistry", "Physics", "Mechanical Engineering", "Civil Engineering",
    "Economics", "History", "Philosophy", "Psychology", "Sociology", "English", "Political Science"
]

KNOWN_RESEARCH_AREAS = [
    "Artificial Intelligence", "Machine Learning", "Natural Language Processing", 
    "Bioinformatics", "Computational Biology", "Computer Architecture", 
    "Computational Science", "Data Mining", "Distributed Systems", 
    "Graphics", "Visualization", "Geometric Modeling", "Human-Computer Interaction", 
    "Information Security", "Networking", "Operating Systems", 
    "Programming Languages", "Compilers", "Robotics", "Computer Vision", 
    "Software Engineering", "Theory of Computing", "Algorithms", "Quantum Computing"
]
KNOWN_PREFERRED_MAJORS = [
    "Computer Science", "Electrical Engineering", "Data Science", "Mathematics",
    "Information Technology", "Software Engineering", "Cybersecurity"
]

# Predefined dictionary mapping CS subdomains to their faculty listing URLs
subtopic_links = {
    "Artificial Intelligence, Machine Learning, and Natural Language Processing": "https://www.cs.purdue.edu/research/ai-machine-learning.html",
    "Bioinformatics and Computational Biology": "https://www.cs.purdue.edu/research/bioinformatics-computational-biology.html",
    "Computer Architecture": "https://www.cs.purdue.edu/research/computer-architecture.html",
    "Computational Science and Engineering": "https://www.cs.purdue.edu/research/computational-science-engineering.html",
    "Databases and Data Mining": "https://www.cs.purdue.edu/research/databases-data-mining.html",
    "Distributed Systems": "https://www.cs.purdue.edu/research/distributed-systems.html",
    "Graphics, Visualization, and Geometric Modeling": "https://www.cs.purdue.edu/research/graphics-visualization-geometric-modeling.html",
    "Human-Computer Interaction": "https://www.cs.purdue.edu/research/human-computer-interaction.html",
    "Information Security and Assurance": "https://www.cs.purdue.edu/research/information-security-assurance.html",
    "Networking and Operating Systems": "https://www.cs.purdue.edu/research/networking-operating-systems.html",
    "Programming Languages and Compilers": "https://www.cs.purdue.edu/research/programming-languages-compilers.html",
    "Robotics and Computer Vision": "https://www.cs.purdue.edu/research/robotics-computer-vision.html",
    "Software Engineering": "https://www.cs.purdue.edu/research/software-engineering.html",
    "Theory of Computing, Algorithms, and Quantum Computing": "https://www.cs.purdue.edu/research/theory-computing-algorithms-quantum.html"
}

# ----------------------------
# Data Cleaning Functions
# ----------------------------
def remove_artifacts(text):
    """
    Remove unwanted PDF or binary artifacts from the text.
    For example, remove strings that include "endobj" or "obj<</D".
    """
    # Remove typical PDF artifacts using regex.
    text = re.sub(r'>>?endobj.*?obj<</D.*?>>', '', text, flags=re.DOTALL)
    # Remove any lines containing "endobj" or "obj<</D"
    lines = text.splitlines()
    lines = [line for line in lines if "endobj" not in line.lower() and "obj<</d" not in line.lower()]
    return "\n".join(lines)

def clean_text(text):
    """Remove non-printable characters, artifacts, and extra whitespace."""
    text = ''.join(ch for ch in text if ch.isprintable())
    text = remove_artifacts(text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def clean_list(lst):
    """Clean each string in a list."""
    return [clean_text(item) for item in lst if clean_text(item)]

def simple_match_keywords(text, keywords):
    """Return a list of keywords (from keywords) found in text (case-insensitive)."""
    matches = []
    text_lower = text.lower()
    for kw in keywords:
        if kw.lower() in text_lower:
            matches.append(kw)
    return list(set(matches))

def lightweight_summarize(text, num_sentences=3):
    """
    Lightweight summarization that splits text into sentences and returns the first num_sentences.
    """
    sentences = re.split(r'(?<=[.!?])\s+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    if len(sentences) <= num_sentences:
        return text
    else:
        return " ".join(sentences[:num_sentences])

@lru_cache(maxsize=1000)
def cached_summarize(text: str, max_length: int = 250, min_length: int = 150) -> str:
    """
    Cached summarization using OpenAI's ChatCompletion API with model "4o-mini".
    This function uses the "4o-mini" model to generate a concise summary in 3-5 sentences.
    """
    if not text or len(text.split()) < 30:
        return text
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # using "4o-mini" as requested; ensure this model is available
            messages=[{
                "role": "system", "content": "You are a helpful assistant that creates concise, 3-5 sentence summaries of academic text.",
                "role": "user", "content": f"Please provide a concise summary in 3-5 sentences for the following text:\n\n{text}"
            }],
            max_tokens=150,
            temperature=0.1,
            top_p=0.9,
            presence_penalty=0.1,
            frequency_penalty=0.1
        )
        return clean_text(response.choices[0].message.content)
    except Exception as e:
        print(f"Summarization error: {e}")
        return text

# ----------------------------
# Helper Functions for Extraction
# ----------------------------
def get_soup(url):
    """Fetch URL content and return a BeautifulSoup object with base_url attribute."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        soup.base_url = url
        return soup
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def extract_professor_profile_links(soup):
    """
    From a faculty listing page, extract all professor profile links (those with '/people/faculty/').
    """
    links = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "/people/faculty/" in href:
            if not href.startswith("http"):
                href = "https://www.cs.purdue.edu" + href
            links.append(href)
    return list(set(links))

def get_professor_homepage_link(soup):
    """
    Look for a link to the professor's personal/home page (typically containing '/homes/').
    """
    for a in soup.find_all("a", href=True):
        if "/homes/" in a["href"]:
            href = a["href"]
            if not href.startswith("http"):
                href = "https://www.cs.purdue.edu" + href
            return href
    return None

def extract_details_from_page(soup):
    """
    Extract professor details from a page.
    Returns a dictionary with:
      name, email, department, classes_teaching, research_areas,
      preferred_majors, research_description (raw), academic_background (raw),
      currently_looking_for
    """
    details = {}
    full_text = clean_text(soup.get_text(separator=" ", strip=True))
    
    # Name
    header = soup.find(['h1', 'h2'])
    details["name"] = clean_text(header.get_text()) if header else "N/A"
    
    # Email
    emails = soup.find_all(string=re.compile(r'[\w\.-]+@[\w\.-]+'))
    details["email"] = clean_text(emails[0]) if emails else "N/A"
    
    # Department
    dept = "N/A"
    dept_tag = soup.find(string=re.compile(r'Department:', re.IGNORECASE))
    if dept_tag:
        parts = dept_tag.split("Department:")
        if len(parts) > 1:
            dept = clean_text(parts[1])
    else:
        if "cs.purdue.edu" in soup.base_url.lower():
            dept = "Computer Science"
    # currently hard coding computer science 
    # details["department"] = dept
    details["department"] = "Computer Science"
    
    # Classes Teaching
    classes = []
    classes_tag = soup.find(string=re.compile(r'(Courses|Classes|Teaching):', re.IGNORECASE))
    if classes_tag:
        parent = classes_tag.parent
        text = re.sub(r'(Courses|Classes|Teaching):', '', parent.get_text(separator=" ", strip=True), flags=re.IGNORECASE)
        classes = [clean_text(c) for c in re.split(r'[;,]', text) if c.strip()]
    if not classes:
        course_matches = re.findall(r'CS\s*\d{3,5}', full_text)
        classes = list(set(course_matches))
    details["classes_teaching"] = clean_list(classes)
    
    # Research Areas
    research_areas = []
    research_tag = soup.find(string=re.compile(r'(Research Interests|Research Areas):', re.IGNORECASE))
    if research_tag:
        parent = research_tag.parent
        text = re.sub(r'(Research Interests|Research Areas):', '', parent.get_text(separator=" ", strip=True), flags=re.IGNORECASE)
        research_areas = [clean_text(r) for r in re.split(r'[;,]', text) if r.strip()]
    if not research_areas:
        research_areas = simple_match_keywords(full_text, KNOWN_RESEARCH_AREAS)
    details["research_areas"] = clean_list(research_areas)
    
    # Preferred Majors
    preferred_majors = []
    majors_tag = soup.find(string=re.compile(r'Preferred Majors:', re.IGNORECASE))
    if majors_tag:
        parent = majors_tag.parent
        text = re.sub(r'Preferred Majors:', '', parent.get_text(separator=" ", strip=True), flags=re.IGNORECASE)
        preferred_majors = [clean_text(m) for m in re.split(r'[;,]', text) if m.strip()]
    if not preferred_majors:
        preferred_majors = simple_match_keywords(full_text, KNOWN_PREFERRED_MAJORS)
    details["preferred_majors"] = clean_list(preferred_majors)
    
    # Research Description – explicit extraction; fallback to paragraphs mentioning "research"
    research_desc = ""
    research_desc_tag = soup.find(string=re.compile(r'(Publications|Past Papers|Research Description):', re.IGNORECASE))
    if research_desc_tag:
        parent = research_desc_tag.parent
        research_desc = re.sub(r'(Publications|Past Papers|Research Description):', '', parent.get_text(separator=" ", strip=True), flags=re.IGNORECASE)
    if not research_desc:
        paragraphs = soup.find_all("p")
        candidate_texts = [clean_text(p.get_text(separator=" ", strip=True)) for p in paragraphs if "research" in p.get_text().lower()]
        if candidate_texts:
            research_desc = " ".join(candidate_texts[:3])
    details["research_description"] = clean_text(research_desc)
    
    # Academic Background – similar extraction
    academic_bg = ""
    edu_tag = soup.find(string=re.compile(r'(Education|Academic Background):', re.IGNORECASE))
    if edu_tag:
        parent = edu_tag.parent
        academic_bg = re.sub(r'(Education|Academic Background):', '', parent.get_text(separator=" ", strip=True), flags=re.IGNORECASE)
    details["academic_background"] = clean_text(academic_bg)
    
    # Currently Looking For
    looking_for = ""
    looking_tag = soup.find(string=re.compile(r'(seeking|looking for|accepting)\s+(undergraduate|grad|postgrad|researchers)', re.IGNORECASE))
    if looking_tag:
        looking_for = clean_text(looking_tag)
    details["currently_looking_for"] = looking_for if looking_for else "Not specified"
    
    return details

def merge_details(profile_details, home_details):
    """
    Merge details from the professor profile page and the home page.
    For list fields, merge uniquely. For string fields, use home page if available.
    """
    merged = {}
    keys = ["name", "email", "department", "classes_teaching", "research_areas",
            "preferred_majors", "research_description", "academic_background", "currently_looking_for"]
    for k in keys:
        val1 = profile_details.get(k, "")
        val2 = home_details.get(k, "")
        if isinstance(val1, list) or isinstance(val2, list):
            merged[k] = list(set(val1) | set(val2))
        else:
            merged[k] = val2 if (val2 and val2 != "N/A") else val1
    return merged

def extract_professor_info(soup, url):
    """Extract raw details from a professor page."""
    return extract_details_from_page(soup)

def validate_professor_details(prof, cs_courses):
    """
    Validate and match scraped categories against reference lists.
    - Department: if not in departments_list, set as "Unknown".
    - Classes Teaching: filter out courses not in cs_courses.
    - Research Areas: keep only those that exactly match (case-insensitive) KNOWN_RESEARCH_AREAS.
    - Preferred Majors: keep only those that match from majors_list.
    """
    # Validate department
    if not any(prof["department"].lower() == d.lower() for d in departments_list):
        prof["department"] = "Unknown"
    
    # Validate classes teaching
    prof["classes_teaching"] = [course for course in prof["classes_teaching"] if course in cs_courses]
    
    # Validate research areas
    prof["research_areas"] = [area for area in prof["research_areas"] if any(area.lower() == ref.lower() for ref in KNOWN_RESEARCH_AREAS)]
    
    # Validate preferred majors
    prof["preferred_majors"] = [major for major in prof["preferred_majors"] if any(major.lower() == ref.lower() for ref in majors_list)]
    
    return prof

def scrape_cs_professors():
    """
    For each CS subdomain (from subtopic_links), extract professor profile links.
    For each professor profile page:
      - Extract raw details.
      - Look for a link to the professor's home page; if found, extract its details.
      - Merge details.
    Returns a list of professor dictionaries.
    """
    all_professors = []
    for subdomain, sub_url in subtopic_links.items():
        print(f"Processing subdomain: {subdomain} at {sub_url}")
        sub_soup = get_soup(sub_url)
        if not sub_soup:
            continue
        prof_links = extract_professor_profile_links(sub_soup)
        print(f"Found {len(prof_links)} professor profile links in subdomain '{subdomain}'.")
        for prof_link in prof_links:
            print(f"Scraping professor profile: {prof_link}")
            profile_soup = get_soup(prof_link)
            if not profile_soup:
                continue
            profile_details = extract_details_from_page(profile_soup)
            print(f"Scraped profile details for: {profile_details.get('name', 'N/A')}")
            home_link = get_professor_homepage_link(profile_soup)
            home_details = {}
            if home_link:
                print(f"Found home page: {home_link}")
                home_soup = get_soup(home_link)
                if home_soup:
                    home_details = extract_details_from_page(home_soup)
                    print(f"Scraped home page details for: {home_details.get('name', 'N/A')}")
            merged_details = merge_details(profile_details, home_details)
            merged_details["profile_link"] = prof_link
            merged_details["cs_subdomain"] = subdomain
            all_professors.append(merged_details)
            print(f"Finished processing: {merged_details.get('name', 'N/A')} in subdomain: {subdomain}\n")
            time.sleep(1)
    return all_professors

def perform_summarization_on_professors(professors):
    """
    After scraping is complete, iterate over professor entries and summarize the research_description
    and academic_background fields using the cached OpenAI summarization function.
    """
    for prof in professors:
        raw_desc = prof.get("research_description", "")
        if raw_desc and len(raw_desc.split()) >= 30:
            prof["research_description"] = cached_summarize(raw_desc)
            print(f"Summarized research description for {prof.get('name', 'N/A')}")
        raw_bg = prof.get("academic_background", "")
        if raw_bg and len(raw_bg.split()) >= 30:
            prof["academic_background"] = cached_summarize(raw_bg)
            print(f"Summarized academic background for {prof.get('name', 'N/A')}")
    return professors

def save_to_csv(professors_data, filename='cs_professors_dataset.csv'):
    # Create data directory if it doesn't exist
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    # Save to CSV
    filepath = os.path.join(data_dir, filename)
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=professors_data[0].keys())
        writer.writeheader()
        writer.writerows(professors_data)
    
    print(f"Saved {len(professors_data)} professors to {filepath}")

def main():
    # Test the OpenAI endpoint before starting.
    print("Testing OpenAI endpoint with model '4o-mini'...")
    test_prompt = "Say hello."
    test_response = cached_summarize(test_prompt, max_length=20, min_length=10)
    print(f"Test response: {test_response}\n")
    
    print("Using manually defined CS courses for validation...")
    print(f"CS Courses: {cs_courses}\n")
    
    print("Starting comprehensive CS professor scraping (sequential)...")
    professors = scrape_cs_professors()
    print(f"Finished web scraping. Total professors scraped: {len(professors)}\n")
    
    print("Validating professor details against reference lists...")
    for idx, prof in enumerate(professors):
        professors[idx] = validate_professor_details(prof, cs_courses)
        print(f"Validated details for: {prof.get('name', 'N/A')}")
    print("Validation complete.\n")
    
    print("Starting summarization tasks for research description and academic background...")
    professors = perform_summarization_on_professors(professors)
    
    # Save the data to CSV
    save_to_csv(professors)
    print("CS professors dataset saved as scripts/data/cs_professors_dataset.csv.")

if __name__ == "__main__":
    main()
