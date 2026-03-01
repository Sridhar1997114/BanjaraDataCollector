import csv
import os

def parse_master_vocab(input_path, output_path):
    master_data = {} # Key: (english_word, banjara_word)
    
    with open(input_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    current_file = ""
    for line in lines:
        if line.startswith("--- START FILE:"):
            current_file = line.replace("--- START FILE:", "").strip().replace(" ---", "")
            continue
        
        if line.startswith("serial_no") or not line.strip():
            continue
            
        parts = line.split(',')
        if len(parts) >= 4:
            # Basic normalization
            eng = parts[1].strip().lower() if len(parts) > 1 else ""
            pos = parts[2].strip().lower() if len(parts) > 2 else ""
            banjara = parts[3].strip() if len(parts) > 3 else ""
            ipa = parts[4].strip() if len(parts) > 4 else ""
            telugu = parts[5].strip() if len(parts) > 5 else ""
            hindi = parts[6].strip() if len(parts) > 6 else ""
            
            key = (eng, banjara)
            if key not in master_data:
                master_data[key] = {
                    'english': eng,
                    'banjara': banjara,
                    'pos': pos,
                    'ipa': ipa,
                    'telugu': telugu,
                    'hindi': hindi,
                    'source': current_file
                }
    
    # Save to CSV
    with open(output_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['english', 'banjara', 'pos', 'ipa', 'telugu', 'hindi', 'source'])
        writer.writeheader()
        for row in master_data.values():
            writer.writerow(row)
            
    return len(master_data)

count = parse_master_vocab('extracted_vocab_full.txt', 'banjara_master_vocabulary.csv')
print(f"Created master vocabulary with {count} unique mappings.")
