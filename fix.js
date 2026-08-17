const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Fix inline duplicate font families
  content = content.replace(/fontFamily:\s*'Inter_400Regular',\s*fontFamily:/g, 'fontFamily:');
  
  // Fix multiline duplicate font families
  content = content.replace(/fontFamily:\s*'Inter_400Regular',\s*\n\s*fontFamily:/g, 'fontFamily:');
  
  // Fix the syntax error injected by marginBottom: 16
  content = content.replace(/},\s*\n\s*marginBottom:\s*16,\s*\n\s*},/g, '},');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed syntax errors in:', file);
  }
});
