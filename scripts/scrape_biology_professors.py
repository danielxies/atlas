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
            model="gpt-4o-mini",
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
KNOWN_RESEARCH_AREAS_BIO = [
    "Molecular Biology", "Cell Biology", "Genetics", "Microbiology", "Ecology",
    "Evolution", "Biochemistry", "Neurobiology", "Immunology", "Developmental Biology",
    "Plant Biology", "Animal Behavior", "Bioinformatics", "Systems Biology", "Structural Biology",
    "Environmental Biology", "Marine Biology", "Physiology", "Biophysics", "Computational Biology"
]

RESEARCH_TO_MAJORS = {
    "Molecular Biology": ["Molecular Biology", "Biochemistry", "Biotechnology"],
    "Cell Biology": ["Cell Biology", "Biomedical Engineering", "Biology"],
    "Genetics": ["Genetics", "Molecular Biology", "Biotechnology"],
    "Microbiology": ["Microbiology", "Biology", "Biotechnology"],
    "Ecology": ["Ecology", "Environmental Science", "Biology"],
    "Evolution": ["Evolutionary Biology", "Biology", "Genetics"],
    "Biochemistry": ["Biochemistry", "Molecular Biology", "Chemistry"],
    "Neurobiology": ["Neuroscience", "Biology", "Biomedical Engineering"],
    "Immunology": ["Immunology", "Biology", "Biomedical Engineering"],
    "Developmental Biology": ["Developmental Biology", "Biology", "Genetics"],
    "Plant Biology": ["Plant Science", "Biology"],
    "Animal Behavior": ["Zoology", "Biology"],
    "Bioinformatics": ["Bioinformatics", "Data Science", "Computer Science"],
    "Systems Biology": ["Systems Biology", "Biology", "Data Science"],
    "Structural Biology": ["Structural Biology", "Biochemistry", "Biophysics"],
    "Environmental Biology": ["Environmental Science", "Biology"],
    "Marine Biology": ["Marine Biology", "Biology"],
    "Physiology": ["Physiology", "Biology", "Biomedical Engineering"],
    "Biophysics": ["Biophysics", "Physics", "Biology"],
    "Computational Biology": ["Computational Biology", "Data Science", "Biology"]
}

# Predefined dictionary mapping Biology subdomains to their faculty listing URLs
SUBDOMAIN_LINKS = {
    "Biology Education": "https://www.bio.purdue.edu/bio-education/index.html",
    "Cell and Molecular Biology": "https://www.bio.purdue.edu/cell/index.html",
    "Ecology and Evolutionary Biology": "https://www.bio.purdue.edu/ecology/index.html",
    "Microbiology, Immunology & Infectious Disease": "https://www.bio.purdue.edu/microbiology/index.html",
    "Neuroscience and Physiology": "https://www.bio.purdue.edu/neuroscience/index.html",
    "Structural and Computational Biology and Biophysics": "https://www.bio.purdue.edu/structural/index.html"
}

# ----------------------------
# Data Cleaning Functions
# ----------------------------
def clean_text(text: str) -> str:
    """Remove non-printable characters and extra whitespace."""
    if not text:
        return ""
    text = ''.join(ch for ch in text if ch.isprintable())
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def clean_list(lst):
    """Clean each string in a list."""
    return [clean_text(item) for item in lst if clean_text(item)]

def simple_match_keywords(text: str, keywords) -> list:
    """Return all matches from 'keywords' that appear in 'text' (case-insensitive)."""
    text_lower = text.lower()
    found = []
    for kw in keywords:
        if kw.lower() in text_lower:
            found.append(kw)
    return list(set(found))

# ----------------------------
# Helper Functions for Extraction
# ----------------------------
def get_soup(url):
    """Fetch URL content and return a BeautifulSoup object."""
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
    """Extract all professor profile links from the main faculty page."""
    links = []
    for a in soup.find_all("a", href=True):
        if "/People/profile/" in a["href"]:
            href = a["href"]
            if not href.startswith("http"):
                href = "https://www.bio.purdue.edu" + href
            links.append(href)
    return list(set(links))

