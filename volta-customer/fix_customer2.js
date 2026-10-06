const fs = require('fs');
let app = fs.readFileSync('App.js', 'utf8');

// The autoLoginCode is already injected by previous script? No, let's check if it's there.
if (!app.includes('isInitializing')) {
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
          setView('HOME');
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
    app = app.replace(`return (`, `if (isInitializing) return <View style={{flex:1, backgroundColor:'#fff', justifyContent:'center', alignItems:'center'}}><ActivityIndicator size="large" color="#000" /></View>;\n  return (`);
}

app = app.replace(
  `<AccountScreen profile={profile} navigation={{...navigation, goBack: () => setView('HOME')}} />`,
  `<AccountScreen profile={profile} navigation={{...navigation, goBack: () => setView('HOME')}} route={{params: {onLogout: async () => { await require('@react-native-async-storage/async-storage').default.removeItem('userToken'); setProfile(null); socket.disconnect(); setView('AUTH'); }}}} />`
);

fs.writeFileSync('App.js', app);

// 3. Fix Customer AuthScreen verifyOTP
let auth = fs.readFileSync('src/screens/AuthScreen.js', 'utf8');
auth = auth.replace(
`        // Fetch profile to see if new user
        try {
            const prof = await api.getProfile();
            if (!prof.first_name) {
                setStep('PROFILE');
                return;
            }
        } catch(e) {}
        
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(async () => {
          onLogin(data.access_token);
        });`,
`        // Fetch profile to see if new user
        try {
            const prof = await api.getProfile();
            if (!prof.first_name) {
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

console.log("Customer fixed!");
