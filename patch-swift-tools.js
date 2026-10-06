const fs = require('fs');
const path = require('path');

const patchFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('swift-tools-version: 6.2')) {
      content = content.replace(/swift-tools-version: 6\.2/g, 'swift-tools-version: 6.0');
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
