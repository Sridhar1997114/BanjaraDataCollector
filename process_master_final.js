const fs = require('fs');

function parseCSVLine(line) {
    const row = [];
    let currentCell = '', insideQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const next = line[i + 1];
        if (char === '"') {
            if (insideQuotes && next === '"') { currentCell += '"'; i++; }
            else { insideQuotes = !insideQuotes; }
        } else if (char === ',' && !insideQuotes) {
            row.push(currentCell.trim()); currentCell = '';
        } else {
            currentCell += char;
        }
    }
    row.push(currentCell.trim());
    return row;
}

function process() {
    const content = fs.readFileSync('extracted_vocab_full.txt', 'utf8');
    const lines = content.split('\n');
    const masterData = [];

    let currentFile = "";

    lines.forEach(line => {
        if (line.includes('--- START FILE:')) {
            currentFile = line.split(':')[1].trim().replace(' ---', '');
            return;
        }
        if (!line.trim() || line.includes('serial_no')) return;

        const row = parseCSVLine(line);
        if (row.length < 4) return;

        let e = "", b = "", p = "", i = "", t = "", h = "";

        if (currentFile.includes('Banjara_english.docx')) {
            // serial, eng, pos, banjara, ipa, telugu, hindi
            e = row[1]; p = row[2]; b = row[3]; i = row[4]; t = row[5]; h = row[6];
        } else if (currentFile.includes('Banjara_hindi.docx')) {
            // serial, hindi, pos, banjara, ipa, telugu, hindi
            h = row[1]; p = row[2]; b = row[3]; i = row[4]; t = row[5]; e = row[6];
        } else if (currentFile.includes('telugu.docx') || currentFile.includes('master_file.docx')) {
            // Variants:
            // 1. serial, telugu, pos, ipa, eng, hindi, banjara_ex, telugu_ex
            // 2. telugu, ipa, pos, eng, hindi, banjara_script

            const isSerial = !isNaN(parseInt(row[0])) && row[0].length < 6;
            if (isSerial) {
                t = row[1]; p = row[2]; b = row[3]; e = row[4]; h = row[5];
            } else {
                t = row[0]; b = row[1]; p = row[2]; e = row[3]; h = row[4];
            }
        }

        const sanitizeBanjara = (str) => {
            if (!str) return "";
            // Remove / / and take first part before / if multiple
            return str.replace(/\//g, "").split('/')[0].trim();
        };

        const cleanB = sanitizeBanjara(b);
        if (cleanB) {
            masterData.push({
                english: (e || "").toLowerCase().trim(),
                banjara: cleanB.toLowerCase(),
                pos: (p || "").toLowerCase().trim(),
                ipa: (i || "").trim(),
                telugu: (t || "").trim(),
                hindi: (h || "").trim(),
                source: currentFile
            });
        }
    });

    let csv = "english,banjara,pos,ipa,telugu,hindi,source\n";
    masterData.forEach(d => {
        csv += `"${d.english || ""}","${d.banjara || ""}","${d.pos || ""}","${d.ipa || ""}","${d.telugu || ""}","${d.hindi || ""}","${d.source || ""}"\n`;
    });
    fs.writeFileSync('banjara_master_vocabulary.csv', csv);
    console.log(`Created master vocabulary with ${masterData.length} entries.`);
}

process();
