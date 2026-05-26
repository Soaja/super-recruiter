import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from './src/context/AppContext';
import { LanguageProvider, LanguageContext } from './src/context/LanguageContext';
import { Theme } from './src/constants/Theme';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SearchScreen from './src/screens/SearchScreen';
import ContactScreen from './src/screens/ContactScreen';
import AdminScreen from './src/screens/AdminScreen';

// Icons
import { Home, UserPlus, User, Search, PhoneCall, Languages, Lock } from 'lucide-react-native';

function MainAppContent() {
  const { width } = useWindowDimensions();
  const isWeb = width > 768;
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [params, setParams] = useState({});
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [logoTapCount, setLogoTapCount] = useState(0);

  const { locale, changeLanguage, t } = useContext(LanguageContext);

  // Inject global CSS for web to completely eliminate horizontal scrolling and default browser margins
  useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = `
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          max-width: 100vw;
          overflow-x: hidden !important;
          position: relative;
          touch-action: pan-y !important;
          background-color: #0d0d0d !important;
          box-sizing: border-box;
        }
        #root > div {
          width: 100% !important;
          max-width: 100vw !important;
          overflow-x: hidden !important;
          touch-action: pan-y !important;
        }
        * {
          box-sizing: border-box;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('admin') === 'true' || window.location.hash.includes('admin')) {
          setCurrentScreen('Admin');
        }
      } catch (e) {
        console.log('Error checking URL params:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (logoTapCount > 0) {
      const timer = setTimeout(() => {
        setLogoTapCount(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [logoTapCount]);

  const handleLogoPress = () => {
    navigate('Home');
    const newCount = logoTapCount + 1;
    setLogoTapCount(newCount);
    if (newCount >= 5) {
      navigate('Admin');
      setLogoTapCount(0);
    }
  };

  const navigate = (screenName, screenParams = {}) => {
    setCurrentScreen(screenName);
    setParams(screenParams);
  };

  const renderScreen = () => {
    const route = { params };
    const navigation = { navigate };

    switch (currentScreen) {
      case 'Home':
        return <HomeScreen navigation={navigation} route={route} />;
      case 'Register':
        return <RegisterScreen navigation={navigation} route={route} />;
      case 'Profile':
        return <ProfileScreen navigation={navigation} route={route} />;
      case 'Search':
        return <SearchScreen navigation={navigation} route={route} />;
      case 'Contact':
        return <ContactScreen navigation={navigation} route={route} />;
      case 'Admin':
        return <AdminScreen navigation={navigation} route={route} />;
      default:
        return <HomeScreen navigation={navigation} route={route} />;
    }
  };

  const activeLangName = () => {
    if (locale === 'sr') return 'SR';
    if (locale === 'ne') return 'NE';
    if (locale === 'sw') return 'SW';
    if (locale === 'uz') return 'UZ';
    if (locale === 'ru') return 'RU';
    if (locale === 'hi') return 'HI';
    if (locale === 'id') return 'ID';
    if (locale === 'ar') return 'AR';
    if (locale === 'de') return 'DE';
    if (locale === 'hr') return 'HR';
    if (locale === 'sq') return 'SQ';
    if (locale === 'si') return 'SI';
    if (locale === 'tl') return 'TL';
    if (locale === 'bn') return 'BN';
    if (locale === 'ur') return 'UR';
    if (locale === 'vi') return 'VI';
    if (locale === 'th') return 'TH';
    if (locale === 'ro') return 'RO';
    if (locale === 'pl') return 'PL';
    if (locale === 'tr') return 'TR';
    return 'EN';
  };

  return (
    <SafeAreaView style={[styles.container, Platform.OS === 'web' && { padding: 0, margin: 0, paddingHorizontal: 0, paddingVertical: 0 }]}>
      <StatusBar style="light" backgroundColor={Theme.colors.background} />

      {/* Global Premium App Header */}
      <View style={styles.appHeader}>
        <View style={[styles.headerContent, { maxWidth: isWeb ? 1100 : '100%' }]}>
          <TouchableOpacity onPress={handleLogoPress} style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoCircleText}>S</Text>
            </View>
            <View>
              <Text style={styles.logoTitle}>SUPERECRUITER</Text>
              <Text style={styles.logoSubtitle}>{t('globalStaffingHub')}</Text>
            </View>
          </TouchableOpacity>

          {/* Header Action row: Desktop Nav + Language toggler */}
          <View style={styles.headerRight}>
            {/* Desktop Navigation Row */}
            {isWeb && (
              <View style={styles.desktopNav}>
                <TouchableOpacity 
                  style={[styles.desktopNavItem, currentScreen === 'Home' && styles.desktopNavActive]}
                  onPress={() => navigate('Home')}
                >
                  <Text style={[styles.desktopNavText, currentScreen === 'Home' && styles.desktopNavTextActive]}>{t('home')}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.desktopNavItem, currentScreen === 'Search' && styles.desktopNavActive]}
                  onPress={() => navigate('Search')}
                >
                  <Text style={[styles.desktopNavText, currentScreen === 'Search' && styles.desktopNavTextActive]}>{t('searchCandidates')}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.desktopNavItem, currentScreen === 'Register' && styles.desktopNavActive]}
                  onPress={() => navigate('Register')}
                >
                  <Text style={[styles.desktopNavText, currentScreen === 'Register' && styles.desktopNavTextActive]}>{t('workerRegistration')}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.desktopNavItem, currentScreen === 'Profile' && styles.desktopNavActive]}
                  onPress={() => navigate('Profile')}
                >
                  <Text style={[styles.desktopNavText, currentScreen === 'Profile' && styles.desktopNavTextActive]}>{t('myProfile')}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.desktopNavItem, currentScreen === 'Contact' && styles.desktopNavActive]}
                  onPress={() => navigate('Contact')}
                >
                  <Text style={[styles.desktopNavText, currentScreen === 'Contact' && styles.desktopNavTextActive]}>{t('contactUs')}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Premium Language Dropdown Menu */}
            <View style={styles.langSelectorContainer}>
              <TouchableOpacity 
                style={styles.langBtn} 
                onPress={() => setShowLangMenu(!showLangMenu)}
                activeOpacity={0.8}
              >
                <Languages size={15} color={Theme.colors.primary} />
                <Text style={styles.langBtnText}>{activeLangName()}</Text>
              </TouchableOpacity>

              {showLangMenu && (
                <ScrollView 
                  style={styles.langDropdown}
                  contentContainerStyle={{ paddingVertical: 4 }}
                  showsVerticalScrollIndicator={true}
                  scrollEnabled={true}
                >
                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'en' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('en');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'en' && styles.langItemTextActive]}>English (EN)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'sr' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('sr');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'sr' && styles.langItemTextActive]}>Srpski (SR)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'ne' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('ne');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'ne' && styles.langItemTextActive]}>नेपाली (NE)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'sw' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('sw');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'sw' && styles.langItemTextActive]}>Kiswahili (SW)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'uz' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('uz');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'uz' && styles.langItemTextActive]}>O'zbekcha (UZ)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'ru' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('ru');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'ru' && styles.langItemTextActive]}>Русский (RU)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'hi' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('hi');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'hi' && styles.langItemTextActive]}>हिन्दी (HI)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'id' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('id');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'id' && styles.langItemTextActive]}>Bahasa (ID)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'ar' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('ar');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'ar' && styles.langItemTextActive]}>العربية (AR)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'de' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('de');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'de' && styles.langItemTextActive]}>Deutsch (DE)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'hr' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('hr');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'hr' && styles.langItemTextActive]}>Hrvatski (HR)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'sq' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('sq');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'sq' && styles.langItemTextActive]}>Shqip (SQ)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'si' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('si');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'si' && styles.langItemTextActive]}>සිංහල (SI)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'tl' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('tl');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'tl' && styles.langItemTextActive]}>Tagalog (TL)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'bn' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('bn');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'bn' && styles.langItemTextActive]}>বাংলা (BN)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'ur' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('ur');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'ur' && styles.langItemTextActive]}>اردو (UR)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'vi' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('vi');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'vi' && styles.langItemTextActive]}>Tiếng Việt (VI)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'th' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('th');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'th' && styles.langItemTextActive]}>ภาษาไทย (TH)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'ro' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('ro');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'ro' && styles.langItemTextActive]}>Română (RO)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'pl' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('pl');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'pl' && styles.langItemTextActive]}>Polski (PL)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.langItem, locale === 'tr' && styles.langItemActive]}
                    onPress={() => {
                      changeLanguage('tr');
                      setShowLangMenu(false);
                    }}
                  >
                    <Text style={[styles.langItemText, locale === 'tr' && styles.langItemTextActive]}>Türkçe (TR)</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Dynamic Page Screen Container */}
      <View style={styles.pageBody}>
        {renderScreen()}
      </View>

      {/* Mobile Tab Bar (Hidden on desktop screen ratios) */}
      {!isWeb && (
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tabItem, currentScreen === 'Home' && styles.tabActive]}
            onPress={() => navigate('Home')}
          >
            <Home size={20} color={currentScreen === 'Home' ? Theme.colors.primary : Theme.colors.textMuted} />
            <Text style={[styles.tabLabel, currentScreen === 'Home' && styles.tabLabelActive]}>{t('home')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabItem, currentScreen === 'Search' && styles.tabActive]}
            onPress={() => navigate('Search')}
          >
            <Search size={20} color={currentScreen === 'Search' ? Theme.colors.primary : Theme.colors.textMuted} />
            <Text style={[styles.tabLabel, currentScreen === 'Search' && styles.tabLabelActive]}>{t('explore')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabItem, currentScreen === 'Register' && styles.tabActive]}
            onPress={() => navigate('Register')}
          >
            <UserPlus size={20} color={currentScreen === 'Register' ? Theme.colors.primary : Theme.colors.textMuted} />
            <Text style={[styles.tabLabel, currentScreen === 'Register' && styles.tabLabelActive]}>{t('onboard')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabItem, currentScreen === 'Profile' && styles.tabActive]}
            onPress={() => navigate('Profile')}
          >
            <User size={20} color={currentScreen === 'Profile' ? Theme.colors.primary : Theme.colors.textMuted} />
            <Text style={[styles.tabLabel, currentScreen === 'Profile' && styles.tabLabelActive]}>{t('profile')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabItem, currentScreen === 'Contact' && styles.tabActive]}
            onPress={() => navigate('Contact')}
          >
            <PhoneCall size={20} color={currentScreen === 'Contact' ? Theme.colors.primary : Theme.colors.textMuted} />
            <Text style={[styles.tabLabel, currentScreen === 'Contact' && styles.tabLabelActive]}>{t('contact')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AppProvider>
          <MainAppContent />
        </AppProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  appHeader: {
    height: 64,
    backgroundColor: Theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    justifyContent: 'center',
    zIndex: 100,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircleText: {
    color: Theme.colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
  logoTitle: {
    color: Theme.colors.text,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  logoSubtitle: {
    color: Theme.colors.primary,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  desktopNav: {
    flexDirection: 'row',
    gap: 8,
  },
  desktopNavItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  desktopNavActive: {
    backgroundColor: 'rgba(255, 116, 49, 0.1)',
  },
  desktopNavText: {
    color: Theme.colors.textMuted,
    fontWeight: 'bold',
    fontSize: 13,
  },
  desktopNavTextActive: {
    color: Theme.colors.primary,
  },
  langSelectorContainer: {
    position: 'relative',
    zIndex: 200,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 116, 49, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 116, 49, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  langBtnText: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  langDropdown: {
    position: 'absolute',
    top: 36,
    right: 0,
    backgroundColor: '#1b1b1b',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 6,
    width: 140,
    maxHeight: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  langItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  langItemActive: {
    backgroundColor: 'rgba(255, 116, 49, 0.1)',
  },
  langItemText: {
    color: Theme.colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  langItemTextActive: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
  },
  pageBody: {
    flex: 1,
  },
  tabBar: {
    height: 60,
    backgroundColor: Theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  tabActive: {
    // optional active feedback
  },
  tabLabel: {
    color: Theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },
  tabLabelActive: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
  }
});
