const BGE = require('./banjara_grammar.js');

console.log("--- Banjara Grammar Engine Test ---");

// Test 1: Location suffix
console.log("Village ->", BGE.toLocation("Taanda")); // Expected: Taanden
console.log("Market ->", BGE.toLocation("Dukaan"));  // Expected: Dukaanen

// Test 2: Pronouns
console.log("I (Possessive) ->", BGE.pronouns["I"].possessive); // Expected: maaro

// Test 3: Verb Conjugation
console.log("kar (Present Continuous, m, s) ->", BGE.conjugate("kar", "present_continuous", "m", "s"));
// Expected: karro chu

// Test 4: Reordering
const res = BGE.reorderToSOV("Me", "kaam", BGE.conjugate("kar", "present_continuous"));
console.log("SOV Reorder (I am doing work) ->", res);
// Expected: Me kaam karro chu
