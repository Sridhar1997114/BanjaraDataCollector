const fs = require('fs');

const data = fs.readFileSync('f:/Banjara AI/BanjaraDataCollector/banjara_master_vocabulary.csv', 'utf8');
const lines = data.split('\n').filter(line => line.trim() !== '');

const uniqueWords = new Set();
let totalEntries = 0;
// Skip header
for (let i = 1; i < lines.length; i++) {
    const rowObj = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (rowObj.length > 1) {
        let banjaraCol = rowObj[1];
        if (banjaraCol) {
            // Remove Quotes
            banjaraCol = banjaraCol.replace(/^"|"$/g, '');
            const words = banjaraCol.split('/').map(w => w.trim().toLowerCase());
            for (const w of words) {
                if (w !== '' && w !== 'banjara') {
                    uniqueWords.add(w);
                }
            }
        }
    }
}

fs.writeFileSync('result.txt', `Total unique Banjara words: ${uniqueWords.size}\n`, 'utf8');
