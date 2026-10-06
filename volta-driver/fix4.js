const fs = require('fs');
let app = fs.readFileSync('App.js', 'utf8');
app = app.replace(
  `Dimensions, Image, StatusBar, Alert\n}`,
  `Dimensions, Image, StatusBar, Alert, ActivityIndicator\n}`
);
fs.writeFileSync('App.js', app);
