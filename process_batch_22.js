const fs = require('fs');
const path = require('path');

const datasetPath = 'verified_dataset.csv';
const audioSourceDir = 'f:\\Banjara AI\\Latest recordings';
const audioDestDir = 'f:\\Banjara AI\\BanjaraDataCollector\\audio';

// Batch 22 Data (Sentences 141-150)
// Copied from banjara_translations_2026-02-13T12-43-05.csv
const newRows = [
    '141,"What happened next elevated our entire community.","voor pacch eethi, apner puuro samaj eer izzath badgi.","aapner-our, samaj-community, voor-that, pacch eethi-after, apner puuro samaj eee-our whole community\'s, izzath-respect, badgi-increased",voor_pacch_eethi_apner_puuro_samaj_eer_izzath_badgi.wav,2026-02-13T12:11:09.421Z',
    '142,"The Nizam, impressed by his healing and wisdom, granted him a royal favor.","nazam voor kaam een dheeken, mothepari thi kai thoi duuchu keen ko","vor-his, anne-and, ee-him, nazam-nizam, voor-his, kaam een-work\'s, dheeken-saw/seen,, mothepari thi - kingly/royal, kai thoi - anything, duuchu-give, keen ko - said so.",nazam_voor_kaam_een_dheeken_mothepari_thi_kai_thoi_duuchu_keen_ko.wav,2026-02-13T12:16:03.132Z',
    '143,"Permission for our community\'s cattle to graze in a protected area.","Gor uur vasu, balad gavdi vun charayen surakshit jaag deeno","aapner-our, Gor uur-forGor\'s/ for community, vasu-for, balad vun -bulls, gavdi vun -cows, charayen-grazing, surakshit-safe/protected, jaag-area/land, deeno-gave",gor_uur_vasu_balad_gavdi_vun_charayen_surakshit_jaag_deeno.wav,2026-02-13T12:20:28.668Z',
    '144,"That area exists today.","Vu jaag aaj bhi che.","aaj-today, Vu-that, jaag-area, aaj-today, bhi-also, che-exists/there.",vu_jaag_aaj_bhi_che.wav,2026-02-13T12:21:31.348Z',
    '145,"Banjara Hills, Hyderabad.","Vuuz aaj eer hyderabad eer maai er banjara hills","hyderabad-hyderabad, Vuuz-thats, aaj eer-todays, hyderabad eer -of hyderabad, maai er-inside of, banjara hills-banjara hills",vuuz_aaj_eer_hyderabad_eer_maai_er_banjara_hills.wav,2026-02-13T12:24:03.436Z',
    '146,"Brothers and sisters, when you see Banjara Hills today, remember this.","maar gor bhaai bheeno, kannitoi banjara hills dikav janna ee vaath hardema rakado","bhaai-brothers, anne-and, kanna-when, tam-you, aaj-today, ee-this, maar-may, gor-gor(community), bhaai-brothers, bheeno-sisters,, kannitoi-when ever, banjara hills-banjara hills, dikav-seen/visible, janna-then, ee-this, vaath-words, hardema-in memory/remember, rakado-keep",maar_gor_bhaai_bheeno_kannitoi_banjara_hills_dikav_janna_ee_vaath_hardema_rakado.wav,2026-02-13T12:28:13.787Z',
    '147,"That prestigious area bears OUR community\'s name.","Vu mahaan jaag een apner jaath er naam paad melech","aapner-our, naam-name, Vu-that, mahaan-prestigious, jaag  een-place, apner-our, jaath er-naam, paad-given/lifter/gave, melech-kept",vu_mahaan_jaag_een_apner_jaath_er_naam_paad_melech.wav,2026-02-13T12:32:52.747Z',
    '148,"Because of Sant Sevalal Maharaj\'s achievement.","keval sant sevalal maharaj eer safaltha thi","eevur-of, keval-only, sant sevalal maharaj eer-sant sevalal maharaj\'s, safaltha-success/achievement, thi-because of",keval_sant_sevalal_maharaj_eer_safaltha_thi.wav,2026-02-13T12:35:49.044Z',
    '149,"The Nizam granted grazing rights to honor our Maharaj.","maharaj eer vasu, nizam apnun vottaz chara eer adhikar deeno.","aapner-our, maharaj eer-maharaj eer\'s vasu-for,, nizam-nizam, apnun-us/we, vottaz-there only, chara eer-to graze, adhikar-rights, deeno-gave.",maharaj_eer_vasu_nizam_apnun_vottaz_chara_eer_adhikar_deeno.wav,2026-02-13T12:38:30.427Z',
    '150,"He even commissioned his royal court artist to paint Sant Sevalal\'s portrait.","Raj darbar eer mai kalakaaren balathanin sant seval maharaj eer chitr karrayo","ee-he, vor-his, Raj darbar eer-royal court\'s, mai-in,  kalakaaren-artist\'s, balathanin-called and, sant seval maharaj eer-sant seval maharaj\'s, chitr-painting, karrayo-was done.",raj_darbar_eer_mai_kalakaaren_balathanin_sant_seval_maharaj_eer_chitr_karrayo.wav,2026-02-13T12:42:55.451Z'
];

// Append to CSV
let content = fs.readFileSync(datasetPath, 'utf8');
if (!content.endsWith('\n')) {
    content += '\n';
}
content += newRows.join('\n') + '\n';
fs.writeFileSync(datasetPath, content);
console.log('Successfully appended 10 new rows (141-150) to verified_dataset.csv');

// Move Audio Files
if (!fs.existsSync(audioDestDir)) {
    fs.mkdirSync(audioDestDir, { recursive: true });
}

newRows.forEach(row => {
    // Extract filename from the CSV row (5th column)
    // Note: Simple split by comma won't work due to commas in fields. 
    // We'll use the fact that the audio file is always before the timestamp at the end.
    // However, since we have the filenames hardcoded in our source array above, we can just extract them manually or via regex.

    // Regex to extract filename: looks for .wav followed by comma and timestamp
    const match = row.match(/,([a-zA-Z0-9_]+\.wav),/);
    if (match && match[1]) {
        const filename = match[1];
        const srcPath = path.join(audioSourceDir, filename);
        const destPath = path.join(audioDestDir, filename);

        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${filename}`);
        } else {
            console.error(`ERROR: Source file not found: ${srcPath}`);
        }
    } else {
        console.error('Could not extract filename from row:', row.substring(0, 50) + '...');
    }
});

console.log('Audio file processing complete.');
