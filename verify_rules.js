const fs = require('fs');
const BGE = require('./banjara_grammar.js');

// Mock suggestTranslation logic to test the Rule-based part
function testRule(english) {
    const words = english.toLowerCase().replace(/[.,!?;:'"()]/g, '').split(/\s+/).filter(w => w);

    const subjects = ['i', 'you', 'he', 'she', 'we', 'they'];
    const verbs = ['doing', 'going', 'working', 'playing', 'eating'];

    let sub = null, verb = null, obj = [];
    words.forEach(w => {
        if (subjects.includes(w)) sub = w;
        else if (verbs.includes(w)) verb = w;
        else if (!['am', 'is', 'are', 'to', 'the', 'a', 'an', 'some'].includes(w)) obj.push(w);
    });

    if (sub && verb && obj.length > 0) {
        const bSub = BGE.pronouns[sub === 'i' ? 'I' : sub]?.base || sub;
        const bVerb = verb === 'doing' ? 'karro chu' : (verb === 'going' ? 'jaaro chu' : verb);
        const bObj = obj.join(' ');

        return BGE.reorderToSOV(bSub, bObj, bVerb);
    }
    return "No rule matched";
}

const examples = [
    "I am doing work",
    "You are going to village",
    "He is playing football",
    "We are eating food"
];

let report = "--- Banjara Rule Verification --- \n\n";
examples.forEach(ex => {
    report += `English: ${ex}\n`;
    report += `Banjara: ${testRule(ex)}\n\n`;
});

fs.writeFileSync('rule_verification_report.txt', report);
console.log("Report generated in rule_verification_report.txt");
