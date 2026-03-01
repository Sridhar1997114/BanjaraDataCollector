#!/usr/bin/env node
/**
 * Banjara Translation Suggestion Engine
 * 
 * Uses existing verified_dataset.csv word mappings to build a vocabulary
 * and generate rough translation suggestions for new sentences.
 * 
 * Usage:
 *   node suggest_translations.js --batch 16    → Generate suggestions for batch 16
 *   node suggest_translations.js --update-html  → Update HTML tool with suggestions
 */

const fs = require('fs');
const path = require('path');

const DATASET_FILE = 'verified_dataset.csv';
const MASTER_VOCAB_FILE = 'banjara_master_vocabulary.csv';
const HTML_FILE = 'banjara_data_collector.html';
const BGE = require('./banjara_grammar.js');

// ===== PARSE CSV =====
function parseCSV(content) {
    const rows = [];
    let currentRow = [], currentCell = '', insideQuotes = false;
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const next = content[i + 1];
        if (char === '"') {
            if (insideQuotes && next === '"') { currentCell += '"'; i++; }
            else { insideQuotes = !insideQuotes; }
        } else if (char === ',' && !insideQuotes) {
            currentRow.push(currentCell.trim()); currentCell = '';
        } else if ((char === '\r' || char === '\n') && !insideQuotes) {
            if (char === '\r' && next === '\n') i++;
            if (currentCell || currentRow.length > 0) currentRow.push(currentCell.trim());
            if (currentRow.length > 0) rows.push(currentRow);
            currentRow = []; currentCell = '';
        } else {
            currentCell += char;
        }
    }
    if (currentCell || currentRow.length > 0) { currentRow.push(currentCell.trim()); rows.push(currentRow); }
    return rows;
}

// ===== BUILD VOCABULARY FROM WORD MAPPINGS =====
function buildVocabulary() {
    const vocab = {};
    const sentencePairs = [];

    // 1. Load Master Vocabulary (High Coverage)
    if (fs.existsSync(MASTER_VOCAB_FILE)) {
        const masterContent = fs.readFileSync(MASTER_VOCAB_FILE, 'utf8');
        const masterRows = parseCSV(masterContent);
        // "english,banjara,pos,source"
        masterRows.slice(1).forEach(row => {
            const english = (row[0] || '').trim().toLowerCase();
            const banjara = (row[1] || '').trim().toLowerCase();
            const telugu = (row[4] || '').trim().toLowerCase();
            const hindi = (row[5] || '').trim().toLowerCase();

            const addMapping = (word) => {
                if (!word || word === banjara) return;
                if (!vocab[word]) vocab[word] = [];
                if (!vocab[word].includes(banjara)) vocab[word].push(banjara);
            };

            addMapping(english);
            addMapping(telugu);
            addMapping(hindi);
        });
    }

    // 2. Load Verified Dataset (High Accuracy / Sentence Patterns)
    if (fs.existsSync(DATASET_FILE)) {
        const csvContent = fs.readFileSync(DATASET_FILE, 'utf8');
        const rows = parseCSV(csvContent);
        const data = rows.slice(1);

        data.forEach(row => {
            const english = (row[1] || '').trim();
            const banjara = (row[2] || '').trim();
            const notes = (row[3] || '').trim();

            if (english && banjara) {
                sentencePairs.push({ english: english.toLowerCase(), banjara });
            }

            if (!notes) return;

            // Parse word mappings from notes
            const parts = notes.split(/,|;/).map(p => p.trim()).filter(p => p);
            parts.forEach(part => {
                let splitChar = null;
                if (part.includes('=')) splitChar = '=';
                else if (part.includes('-')) splitChar = '-';

                if (!splitChar) return;

                const idx = part.indexOf(splitChar);
                const banjaraWord = part.substring(0, idx).trim().toLowerCase();
                const englishMeaning = part.substring(idx + 1).trim().toLowerCase();

                if (!banjaraWord || !englishMeaning) return;

                const meanings = englishMeaning.split('/').map(m => m.trim()).filter(m => m);
                meanings.forEach(meaning => {
                    if (!vocab[meaning]) vocab[meaning] = [];
                    if (!vocab[meaning].includes(banjaraWord)) {
                        vocab[meaning].push(banjaraWord);
                    }
                });
            });
        });
    }

    return { vocab, sentencePairs };
}

