const fs = require('fs');
const path = require('path');

const csvPath = 'f:/Banjara AI/Latest recordings/banjara_translations_2026-02-15.csv';
const htmlPath = 'f:/Banjara AI/BanjaraDataCollector/banjara_data_collector.html';
const scriptPath = 'f:/Banjara AI/BanjaraDataCollector/full_english_script.md';

function parseCSV(content) {
    const lines = content.trim().split('\n');
    const translations = {};
    // Skip header
    for (let i = 1; i < lines.length; i++) {
        // Simple regex to handle quoted CSV fields
        const match = lines[i].match(/^(\d+),"((?:[^"]|"")*)","((?:[^"]|"")*)","(.*)"$/);
        if (match) {
            translations[match[1]] = match[3].replace(/""/g, '"');
        } else {
            // Fallback for simple lines
            const parts = lines[i].split(',');
            if (parts.length >= 3) translations[parts[0]] = parts[2].replace(/^"|"$/g, '');
        }
    }
    return translations;
}

function parseScript(content) {
    const sentences = {};
    const regex = /\*\*(\d+)\.\*\*\s+(.*)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        sentences[match[1]] = match[2].trim();
    }
    return sentences;
}

const translations = parseCSV(fs.readFileSync(csvPath, 'utf8'));
const allSentences = parseScript(fs.readFileSync(scriptPath, 'utf8'));

// Generate Batches JS Object
let batchesJS = "const batches = {\n";

// We know existing batches 9-22 exist, we leave them (or we'd have to parse the existing HTML to preserve them).
// For simplicity, let's assume we are APPENDING/REPLACING from Batch 23 onwards.
// Actually, safely replacing the whole object is best if we had all data. 
// Since we don't want to break 9-22, we should read the existing file and look for the 'batches' object end or specific keys.

// Strategy: Generate the string for Batches 23, 24, 25, 26 and manually inject using replace_file_content for precision.

function generateBatchString(batchNum, startId, endId) {
    let s = `            ${batchNum}: [\n`;
    for (let id = startId; id <= endId; id++) {
        if (!allSentences[id]) continue;
        const banjara = translations[id] || "";
        const suggestion = banjara ? `[User Translation] ${banjara}` : "";
        // We will add a new property 'banjara' to the item
        s += `                { english: "${allSentences[id].replace(/"/g, '\\"')}", banjara: "${banjara.replace(/"/g, '\\"')}", suggestion: "${suggestion.replace(/"/g, '\\"')}" },\n`;
    }
    s += `            ],`;
    return s;
}

console.log(generateBatchString(23, 151, 160));
console.log(generateBatchString(24, 161, 170));
console.log(generateBatchString(25, 171, 180));
console.log(generateBatchString(26, 181, 190)); // Going up to 190 to complete the batch if script has it

