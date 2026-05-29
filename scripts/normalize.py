import re

def normalize_quota(quota):
    if not quota:
        return 'AI'
    q = str(quota).strip().lower()
    mapping = {
        'all india': 'AI',
        'ai': 'AI',
        'home state': 'HS',
        'hs': 'HS',
        'other state': 'OS',
        'os': 'OS',
        'goa': 'HS', # Example of state-specific JoSAA mappings
    }
    return mapping.get(q, str(quota).strip().upper())

def normalize_category(category):
    if not category:
        return 'OPEN'
    c = str(category).strip().lower()
    mapping = {
        'open': 'OPEN',
        'general': 'OPEN',
        'obc-ncl': 'OBC-NCL',
        'obc': 'OBC-NCL',
        'sc': 'SC',
        'st': 'ST',
        'ews': 'EWS',
        'gen-ews': 'EWS',
        'open (pwd)': 'OPEN-PwD',
    }
    return mapping.get(c, str(category).strip().upper())

def normalize_gender(gender):
    if not gender:
        return 'Gender-Neutral'
    lower = str(gender).strip().lower()
    if 'female' in lower:
        return 'Female-only'
    return 'Gender-Neutral'

def clean_institute_name(name):
    """Remove common JoSAA prefixes/suffixes for cleaner matching"""
    name = str(name).strip()
    # Remove things like "Indian Institute of Technology", "National Institute of Technology" if we want shorter names
    # But usually it's better to keep them and just trim whitespace.
    return name

def clean_branch_name(name):
    """Standardize branch names"""
    name = str(name).strip()
    # Example: "Computer Science and Engineering (4 Years, Bachelor of Technology)" -> "Computer Science and Engineering"
    name = re.sub(r'\s*\(.*?\)', '', name)
    return name.strip()
