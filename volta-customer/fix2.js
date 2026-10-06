const fs = require('fs');
let app = fs.readFileSync('App.js', 'utf8');

// Ensure ActivityIndicator is imported
if (!app.includes('ActivityIndicator')) {
    app = app.replace('Dimensions, Image, StatusBar, ScrollView, Alert', 'Dimensions, Image, StatusBar, ScrollView, Alert, ActivityIndicator');
}

app = app.replace(
  `<require('react-native').ActivityIndicator size="large" color="#000" />`,
  `<ActivityIndicator size="large" color="#000" />`
);
fs.writeFileSync('App.js', app);
