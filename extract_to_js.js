const fs = require('fs');

try {
    const data = fs.readFileSync('banjara_master_vocabulary.csv', 'utf8').split('\n');
    const uniqueWords = [];
    const seen = new Set();

    for (let i = 1; i < data.length; i++) {
        const row = data[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (row.length > 1 && row[1] && row[0]) {
            let banjaraCol = row[1].replace(/^"|"$/g, '').trim();
            let englishCol = row[0].replace(/^"|"$/g, '').trim();
            const words = banjaraCol.split('/').map(w => w.trim().toLowerCase());
            for (const w of words) {
                if (w !== '' && w !== 'banjara' && !seen.has(w)) {
                    seen.add(w);
                    uniqueWords.push({ banjara: w, english: englishCol });
                }
            }
        }
    }

    fs.writeFileSync('banjara_unique_words_with_english.js', 'const BANJARA_WORDS = ' + JSON.stringify(uniqueWords, null, 2) + ';\n');
    console.log('Saved ' + uniqueWords.length + ' words');
} catch (e) {
    console.error(e);
}
