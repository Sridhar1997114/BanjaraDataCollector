const fs = require('fs');
const path = require('path');

const datasetPath = 'verified_dataset.csv';

const newRows = [
    '211,"Using herbs from the forest.","jungle eer jadi bootivuthi","eeti-from, jungle eer-of forest, jadi bootivuthi - with herbs (jadibooti=herbs)",jungle_eer_jadi_bootivuthi.wav,2026-02-13T11:03:28.351Z',
    '212,"Using ancient healing knowledge.","an peenaro vaidyeer gyan eethi","peenaro-ancient, an-and, peenaro-ancient, viadyeer gyan-of healing knowledge,  eethi-with",an_peenaro_vaidyeer_gyan_eethi.wav,2026-02-13T11:06:43.232Z',
    '213,"And miraculously, people began recovering.","chamatkaar eer nai see admivun aacho veego.","anne-and, mannkya-people, chamatkaar eer nai-miraculously, see admivun-all people, aacho veego-were healed/good happened",chamatkaar_eer_nai_see_admivun_aacho_veego.wav,2026-02-13T11:08:57.103Z',
    '214,"Day after day, our Maharaj worked tirelessly.","daade daade keen, apnero maharaj haareniju kaamkido","aapner-our, daade daade keen- day by day, maharaj-maharaj, haareniju-tirelessly, kaamkido-worked",daade_daade_keen_apnero_maharaj_haareniju_kaamkido.wav,2026-02-13T11:10:55.727Z',
    '215,"Treating the sick without discrimination.","bhed bahaav chey ju sendur dhekbal kidho","bimar-sick, bhed bahaav-discrimination, chey ju-without, sendur-all of them, dhekbal-took care/treating, kidho-did",bhed_bahaav_chey_ju_sendur_dhekbal_kidho.wav,2026-02-13T11:13:37.215Z',
    '216,"Hindu, Muslim, rich, poor—all received his care.","hindu, masanmaan, ameer gareeb ken kaai deeto koni","vor-his, hindu-hindu, masanmaan-muslim, ameer-rich, gareeb-poor, ken-like, kaai-whatever, deeto-saw, koni-no/didnt",hindu_masanmaan_ameer_gareeb_ken_kaai_deeto_koni.wav,2026-02-13T11:16:39.000Z',
    '217,"By the time the epidemic ended, he had saved thousands of lives.","Vu mahammari kam ve jatrama, hazaru mankyavun banchadlido","time-time, ee-he, eevur-of, Vu mahammari-that epidemic ,  kam ve-ended/lessen, jatrama-within, hazaru-thousands of, mankya vun-to people, banchado lido-saved lives.",vu_mahammari_kam_ve_jatrama_hazaru_mankyavun_banchadlido.wav,2026-02-13T11:19:33.790Z',
    '218,"This is historically documented.","hannu ken itihaas eer mai lakhmele che","ee-this, che-is, hannu ken-like that, itihaas eer mai- inside history/historically, lakhmele che-is written",hannu_ken_itihaas_eer_mai_lakhmele_che.wav,2026-02-13T11:21:10.070Z',
    '219,"The Nizam of Hyderabad heard of this extraordinary achievement.","hyderabad eero nizam een ee kamaaleer baarema malam padi","eevur-of, hyderabad-hyderabad, eevur-of, ee-this, hyderabad eero-of hyderabad, nizam een - to nizam, ee-this, kamaaleer-of wonder, baarema-about it, malam padi-got to know.",hyderabad_eero_nizam_een_ee_kamaaleer_baarema_malam_padi.wav,2026-02-13T11:24:38.575Z',
    '220,"He summoned Sant Sevalal to his royal court.","Janna Raj darbar een Sant Sevalal maharaj een balaye.","ee-he, een-to, vor-his, Janna-then, Raj darbar een-to royal court, Sant Sevalal maharaj een -Sant Sevalal maharaj, balaye-invited/summoned",janna_raj_darbar_een_sant_sevalal_maharaj_een_balaye.wav,2026-02-13T11:26:41.478Z'
];

let content = fs.readFileSync(datasetPath, 'utf8');

// Ensure we end with a newline before appending
if (!content.endsWith('\n')) {
    content += '\n';
}

content += newRows.join('\n') + '\n';

fs.writeFileSync(datasetPath, content);
console.log('Successfully appended 10 new rows to verified_dataset.csv');
