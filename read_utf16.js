const fs = require('fs');
try {
    const data = fs.readFileSync('docx_output.txt');
    console.log(data.toString('utf16le'));
} catch (e) {
    console.log(e.message);
}
