const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/(auth)/login.tsx',
  'src/app/(auth)/signup.tsx',
  'src/app/(tabs)/index.tsx',
  'src/app/(tabs)/browse.tsx',
  'src/app/(tabs)/cart.tsx',
  'src/app/(tabs)/orders.tsx',
  'src/app/(tabs)/search.tsx',
  'src/app/distributor/[id].tsx',
  'src/app/distributors/index.tsx',
  'src/app/generic/index.tsx',
  'src/app/order/[id].tsx',
  'src/app/outstandings/index.tsx',
  'src/app/profile/index.tsx',
  'src/app/returns/index.tsx',
  'src/app/returns/initiate.tsx',
  'src/app/static/privacy.tsx',
  'src/app/static/terms.tsx'
];

filesToFix.forEach(relPath => {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Add Platform and StatusBar to react-native import
  const rnImportRegex = /import\s+{([^}]*)}\s+from\s+['"]react-native['"];?/;
  const match = content.match(rnImportRegex);
  
  if (match) {
    let importsStr = match[1];
    let imports = importsStr.split(',').map(s => s.trim()).filter(s => s);
    let changed = false;
    
    if (!imports.includes('Platform')) {
      imports.push('Platform');
      changed = true;
    }
    if (!imports.includes('StatusBar')) {
      imports.push('StatusBar');
      changed = true;
    }
    
    if (changed) {
      const newImport = `import { ${imports.join(', ')} } from 'react-native';`;
      content = content.replace(match[0], newImport);
    }
  } else {
    // If no react-native import exists (unlikely), just add it at the top
    content = `import { Platform, StatusBar } from 'react-native';\n` + content;
  }

  // Inject paddingTop into safeArea
  const safeAreaRegex = /safeArea:\s*{\s*\n/;
  if (safeAreaRegex.test(content)) {
      if (!content.includes("paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0")) {
          content = content.replace(safeAreaRegex, `safeArea: {\n    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,\n`);
      }
  } else {
      console.log(`Could not find safeArea style in: ${filePath}`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
});