def extract_details_from_page(soup):
    """Extract professor details from a page."""
    details = {
        "name": "N/A",
        "email": "N/A",
        "department": "Biology",
        "classes_teaching": "N/A",
        "research_description": "",
        "research_areas": [],
        "preferred_majors": [],
        "currently_looking_for": "Not specified",
        "research_subdomain": "Not found"
    }
    
    full_text = clean_text(soup.get_text(separator=" ", strip=True))
    
    # Name
    header = soup.find(["h1", "h2"])
    if header:
        name_raw = clean_text(header.get_text())
        details["name"] = name_raw.title()
    
    # Email
    email_match = soup.find_all(string=re.compile(r'[\w\.-]+@[\w\.-]+'))
    if email_match:
        details["email"] = clean_text(email_match[0])
    
    # Research Description
    paragraphs = soup.find_all("p")
    research_paras = [p.get_text(separator=" ") for p in paragraphs if "research" in p.get_text().lower()]
    if research_paras:
        combined = " ".join(research_paras)
    else:
        combined = full_text
    details["research_description"] = clean_text(combined)
    
    # Research Areas
    found_areas = simple_match_keywords(full_text, KNOWN_RESEARCH_AREAS_BIO)
    found_areas = sorted(found_areas)[:3]  # Limit to 3
    details["research_areas"] = found_areas
    
    # Preferred Majors
    majors_block = soup.find(text=re.compile(r'Preferred\s+Majors:', re.IGNORECASE))
    if majors_block:
        parent = majors_block.parent
        text = re.sub(r'Preferred\s+Majors:', '', parent.get_text(separator=" ", strip=True), flags=re.IGNORECASE)
        pm = [clean_text(m) for m in re.split(r'[;,]', text) if m.strip()]
        details["preferred_majors"] = pm[:3]
    else:
        derived_majors = []
        for area in details["research_areas"]:
            if area in RESEARCH_TO_MAJORS:
                for m in RESEARCH_TO_MAJORS[area]:
                    if m not in derived_majors:
                        derived_majors.append(m)
        details["preferred_majors"] = derived_majors[:3]
    
    # Currently Looking For
    looking_tag = soup.find(text=re.compile(r'(seeking|looking for|accepting)\s+(students|researchers)', re.IGNORECASE))
    if looking_tag:
        details["currently_looking_for"] = clean_text(looking_tag)
    
    return details

def normalize_name_for_match(name: str) -> str:
    """Normalize a name by removing non-alphabetic characters and converting to lowercase."""
    # Remove any titles (Dr., Prof., etc.)
    name = re.sub(r'^(Dr\.|Prof\.|Professor)\s+', '', name, flags=re.IGNORECASE)
    # Remove any suffixes (Ph.D., etc.)
    name = re.sub(r'\s+(Ph\.D\.|M\.D\.|M\.S\.|B\.S\.).*$', '', name, flags=re.IGNORECASE)
    
    # Split the name into parts and handle comma-separated names
    parts = [part.strip() for part in name.split(',')]
    if len(parts) > 1:
        # If there's a comma, the format is "Last, First"
        last_name = parts[0]
        first_name = parts[1]
        # Flip the order to "First Last"
        name = f"{first_name} {last_name}"
    
    # Remove any non-alphabetic characters and convert to lowercase
    return re.sub(r'[^a-z]+', '', name.lower())

def assign_subdomains(professors):
    """Assign research subdomains to professors based on subdomain pages."""
    subdomain_map = {}
    
    for subdomain_name, url in SUBDOMAIN_LINKS.items():
        print(f"\nParsing subdomain page for {subdomain_name}: {url}")
        soup = get_soup(url)
        if not soup:
            print(f"Failed to fetch subdomain page: {url}")
            continue
        
        # Find the Research Area Members section
        title_li = soup.find("li", class_="title", string=re.compile(r"Research Area Members", re.IGNORECASE))
        if not title_li:
            print(f"Could not find 'Research Area Members' section on {url}")
            continue
        
        # Get all professor names in this subdomain
        current_li = title_li.find_next_sibling("li")
        professor_count = 0
        while current_li:
            if "title" in current_li.get("class", []):
                break
            a_tag = current_li.find("a", href=True)
            if a_tag:
                raw_name = clean_text(a_tag.get_text())
                print(raw_name)
                norm_name = normalize_name_for_match(raw_name)
                subdomain_map.setdefault(norm_name, []).append(subdomain_name)
                professor_count += 1
                print(f"Found professor: {raw_name} -> {norm_name}")
            current_li = current_li.find_next_sibling("li")
        print(f"Total professors found in {subdomain_name}: {professor_count}")
        time.sleep(1)
    
    # Assign research_subdomain to each professor
    print("\nAssigning subdomains to professors...")
    for prof in professors:
        norm_prof_name = normalize_name_for_match(prof["name"])
        if norm_prof_name in subdomain_map:
            unique_subs = set(subdomain_map[norm_prof_name])
            prof["research_subdomain"] = ", ".join(sorted(unique_subs))
            print(f"Assigned subdomains for {prof['name']} ({norm_prof_name}): {prof['research_subdomain']}")
        else:
            print(f"No subdomains found for {prof['name']} ({norm_prof_name})")
            prof["research_subdomain"] = "Not found"
    
    return professors

