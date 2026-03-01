const { buildVocabulary, suggestTranslation } = require('./suggest_translations.js');
const fs = require('fs');

try {
    const { vocab, sentencePairs } = buildVocabulary();

    const sentences = [
        "I am going to the village",
        "She is drinking water in the house",
        "The teacher is teaching the students",
        "We are working in the field",
        "You are eating a fruit",
        "They are playing in the garden",
        "Mother is cooking food",
        "The buffalo is drinking water",
        "I am coming from the market",
        "Sister is reading a book"
    ];

    let markdown = "# Banjara Translation Table\n\n";
    markdown += "| # | English Sentence | Banjara Translation (Logic-Based) |\n";
    markdown += "|---|------------------|-----------------------------------|\n";

    sentences.forEach((s, idx) => {
        const translation = suggestTranslation(s, vocab, sentencePairs);
        const cleanTranslation = translation.replace(/\[\d+%\]\s*/, '').replace(/✅ EXACT:\s*/, '').replace(/🧠 RULE:\s*/, '');
        markdown += `| ${idx + 1} | ${s} | ${cleanTranslation} |\n`;
    });

    fs.writeFileSync('TRANSLATION_TABLE.md', markdown);
    console.log('Translation table generated in TRANSLATION_TABLE.md');
} catch (e) {
    fs.writeFileSync('ERROR_LOG.txt', e.stack);
}
