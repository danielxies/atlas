import os
import csv
import pandas as pd
from scrape_cs_professors import scrape_cs_professors, save_to_csv as save_cs_csv
from scrape_biology_professors import scrape_biology_professors, save_to_csv as save_bio_csv

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
    if 'research_subdomain' in bio_df.columns:
        bio_df = bio_df.rename(columns={'research_subdomain': 'cs_subdomain'})

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

    # Use a data folder relative to this file
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(data_dir, exist_ok=True)

    # Run CS scraper and save CSV if not already present
    print("\nRunning CS professor scraper...")
    cs_professors = scrape_cs_professors()
    if cs_professors:
        save_cs_csv(cs_professors, filename='cs_professors_dataset.csv')
    else:
        print("No CS professor data scraped.")

    # Run Biology scraper and save CSV if not already present
    print("\nRunning Biology professor scraper...")
    bio_professors = scrape_biology_professors()
    if bio_professors:
        save_bio_csv(bio_professors, filename='biology_professors_dataset.csv')
    else:
        print("No Biology professor data scraped.")

    # Combine the two CSV files into a master CSV
    print("\nCombining professor data...")
    combine_professor_data()
    
    print("\nProcess completed successfully!")

if __name__ == "__main__":
    main()
