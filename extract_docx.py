import zipfile
import xml.etree.ElementTree as ET
import os
import sys

def extract_docx_text(path):
    try:
        with zipfile.ZipFile(path) as zf:
            xml_content = zf.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            text = []
            for paragraph in tree.findall('.//w:p', namespace):
                p_text = ""
                for run in paragraph.findall('.//w:r', namespace):
                    t = run.find('.//w:t', namespace)
                    if t is not None:
                        p_text += t.text
                if p_text:
                    text.append(p_text.strip())
            return "\n".join(text)
    except Exception as e:
        return f"Error extracting {os.path.basename(path)}: {str(e)}"

directory = r"F:\Banjara AI\Banjara GPT CSVs"
output_file = "extracted_vocab_full.txt"

if not os.path.exists(directory):
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(f"Error: Directory {directory} not found.")
    sys.exit(1)

files = [f for f in os.listdir(directory) if f.endswith('.docx')]

with open(output_file, "w", encoding="utf-8") as f:
    for file in files:
        full_path = os.path.join(directory, file)
        f.write(f"--- START FILE: {file} ---\n")
        content = extract_docx_text(full_path)
        f.write(content)
        f.write(f"\n--- END FILE: {file} ---\n\n")

print(f"Finished. Extracted content from {len(files)} files to {output_file}")
