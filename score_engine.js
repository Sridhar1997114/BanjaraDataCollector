const { buildVocabulary, suggestTranslation } = require('./suggest_translations.js');
const fs = require('fs');

const { vocab, sentencePairs } = buildVocabulary();

const testCases = [
    { en: "I am going to the village", target: "Mai taandan jaaro chu" },
    { en: "She is drinking water in the house", target: "Vu gharmaa paani peeri che" },
    { en: "The teacher is teaching the students", target: "Guru chacharune sikhaaro che" }, // User noted chacharune for children
    { en: "We are working in the field", target: "Ham khetrmaa kaam karre cha" },
    { en: "You are eating a fruit", target: "Tu phal khaaro chi" },
    { en: "They are playing in the garden", target: "Ve baageermaa khelde che" },
    { en: "Mother is cooking food", target: "Maay dhann raandri che" },
    { en: "The buffalo is drinking water", target: "Bhyamsi paani peeri che" },
    { en: "I am coming from the market", target: "Mai bajartee aaro chu" },
    { en: "Sister is reading a book", target: "Baay pustak saderi che" }
];

let report = "# Refinement Scoring Report\n\n";
report += "| # | English | Target (Correct) | Engine Output | Score |\n";
report += "|---|---------|------------------|---------------|-------|\n";

let totalScore = 0;

testCases.forEach((t, idx) => {
    const output = suggestTranslation(t.en, vocab, sentencePairs);
    const cleanOutput = output.replace('🧠 RULE: ', '').trim();

    // Simple matching score (case insensitive)
    const isMatch = cleanOutput.toLowerCase() === t.target.toLowerCase();
    const score = isMatch ? 100 : 0;
    totalScore += score;

    report += `| ${idx + 1} | ${t.en} | ${t.target} | ${cleanOutput} | ${score}% |\n`;
});

const finalScore = totalScore / testCases.length;
report += `\n\n**Final Accuracy Score: ${finalScore}%**\n`;

fs.writeFileSync('SCORING_REPORT.md', report);
console.log(`Scoring complete. Final Score: ${finalScore}%`);
