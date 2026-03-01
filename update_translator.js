const fs = require('fs');
const path = require('path');

const csvPath = 'f:/Banjara AI/Latest recordings/banjara_translations_2026-02-15.csv';
const htmlPath = 'f:/Banjara AI/BanjaraDataCollector/banjara_translator.html';

function parseCSV(content) {
    const lines = content.trim().split('\n');
    const translations = {};
    // Skip header
    for (let i = 1; i < lines.length; i++) {
        // Simple regex to handle quoted CSV fields
        const match = lines[i].match(/^(\d+),"((?:[^"]|"")*)","((?:[^"]|"")*)","(.*)"$/);
        if (match) {
            translations[match[1]] = {
                banjara: match[3].replace(/""/g, '"'),
                notes: match[4].replace(/""/g, '"')
            };
        } else {
            // Fallback for simple lines
            const parts = lines[i].split(',');
            if (parts.length >= 3) {
                translations[parts[0]] = {
                    banjara: parts[2].replace(/^"|"$/g, ''),
                    notes: parts[3] ? parts[3].replace(/^"|"$/g, '') : ''
                };
            }
        }
    }
    return translations;
}

const translations = parseCSV(fs.readFileSync(csvPath, 'utf8'));
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// We need to find the rawData array and update it.
// Regex to find: { id: 153, en: "..." },
// And replace with: { id: 153, en: "...", banjara: "...", notes: "..." },

// Actually, the current HTML structure is:
// {id: 153, en: "A nomadic community, discriminated against everywhere."},
// We want to verify if we need to change the structure or just how it's initialized.
// The current `init()` function loads from localStorage. 
// If we change `rawData` to include `banjara` property, we need to update `init()` to use it if localStorage is empty.
// OR, easier: We generate a <script> block that pre-populates localStorage if it's empty! 
// No, that's hacky.

// Better: Update `rawData` to include pre-filled data, and update the rendering logic to use it as default.
// In the current HTML:
// const t = translations[item.id] || { banjara: '', notes: '' };
// We should change this to use item.banjara if translations[item.id] is missing.

// Let's first inject the data into rawData.
let newRawData = "const rawData = [\n";
const rawDataRegex = /const rawData = \[\s*([\s\S]*?)\];/;
const match = htmlContent.match(rawDataRegex);

if (!match) {
    console.error("Could not find rawData in HTML");
    process.exit(1);
}

// We will reconstruct the rawData array using the known IDs (153-281) and text from the file (or just regex parsing the existing list).
// Parsing existing list is safer to keep English text exactly as is.
const existingItems = match[1].split('},');
existingItems.forEach(itemStr => {
    if (!itemStr.trim()) return;
    itemStr = itemStr.trim();
    if (!itemStr.endsWith('}')) itemStr += '}';

    // Extract ID and EN
    const idMatch = itemStr.match(/id:\s*(\d+)/);
    const enMatch = itemStr.match(/en:\s*"(.*)"/);

    if (idMatch && enMatch) {
        const id = idMatch[1];
        const en = enMatch[1];
        const t = translations[id];

        let line = `        { id: ${id}, en: "${en}"`;
        if (t && t.banjara) {
            line += `, banjara: "${t.banjara.replace(/"/g, '\\"')}", notes: "${t.notes.replace(/"/g, '\\"')}"`;
        }
        line += ` },`;
        newRawData += line + "\n";
    }
});
newRawData += "    ];";

htmlContent = htmlContent.replace(rawDataRegex, newRawData);

// Now update the render logic to use this pre-filled data
// Original: const t = translations[item.id] || { banjara: '', notes: '' };
// New: const t = translations[item.id] || { banjara: item.banjara || '', notes: item.notes || '' };

htmlContent = htmlContent.replace(
    "const t = translations[item.id] || { banjara: '', notes: '' };",
    "const t = translations[item.id] || { banjara: item.banjara || '', notes: item.notes || '' };"
);

fs.writeFileSync(htmlPath, htmlContent);
console.log("Updated banjara_translator.html");
