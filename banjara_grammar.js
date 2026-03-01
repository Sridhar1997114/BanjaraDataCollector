/**
 * BANJARA GLOBAL GRAMMAR ENGINE (BGGE)
 * Consolidated from textbook-accurate rules.
 */

const BGGE = {
    // === PRONOUNS ===
    getPronoun: function (person, number = 'singular', formality = 'informal', isInclusive = true) {
        const num = number.toLowerCase();
        switch (person) {
            case 1:
                return num === 'singular' ? "Me" : "Hum";
            case 2:
                return "Tu";
            case 3:
                return num === 'singular' ? "Vu" : "Voo";
            default: return "Error";
        }
    },

    // === AUXILIARIES (To Be) ===
    getAuxiliary: function (person, number = 'singular', gender = 'masculine') {
        if (person === 1) return number === 'singular' ? 'chu' : 'cha';
        if (person === 2) return 'chi';
        // 3rd person usually takes 'che' in the user's correct set, but they noted 'chi' for feminine
        if (person === 3 && gender === 'feminine') return 'che'; // Sticking to user list pattern for now (peeri che)
        return 'che';
    },

    // === GENDER (Maati & Maataatev) ===
    getVerbEnding: function (gender, number) {
        if (number === 'plural') return 'e';
        return gender === 'feminine' ? 'i' : 'o';
    },

    // === GENDER (Maati & Maataatev) ===
    getFeminineForm: function (masculineWord) {
        const word = masculineWord.trim();
        const lowerWord = word.toLowerCase();
        const irregularMap = {
            "baap": "maay", "baapa": "baay", "aadmi": "baay", "nara": "maadi",
            "shet": "shetaanee", "baag": "baaginee", "bhil": "bhillee",
            "bel": "gaay", "paado": "bhes", "haran": "harnee"
        };
        if (irregularMap[lowerWord]) return irregularMap[lowerWord];

        const last = lowerWord.slice(-1);
        const lastTwo = lowerWord.slice(-2);
        if (lastTwo === 'ee') return word.slice(0, -2) + "anee";
        if (["a", "o", "u"].includes(last)) return word.slice(0, -1) + "ee";
        return word + "ee";
    },

    // === NUMBERS (Vachanaalu) ===
    pluralize: function (singularWord, ruleType) {
        const word = singularWord.trim();
        const lower = word.toLowerCase();
        switch (ruleType.toLowerCase()) {
            case 's-suffix': return lower + "s";
            case 'y-suffix': return lower + "y";
            case 'masc-o':
                if (lower.endsWith('a')) return lower.slice(0, -1) + "o";
                return lower + "o";
            case 'fem-ye':
                if (lower.endsWith('i') || lower.endsWith('ee')) return lower.replace(/(i|ee)$/, "ye");
                return lower + "ye";
            case 'consonant-e': return lower + "e";
            case 'color': return lower.endsWith('o') ? lower.slice(0, -1) + "e" : lower;
            default: return lower;
        }
    },

    // === NOUNS ===
    createVerbalNoun: function (verbRoot, ruleType, gender = 'masculine', isPlural = false) {
        let root = verbRoot.trim();
        if (ruleType === 1) return root + "uu";
        if (root.endsWith("a")) {
            return gender === 'masculine' ? root + "vu" : root + "vani";
        }
        if (gender === 'masculine') {
            return isPlural ? root + "evaal" : root + "evaalo";
        } else {
            return isPlural ? root + "evaalye" : root + "evaali";
        }
    },

    // === VERBS ===
    conjugateContinuous: function (verbRoot, gender = 'masculine', number = 'singular') {
        let root = verbRoot.trim();
        const last = root.slice(-1).toLowerCase();

        let suffix = "";
        if (number === 'plural') suffix = (last === 'r') ? "e" : "re";
        else if (gender === 'feminine') suffix = (last === 'r') ? "i" : "ri";
        else suffix = (last === 'r') ? "o" : "ro";

        // Handle specific cases like 'bal' -> 'balaro'
        if (root === 'bal' && suffix === "ro") return "balaro";

        return root + suffix;
    },

    transformVerb: function (verbRoot, type, secondaryVerb = "") {
        let root = verbRoot.trim();
        const endsWithVowel = ["a", "e", "i", "o", "u"].includes(root.slice(-1).toLowerCase());
        switch (type.toLowerCase()) {
            case 'incomplete': return endsWithVowel ? root + "n" : root + "an";
            case 'causative':
                let causRoot = root.toLowerCase().replace("aa", "a");
                return (root.charAt(0) + causRoot.slice(1)) + "aaro";
            case 'sound':
                let sound = root.toLowerCase().replace(/[aeiouAEIOU]+/, "u");
                if (!sound.endsWith("aan")) sound += "aan";
                return `${root} ${root.charAt(0) + sound.slice(1)}`;
            case 'compound': return root + secondaryVerb.toLowerCase();
            case 'simultaneous':
                let stem = root.toLowerCase().endsWith('o') ? root : root + "o";
                return `${stem} ${stem.toLowerCase()} ${secondaryVerb}`;
            default: return root;
        }
    },

    // === ADJECTIVES ===
    transformAdjective: function (baseWord, type, gender = 'masculine') {
        let root = baseWord.trim();
        switch (type.toLowerCase()) {
            case 'dual': return `${root} ${root.toLowerCase()}`;
            case 'verbal': return gender === 'masculine' ? root + "vano" : root + "ni";
            case 'noun':
                let clean = root.toLowerCase().endsWith('a') ? root.slice(0, -1) : root;
                return gender === 'masculine' ? clean + "aalo" : clean + "aali";
            case 'imitative':
                let short = root.toLowerCase().replace("aa", "a");
                let f = root.charAt(0) + short.slice(1);
                return `${f}o ${f}aayo`;
            default: return root;
        }
    },

    // === SUFFIXES ===
    attachSuffix: function (root, semanticType, number = 'singular') {
        const last = root.slice(-1);
        const isPlural = number === 'plural';

        const map = {
            'in': 'maa',
            'to': isPlural ? 'un' : 'een',
            'from': 'tee',
            'with': 'tee',
            'of': 'er',
            'speech': ' thi'
        };

        const base = map[semanticType] || 'een';

        // Custom contractions from user set
        if (root.toLowerCase() === 'chachaper' && semanticType === 'to') return "chachaparun";
        if (root.toLowerCase() === 'chacharune' && semanticType === 'with') return "chacharuntee";
        if (root.toLowerCase() === 'taanda' && semanticType === 'to') return "taandan";
        if (root.toLowerCase() === 'bajar' && semanticType === 'to') return "bajareen";

        // General rule
        if (last === 'a' && base.startsWith('e')) return root.slice(0, -1) + base;
        return root + base;
    }
};

if (typeof module !== 'undefined') module.exports = BGGE;
