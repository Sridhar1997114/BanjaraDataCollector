with open('extracted_vocab_full.txt', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if '--- START FILE:' in line:
            print(f"Line {i+1}: {line.strip()}")
