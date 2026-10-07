const fs = require('fs');
const path = require('path');

const patchRuntimeScheduler = (filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('inline void retainRuntimeScheduler')) return;
    
    // We already moved SWIFT_SHARED_REFERENCE to the front and added forward decls in the previous commit.
    // Let's strip SWIFT_RETURNS_RETAINED from the constructors.
    if (content.includes('SWIFT_RETURNS_RETAINED')) {
        content = content.replace(/SWIFT_RETURNS_RETAINED /g, '');
        fs.writeFileSync(filePath, content);
        console.log(`Patched ${filePath} - Removed SWIFT_RETURNS_RETAINED`);
    } else {
        console.log(`Already patched ${filePath}`);
    }
  }
};

patchRuntimeScheduler(path.join(__dirname, 'node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI-Cxx/include/RuntimeScheduler.h'));
