import requests
from bs4 import BeautifulSoup
import re
import csv
import time
from functools import lru_cache
from openai import OpenAI
import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
if not client.api_key:
    raise ValueError("OPENAI_API_KEY is missing")

# Research area config
KNOWN_RESEARCH_AREAS_MATH = [
    "Algebra", "Analysis", "Topology", "Geometry", "Mathematical Physics",
    "Probability", "Statistics", "Number Theory", "Dynamical Systems",
    "Partial Differential Equations", "Applied Mathematics", "Combinatorics",
    "Computational Mathematics", "Mathematics Education", "Algebraic Geometry"]

RESEARCH_TO_MAJORS_MATH = {
    "Algebra": ["Mathematics", "Applied Math", "Theoretical Physics"],
    "Analysis": ["Mathematics", "Physics", "Engineering"],
    "Topology": ["Mathematics", "Geometry", "Theoretical CS"],
    "Geometry": ["Mathematics", "Architecture", "Computer Graphics"],
    "Mathematical Physics": ["Physics", "Mathematics", "Engineering"],
    "Probability": ["Statistics", "Data Science", "Finance"],
    "Statistics": ["Statistics", "Data Science", "Biostatistics"],
    "Number Theory": ["Mathematics", "Cryptography", "Computer Science"],
    "Dynamical Systems": ["Physics", "Mathematics", "Engineering"],
    "Partial Differential Equations": ["Engineering", "Mathematics", "Physics"],
    "Applied Mathematics": ["Mathematics", "Mechanical Engineering", "Finance"],
    "Combinatorics": ["Computer Science", "Mathematics", "Data Science"],
    "Computational Mathematics": ["Computer Science", "Mathematics", "Engineering"],
    "Mathematics Education": ["Education", "Mathematics", "STEM Education"],
    "Algebraic Geometry": ["Mathematics", "Theoretical Physics", "Algebra"],
    "Functional Analysis": ["Mathematics", "Quantum Mechanics", "Physics"],
    "Optimization": ["Operations Research", "Industrial Engineering", "CS"],
    "Logic": ["Philosophy", "Mathematics", "Theoretical CS"],
    "Category Theory": ["Mathematics", "Computer Science", "Logic"]
}

@lru_cache(maxsize=1000)
def cached_summarize(text: str) -> str:
    if not text or len(text.split()) < 30:
        return text
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that creates concise, 3-5 sentence summaries of academic text."},
                {"role": "user", "content": f"Your output will be featured on a website. You should talk about the professor in the third person and the summary should be describing the professor based on their research description provided. This is an example of a good description: Kiril Datchev is an Associate Professor in the Department of Mathematics at Purdue University, where he teaches courses in Linear Algebra and Functional Analysis. His research focuses on various aspects of mathematical physics, particularly in spectral theory and wave equations, with numerous publications co-authored with colleagues on topics such as low energy resolvent asymptotics, eigenvalue behavior, and semiclassical resonances. Datchev has supervised PhD students and has been involved in organizing academic conferences and programs related to microlocal analysis. His extensive publication record includes articles in prestigious journals, contributing significantly to the fields of analysis and partial differential equations. Summarize the following academic research text in 3-5 sentences. \n\n{text}"}
            ],
            max_tokens=150,
            temperature=0.1,
        )
        return clean_text(response.choices[0].message.content)
    except Exception as e:
        print(f"Summarization error: {e}")
        return text

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = "".join(ch for ch in text if ch.isprintable())
    return re.sub(r"\s+", " ", text).strip()