@lru_cache(maxsize=1000)
def cached_summarize(text: str, max_length: int = 250, min_length: int = 150) -> str:
    """Cached summarization using OpenAI's ChatCompletion API."""
    if not text or len(text.split()) < 30:
        return text
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
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

def perform_summarization_on_professors(professors):
    """Summarize research descriptions and academic backgrounds."""
    for prof in professors:
        raw_desc = prof.get("research_description", "")
        if raw_desc and len(raw_desc.split()) >= 30:
            prof["research_description"] = cached_summarize(raw_desc)
            print(f"Summarized research description for {prof.get('name', 'N/A')}")
    return professors

def scrape_biology_professors():
    """Main scraping function for biology professors."""
    all_professors = []
    
    # Get main faculty page
    main_url = "https://www.bio.purdue.edu/People/faculty/index.html"
    print(f"Scraping main faculty list at {main_url}...")
    main_soup = get_soup(main_url)
    if not main_soup:
        return []
    
    # Get all professor profile links
    prof_links = extract_professor_profile_links(main_soup)
    print(f"Found {len(prof_links)} professor profile links.")
    
    # Scrape each professor's details
    for link in prof_links:
        print(f"Scraping professor page: {link}")
        profile_soup = get_soup(link)
        if not profile_soup:
            continue
        details = extract_details_from_page(profile_soup)
        details["profile_link"] = link
        all_professors.append(details)
        time.sleep(1)
    
    return all_professors

def save_to_csv(professors_data, filename='biology_professors_dataset.csv'):
    """Save professor data to CSV file."""
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    filepath = os.path.join(data_dir, filename)
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=professors_data[0].keys())
        writer.writeheader()
        writer.writerows(professors_data)
    
    print(f"Saved {len(professors_data)} professors to {filepath}")

def classify_research_area(description: str) -> str:
    """Classify a research description into one of the known research areas using GPT-4o-mini."""
    if not description or len(description.split()) < 10:
        return "Not found"
    prompt = (
        f"Below is a research description. Choose exactly one research area from the following list: "
        f"{', '.join(KNOWN_RESEARCH_AREAS_BIO)}.\n\n"
        f"Research Description:\n{description}\n\n"
        "Your answer should be ONLY the exact name of one research area from the list."
    )
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a strict classification assistant."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=40,  # slightly increased token limit
            temperature=0.0,
        )
        area = response.choices[0].message.content.strip()
        print("Raw classification response:", area)  # For debugging
        
        # Remove quotes and extra whitespace
        area = area.strip(' "\'')
        
        # Check if any of the known research areas appear in the response (case-insensitive)
        for known in KNOWN_RESEARCH_AREAS_BIO:
            if known.lower() in area.lower():
                return known
        return "Not found"
    except Exception as e:
        print("Classification error:", e)
        return "Not found"



def assign_subdomains_via_classification(professors):
    """Assign research subdomains to each professor using a classification model."""
    print("\nAssigning research subdomains via classification...")
    for prof in professors:
        description = prof.get("research_description", "")
        classified_area = classify_research_area(description)
        prof["research_subdomain"] = classified_area
        print(f"Classified {prof.get('name', 'N/A')} as: {classified_area}")
    return professors

def run_biology_pipeline():
    """Run the full scraping, summarization, and classification pipeline."""
    print("Running full biology professor scraping pipeline...")
    
    professors = scrape_biology_professors()
    if not professors:
        print("No professors scraped. Exiting biology pipeline.")
        return []

    print("Summarizing research descriptions...")
    professors = perform_summarization_on_professors(professors)

    print("Classifying research subdomains...")
    professors = assign_subdomains_via_classification(professors)

    save_to_csv(professors)
    print("Biology professor data saved.")

    return professors

def main():
    # Test the OpenAI endpoint before starting
    print("Testing OpenAI endpoint with model '4o-mini'...")
    test_openai_api()
    
    print("Starting comprehensive Biology professor scraping...")
    professors = scrape_biology_professors()
    print(f"Finished web scraping. Total professors scraped: {len(professors)}\n")
    
    # Skip the original subdomain parsing
    # print("Assigning research subdomains...")
    # professors = assign_subdomains(professors)
    
    print("Starting summarization tasks for research descriptions...")
    professors = perform_summarization_on_professors(professors)
    
    print("Assigning research subdomains via classification...")
    professors = assign_subdomains_via_classification(professors)
    
    # Save the data to CSV with the new subdomains
    save_to_csv(professors)
    print("Biology professors dataset saved as scripts/data/biology_professors_dataset.csv.")

if __name__ == "__main__":
    main()
