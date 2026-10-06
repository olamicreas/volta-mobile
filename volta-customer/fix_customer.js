const fs = require('fs');

// 1. Fix Customer AccountScreen Logout
let acc = fs.readFileSync('src/screens/AccountScreen.js', 'utf8');
acc = acc.replace(
  `<TouchableOpacity style={styles.logoutBtn}>`,
  `<TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>`
);
acc = acc.replace(`export default function AccountScreen({ navigation }) {`, `export default function AccountScreen({ navigation, route }) {\n  const onLogout = route?.params?.onLogout || (() => {});`);
fs.writeFileSync('src/screens/AccountScreen.js', acc);

// 2. Fix Customer App.js
let app = fs.readFileSync('App.js', 'utf8');
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
// Find where AccountScreen is navigated to. It's probably in the Bottom Nav or Drawer.
// Wait, customer app has a Bottom Nav? Or is it inline? Let's check `showNav` and `view === 'ACCOUNT'`
// Actually, `App.js` sets views. Wait, how is AccountScreen shown?
// `view === 'ACCOUNT' && <AccountScreen ... />` maybe?
