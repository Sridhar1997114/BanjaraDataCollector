const fs = require('fs');
try {
    const wordsJS = fs.readFileSync('banjara_unique_words_with_english.js', 'utf8');
    let html = fs.readFileSync('word_recorder_ui.html', 'utf8');
    html = html.replace('<script src="banjara_unique_words_with_english.js"></script>', '<script>\n' + wordsJS + '\n</script>');
    fs.writeFileSync('word_recorder_ui.html', html, 'utf8');
    console.log('Injected dataset directly into HTML.');
} catch (e) {
    console.error(e);
}
