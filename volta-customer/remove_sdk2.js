const fs = require('fs');
let app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
const props = app.expo.plugins.find(p => Array.isArray(p) && p[0] === 'expo-build-properties');
if (props) {
    delete props[1].android.compileSdkVersion;
    delete props[1].android.targetSdkVersion;
    delete props[1].android.buildToolsVersion;
}
fs.writeFileSync('app.json', JSON.stringify(app, null, 2));
