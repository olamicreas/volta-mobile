const fs = require('fs');
const path = require('path');

const patchFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    if (content.includes('swift-tools-version: 6.2')) {
      content = content.replace(/swift-tools-version: 6\.2/g, 'swift-tools-version: 6.0');
      modified = true;
    }
    if (content.includes('swiftLanguageModes: [.v6]')) {
      content = content.replace(/swiftLanguageModes: \[\.v6\]/g, 'swiftLanguageModes: [.v5]');
      modified = true;
    }
    if (content.includes('.enableUpcomingFeature("InferIsolatedConformances")')) {
      content = content.replace(/\.enableUpcomingFeature\("InferIsolatedConformances"\),?/g, '// .enableUpcomingFeature("InferIsolatedConformances"),');
      modified = true;
    }
    if (content.includes('.enableUpcomingFeature("NonisolatedNonsendingByDefault")')) {
      content = content.replace(/\.enableUpcomingFeature\("NonisolatedNonsendingByDefault"\),?/g, '// .enableUpcomingFeature("NonisolatedNonsendingByDefault"),');
      modified = true;
    }
    if (/,(\s*\))/.test(content)) {
      content = content.replace(/,(\s*\))/g, '$1');
      modified = true;
    }
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Patched ${filePath}`);
    }
  }
};

const apps = ['volta-customer', 'volta-driver'];
const modulesToPatch = [
  'expo-modules-jsi/apple/Package.swift',
  '@expo/expo-modules-macros-plugin/apple/Package.swift'
];

apps.forEach(app => {
  modulesToPatch.forEach(mod => {
    patchFile(path.join(__dirname, app, 'node_modules', mod));
  });
});
