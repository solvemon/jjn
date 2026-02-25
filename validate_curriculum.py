import os
import yaml
import re

CONTENT_DIR = "content"
schema_errors = []
ref_errors = []
all_ids = set()
files_data = {}

# 1. Collect all IDs and verify filename match
for root, dirs, files in os.walk(CONTENT_DIR):
    for file in files:
        if not file.endswith(".md"):
            continue
        
        filepath = os.path.join(root, file)
        with open(filepath, 'r') as f:
            content = f.read()
            
        # Extract YAML frontmatter
        match = re.search(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
        if not match:
            schema_errors.append(f"No YAML frontmatter in {filepath}")
            continue
            
        try:
            data = yaml.safe_load(match.group(1))
        except Exception as e:
            schema_errors.append(f"YAML parse error in {filepath}: {e}")
            continue
            
        node_id = data.get('id')
        if not node_id:
            schema_errors.append(f"Missing 'id' in {filepath}")
            continue
            
        filename_id = os.path.splitext(file)[0]
        if node_id != filename_id:
            schema_errors.append(f"ID mismatch in {filepath}: id='{node_id}', filename='{file}'")
            
        all_ids.add(node_id)
        files_data[filepath] = data

# 2. Validate references
ref_fields = [
    'against', 'sequence', 'curriculum_levels', 'curriculum_level',
    'prerequisite_level', 'grading_test', 'defenses', 'drills', 
    'techniques', 'techniques_trained', 'introduced_at'
]

for filepath, data in files_data.items():
    for field in ref_fields:
        val = data.get(field)
        if not val:
            continue
            
        # Normalize to list
        refs = val if isinstance(val, list) else [val]
        
        for r in refs:
            # Check if it's a string ID (skip structured objects like sources)
            if isinstance(r, str) and r not in all_ids:
                ref_errors.append(f"Broken reference in {filepath}: '{field}' refers to non-existent ID '{r}'")

# Print results
if not schema_errors and not ref_errors:
    print("VALIDATION SUCCESSFUL: No errors found.")
else:
    if schema_errors:
        print("\n--- SCHEMA/ID ERRORS ---")
        for err in schema_errors:
            print(err)
            
    if ref_errors:
        print("\n--- REFERENCE ERRORS ---")
        for err in ref_errors:
            print(err)
    
    exit(1)
