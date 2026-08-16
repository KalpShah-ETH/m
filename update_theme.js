const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const colorMap = {
  // Old Primary Teal -> New Primary Forest Green
  '#0F9B8E': '#1F5B4E',
  '#0D8B7F': '#154238', // Darker variant

  // Old Success Green -> New Primary Forest Green (Success maps to primary now)
  '#16A34A': '#1F5B4E',
  '#DCFCE7': '#E8F0EE', // Light green bg -> Light forest bg

  // Old Amber Accent -> New Primary Forest Green (No separate accent)
  '#F5A623': '#1F5B4E',
  '#FEF3C7': '#E8F0EE', // Light amber bg -> Light forest bg
  '#FDE68A': '#1F5B4E', // Warning border -> Forest green border

  // Light Teal bg -> Light forest bg
  '#E0F2F1': '#E8F0EE',
};

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

      // Update colors
      Object.entries(colorMap).forEach(([oldColor, newColor]) => {
        // Case-insensitive replace
        const regex = new RegExp(oldColor, 'gi');
        if (regex.test(content)) {
          content = content.replace(regex, newColor);
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated colors in ${fullPath}`);
      }
    }
  });
}

processDirectory(srcDir);
console.log('Forest Green Color theme update complete.');
