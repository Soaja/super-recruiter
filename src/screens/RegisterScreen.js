import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Platform, Dimensions, useWindowDimensions, ActivityIndicator } from 'react-native';
import { Theme } from '../constants/Theme';
import { Countries } from '../constants/Countries';
import { AppContext } from '../context/AppContext';
import { LanguageContext } from '../context/LanguageContext';
import { Mail, Lock, User, Phone, Briefcase, ChevronDown, CheckSquare, Square } from 'lucide-react-native';
import { SKILL_CATEGORIES } from '../constants/Skills';

export default function RegisterScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const isWeb = width > 768;
  const { registerWorker, loginWorker, loginWithGoogle, skillCategories } = useContext(AppContext);
  const { t } = useContext(LanguageContext);

  const categoriesToRender = (skillCategories && Object.keys(skillCategories).length > 0) ? skillCategories : SKILL_CATEGORIES;
  const isLoginMode = route?.params?.isLogin || false;
  const [isLogin, setIsLogin] = useState(isLoginMode);
  const [authenticatingGoogle, setAuthenticatingGoogle] = useState(false);

  useEffect(() => {
    if (route?.params?.isLogin !== undefined) {
      setIsLogin(route.params.isLogin);
    }
  }, [route?.params?.isLogin]);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [country, setCountry] = useState('Nepal');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [showCountries, setShowCountries] = useState(false);

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleAction = async () => {
    if (!email || !password) {
      showAlert(t('error'), t('fillCredentials'));
      return;
    }

    if (isLogin) {
      // Login
      const res = await loginWorker(email, password);
      if (res.success) {
        showAlert(t('success'), t('loggedIn'), () => {
          navigation.navigate('Profile');
        });
      } else {
        showAlert(t('error'), res.error);
      }
    } else {
      // Register
      if (!firstName || !lastName || !age || !phone || !jobTitle) {
        showAlert(t('error'), t('fillMandatory'));
        return;
      }

      const workerObject = {
        firstName,
        lastName,
        email,
        password,
        age: parseInt(age) || 25,
        country,
        gender,
        phone,
        jobTitle,
        experience,
        skills: selectedSkills,
        languages: ['English']
      };

      const res = await registerWorker(workerObject);
      if (res.success) {
        showAlert(t('success'), t('accountCreated'), () => {
          navigation.navigate('Profile');
        });
      } else {
        showAlert(t('error'), res.error);
      }
    }
  };

  const showAlert = (title, msg, onOk) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${msg}`);
      if (onOk) onOk();
    } else {
      Alert.alert(title, msg, [{ text: 'OK', onPress: onOk }]);
    }
  };

  const handleGoogleLogin = () => {
    setAuthenticatingGoogle(true);
    setTimeout(async () => {
      const googleMockProfile = {
        email: 'google.worker@superecruiter.rs',
        givenName: 'Google',
        familyName: 'Worker',
      };

      const res = await loginWithGoogle(googleMockProfile);
      setAuthenticatingGoogle(false);

      if (res.success) {
        showAlert(t('success'), t('loggedIn'), () => {
          navigation.navigate('Profile');
        });
      } else {
        showAlert(t('error'), res.error);
      }
    }, 1500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.contentContainer, { maxWidth: isWeb ? 650 : '100%' }]}>
      <View style={styles.card}>
        <Text style={styles.title}>{isLogin ? t('loginAccount') : t('createAccount')}</Text>
        <Text style={styles.subtitle}>
          {isLogin 
            ? t('loginDesc') 
            : t('onboardDesc')}
        </Text>

        {/* Credentials Section */}
        <Text style={styles.sectionLabel}>{t('credentials')}</Text>
        <View style={styles.inputContainer}>
          <Mail size={18} color={Theme.colors.textMuted} style={styles.inputIcon} />
          <TextInput 
            placeholder={t('emailPlaceholder')} 
            placeholderTextColor={Theme.colors.textMuted}
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={18} color={Theme.colors.textMuted} style={styles.inputIcon} />
          <TextInput 
            placeholder={t('passwordPlaceholder')} 
            placeholderTextColor={Theme.colors.textMuted}
            style={styles.textInput}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        {/* Profile Details (Only visible in Register Mode) */}
        {!isLogin && (
          <View>
            <Text style={styles.sectionLabel}>{t('personalInfo')}</Text>
            
            <View style={styles.inputRow}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <User size={18} color={Theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput 
                  placeholder={t('firstName')} 
                  placeholderTextColor={Theme.colors.textMuted}
                  style={styles.textInput}
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>

              <View style={[styles.inputContainer, { flex: 1 }]}>
                <User size={18} color={Theme.colors.textMuted} style={styles.inputIcon} />
                <TextInput 
                  placeholder={t('lastName')} 
                  placeholderTextColor={Theme.colors.textMuted}
                  style={styles.textInput}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <TextInput 
                  placeholder={t('agePlaceholder')} 
                  placeholderTextColor={Theme.colors.textMuted}
                  style={[styles.textInput, { paddingLeft: 12 }]}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.genderContainer}>
                <TouchableOpacity 
                  style={[styles.genderBtn, gender === 'Male' && styles.genderBtnActive]}
                  onPress={() => setGender('Male')}
                >
                  <Text style={[styles.genderText, gender === 'Male' && styles.genderTextActive]}>Male</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.genderBtn, gender === 'Female' && styles.genderBtnActive]}
                  onPress={() => setGender('Female')}
                >
                  <Text style={[styles.genderText, gender === 'Female' && styles.genderTextActive]}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Phone size={18} color={Theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                placeholder={t('phonePlaceholder')} 
                placeholderTextColor={Theme.colors.textMuted}
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Country Selector Dropdown */}
            <Text style={styles.sectionLabel}>{t('countryOfOrigin')}</Text>
            <TouchableOpacity 
              style={styles.dropdownBtn}
              onPress={() => setShowCountries(!showCountries)}
            >
              <Text style={styles.dropdownBtnText}>{country}</Text>
              <ChevronDown size={18} color={Theme.colors.primary} />
            </TouchableOpacity>

            {showCountries && (
              <View style={styles.countriesWrapper}>
                {Countries.map((c, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={styles.countryItem}
                    onPress={() => {
                      setCountry(c);
                      setShowCountries(false);
                    }}
                  >
                    <Text style={[styles.countryItemText, country === c && { color: Theme.colors.primary }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Professional Details */}
            <Text style={styles.sectionLabel}>{t('desiredJobTitle')}</Text>
            <View style={styles.inputContainer}>
              <Briefcase size={18} color={Theme.colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                placeholder={t('desiredJobTitle')} 
                placeholderTextColor={Theme.colors.textMuted}
                style={styles.textInput}
                value={jobTitle}
                onChangeText={setJobTitle}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput 
                placeholder={t('bioPlaceholder')} 
                placeholderTextColor={Theme.colors.textMuted}
                style={[styles.textInput, { paddingLeft: 12, height: 80 }]}
                value={experience}
                onChangeText={setExperience}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Skills Chip Selection */}
            <Text style={styles.sectionLabel}>{t('selectSkills')}</Text>
            {Object.keys(categoriesToRender).map((category, catIndex) => (
              <View key={catIndex} style={{ marginBottom: 16 }}>
                <Text style={{ color: Theme.colors.primary, fontSize: 11, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{category}</Text>
                <View style={styles.skillsContainer}>
                  {categoriesToRender[category].map((skill, index) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[styles.skillChip, isSelected && styles.skillChipActive]}
                        onPress={() => toggleSkill(skill)}
                      >
                        <Text style={[styles.skillChipText, isSelected && styles.skillChipTextActive]}>{skill}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}

            {/* Custom Skill Input */}
            <View style={[styles.inputRow, { marginTop: 10 }]}>
              <View style={[styles.inputContainer, { flex: 1, marginBottom: 0 }]}>
                <TextInput 
                  placeholder={t('enterOtherSkill')} 
                  placeholderTextColor={Theme.colors.textMuted}
                  style={[styles.textInput, { paddingLeft: 12 }]}
                  value={customSkill}
                  onChangeText={setCustomSkill}
                />
              </View>
              <TouchableOpacity 
                style={styles.addSkillBtn}
                onPress={addCustomSkill}
              >
                <Text style={styles.addSkillBtnText}>{t('add')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Submit Actions */}
        <TouchableOpacity 
          style={styles.submitBtn}
          onPress={handleAction}
        >
          <Text style={styles.submitBtnText}>{isLogin ? t('loginAccount') : t('createAccount')}</Text>
        </TouchableOpacity>

        {/* Beautiful OR Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google SSO Button */}
        <TouchableOpacity 
          style={styles.googleBtn}
          onPress={handleGoogleLogin}
          activeOpacity={0.85}
        >
          <View style={styles.googleIconContainer}>
            <Text style={styles.googleG}>G</Text>
          </View>
          <Text style={styles.googleBtnText}>{t('continueWithGoogle')}</Text>
        </TouchableOpacity>

        {/* Mode Switcher */}
        <TouchableOpacity 
          style={styles.switcherBtn}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.switcherText}>
            {isLogin 
              ? t('dontHaveAccount') 
              : t('alreadyHaveAccount')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Premium Authentication Overlay */}
      {authenticatingGoogle && (
        <View style={styles.authOverlay}>
          <View style={styles.authCard}>
            <ActivityIndicator size="large" color={Theme.colors.primary} style={{ marginBottom: 16 }} />
            <Text style={styles.authText}>{t('continueWithGoogle')}...</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    maxWidth: '100%',
  },
  contentContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignSelf: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 24,
  },
  title: {
    color: Theme.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  sectionLabel: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  inputContainer: {
    height: 48,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputIcon: {
    marginLeft: 12,
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: Theme.colors.text,
    fontSize: 14,
    paddingLeft: 8,
    outlineStyle: 'none',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    gap: 8,
    marginBottom: 12,
  },
  genderBtn: {
    flex: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  genderBtnActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: 'rgba(255, 116, 49, 0.1)',
  },
  genderText: {
    color: Theme.colors.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  genderTextActive: {
    color: Theme.colors.primary,
  },
  dropdownBtn: {
    height: 48,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  dropdownBtnText: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  countriesWrapper: {
    maxHeight: 200,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: '#1b1b1b',
    marginBottom: 12,
    overflow: 'scroll',
  },
  countryItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Theme.colors.border,
  },
  countryItemText: {
    color: Theme.colors.text,
    fontSize: 14,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: '#1b1b1b',
  },
  skillChipActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: 'rgba(255, 116, 49, 0.15)',
  },
  skillChipText: {
    color: Theme.colors.textMuted,
    fontSize: 12,
  },
  skillChipTextActive: {
    color: Theme.colors.primary,
    fontWeight: '600',
    margin: 0,
  },
  addSkillBtn: {
    backgroundColor: Theme.colors.primary,
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSkillBtnText: {
    color: Theme.colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: Theme.colors.primary,
    height: 50,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  submitBtnText: {
    color: Theme.colors.white,
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 1,
  },
  switcherBtn: {
    marginTop: 18,
    alignItems: 'center',
  },
  switcherText: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.colors.border,
  },
  dividerText: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    marginHorizontal: 12,
    letterSpacing: 1,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1b1b1b',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    height: 50,
    borderRadius: 6,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleG: {
    color: '#4285F4',
    fontSize: 15,
    fontWeight: 'bold',
  },
  googleBtnText: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  authOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  authCard: {
    backgroundColor: '#1b1b1b',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  authText: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  }
});
