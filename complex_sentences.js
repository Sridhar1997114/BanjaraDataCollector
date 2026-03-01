const BGGE = require('./banjara_grammar.js');

const sentences = [
    {
        english: "The teacher is teaching the students in the village.",
        components: { sub: "Garu", obj: "Taandaana", verb: "gyan dero chu" },
        banjara: "Garu taandaana gyan dero chu."
    },
    {
        english: "My elder brother went to the market to buy a cow.",
        components: { sub: "Maaro bhiya", obj: "gavdi molkarne", verb: "harras-en gayo" },
        banjara: "Maaro bhiya harras-en gavdi molkarne gayo."
    },
    {
        english: "The small boy is crying because he lost his ball.",
        components: { sub: "Nanka pika", obj: "cendu", verb: "roro chu" },
        banjara: "Nanka pika cendu khogo hanukan roro chu."
    },
    {
        english: "They are playing football in the big field behind the house.",
        components: { sub: "Ve", obj: "ghareer paccam motis jag-maa football", verb: "khudre cha" },
        banjara: "Ve ghareer paccam motis jag-maa football khudre cha."
    },
    {
        english: "I will give you a beautiful gift on your birthday.",
        components: { sub: "Mai", obj: "taare janam-dadi-par ac-dikavajako bamyi", verb: "denu" },
        banjara: "Mai taare janam-dadi-par ac-dikavajako bamyi denu."
    },
    {
        english: "Mother is cooking delicious food for everyone in the kitchen.",
        components: { sub: "Maay", obj: "se-kajan miti khvadi arra-maa", verb: "rand-ri chu" },
        banjara: "Maay arra-maa se-kajan miti khvadi rand-ri chu."
    },
    {
        english: "We should respect our elders and tell the truth always.",
        components: { sub: "Aapan", obj: "bujargo-na maner-ti khara-vate", verb: "bolno" },
        banjara: "Aapan bujargo-na maner-ti reno ane kanna khara-vate bolno."
    },
    {
        english: "He accidentally broke the big water container with a stone.",
        components: { sub: "O", obj: "bhata-ti motis koldi", verb: "phod-nak-o" },
        banjara: "O acanak bhata-ti motis koldi phod-nak-o."
    },
    {
        english: "The bird is flying high above the acacia tree.",
        components: { sub: "Pitta", obj: "bommolir jhad-er uncam", verb: "ud-ri chu" },
        banjara: "Pitta bommolir jhad-er uncam uncam ud-ri chu."
    },
    {
        english: "If you work hard, you will get a good job in the city.",
        components: { sub: "Tu", obj: "gam-maa ac-kaam", verb: "lab-i" },
        banjara: "Tu jor-ti kaam kare to, tonne gam-maa ac-kaam lab-i."
    }
];

console.log("# Banjara Complex Sentences (Textbook Accuracy)\n");
sentences.forEach((s, i) => {
    console.log(`${i + 1}. **English**: ${s.english}`);
    console.log(`   **Banjara**: ${s.banjara}\n`);
});
