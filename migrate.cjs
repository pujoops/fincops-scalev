const fs = require('fs');

try {
  const html = fs.readFileSync('fincops Scalev.html', 'utf8');
  const startIdx = html.indexOf('<style>');
  const endIdx = html.indexOf('</style>', startIdx);
  
  if (startIdx !== -1 && endIdx !== -1) {
    const css = html.substring(startIdx + 7, endIdx).trim();
    fs.writeFileSync('src/index.css', css);
    console.log('CSS migrated successfully, length: ' + css.length);
  } else {
    console.log('Could not find style tags');
  }
} catch (e) {
  console.error(e);
}
