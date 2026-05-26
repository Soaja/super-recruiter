import React, { useContext, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform, Dimensions, Image, useWindowDimensions } from 'react-native';
import { Theme } from '../constants/Theme';
import { AppContext } from '../context/AppContext';
import { LanguageContext } from '../context/LanguageContext';
import { Countries } from '../constants/Countries';
import { User, Mail, Phone, Briefcase, Calendar, MapPin, ChevronDown, Check, LogOut, Edit2, Save, Upload, Download, FileText, Trash2, Camera } from 'lucide-react-native';
import { SKILL_CATEGORIES } from '../constants/Skills';

export default function ProfileScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isWeb = width > 768;
  const { currentUser, updateProfile, logoutWorker, changeUserPassword, skillCategories } = useContext(AppContext);
  const { t } = useContext(LanguageContext);

  const categoriesToRender = (skillCategories && Object.keys(skillCategories).length > 0) ? skillCategories : SKILL_CATEGORIES;
  const [isEditing, setIsEditing] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Form states
  const [firstName, setFirstName] = useState(currentUser?.firstName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [jobTitle, setJobTitle] = useState(currentUser?.jobTitle || '');
  const [experience, setExperience] = useState(currentUser?.experience || '');
  const [country, setCountry] = useState(currentUser?.country || 'Nepal');
  const [showCountries, setShowCountries] = useState(false);

  // File and Skills states
  const [photoUri, setPhotoUri] = useState(currentUser?.photoUri || '');
  const [cvUri, setCvUri] = useState(currentUser?.cvUri || '');
  const [cvName, setCvName] = useState(currentUser?.cvName || '');
  const [cvSize, setCvSize] = useState(currentUser?.cvSize || '');
  const [selectedSkills, setSelectedSkills] = useState(currentUser?.skills || []);

  const photoInputRef = useRef(null);
  const cvInputRef = useRef(null);

  // Sync state when currentUser is loaded/changed
  React.useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName || '');
      setLastName(currentUser.lastName || '');
      setPhone(currentUser.phone || '');
      setJobTitle(currentUser.jobTitle || '');
      setExperience(currentUser.experience || '');
      setCountry(currentUser.country || 'Nepal');
      setPhotoUri(currentUser.photoUri || '');
      setCvUri(currentUser.cvUri || '');
      setCvName(currentUser.cvName || '');
      setCvSize(currentUser.cvSize || '');
      setSelectedSkills(currentUser.skills || []);
    }
  }, [currentUser]);

  // File browers trigger handlers
  const triggerPhotoUpload = () => {
    if (photoInputRef.current) {
      photoInputRef.current.click();
    }
  };

  const triggerCvUpload = () => {
    if (cvInputRef.current) {
      cvInputRef.current.click();
    }
  };

  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUri(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCvFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCvUri(event.target.result);
        setCvName(file.name);
        const sizeInKB = (file.size / 1024).toFixed(1);
        setCvSize(`${sizeInKB} KB`);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  if (!currentUser) {
    return (
      <View style={styles.emptyContainer}>
        <Briefcase size={64} color={Theme.colors.primary} style={{ marginBottom: 16 }} />
        <Text style={styles.emptyTitle}>{t('noProfile')}</Text>
        <Text style={styles.emptySubtitle}>{t('noProfileDesc')}</Text>
        <TouchableOpacity 
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.loginBtnText}>{t('registerLoginNow')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSave = async () => {
    if (!firstName || !lastName || !phone || !jobTitle) {
      showAlert(t('error'), t('fillMandatory'));
      return;
    }

    const updatedObject = {
      ...currentUser,
      firstName,
      lastName,
      phone,
      jobTitle,
      experience,
      country,
      photoUri,
      cvUri,
      cvName,
      cvSize,
      skills: selectedSkills,
      cvAvailable: !!cvUri
    };

    const res = await updateProfile(updatedObject);
    if (res.success) {
      setIsEditing(false);
      showAlert(t('success'), t('profileSaved'));
    } else {
      showAlert(t('error'), res.error);
    }
  };

  const handleLogout = async () => {
    await logoutWorker();
    showAlert(t('success'), 'Logged out successfully!', () => {
      navigation.navigate('Home');
    });
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert(t('error'), 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert(t('error'), 'New passwords do not match.');
      return;
    }
    const res = await changeUserPassword(currentUser.id, currentPassword, newPassword);
    if (res.success) {
      showAlert(t('success'), 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      showAlert(t('error'), res.error);
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.contentContainer, { maxWidth: isWeb ? 650 : '100%' }]}>
      <View style={styles.profileHeaderCard}>
        {Platform.OS === 'web' && (
          <>
            <input 
              type="file" 
              ref={photoInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handlePhotoFileChange} 
            />
            <input 
              type="file" 
              ref={cvInputRef} 
              style={{ display: 'none' }} 
              accept=".pdf,.doc,.docx" 
              onChange={handleCvFileChange} 
            />
          </>
        )}

        <TouchableOpacity 
          style={styles.avatarWrap} 
          disabled={!isEditing} 
          onPress={triggerPhotoUpload}
          activeOpacity={0.7}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}{lastName[0]?.toUpperCase()}</Text>
          )}
          {isEditing && (
            <View style={styles.cameraOverlay}>
              <Camera size={14} color={Theme.colors.white} />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.userName}>{currentUser.firstName} {currentUser.lastName}</Text>
        <Text style={styles.userRole}>{currentUser.jobTitle}</Text>
        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <MapPin size={12} color={Theme.colors.primary} />
            <Text style={styles.tagText}>{currentUser.country}</Text>
          </View>
          <View style={styles.tag}>
            <Calendar size={12} color={Theme.colors.primary} />
            <Text style={styles.tagText}>{t('dateOfReg').split(' ')[0]} {currentUser.registrationDate}</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{t('profileHeader')}</Text>
          <TouchableOpacity 
            style={styles.editToggleBtn}
            onPress={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
          >
            {isEditing ? (
              <View style={styles.editBtnContent}>
                <Save size={16} color={Theme.colors.white} />
                <Text style={[styles.editBtnText, { color: Theme.colors.white }]}>{t('save')}</Text>
              </View>
            ) : (
              <View style={[styles.editBtnContent, styles.editBtnInactive]}>
                <Edit2 size={16} color={Theme.colors.primary} />
                <Text style={styles.editBtnText}>{t('editDetails')}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Dynamic Display / Fields */}
        <View style={styles.fieldsContainer}>
          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>{t('emailUsername')}</Text>
            <View style={[styles.fieldContent, styles.disabledField]}>
              <Mail size={16} color={Theme.colors.textMuted} />
              <Text style={styles.disabledText}>{currentUser.email}</Text>
            </View>
          </View>

          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>{t('firstName')}</Text>
            {isEditing ? (
              <TextInput 
                style={styles.textInput}
                value={firstName}
                onChangeText={setFirstName}
                placeholder={t('firstName')}
                placeholderTextColor={Theme.colors.textMuted}
              />
            ) : (
              <View style={styles.fieldContent}>
                <User size={16} color={Theme.colors.primary} />
                <Text style={styles.fieldText}>{currentUser.firstName}</Text>
              </View>
            )}
          </View>

          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>{t('lastName')}</Text>
            {isEditing ? (
              <TextInput 
                style={styles.textInput}
                value={lastName}
                onChangeText={setLastName}
                placeholder={t('lastName')}
                placeholderTextColor={Theme.colors.textMuted}
              />
            ) : (
              <View style={styles.fieldContent}>
                <User size={16} color={Theme.colors.primary} />
                <Text style={styles.fieldText}>{currentUser.lastName}</Text>
              </View>
            )}
          </View>

          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>{t('phonePlaceholder').split(' ')[0]}</Text>
            {isEditing ? (
              <TextInput 
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder={t('phonePlaceholder')}
                placeholderTextColor={Theme.colors.textMuted}
                keyboardType="phone-pad"
              />
            ) : (
              <View style={styles.fieldContent}>
                <Phone size={16} color={Theme.colors.primary} />
                <Text style={styles.fieldText}>{currentUser.phone}</Text>
              </View>
            )}
          </View>

          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>{t('countryOfOrigin')}</Text>
            {isEditing ? (
              <View>
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
              </View>
            ) : (
              <View style={styles.fieldContent}>
                <MapPin size={16} color={Theme.colors.primary} />
                <Text style={styles.fieldText}>{currentUser.country}</Text>
              </View>
            )}
          </View>

          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>{t('desiredJobTitle')}</Text>
            {isEditing ? (
              <TextInput 
                style={styles.textInput}
                value={jobTitle}
                onChangeText={setJobTitle}
                placeholder={t('desiredJobTitle')}
                placeholderTextColor={Theme.colors.textMuted}
              />
            ) : (
              <View style={styles.fieldContent}>
                <Briefcase size={16} color={Theme.colors.primary} />
                <Text style={styles.fieldText}>{currentUser.jobTitle}</Text>
              </View>
            )}
          </View>

          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>{t('experienceSummary')}</Text>
            {isEditing ? (
              <TextInput 
                style={[styles.textInput, { height: 80, paddingVertical: 10 }]}
                value={experience}
                onChangeText={setExperience}
                placeholder={t('bioPlaceholder')}
                placeholderTextColor={Theme.colors.textMuted}
                multiline
                numberOfLines={3}
              />
            ) : (
              <View style={[styles.fieldContent, { height: 'auto', paddingVertical: 12, alignItems: 'flex-start' }]}>
                <Text style={[styles.fieldText, { lineHeight: 20 }]}>
                  {currentUser.experience || t('noSkillsText')}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>{t('verificationStatus')}</Text>
            <View style={styles.fieldContent}>
              <Check size={16} color={Theme.colors.success} />
              <Text style={[styles.fieldText, { color: Theme.colors.success, fontWeight: 'bold' }]}>
                {t('verStatusValue')}
              </Text>
            </View>
          </View>

          {/* Curriculum Vitae (CV) Section */}
          <View style={styles.fieldItem}>
            <Text style={styles.fieldLabel}>{t('cvTitle')}</Text>
            {isEditing ? (
              <TouchableOpacity 
                style={styles.uploadBox} 
                onPress={triggerCvUpload}
                activeOpacity={0.7}
              >
                <Upload size={20} color={Theme.colors.primary} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.uploadBoxTitle}>
                    {cvName ? t('changeUploadCV') : t('uploadCVResume')}
                  </Text>
                  <Text style={styles.uploadBoxSubtitle}>
                    {cvName ? `${cvName} (${cvSize})` : t('supportsPDF')}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : cvUri ? (
              <TouchableOpacity 
                style={styles.cvDownloadBox} 
                onPress={() => {
                  const link = document.createElement('a');
                  link.href = cvUri;
                  link.download = cvName || `${firstName}_CV.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                activeOpacity={0.8}
              >
                <FileText size={20} color={Theme.colors.white} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.cvDownloadTitle}>{cvName || `${firstName.toUpperCase()}_CV_RESUME.pdf`}</Text>
                  <Text style={styles.cvDownloadSubtitle}>{cvSize || 'Dynamic PDF'}</Text>
                </View>
                <Download size={16} color={Theme.colors.white} />
              </TouchableOpacity>
            ) : (
              <View style={[styles.fieldContent, styles.disabledField]}>
                <FileText size={16} color={Theme.colors.textMuted} />
                <Text style={styles.disabledText}>{t('noSkillsText')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Registered Skills Listing / Customization */}
        <Text style={[styles.fieldLabel, { marginTop: 24, marginLeft: 6 }]}>
          {isEditing ? t('editSkillsTitle') : t('staticSkillsTitle')}
        </Text>
        
        {isEditing ? (
          <View style={{ marginTop: 12, gap: 16 }}>
            {Object.keys(categoriesToRender).map((category, catIndex) => (
              <View key={catIndex} style={{ backgroundColor: 'rgba(255, 255, 255, 0.01)', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: Theme.colors.border }}>
                <Text style={{ color: Theme.colors.primary, fontSize: 11, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{category}</Text>
                <View style={styles.skillsWrapper}>
                  {categoriesToRender[category].map((skill, index) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[styles.skillBadge, isSelected && styles.skillBadgeActive]}
                        onPress={() => toggleSkill(skill)}
                      >
                        <Text style={[styles.skillBadgeText, isSelected && styles.skillBadgeTextActive]}>{skill}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.skillsWrapper}>
            {currentUser.skills && currentUser.skills.length > 0 ? (
              currentUser.skills.map((skill, index) => (
                <View key={index} style={styles.skillBadgeStatic}>
                  <Text style={styles.skillBadgeTextStatic}>{skill}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noSkillsText}>{t('noSkillsText')}</Text>
            )}
          </View>
        )}

        {/* Account Security / Change Password */}
        <View style={[styles.profileHeaderCard, { marginTop: 24, padding: 20 }]}>
          <Text style={{ color: Theme.colors.primary, fontSize: 13, fontWeight: 'bold', letterSpacing: 1.5, marginBottom: 16 }}>
            ACCOUNT SECURITY / SIGURNOST NALOGA
          </Text>
          
          <View style={{ gap: 14 }}>
            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Current Password / Trenutna lozinka</Text>
              <TextInput 
                style={styles.textInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="••••••••"
                placeholderTextColor={Theme.colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>New Password / Nova lozinka</Text>
              <TextInput 
                style={styles.textInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="••••••••"
                placeholderTextColor={Theme.colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>Confirm New Password / Potvrda lozinke</Text>
              <TextInput 
                style={styles.textInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor={Theme.colors.textMuted}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={[styles.loginBtn, { marginTop: 6, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 }]}
              onPress={handlePasswordChange}
            >
              <Save size={16} color={Theme.colors.white} />
              <Text style={styles.loginBtnText}>CHANGE PASSWORD / PROMENI LOZINKU</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Callout */}
        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <LogOut size={16} color={Theme.colors.danger} />
          <Text style={styles.logoutText}>{t('logoutCallout')}</Text>
        </TouchableOpacity>
      </View>
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
  emptyContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 500,
    marginTop: 40,
  },
  emptyTitle: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 6,
  },
  loginBtnText: {
    color: Theme.colors.white,
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  profileHeaderCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 116, 49, 0.1)',
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: Theme.colors.primary,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  userName: {
    color: Theme.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    color: Theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 116, 49, 0.05)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 116, 49, 0.2)',
  },
  tagText: {
    color: Theme.colors.text,
    fontSize: 12,
    fontWeight: '500',
  },
  detailsCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingBottom: 16,
    marginBottom: 20,
  },
  cardTitle: {
    color: Theme.colors.text,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  editToggleBtn: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  editBtnContent: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editBtnInactive: {
    backgroundColor: 'rgba(255, 116, 49, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 116, 49, 0.2)',
  },
  editBtnText: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  fieldsContainer: {
    gap: 16,
  },
  fieldItem: {
    gap: 6,
  },
  fieldLabel: {
    color: Theme.colors.textMuted,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  fieldContent: {
    height: 46,
    backgroundColor: '#1b1b1b',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
    borderWidth: 0.5,
    borderColor: Theme.colors.border,
  },
  disabledField: {
    opacity: 0.6,
  },
  disabledText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
  },
  fieldText: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  textInput: {
    height: 46,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    color: Theme.colors.text,
    fontSize: 14,
    paddingHorizontal: 12,
    outlineStyle: 'none',
  },
  dropdownBtn: {
    height: 46,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  dropdownBtnText: {
    color: Theme.colors.text,
    fontSize: 14,
  },
  countriesWrapper: {
    maxHeight: 180,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: '#1b1b1b',
    marginTop: 6,
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
  skillsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 6,
  },
  skillBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: '#1b1b1b',
  },
  skillBadgeActive: {
    borderColor: Theme.colors.primary,
    backgroundColor: 'rgba(255, 116, 49, 0.15)',
  },
  skillBadgeText: {
    color: Theme.colors.textMuted,
    fontSize: 12,
  },
  skillBadgeTextActive: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
  },
  skillBadgeStatic: {
    backgroundColor: 'rgba(255, 116, 49, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 116, 49, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  skillBadgeTextStatic: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Theme.colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Theme.colors.card,
  },
  uploadBox: {
    height: 70,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Theme.colors.primary,
    backgroundColor: 'rgba(255, 116, 49, 0.03)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 4,
  },
  uploadBoxTitle: {
    color: Theme.colors.text,
    fontSize: 13,
    fontWeight: 'bold',
  },
  uploadBoxSubtitle: {
    color: Theme.colors.textMuted,
    fontSize: 11,
  },
  cvDownloadBox: {
    height: 60,
    borderRadius: 8,
    backgroundColor: Theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 4,
  },
  cvDownloadTitle: {
    color: Theme.colors.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  cvDownloadSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
  },
  noSkillsText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
  },
  logoutBtn: {
    height: 48,
    borderWidth: 1.5,
    borderColor: 'rgba(244, 67, 54, 0.2)',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(244, 67, 54, 0.05)',
  },
  logoutText: {
    color: Theme.colors.danger,
    fontWeight: 'bold',
    fontSize: 14,
  }
});
