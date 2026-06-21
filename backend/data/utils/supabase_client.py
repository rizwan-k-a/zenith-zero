from supabase import create_client
import sys
sys.path.insert(0, '/tmp/cc-agent/68062460/project/backend/data')
from config import SUPABASE_URL, SUPABASE_KEY

_client = None

def get_client():
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client
