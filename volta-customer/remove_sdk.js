const fs = require('fs');
let app = fs.readFileSync('app.json', 'utf8');
app = app.replace(
  `"usesCleartextTraffic": true,\n            "compileSdkVersion": 36,\n            "targetSdkVersion": 34,\n            "buildToolsVersion": "34.0.0"`,
  `"usesCleartextTraffic": true`
);
fs.writeFileSync('app.json', app);
