const fs = require('fs');

// 1. Fix Driver AccountScreen Logout
let acc = fs.readFileSync('src/screens/AccountScreen.js', 'utf8');
acc = acc.replace(
  `<TouchableOpacity style={styles.logoutBtn}>`,
  `<TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>`
);
// Make sure onLogout is passed as a prop
acc = acc.replace(`export default function AccountScreen({ navigation }) {`, `export default function AccountScreen({ navigation, route }) {\n  const onLogout = route?.params?.onLogout || (() => {});`);
fs.writeFileSync('src/screens/AccountScreen.js', acc);

// 2. Fix Driver App.js
let app = fs.readFileSync('App.js', 'utf8');
// Add useEffect for auto-login
const autoLoginCode = `
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await require('@react-native-async-storage/async-storage').default.getItem('userToken');
        if (token) {
          const p = await api.getProfile();
          setProfile(p);
          socket.connect();
          setView('OFFLINE');
        }
      } catch(e) {
        console.log('Auto-login failed:', e);
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, []);
`;
app = app.replace(`const mapRef = useRef(null);`, autoLoginCode + `\n  const mapRef = useRef(null);`);
app = app.replace(`onSettingsPress={() => navigation.navigate('Preferences')}`, `onSettingsPress={() => navigation.navigate('Preferences')}\n            onLogoutPress={async () => { await require('@react-native-async-storage/async-storage').default.removeItem('userToken'); setProfile(null); socket.disconnect(); setView('AUTH'); }}`);
// Pass onLogout to AccountScreen inside MainApp navigation.navigate? No, DashboardScreen doesn't navigate to Account directly, wait it does!
// onMenuPress={() => navigation.navigate('Account')}
app = app.replace(`onMenuPress={() => navigation.navigate('Account')}`, `onMenuPress={() => navigation.navigate('Account', { onLogout: async () => { await require('@react-native-async-storage/async-storage').default.removeItem('userToken'); setProfile(null); socket.disconnect(); setView('AUTH'); navigation.navigate('Main'); }})}`);
// Also return loading screen if isInitializing
app = app.replace(`return (`, `if (isInitializing) return <View style={{flex:1, backgroundColor:'#121212', justifyContent:'center', alignItems:'center'}}><ActivityIndicator size="large" color="#05A357" /></View>;\n  return (`);
fs.writeFileSync('App.js', app);

// 3. Fix Driver AuthScreen
let auth = fs.readFileSync('src/screens/AuthScreen.js', 'utf8');
// In verifyOTP, if getProfile throws, show error and don't login!
auth = auth.replace(
`        try {
            const prof = await api.getProfile();
            if (!prof.first_name || isApplying) {
                if (!prof.first_name && !isApplying) {
                    Alert.alert("Account Not Found", "This phone number isn't registered. Let's get you set up to drive!");
                }
                setStep('PROFILE');
                return;
            }
        } catch(e) { console.log('Get profile error:', e); }
        
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(async () => {
          onLogin(data.access_token);
        });`,
`        try {
            const prof = await api.getProfile();
            if (!prof.first_name || isApplying) {
                if (!prof.first_name && !isApplying) {
                    require('react-native').Alert.alert("Account Not Found", "This phone number isn't registered. Let's get you set up to drive!");
                }
                setStep('PROFILE');
                return;
            }
            Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(async () => {
              onLogin(data.access_token);
            });
        } catch(e) {
            setError('Failed to fetch profile. Is the server online?');
            setLoading(false);
            return;
        }`
);
fs.writeFileSync('src/screens/AuthScreen.js', auth);

console.log("Driver fixed!");