def get_soup(url: str) -> Optional[BeautifulSoup]:
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        soup.base_url = url
        return soup
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def classify_research_area(text: str) -> str:
    if not text or len(text.split()) < 10:
        return "Not found"
    prompt = f"""
Choose one research area from the following list using the text description provided:
{', '.join(KNOWN_RESEARCH_AREAS_MATH)}.

Research Description Text:
{text}

Only respond with one exact area from the list above.
"""
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-nano",
            messages=[
                {"role": "system", "content": "You are a research area classification assistant given a professor's research description."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=40,
            temperature=0.0,
        )
        area = clean_text(response.choices[0].message.content.strip(' "\''))
        for known in KNOWN_RESEARCH_AREAS_MATH:
            if known.lower() in area.lower():
                print(f"✅ Classified as: {known}")
                return known
        print(f"⚠️ Unrecognized area: {area}")
        return "Not found"
    except Exception as e:
        print(f"Classification error: {e}")
        return "Not found"

def get_personal_website_link(block: BeautifulSoup, email) -> str:
    anchors = block.find_all("a", href=True)
    for a in anchors:
        text = a.get_text(strip=True).lower()
        if "personal website" in text:
            href = a["href"]
            return href if href.startswith("http") else "https://www.math.purdue.edu" + href
    return str("https://www.math.purdue.edu/~" + email.split("@")[0] + "/")



def scrape_math_professors():
    base_url = "https://www.math.purdue.edu"
    faculty_url = f"{base_url}/people/faculty.html"
    soup = get_soup(faculty_url)
    if not soup:
        return []

    professors = []
    faculty_blocks = soup.select(".element.directory-row.faculty")

    print(f"\n🔎 Found {len(faculty_blocks)} faculty entries")

    for idx, block in enumerate(faculty_blocks):
        print("\n" + "="*60)
        print(f"📘 Scraping professor {idx + 1}/{len(faculty_blocks)}")

        info_div = block.select_one(".col-xs-12.col-sm-10.novcenter")
        if not info_div:
            print("⚠️ Missing info container.")
            continue

        name_tag = info_div.find("h2", class_="peopleDirectoryName")
        name = clean_text(name_tag.get_text()) if name_tag else "N/A"

        title_tag = info_div.find("strong")
        title = clean_text(title_tag.get_text()) if title_tag else "N/A"

        ul = info_div.find("ul")
        office = clean_text(ul.get_text()) if ul else "N/A"

        bg_div = info_div.find_all("div")
        background = ""
        for d in bg_div:
            text = clean_text(d.get_text())
            if "University" in text or re.search(r"\b\d{4}\b", text):
                background = text
                break

        email_tag = info_div.find("a", href=re.compile(r"mailto:"))
        email = clean_text(email_tag.get("href").replace("mailto:", "")) if email_tag else "N/A"

        profile_url = get_personal_website_link(block, email)

        print(f"🧑 {name}")
        print(f"📨 {email}")
        print(f"🔗 Profile: {profile_url}")

        profile_desc, personal_desc = "", ""
        if profile_url:
            profile_soup = get_soup(profile_url)
            if profile_soup:
                paragraphs = profile_soup.find_all("p")
                relevant = [clean_text(p.get_text()) for p in paragraphs if any(x in p.get_text().lower() for x in ["research", "interest", "publication"])]
                profile_desc = " ".join(relevant[:3]) if relevant else clean_text(profile_soup.get_text())
                if len(profile_desc.split()) > 30:
                    profile_desc = cached_summarize(name + ": " + profile_desc)

        final_desc = personal_desc or profile_desc

        print(f"🧠 Research text length: {len(final_desc.split())} words")

        # Classify
        area = classify_research_area(final_desc)
        majors = RESEARCH_TO_MAJORS_MATH.get(area, [])[:3]
        print(f"🔬 Area: {area}")
        print(f"🎓 Majors: {majors}")

        professor_data = {
            "name": name,
            "title": title,
            "department": "Mathematics",
            "classes_teaching": office,
            "email": email,
            "academic_background": background,
            "profile_link": profile_url,
            "research_description": final_desc,
            "research_areas": [area] if area != "Not found" else [],
            "preferred_majors": majors,
            "currently_looking_for": "Not specified",
            "research_subdomain": area
        }
        professors.append(professor_data)
        print(f"✅ Finished: {name}")
        time.sleep(0.3)

    print(f"\n✅ Scraped {len(professors)} Math professors.")
    return professors

def save_to_csv(professors_data, filename='math_professors_dataset.csv'):
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(data_dir, exist_ok=True)
    filepath = os.path.join(data_dir, filename)

    if not professors_data:
        print("⚠️ No data to save.")
        return

    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=professors_data[0].keys())
        writer.writeheader()
        writer.writerows(professors_data)
    print(f"💾 Saved {len(professors_data)} entries to {filepath}")

def run_math_pipeline():
    print("🚀 Running Math professor pipeline...")
    professors = scrape_math_professors()
    save_to_csv(professors)
    return professors

if __name__ == "__main__":
    run_math_pipeline()
