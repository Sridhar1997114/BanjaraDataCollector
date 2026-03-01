const fs = require('fs');
const path = require('path');

const datasetPath = 'verified_dataset.csv';
const audioSourceDir = 'f:\\Banjara AI\\Latest recordings';
const audioDestDir = 'f:\\Banjara AI\\BanjaraDataCollector\\audio';

// Partial Batch 23 Data (Sentences 151-152)
const newRows = [
    '151,"Historical records indicate that portrait was transported to Bangalore.","itihaaseer hisabeethi vuu painting een banglore een meeldineech","itihaaseer-history\'s, hisabeethi-according, vuu-that, painting-painting/chitre, een-to, banglore een-to banglore, meeldineech-was sent.",itihaaseer_hisabeethi_vuu_painting_een_banglore_een_meeldineech.wav,2026-02-13T12:56:11.042Z',
    '152,"Think about the significance.","ee katra mootto vaath che sooch an dheeko","ee-this, katra-how much, mootto-heavy/significant, vaath-word/saying, che-is, sooch an-think and, dheeko-see",ee_katra_mootto_vaath_che_sooch_an_dheeko.wav,2026-02-13T12:59:33.698Z'
];

// Append to CSV
let content = fs.readFileSync(datasetPath, 'utf8');
if (!content.endsWith('\n')) {
    content += '\n';
}
content += newRows.join('\n') + '\n';
fs.writeFileSync(datasetPath, content);
console.log('Successfully appended 2 new rows (151-152) to verified_dataset.csv');

// Move Audio Files
if (!fs.existsSync(audioDestDir)) {
    fs.mkdirSync(audioDestDir, { recursive: true });
}

newRows.forEach(row => {
    const match = row.match(/,([a-zA-Z0-9_]+\.wav),/);
    if (match && match[1]) {
        const filename = match[1];
        const srcPath = path.join(audioSourceDir, filename);
        const destPath = path.join(audioDestDir, filename);

        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${filename}`);
        } else {
            console.error(`ERROR: Source file not found: ${srcPath}`);
        }
    }
});
