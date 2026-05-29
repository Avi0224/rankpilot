# JoSAA + CSAB Data Ingestion Pipeline

This directory contains Python scripts to clean and import college cutoff data from JoSAA/CSAB raw datasets into the RankPilot platform.

## Prerequisites

1.  **Python 3.8+** installed on your system.
2.  Install required packages:
    ```bash
    pip install -r scripts/requirements.txt
    ```
3.  Ensure your `.env.local` file contains the following:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    ```
    *Note: Use the **Service Role Key** to bypass Row Level Security (RLS) during the import process.*

## Pipeline Steps

### 1. Cleaning Raw Data

Place your raw JoSAA/CSAB CSV files in a `data/raw` folder. The raw data should ideally contain columns for Institute, Academic Program Name, Quota, Seat Type, Gender, and Ranks.

Run the cleaner:
```bash
python scripts/clean_josaa.py --input data/raw/josaa_2024_r6.csv --year 2024
```
This will produce three files in `data/cleaned/`:
- `colleges_clean.csv`
- `branches_clean.csv`
- `cutoffs_clean.csv`

### 2. Importing to Supabase

Once the data is cleaned, run the import script to upload it to your Supabase instance:
```bash
python scripts/import_cutoffs.py --dir data/cleaned
```

## Features

- **Normalization**: Standardizes category names (e.g., "Gen-EWS" to "EWS"), quotas, and genders.
- **Deduplication**: Checks for existing colleges and branches before creating new ones.
- **Batch Insertion**: Uses Supabase's bulk insert capabilities for high performance.
- **Logging**: Provides detailed feedback on the progress and any errors encountered.

## Data Schema Mapping

- **Colleges**: `id`, `name`, `short_name`, `type`, `state`, `city`
- **Branches**: `id`, `college_id`, `branch_name`, `branch_code`
- **Cutoffs**: `college_id`, `branch_id`, `year`, `round`, `category`, `quota`, `gender`, `opening_rank`, `closing_rank`
