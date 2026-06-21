import random
import sys
sys.path.insert(0, '/tmp/cc-agent/68062460/project/backend/data')
from config import RELATIONSHIP_TYPES, PLATFORMS, COUNTS

def generate_identity_relationships(employee_ids):
    relationships = []
    total = COUNTS["identity_relationships"]

    for i in range(total):
        source_id = random.choice(employee_ids)
        target_id = random.choice(employee_ids)

        if source_id == target_id:
            target_id = random.choice([e for e in employee_ids if e != source_id] or employee_ids)

        rel_type = random.choice(RELATIONSHIP_TYPES)
        platform = random.choice(PLATFORMS)

        relationships.append({
            "relationship_id": f"REL{i+1:07d}",
            "source_id": source_id,
            "target_id": target_id,
            "relationship_type": rel_type,
            "platform": platform,
        })

    return relationships
