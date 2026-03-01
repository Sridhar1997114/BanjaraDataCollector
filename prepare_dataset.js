const fs = require('fs');
const path = require('path');

const SOURCE_CSV = 'verified_dataset.csv';
const AUDIO_DIR = 'audio';
const OUTPUT_DIR = 'dataset';
const TRAIN_RATIO = 0.9;

// Ensure output directories exist
if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(OUTPUT_DIR);

['train', 'test'].forEach(split => {
    const splitDir = path.join(OUTPUT_DIR, split);
    fs.mkdirSync(splitDir);
    fs.mkdirSync(path.join(splitDir, 'audio'));
});

// Read and Parse CSV
const data = fs.readFileSync(SOURCE_CSV, 'utf8');
const lines = data.split('\n').filter(l => l.trim());

// Skip header
const dataLines = lines.slice(1);

const validRows = [];

dataLines.forEach((line, index) => {
    // Simple split by comma
    let parts = line.split(',');

    // Recovery Logic for Unquoted Fields
    // Structure: ID, English, Banjara, Notes..., Audio.wav, Timestamp

    // Find column with .wav (Audio Anchor)
    let audioIdx = -1;
    for (let i = parts.length - 1; i >= 0; i--) {
        if (parts[i].trim().endsWith('.wav')) {
            audioIdx = i;
            break;
        }
    }

    let id, english, banjara, notes, audioFile;

    if (audioIdx !== -1) {
        // We found the audio anchor!
        audioFile = parts[audioIdx].trim();
        // timestamp = parts.slice(audioIdx + 1).join(',').trim(); // Ignore timestamp for now
        id = parts[0].trim();

        // Everything between ID (index 0) and Audio (index audioIdx) are text fields
        const middle = parts.slice(1, audioIdx);

        // Heuristic: 
        // English = middle[0]
        // Banjara = middle[1]
        // Notes = middle.slice(2).join(',')

        if (middle.length >= 3) {
            english = middle[0].trim();
            banjara = middle[1].trim();
            notes = middle.slice(2).join(',').trim();
        } else if (middle.length === 2) {
            english = middle[0].trim();
            banjara = middle[1].trim();
            notes = '';
        } else {
            english = middle[0] || '';
            banjara = '';
            notes = '';
        }
    } else {
        console.warn(`Line ${index + 2}: No .wav file found.`);
        return;
    }

    // Clean quotes roughly
    const clean = (s) => s ? s.replace(/^"|"$/g, '').replace(/""/g, '"') : '';
    english = clean(english);
    banjara = clean(banjara);
    notes = clean(notes);

    const audioPath = path.join(AUDIO_DIR, audioFile);
    if (!fs.existsSync(audioPath)) {
        console.warn(`Line ${index + 2}: Missing audio file: ${audioFile}`);
        return;
    }

    validRows.push({
        id, english, banjara, notes, audioFile
    });
});

console.log(`✅ Found ${validRows.length} valid entries out of ${dataLines.length}.`);

// Shuffle
for (let i = validRows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [validRows[i], validRows[j]] = [validRows[j], validRows[i]];
}

// Split
const trainCount = Math.floor(validRows.length * TRAIN_RATIO);
const trainData = validRows.slice(0, trainCount);
const testData = validRows.slice(trainCount);

console.log(`📊 Split: ${trainData.length} Train, ${testData.length} Test`);

function writeSplit(splitName, dataRows) {
    const splitDir = path.join(OUTPUT_DIR, splitName);
    const splitAudioDir = path.join(splitDir, 'audio');

    let csvContent = 'file_name,english,banjara,notes\n';

    dataRows.forEach(row => {
        const src = path.join(AUDIO_DIR, row.audioFile);
        const dest = path.join(splitAudioDir, row.audioFile);

        try {
            fs.copyFileSync(src, dest);

            // Robust CSV quoting
            const q = (s) => `"${(s || '').replace(/"/g, '""')}"`;
            csvContent += `${row.audioFile},${q(row.english)},${q(row.banjara)},${q(row.notes)}\n`;
        } catch (e) {
            console.error(`❌ Error copying ${row.audioFile}: ${e.message}`);
        }
    });

    fs.writeFileSync(path.join(splitDir, 'metadata.csv'), csvContent);
    console.log(`✅ Written ${splitName} set.`);
}

writeSplit('train', trainData);
writeSplit('test', testData);

console.log('\n🎉 Dataset ready in "dataset/" folder.');
