import sys
sys.path.insert(0, '/tmp/cc-agent/68062460/project/backend/data')
from config import BATCH_SIZE
from utils.supabase_client import get_client

def insert_batches(table, data):
    client = get_client()
    total = len(data)
    inserted = 0
    errors = []

    for i in range(0, total, BATCH_SIZE):
        chunk = data[i:i + BATCH_SIZE]
        try:
            result = client.table(table).insert(chunk).execute()
            inserted += len(chunk)
            print(f"  {table}: Inserted {inserted}/{total}")
        except Exception as e:
            errors.append(f"Batch {i//BATCH_SIZE}: {e}")
            print(f"  {table}: ERROR at batch {i//BATCH_SIZE}: {e}")
            raise e

    return {"table": table, "inserted": inserted, "total": total, "errors": errors}

def verify_count(table, expected):
    client = get_client()
    try:
        result = client.table(table).select("id", count="exact").execute()
        actual = result.count if hasattr(result, 'count') else len(result.data)
        status = "OK" if actual == expected else "MISMATCH"
        print(f"  {table}: {actual} rows (expected {expected}) - {status}")
        return {"table": table, "actual": actual, "expected": expected, "status": status}
    except Exception as e:
        print(f"  {table}: ERROR - {e}")
        return {"table": table, "actual": -1, "expected": expected, "status": "ERROR", "error": str(e)}
