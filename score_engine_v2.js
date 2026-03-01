const { buildVocabulary, suggestTranslation } = require('./suggest_translations.js');
const fs = require('fs');

const { vocab, sentencePairs } = buildVocabulary();

const testCases = [
    { en: "The man is calling the boys", target: "Vu aadmi chachaparun balaro che" },
    { en: "She is cooking rice in the kitchen", target: "Vu konimaa chaaval raandri che" },
    { en: "We are talking to the teacher", target: "Hum guru thi waaathe karre cha" },
    { en: "He is coming home", target: "Vu ghar aaro che" },
    { en: "They are eating fruit in the field", target: "Voo khetrmaa phal khaare che" },
    { en: "The cow is drinking water", target: "Gawdi paani peeri che" },
    { en: "You are reading a lesson", target: "Tu paat paddro chi" },
    { en: "I am working in the garden", target: "Me baageermaa kaam karro chu" },
    { en: "Sister is going to the market", target: "Baay bajareen jaari che" },
    { en: "Mother is playing with the children", target: "Maay chacharuntee ramri che" }
];

let report = "# Refinement Scoring Report V2\n\n";
report += "| # | English | Target (Correct) | Engine Output | Score |\n";
report += "|---|---------|------------------|---------------|-------|\n";

let totalScore = 0;

testCases.forEach((t, idx) => {
    const output = suggestTranslation(t.en, vocab, sentencePairs);
    const cleanOutput = output.replace('🧠 RULE: ', '').trim();

    // Normalize for comparison (spaces, casing)
    const normOutput = cleanOutput.toLowerCase().replace(/\s+/g, ' ');
    const normTarget = t.target.toLowerCase().replace(/\s+/g, ' ');

    const isMatch = normOutput === normTarget;
    const score = isMatch ? 100 : 0;
    totalScore += score;

    report += `| ${idx + 1} | ${t.en} | ${t.target} | ${cleanOutput} | ${score}% |\n`;
});

const finalScore = totalScore / testCases.length;
report += `\n\n**Final Accuracy Score (V2): ${finalScore}%**\n`;

fs.writeFileSync('SCORING_REPORT_V2.md', report);
console.log(`Scoring V2 complete. Final Score: ${finalScore}%`);
