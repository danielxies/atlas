import os
import csv
import pandas as pd
from scrape_cs_professors import scrape_cs_professors
from scrape_biology_professors import scrape_biology_professors

def combine_professor_data():
    """Combine CS and Biology professor data into a master CSV file."""
    print("Starting to combine professor data...")
    
    # Get the data directory path
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    # Define file paths
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
    
    # Ensure consistent column names
    # CS uses 'cs_subdomain' while Biology uses 'research_subdomain'
    bio_df = bio_df.rename(columns={'research_subdomain': 'cs_subdomain'})
    
    # Combine the dataframes
    print("Combining professor data...")
    combined_df = pd.concat([cs_df, bio_df], ignore_index=True)
    print(f"Total professors in combined dataset: {len(combined_df)}")
    
    # Save to master CSV file
    print(f"Saving combined data to {master_file}...")
    combined_df.to_csv(master_file, index=False)
    print("Successfully created master professors dataset!")

def main():
    print("Starting professor data collection and combination process...")
    
    # Run CS scraper
    print("\nRunning CS professor scraper...")
    scrape_cs_professors()
    
    # Run Biology scraper
    print("\nRunning Biology professor scraper...")
    scrape_biology_professors()
    
    # Combine the data
    print("\nCombining professor data...")
    combine_professor_data()
    
    print("\nProcess completed successfully!")

if __name__ == "__main__":
    main() 