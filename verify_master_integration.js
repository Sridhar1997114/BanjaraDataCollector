const { buildVocabulary, suggestTranslation } = require('./suggest_translations.js');
const fs = require('fs');

const { vocab, sentencePairs } = buildVocabulary();

const testWords = [
    "news",      // English
    "varta",     // Hindi (from news row)
    "వార్త",     // Telugu (from news row)
    "abide",    // From English docx
    "buffalo"   // Common word
];

let out = "# Master Vocabulary Integration Verification\n\n";
out += `Total words in vocabulary: ${Object.keys(vocab).length}\n\n`;

testWords.forEach(word => {
    const translations = vocab[word.toLowerCase()] || ["Not Found"];
    out += `- **Source Word**: ${word}\n`;
    out += `  **Translations Found**: ${translations.join(', ')}\n\n`;
});

const complexTest = "The teacher is teaching in the school";
out += `\n## Complex Translation Test: "${complexTest}"\n`;
out += suggestTranslation(complexTest, vocab, sentencePairs) + "\n";

fs.writeFileSync('VERIFICATION_REPORT.txt', out);
console.log('Verification report written to VERIFICATION_REPORT.txt');
