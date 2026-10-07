const fs = require('fs');
const path = require('path');

const patchRuntimeScheduler = (filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('inline void retainRuntimeScheduler')) return;
    if (content.includes('SWIFT_RETURNS_RETAINED')) {
        content = content.replace(/SWIFT_RETURNS_RETAINED /g, '');
        fs.writeFileSync(filePath, content);
        console.log(`Patched ${filePath} - Removed SWIFT_RETURNS_RETAINED`);
    } else {
        console.log(`Already patched ${filePath}`);
    }
  }
};

const patchPackageSwift = (filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('swiftLanguageModes: [.v6]')) {
        content = content.replace(/swiftLanguageModes: \[\.v6\]/g, 'swiftLanguageModes: [.v5]');
        fs.writeFileSync(filePath, content);
        console.log(`Patched ${filePath} - Changed swiftLanguageModes to .v5`);
    } else {
        console.log(`Already patched ${filePath}`);
    }
  }
};

const appDir = __dirname;
patchRuntimeScheduler(path.join(appDir, 'node_modules/expo-modules-jsi/apple/Sources/ExpoModulesJSI-Cxx/include/RuntimeScheduler.h'));
patchPackageSwift(path.join(appDir, 'node_modules/expo-modules-jsi/apple/Package.swift'));