// ===== SUGGEST TRANSLATION =====
function suggestTranslation(englishSentence, vocab, sentencePairs) {
    const lower = englishSentence.toLowerCase().replace(/[.,!?;:'"()]/g, '');
    const words = lower.split(/\s+/).filter(w => w);

    // First: check if we have a very similar sentence already
    for (const pair of sentencePairs) {
        const pairClean = pair.english.replace(/[.,!?;:'"()]/g, '');
        if (pairClean === lower) {
            return `✅ EXACT: ${pair.banjara}`;
        }
    }

    // Second: Apply logic-based reordering (SOV)
    const lowerWithPunct = englishSentence.toLowerCase();
    const cleanWords = lowerWithPunct.replace(/[.,!?;:'"()]/g, '').split(/\s+/).filter(w => w);

    // Subjects & Vocabulary Overrides
    const subjectMap = {
        'i': { p: 1, n: 'singular' }, 'me': { p: 1, n: 'singular' },
        'we': { p: 1, n: 'plural' }, 'you': { p: 2, n: 'singular' },
        'he': { p: 3, n: 'singular', g: 'masculine' },
        'she': { p: 3, n: 'singular', g: 'feminine' },
        'they': { p: 3, n: 'plural' }, 'it': { p: 3, n: 'singular' }
    };

    const verbRoots = {
        'doing': 'karr', 'going': 'jaar', 'working': 'karr', 'playing': 'ram',
        'ramre': 'ram', 'eating': 'khaar', 'drinking': 'peer', 'cooking': 'raand',
        'teaching': 'sikhaar', 'reading': 'padd', 'coming': 'aar', 'talking': 'waaathe',
        'calling': 'bal'
    };

    const vocabOverrides = {
        'teacher': 'guru', 'children': 'chacharune', 'students': 'chacharune',
        'food': 'dhann', 'sister': 'baay', 'mother': 'maay', 'buffalo': 'bhyamsi',
        'market': 'bajar', 'garden': 'baageer', 'school': 'badi', 'field': 'khetr',
        'house': 'ghar', 'village': 'taanda', 'water': 'paani', 'fruit': 'phal',
        'book': 'pustak', 'rice': 'chaaval', 'grass': 'gvaas', 'milk': 'doodh',
        'work': 'kaam', 'man': 'aadmi', 'boy': 'chora', 'cow': 'gawdi', 'lesson': 'paat',
        'kitchen': 'koni', 'boys': 'chachaper', 'students': 'chachaper'
    };

    const bgeSkipWords = new Set(['am', 'is', 'are', 'the', 'a', 'an', 'to', 'in', 'of', 'from', 'at', 'by', 'for', 'with', 'it', 'into']);

    let sub = null, verb = null, objList = [], suffix = null;

    // Component identification
    for (let i = 0; i < cleanWords.length; i++) {
        const w = cleanWords[i];
        if (bgeSkipWords.has(w)) continue;

        if (!sub && (subjectMap[w] || vocabOverrides[w])) {
            sub = w;
        } else if (!verb && verbRoots[w]) {
            verb = w;
        } else if (vocabOverrides[w] || vocab[w]) {
            if (w !== sub && !objList.includes(w)) objList.push(w);
        }
    }

    // Capture "kaam" (work) specifically
    if (lowerWithPunct.match(/\b(work|working)\b/i) && !objList.includes('work')) {
        objList.push('work');
    }

    // Sorting objects: Prepositional/Suffix object first
    let targetObj = null;
    objList.forEach(o => {
        if (lowerWithPunct.match(new RegExp(`(to|into|in|inside|from|with|along with|of|calling)(\\s+the)?\\s+${o}`, 'i'))) {
            targetObj = o;
            suffix = lowerWithPunct.includes('to ' + o) || lowerWithPunct.includes('to the ' + o) ? 'to' :
                lowerWithPunct.includes('in ' + o) || lowerWithPunct.includes('in the ' + o) ? 'in' :
                    lowerWithPunct.includes('from ' + o) || lowerWithPunct.includes('from the ' + o) ? 'from' :
                        lowerWithPunct.includes('with ' + o) || lowerWithPunct.includes('with the ' + o) ? 'with' :
                            (lowerWithPunct.includes('calling ' + o) || lowerWithPunct.includes('calling the ' + o)) ? 'to' : 'of';
        }
    });

    // Special case for speech: talking TO/WITH teacher
    if (verb === 'talking' && targetObj) suffix = 'speech';

    if (sub && verb) {
        let person = 3, number = 'singular', gender = 'masculine';
        let bSub = "";

        if (subjectMap[sub]) {
            const info = subjectMap[sub];
            person = info.p;
            number = info.n;
            gender = info.g || 'masculine';
            bSub = BGE.getPronoun(person, number);
        } else {
            bSub = vocabOverrides[sub] || (vocab[sub] ? vocab[sub][0] : sub);
            bSub = bSub.charAt(0).toUpperCase() + bSub.slice(1);
            // Prepend Vu only for 'man' as per Correct set #1
            if (lowerWithPunct.startsWith('the ') && sub === 'man') bSub = "Vu " + bSub.toLowerCase();
            person = 3;
            number = (sub === 'children' || sub === 'they' || sub === 'we' || sub === 'boys' || sub === 'students') ? 'plural' : 'singular';
        }

        if (lowerWithPunct.match(/\b(she|mother|sister|girl|baai|yaadi|bhyamsi|buffalo|cow|gaay|gawdi)\b/i)) {
            gender = 'feminine';
        }

        const bVerbRoot = verbRoots[verb];
        let bVerbBase = BGE.conjugateContinuous(bVerbRoot, gender, number);
        const bAux = BGE.getAuxiliary(person, number, gender);

        // Special case for compound speech verb: waaathe karre
        if (verb === 'talking') bVerbBase = "waaathe karre";

        // Sort objList so targetObj (suffix) comes first
        let sortedObjs = [...objList];
        if (targetObj) {
            sortedObjs = sortedObjs.filter(o => o !== targetObj);
            sortedObjs.unshift(targetObj);
        }

        let filteredObjs = sortedObjs.filter(o => !bgeSkipWords.has(o));
        let bObjs = filteredObjs.map(o => {
            let bO = vocabOverrides[o] || (vocab[o] ? vocab[o][0] : o);
            if (o === targetObj && suffix) {
                const isOPlural = (o === 'children' || o === 'boys' || o === 'students');
                bO = BGE.attachSuffix(bO, suffix, isOPlural ? 'plural' : 'singular');
            }
            return bO;
        }).join(' ');

        if (bObjs) bObjs += " ";

        const sov = `${bSub} ${bObjs}${bVerbBase} ${bAux}`;
        return `🧠 RULE: ${sov}`;
    }

    // Third: word-by-word lookup
    const translated = [];
    const unknown = [];
    const skipWords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been',
        'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'from', 'and', 'or', 'but',
        'this', 'that', 'these', 'those', 'it', 'its', 'he', 'she', 'we', 'they',
        'his', 'her', 'our', 'their', 'who', 'which', 'what', 'how', 'not']);

    // Try multi-word matches first (2-3 word phrases)
    let i = 0;
    while (i < words.length) {
        let matched = false;

        // Try 3-word phrase
        if (i + 2 < words.length) {
            const phrase3 = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
            if (vocab[phrase3]) {
                translated.push(`${vocab[phrase3][0]}(${phrase3})`);
                i += 3;
                matched = true;
                continue;
            }
        }

        // Try 2-word phrase
        if (i + 1 < words.length) {
            const phrase2 = `${words[i]} ${words[i + 1]}`;
            if (vocab[phrase2]) {
                translated.push(`${vocab[phrase2][0]}(${phrase2})`);
                i += 2;
                matched = true;
                continue;
            }
        }

        // Single word
        const word = words[i];
        if (vocab[word]) {
            translated.push(`${vocab[word][0]}(${word})`);
        } else if (!skipWords.has(word)) {
            translated.push(`❓${word}`);
            unknown.push(word);
        }
        // Skip common words silently
        i++;
    }

    const suggestion = translated.join(' ');
    const unknownCount = unknown.length;
    const totalContent = translated.length;
    const knownCount = totalContent - unknownCount;

    let confidence = totalContent > 0 ? Math.round((knownCount / totalContent) * 100) : 0;

    return `[${confidence}%] ${suggestion}`;
}

// ===== GENERATE SUGGESTIONS FOR A BATCH =====
function generateBatchSuggestions(batchNum) {
    const { vocab, sentencePairs } = buildVocabulary();

    // Read batch sentences from HTML
    const html = fs.readFileSync(HTML_FILE, 'utf8');
    const batchRegex = new RegExp(`${batchNum}:\\s*\\[([\\s\\S]*?)\\]`);
    const match = html.match(batchRegex);

    if (!match) {
        console.error(`❌ Batch ${batchNum} not found in HTML.`);
        return;
    }

    // Extract sentences
    const sentenceRegex = /english:\s*"([^"]+)"/g;
    const sentences = [];
    let m;
    while ((m = sentenceRegex.exec(match[1])) !== null) {
        sentences.push(m[1]);
    }

    console.log(`\n🔍 Suggestions for Batch ${batchNum} (${sentences.length} sentences):\n`);
    console.log(`Vocabulary size: ${Object.keys(vocab).length} English terms mapped\n`);
    console.log('─'.repeat(80));

    const suggestions = [];
    sentences.forEach((sentence, idx) => {
        const suggestion = suggestTranslation(sentence, vocab, sentencePairs);
        suggestions.push({ english: sentence, suggestion });
        console.log(`\n${idx + 1}. ${sentence}`);
        console.log(`   → ${suggestion}`);
    });

    console.log('\n' + '─'.repeat(80));
    console.log('\n Legend: ✅=exact match, ❓=unknown word, (word)=source English');

    return suggestions;
}

// ===== UPDATE HTML WITH SUGGESTIONS =====
function updateHTMLWithSuggestions(batchNum) {
    const { vocab, sentencePairs } = buildVocabulary();
    let html = fs.readFileSync(HTML_FILE, 'utf8');

    const batchRegex = new RegExp(`(${batchNum}:\\s*\\[)([\\s\\S]*?)(\\])`);
    const match = html.match(batchRegex);

    if (!match) {
        console.error(`❌ Batch ${batchNum} not found in HTML.`);
        return;
    }

    // Extract and update sentences with suggestions
    const block = match[2];
    const sentenceRegex = /\{\s*english:\s*"([^"]+)",\s*suggestion:\s*"([^"]*)"\s*\}/g;

    let updatedBlock = block;
    let sm;
    while ((sm = sentenceRegex.exec(block)) !== null) {
        const sentence = sm[1];
        const suggestion = suggestTranslation(sentence, vocab, sentencePairs);
        // Escape for JS string
        const escaped = suggestion.replace(/"/g, '\\"');
        updatedBlock = updatedBlock.replace(
            `suggestion: "${sm[2]}"`,
            `suggestion: "${escaped}"`
        );
    }

    html = html.replace(match[0], match[1] + updatedBlock + match[3]);
    fs.writeFileSync(HTML_FILE, html, 'utf8');
    console.log(`✅ Updated ${HTML_FILE} with suggestions for Batch ${batchNum}`);
}

// ===== MAIN =====
if (require.main === module) {
    const args = process.argv.slice(2);
    switch (args[0]) {
        case '--batch': {
            const batchNum = parseInt(args[1]);
            if (isNaN(batchNum)) { console.error('Usage: node suggest_translations.js --batch <N>'); break; }
            generateBatchSuggestions(batchNum);
            break;
        }
        case '--update-html': {
            const batchNum = parseInt(args[1]);
            if (isNaN(batchNum)) { console.error('Usage: node suggest_translations.js --update-html <N>'); break; }
            generateBatchSuggestions(batchNum);
            updateHTMLWithSuggestions(batchNum);
            break;
        }
        default:
            console.log(`
🔍 Banjara Translation Suggestion Engine

Usage:
  node suggest_translations.js --batch <N>        Show suggestions for batch N
  node suggest_translations.js --update-html <N>  Update HTML tool with suggestions for batch N
            `);
    }
}

if (typeof module !== 'undefined' && require.main !== module) {
    module.exports = { buildVocabulary, suggestTranslation, parseCSV };
}
