const fs = require('fs');
const BGGE = require('./banjara_grammar.js');

/**
 * Synthetic Data Generator for Banjara AI training.
 * Uses textbook rules to create varied, grammatically correct sentences.
 */

const subjects = [
    { en: "i", person: 1, num: "singular" },
    { en: "we", person: 1, num: "plural" },
    { en: "you", person: 2, num: "singular", form: "informal" },
    { en: "he", person: 3, num: "singular" },
    { en: "they", person: 3, num: "plural" }
];

const objects = ["kaam", "daliya", "taanda", "dukaan", "chora", "ruukh"];
const verbs = [
    { root: "kar", en: "doing/doing work" },
    { root: "jaa", en: "going" },
    { root: "kha", en: "eating" },
    { root: "de", en: "giving" }
];

let dataset = [];

// Generate basic SOV sentences
subjects.forEach(sub => {
    verbs.forEach(v => {
        objects.forEach(obj => {
            const bSub = BGGE.getPronoun(sub.person, sub.num, sub.form || 'informal');
            const bVerb = BGGE.transformVerb(v.root, 'incomplete'); // Using 'incomplete' for simple present-ish

            // Apply suffixes to objects if it makes sense (e.g. going to village)
            let bObj = obj;
            if (v.root === 'jaa') {
                bObj = BGGE.attachSuffix(obj, 'to');
            }

            const sentence = `${bSub} ${bObj} ${bVerb}`;
            dataset.push({
                english: `${sub.en} ${v.en} ${obj}`,
                banjara: sentence
            });
        });
    });
});

const output = dataset.map(d => `${d.english},${d.banjara}`).join('\n');
fs.writeFileSync('synthetic_banjara_dataset.csv', "english,banjara\n" + output);

console.log(`Generated ${dataset.length} synthetic sentences in synthetic_banjara_dataset.csv`);
