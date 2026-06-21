import sys
sys.path.insert(0, '/tmp/cc-agent/68062460/project/backend/data')
from config import DELETE_ORDER
from utils.supabase_client import get_client

def wipe_database():
    client = get_client()
    results = {}
    for table in DELETE_ORDER:
        try:
            result = client.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            results[table] = "WIPED"
            print(f"Wiped table: {table}")
        except Exception as e:
            if "does not exist" in str(e) or "not found" in str(e).lower():
                results[table] = "NOT_EXIST"
                print(f"Table not found (skipped): {table}")
            else:
                results[table] = f"ERROR: {e}"
                print(f"Error wiping {table}: {e}")
    return results

def cleanup_user_roles(keep_emails):
    client = get_client()
    try:
        all_roles = client.table("user_roles").select("*").execute()
        deleted = 0
        for role in all_roles.data:
            if role.get("email") not in keep_emails:
                client.table("user_roles").delete().eq("id", role["id"]).execute()
                deleted += 1
        print(f"Cleaned user_roles: kept {len(keep_emails)}, deleted {deleted}")
        return deleted
    except Exception as e:
        print(f"Error cleaning user_roles: {e}")
        return -1
