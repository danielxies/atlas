import os
import time
import pandas as pd
import openai
import ast
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    raise ValueError("Please set the OPENAI_API_KEY environment variable in your .env file")


def get_embedding(text: str) -> list:
    """
    Generate an embedding for the given text using OpenAI's text-embedding-ada-002 model.
    Returns a list of floats (the embedding vector) or an empty list if something goes wrong.
    """
    if not isinstance(text, str):
        return []
    if not text.strip():
        return []
    try:
        response = openai.embeddings.create(
            input=[text],
            model="text-embedding-ada-002"
        )
        return response.data[0].embedding
    except Exception as e:
        print("Error generating embedding:", e)
        return []


def convert_list_field(value):
    """
    Convert a CSV string representation of an array field into a proper Python list.
    If value is already a list, return it. If it's a string such as "[]" or a list literal,
    try to convert it using ast.literal_eval. If conversion fails, return an empty list.
    """
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        trimmed = value.strip()
        if trimmed == "" or trimmed == "[]" or trimmed.lower() == "nan":
            return []
        try:
            # Safely evaluate the string (e.g., "['x', 'y']") into a list
            evaluated = ast.literal_eval(trimmed)
            if isinstance(evaluated, list):
                return evaluated
            else:
                return [evaluated]
        except Exception as e:
            print(f"Warning: Could not convert field value '{value}' to list: {e}")
            return []
    return []


def upload_to_supabase(df: pd.DataFrame):
    supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not supabase_url or not supabase_key:
        raise ValueError("Missing Supabase credentials")

    supabase: Client = create_client(supabase_url, supabase_key)

    # Clear the current professors database.
    print("Clearing the current professors database...")
    # We use a filter that always evaluates to True (assuming id > 0 for all records)
    reset_response = supabase.rpc("reset_professors_table").execute()
    # Check based on returned data
    if reset_response.data is None:
        print("❌ Error resetting professors table.")
    else:
        print("Professors table cleared and IDs reset.")

    list_fields = ["classes_teaching", "research_areas", "preferred_majors"]

    for index, row in df.iterrows():
        record = row.to_dict()
        research_text = record.get("research_description", "")
        try:
            embedding = get_embedding(research_text)
            if not embedding or not isinstance(embedding, list):
                print(f"⚠️ Skipping {record.get('name')} due to missing embedding.")
                continue
            record["embedding"] = embedding
        except Exception as e:
            print(f"Embedding error for {record.get('name')}: {e}")
            continue

        # Convert list fields from string to actual Python lists.
        for key in list_fields:
            value = record.get(key, None)
            record[key] = convert_list_field(value)

        # Convert non-serializable values (e.g., NaN) to None.
        for key, value in record.items():
            if isinstance(value, float) and pd.isna(value):
                record[key] = None

        print(f"⬆️ Uploading {record.get('name')}...")
        try:
            response = supabase.table("professors").insert(record).execute()
            # Instead of checking for .error, we check if data was returned.
            if not response.data or (isinstance(response.data, list) and len(response.data) == 0):
                print(f"❌ Insert failed for {record.get('name')}: {response}")
            else:
                print(f"✅ Inserted: {record.get('name')}")
        except Exception as e:
            print(f"❌ Upload error for {record.get('name')}: {e}")
        time.sleep(0.3)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Upload professors dataset to Supabase")
    parser.add_argument(
        "--csv",
        type=str,
        default="data/professors_dataset.csv",
        help="Path to the CSV file containing combined professor data"
    )
    args = parser.parse_args()

    if not os.path.exists(args.csv):
        print(f"❌ File not found: {args.csv}")
    else:
        df = pd.read_csv(args.csv)
        upload_to_supabase(df)
