const fs = require('fs');
let app = fs.readFileSync('App.js', 'utf8');
app = app.replace(
  `    if (isInitializing) return <View style={{flex:1, backgroundColor:'#fff', justifyContent:'center', alignItems:'center'}}><ActivityIndicator size="large" color="#000" /></View>;\n  return () => { showSub.remove(); hideSub.remove(); };`,
  `    return () => { showSub.remove(); hideSub.remove(); };`
);
app = app.replace(
  `  return (\n    <View style={styles.root}>`,
  `  if (isInitializing) return <View style={{flex:1, backgroundColor:'#fff', justifyContent:'center', alignItems:'center'}}><require('react-native').ActivityIndicator size="large" color="#000" /></View>;\n  return (\n    <View style={styles.root}>`
);
fs.writeFileSync('App.js', app);
