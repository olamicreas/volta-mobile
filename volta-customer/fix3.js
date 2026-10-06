const fs = require('fs');
let app = fs.readFileSync('App.js', 'utf8');
app = app.replace(
  `Dimensions, Image, StatusBar, ScrollView, Alert\n}`,
  `Dimensions, Image, StatusBar, ScrollView, Alert, ActivityIndicator\n}`
);
fs.writeFileSync('App.js', app);
