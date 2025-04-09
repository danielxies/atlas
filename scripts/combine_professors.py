import os
import csv
import pandas as pd
from scrape_cs_professors import run_cs_pipeline
from scrape_biology_professors import run_biology_pipeline

def combine_professor_data():
    """
    Combine CS and Biology professor data CSV files into a master CSV file.
    Assumes that the files 'cs_professors_dataset.csv' and 'biology_professors_dataset.csv'
    exist in the local 'data' directory.
    """
    print("Starting to combine professor data...")

    # Use a data folder relative to the current file
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(data_dir, exist_ok=True)

    cs_file = os.path.join(data_dir, 'cs_professors_dataset.csv')
    bio_file = os.path.join(data_dir, 'biology_professors_dataset.csv')
    master_file = os.path.join(data_dir, 'professors_dataset.csv')

    # Read both CSV files
    print("Reading CS professors data...")
    cs_df = pd.read_csv(cs_file)
    print(f"Found {len(cs_df)} CS professors")

    print("Reading Biology professors data...")
    bio_df = pd.read_csv(bio_file)
    print(f"Found {len(bio_df)} Biology professors")

    # Rename Biology column 'research_subdomain' to 'cs_subdomain' for consistency if necessary
    if 'cs_subdomain' in cs_df.columns:
        cs_df = cs_df.rename(columns={'cs_subdomain': 'research_subdomain'})

    # Combine the dataframes
    print("Combining professor data...")
    combined_df = pd.concat([cs_df, bio_df], ignore_index=True)
    print(f"Total professors in combined dataset: {len(combined_df)}")

    # Save the combined dataframe to CSV
    print(f"Saving combined data to {master_file}...")
    combined_df.to_csv(master_file, index=False)
    print("Successfully created master professors dataset!")

def main():
    print("Starting professor data collection and combination process...")

    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(data_dir, exist_ok=True)

    # Run CS pipeline
    print("\nRunning CS professor pipeline...")
    cs_professors = run_cs_pipeline()
    if not cs_professors:
        print("No CS professor data scraped.")

    # Run Bio pipeline
    print("\nRunning Biology professor pipeline...")
    from scrape_biology_professors import run_biology_pipeline
    bio_professors = run_biology_pipeline()
    if not bio_professors:
        print("No Biology professor data scraped.")

    # Combine into one dataset
    print("\nCombining professor data...")
    combine_professor_data()
    
    print("\nProcess completed successfully!")


if __name__ == "__main__":
    main()
