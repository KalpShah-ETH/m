const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const colorMap = {
  // Primary
  '#0066cc': '#0F9B8E',
  '#005bb5': '#0D8B7F', // Slightly darker primary if used
  
  // Neutral background
  '#f5f7fa': '#FAFAFA',
  
  // Text
  '#333333': '#1F2937',
  "'#333'": "'#1F2937'",
  '"#333"': '"#1F2937"',
  
  // Success Green
  '#1e8e3e': '#16A34A',
  '#e6f4ea': '#DCFCE7', // Light green bg
  
  // Alert Red
  '#d93025': '#DC2626',
  '#fce8e6': '#FEE2E2', // Light red bg
  '#fad2cf': '#FECACA', // Lighter red border
  
  // Accents / Light Backgrounds
  '#e6f2ff': '#E0F2F1', // Was light blue, now light teal
  '#f0f8ff': '#E0F2F1',
  '#b06000': '#F5A623', // Warning orange text mapped to amber
  '#fef7e0': '#FEF3C7', // Warning bg
  '#fce8b2': '#FDE68A', // Warning border
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
        // Case-insensitive replace for colors like #0066CC
        const regex = new RegExp(oldColor, 'gi');
        if (regex.test(content)) {
          content = content.replace(regex, newColor);
          modified = true;
        }
      });

      // Inject fontFamily: 'Inter' where fontWeight is not bold, or just apply it globally
      // Actually, standard practice in React Native is to add fontFamily to text styles.
      // We will add fontFamily: 'Inter_400Regular' for normal text, 'Inter_600SemiBold' for bold text, etc.
      // But the easiest way is to let the user see the font loaded, and maybe just replace 'fontWeight: \'bold\'' with 'fontFamily: \'Inter_700Bold\''.
      // To keep it simple and robust, we can just replace 'fontWeight: \'bold\'' with 'fontWeight: \'bold\', fontFamily: \'Inter_700Bold\'' 
      // But wait, React Native doesn't strictly need font weights removed if the fontFamily maps to it, except on Android where custom fonts need explicit files.
      // Let's just do a basic replace for font family on Text elements.
      const styleRegex = /fontSize:\s*\d+,/g;
      if (styleRegex.test(content) && !content.includes('fontFamily:')) {
        // Let's not risk breaking the layout with naive regex for fonts.
        // I will update the root layout to use defaultProps for Text if possible, or just skip it here and do it safely in _layout.tsx.
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated colors in ${fullPath}`);
      }
    }
  });
}

processDirectory(srcDir);
console.log('Color theme update complete.');
