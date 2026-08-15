const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Match StyleSheet.create blocks to inject fontFamily
      // We'll look for blocks that look like style definitions and add fontFamily if it's missing,
      // mapping fontWeight to the correct Inter font weight.
      // E.g., replace `fontWeight: 'bold'` with `fontFamily: 'Inter_700Bold', fontWeight: 'bold'`
      // E.g., replace `fontWeight: '600'` with `fontFamily: 'Inter_600SemiBold', fontWeight: '600'`
      // For lines with `fontSize` but no `fontWeight` and no `fontFamily`, add `fontFamily: 'Inter_400Regular'`
      
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.includes('fontSize:') || line.includes('fontWeight:')) {
          if (!line.includes('fontFamily:')) {
            if (line.includes("fontWeight: 'bold'") || line.includes('fontWeight: "bold"')) {
              lines[i] = line.replace(/fontWeight:\s*['"]bold['"]/, "fontFamily: 'Inter_700Bold', fontWeight: 'bold'");
              modified = true;
            } else if (line.includes("fontWeight: '600'") || line.includes('fontWeight: "600"')) {
              lines[i] = line.replace(/fontWeight:\s*['"]600['"]/, "fontFamily: 'Inter_600SemiBold', fontWeight: '600'");
              modified = true;
            } else if (line.includes("fontWeight: '500'") || line.includes('fontWeight: "500"')) {
              lines[i] = line.replace(/fontWeight:\s*['"]500['"]/, "fontFamily: 'Inter_500Medium', fontWeight: '500'");
              modified = true;
            } else if (line.includes('fontSize:')) {
              // Add regular font to anything with a font size that doesn't have a weight specified yet
              // Assuming it's safe to add. If it's a multi-line style block, this is fine.
              lines[i] = line + " fontFamily: 'Inter_400Regular',";
              modified = true;
            }
          }
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
        console.log(`Updated fonts in ${fullPath}`);
      }
    }
  });
}

processDirectory(srcDir);
console.log('Font update complete.');
