const fs = require('fs');
const content = fs.readFileSync('extracted_vocab_full.txt', 'utf8');
const lines = content.split('\n');
let out = '';
lines.forEach((line, i) => {
    if (line.includes('--- START FILE:')) {
        out += `Line ${i + 1}: ${line.trim()}\n`;
    }
});
out += `Total Lines: ${lines.length}\n`;
fs.writeFileSync('boundaries.txt', out);
