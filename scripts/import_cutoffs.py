import pandas as pd
import os
import argparse
import logging
import json
from supabase import create_client, Client
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv(dotenv_path='.env.local')

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use service role for bypass RLS

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Missing Supabase credentials. Check .env.local")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def import_data(data_dir):
    logger.info(f"Starting import from {data_dir}")

    # 1. Import Colleges
    colleges_file = os.path.join(data_dir, 'colleges_clean.csv')
    if os.path.exists(colleges_file):
        colleges_df = pd.read_csv(colleges_file)
        logger.info(f"Importing {len(colleges_df)} colleges...")
        
        college_map = {} # Maps temp_id to real uuid
        
        for _, row in colleges_df.iterrows():
            # Check if college exists by name
            existing = supabase.table('colleges').select('id').eq('name', row['college_name']).maybe_single().execute()
            
            if existing.data:
                college_id = existing.data['id']
                logger.debug(f"College exists: {row['college_name']}")
            else:
                new_col = supabase.table('colleges').insert({
                    'name': row['college_name'],
                    'short_name': row['college_name'][:50], # Default short name
                    'type': 'Other' # Default, should be updated manually or via better cleaning
                }).execute()
                college_id = new_col.data[0]['id']
                logger.info(f"Created college: {row['college_name']}")
            
            college_map[row['id']] = college_id
    else:
        logger.error("colleges_clean.csv not found!")
        return

    # 2. Import Branches
    branches_file = os.path.join(data_dir, 'branches_clean.csv')
    if os.path.exists(branches_file):
        branches_df = pd.read_csv(branches_file)
        logger.info(f"Importing {len(branches_df)} branches...")
        
        branch_map = {} # Maps (college_uuid, branch_name) to branch_uuid
        
        for _, row in branches_df.iterrows():
            real_college_id = college_map.get(row['college_id'])
            if not real_college_id: continue
            
            # Check if branch exists for this college
            existing = supabase.table('branches').select('id').eq('college_id', real_college_id).eq('branch_name', row['branch_name']).maybe_single().execute()
            
            if existing.data:
                branch_id = existing.data['id']
            else:
                new_branch = supabase.table('branches').insert({
                    'college_id': real_college_id,
                    'branch_name': row['branch_name'],
                    'branch_code': row['branch_name'][:10].upper()
                }).execute()
                branch_id = new_branch.data[0]['id']
                logger.info(f"Created branch: {row['branch_name']} for college {real_college_id}")
            
            branch_map[(real_college_id, row['branch_name'])] = branch_id
    else:
        logger.error("branches_clean.csv not found!")
        return

    # 3. Import Cutoffs in batches
    cutoffs_file = os.path.join(data_dir, 'cutoffs_clean.csv')
    if os.path.exists(cutoffs_file):
        cutoffs_df = pd.read_csv(cutoffs_file)
        logger.info(f"Importing {len(cutoffs_df)} cutoffs...")
        
        batch = []
        batch_size = 500
        count = 0
        
        # Load existing branches to map temp IDs correctly if needed, 
        # but clean_josaa already provides college_id and branch_id as temp IDs.
        # We need to map them to real UUIDs.
        
        # First, we need the branch names for the mapping
        temp_branches = pd.read_csv(branches_file)
        temp_branch_name_map = temp_branches.set_index('id')['branch_name'].to_dict()

        for _, row in cutoffs_df.iterrows():
            real_college_id = college_map.get(row['college_id'])
            branch_name = temp_branch_name_map.get(row['branch_id'])
            real_branch_id = branch_map.get((real_college_id, branch_name))
            
            if not real_college_id or not real_branch_id:
                continue

            cutoff_data = {
                'college_id': real_college_id,
                'branch_id': real_branch_id,
                'year': int(row['year']),
                'round': int(row['round']),
                'category': row['category'],
                'quota': row['quota'],
                'gender': row['gender'],
                'opening_rank': int(row['opening_rank']),
                'closing_rank': int(row['closing_rank'])
            }
            batch.append(cutoff_data)
            
            if len(batch) >= batch_size:
                try:
                    supabase.table('cutoffs').insert(batch).execute()
                    count += len(batch)
                    logger.info(f"Inserted {count} cutoffs...")
                    batch = []
                except Exception as e:
                    logger.error(f"Batch insert failed: {e}")
                    # In production, you might want to retry or log individual failures
                    batch = []

        if batch:
            supabase.table('cutoffs').insert(batch).execute()
            count += len(batch)
            logger.info(f"Final batch complete. Total cutoffs: {count}")

    logger.info("Import process finished successfully.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Import cleaned JoSAA data to Supabase')
    parser.add_argument('--dir', default='data/cleaned', help='Directory containing cleaned CSVs')
    
    args = parser.parse_args()
    import_data(args.dir)
