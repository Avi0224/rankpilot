import pandas as pd
import os
import argparse
import logging
from normalize import normalize_quota, normalize_category, normalize_gender, clean_institute_name, clean_branch_name

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def process_josaa_data(input_file, output_dir, year):
    logger.info(f"Processing JoSAA data from {input_file} for year {year}")
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Load data
    try:
        df = pd.read_csv(input_file)
    except Exception as e:
        logger.error(f"Failed to load CSV: {e}")
        return

    # Expected JoSAA Columns: 
    # Institute, Academic Program Name, Quota, Seat Type, Gender, Opening Rank, Closing Rank
    # Mapping for column names if they vary
    column_map = {
        'Institute': 'college_name',
        'Academic Program Name': 'branch_raw',
        'Quota': 'quota_raw',
        'Seat Type': 'category_raw',
        'Gender': 'gender_raw',
        'Opening Rank': 'opening_rank',
        'Closing Rank': 'closing_rank'
    }
    
    # Check for missing columns
    for col in column_map.keys():
        if col not in df.columns:
            logger.warning(f"Column '{col}' not found in input. Trying to guess...")
            # Basic fuzzy matching or manual intervention might be needed here

    df = df.rename(columns=column_map)

    # 1. Normalize and Clean
    logger.info("Normalizing data...")
    df['college_name'] = df['college_name'].apply(clean_institute_name)
    df['branch_name'] = df['branch_raw'].apply(clean_branch_name)
    df['quota'] = df['quota_raw'].apply(normalize_quota)
    df['category'] = df['category_raw'].apply(normalize_category)
    df['gender'] = df['gender_raw'].apply(normalize_gender)
    
    # Convert ranks to numeric, handling potential non-numeric strings
    df['opening_rank'] = pd.to_numeric(df['opening_rank'], errors='coerce')
    df['closing_rank'] = pd.to_numeric(df['closing_rank'], errors='coerce')
    
    # Drop rows with invalid ranks
    initial_count = len(df)
    df = df.dropna(subset=['opening_rank', 'closing_rank'])
    if len(df) < initial_count:
        logger.warning(f"Dropped {initial_count - len(df)} rows due to invalid ranks")

    # 2. Extract Colleges
    logger.info("Extracting unique colleges...")
    colleges_df = df[['college_name']].drop_duplicates()
    colleges_df['id'] = range(1, len(colleges_df) + 1) # Temporary IDs for linking
    
    # 3. Extract Branches
    logger.info("Extracting unique branches per college...")
    branches_df = df[['college_name', 'branch_name']].drop_duplicates()
    branches_df = branches_df.merge(colleges_df, on='college_name')
    branches_df = branches_df.rename(columns={'id': 'college_id'})
    branches_df['id'] = range(1, len(branches_df) + 1)

    # 4. Prepare Cutoffs
    logger.info("Preparing cutoff data...")
    cutoffs_df = df.merge(colleges_df, on='college_name')
    cutoffs_df = cutoffs_df.rename(columns={'id': 'college_id'})
    cutoffs_df = cutoffs_df.merge(branches_df[['college_id', 'branch_name', 'id']], on=['college_id', 'branch_name'])
    cutoffs_df = cutoffs_df.rename(columns={'id': 'branch_id'})
    
    cutoffs_df['year'] = year
    # JoSAA datasets usually represent Round 6 or final round if not specified
    cutoffs_df['round'] = 6 

    final_cutoffs = cutoffs_df[[
        'college_id', 'branch_id', 'year', 'round', 
        'category', 'quota', 'gender', 'opening_rank', 'closing_rank'
    ]]

    # 5. Save Outputs
    logger.info(f"Saving cleaned files to {output_dir}")
    colleges_df.to_csv(os.path.join(output_dir, 'colleges_clean.csv'), index=False)
    branches_df[['id', 'college_id', 'branch_name']].to_csv(os.path.join(output_dir, 'branches_clean.csv'), index=False)
    final_cutoffs.to_csv(os.path.join(output_dir, 'cutoffs_clean.csv'), index=False)

    logger.info("Cleaning complete.")
    logger.info(f"Summary: {len(colleges_df)} colleges, {len(branches_df)} branches, {len(final_cutoffs)} cutoff entries.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Clean JoSAA/CSAB raw data')
    parser.add_argument('--input', required=True, help='Path to raw CSV file')
    parser.add_argument('--output_dir', default='data/cleaned', help='Directory to save cleaned CSVs')
    parser.add_argument('--year', type=int, default=2024, help='Year of the data')
    
    args = parser.parse_args()
    process_josaa_data(args.input, args.output_dir, args.year)
