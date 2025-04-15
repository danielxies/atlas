import os
import pandas as pd
from scrape_cs_professors import run_cs_pipeline
from scrape_biology_professors import run_biology_pipeline
from scrape_math_professors import run_math_pipeline
from supabase_upload import upload_to_supabase  # import the supabase upload function

def combine_professor_data():
    """
    Combine CS, Biology, and Math professor data CSV files into a master CSV file.
    Assumes that the following files exist in the local 'data' directory:
      - cs_professors_dataset.csv
      - biology_professors_dataset.csv
      - math_professors_dataset.csv
    Returns the combined DataFrame.
    """
    print("Starting to combine professor data...")

    # Use a data folder relative to this file.
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(data_dir, exist_ok=True)

    cs_file = os.path.join(data_dir, 'cs_professors_dataset.csv')
    bio_file = os.path.join(data_dir, 'biology_professors_dataset.csv')
    math_file = os.path.join(data_dir, 'math_professors_dataset.csv')
    master_file = os.path.join(data_dir, 'professors_dataset.csv')

    dfs = []

    # CS
    if os.path.exists(cs_file):
        print("Reading CS professors data...")
        cs_df = pd.read_csv(cs_file)
        print(f"Found {len(cs_df)} CS professors")
        dfs.append(cs_df)
    else:
        print("CS data file not found; skipping.")

    # Biology
    if os.path.exists(bio_file):
        print("Reading Biology professors data...")
        bio_df = pd.read_csv(bio_file)
        print(f"Found {len(bio_df)} Biology professors")
        dfs.append(bio_df)
    else:
        print("Biology data file not found; skipping.")

    # Math
    if os.path.exists(math_file):
        print("Reading Math professors data...")
        math_df = pd.read_csv(math_file)
        print(f"Found {len(math_df)} Math professors")
        dfs.append(math_df)
    else:
        print("Math data file not found; skipping.")

    if not dfs:
        print("No professor data to combine.")
        return None

    print("Combining professor data into one dataframe...")
    combined_df = pd.concat(dfs, ignore_index=True)
    print(f"Total professors in combined dataset: {len(combined_df)}")

    print(f"Saving combined data to {master_file}...")
    combined_df.to_csv(master_file, index=False)
    print("Successfully created master professors dataset!")
    
    return combined_df

def main():
    print("Starting professor data collection and combination process...")

    # Run individual pipelines.
    print("\nRunning CS professor pipeline...")
    cs_professors = run_cs_pipeline()
    if not cs_professors:
        print("No CS professor data scraped.")

    print("\nRunning Biology professor pipeline...")
    bio_professors = run_biology_pipeline()
    if not bio_professors:
        print("No Biology professor data scraped.")

    print("\nRunning Math professor pipeline...")
    math_professors = run_math_pipeline()
    if not math_professors:
        print("No Math professor data scraped.")

    # Combine CSV files from all pipelines.
    combined_df = combine_professor_data()
    if combined_df is None:
        print("No data combined, exiting.")
        return

    # Now, call the Supabase upload module to save the data into your Supabase vector db.
    print("\nUploading combined professor data to Supabase...")
    upload_to_supabase(combined_df)

    print("\nProcess completed successfully!")

if __name__ == "__main__":
    main()
