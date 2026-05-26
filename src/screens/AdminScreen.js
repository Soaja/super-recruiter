import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Platform, useWindowDimensions } from 'react-native';
import { Theme } from '../constants/Theme';
import { AppContext } from '../context/AppContext';
import { LanguageContext } from '../context/LanguageContext';
import { Lock, Search, Users, Mail, Settings, Save, ShieldAlert, LogOut, CheckSquare, Eye, ChevronDown } from 'lucide-react-native';

export default function AdminScreen() {
  const { width } = useWindowDimensions();
  const isWeb = width > 768;
  
  const { workers, inquiries, adminPassword, changeAdminPassword, skillCategories, addAdminSkill } = useContext(AppContext);
  const { t } = useContext(LanguageContext);

  // Auth state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // Tab state
  const [activeTab, setActiveTab] = useState('workers'); // 'workers', 'inquiries', 'security', 'skills'

  // Workers search state
  const [workerQuery, setWorkerQuery] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Security state
  const [currentAdminPass, setCurrentAdminPass] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');

  // Skill Manager State
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('');
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryNameInput, setNewCategoryNameInput] = useState('');
  const [newSkillNameInput, setNewSkillNameInput] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handleAdminLogin = () => {
    if (passwordInput === adminPassword) {
      setIsAdminLoggedIn(true);
      setPasswordInput('');
    } else {
      showAlert(t('error') || 'Error', 'Incorrect administrator password / Pogrešna lozinka');
    }
  };

  const handleAdminPasswordChange = async () => {
    if (!currentAdminPass || !newAdminPass || !confirmAdminPass) {
      showAlert(t('error') || 'Error', 'Please fill in all fields.');
      return;
    }
    if (newAdminPass !== confirmAdminPass) {
      showAlert(t('error') || 'Error', 'New passwords do not match.');
      return;
    }
    
    const res = await changeAdminPassword(currentAdminPass, newAdminPass);
    if (res.success) {
      showAlert(t('success') || 'Success', 'Administrator password updated successfully!');
      setCurrentAdminPass('');
      setNewAdminPass('');
      setConfirmAdminPass('');
    } else {
      showAlert(t('error') || 'Error', res.error);
    }
  };

  const handleAddSkill = async () => {
    const category = isCreatingNewCategory ? newCategoryNameInput : selectedSkillCategory;
    
    if (!category || !newSkillNameInput) {
      showAlert(t('error') || 'Error', 'Please fill in all fields / Popunite sva polja.');
      return;
    }

    const trimmedCategory = category.trim();
    const trimmedSkill = newSkillNameInput.trim();

    if (!trimmedCategory || !trimmedSkill) {
      showAlert(t('error') || 'Error', 'Fields cannot be empty.');
      return;
    }

    const res = await addAdminSkill(trimmedCategory, trimmedSkill);
    if (res.success) {
      showAlert(t('success') || 'Success', `Skill "${trimmedSkill}" successfully added!`);
      setNewSkillNameInput('');
      if (isCreatingNewCategory) {
        setNewCategoryNameInput('');
        setIsCreatingNewCategory(false);
        setSelectedSkillCategory(trimmedCategory);
      }
    } else {
      showAlert(t('error') || 'Error', res.error);
    }
  };

  const showAlert = (title, msg) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  // Filtered workers list
  const filteredWorkers = workers.filter(w => {
    const q = workerQuery.toLowerCase();
    return (
      w.firstName?.toLowerCase().includes(q) ||
      w.lastName?.toLowerCase().includes(q) ||
      w.jobTitle?.toLowerCase().includes(q) ||
      w.country?.toLowerCase().includes(q) ||
      w.skills?.some(s => s.toLowerCase().includes(q))
    );
  });

  if (!isAdminLoggedIn) {
    return (
      <View style={styles.loginContainer}>
        <View style={styles.loginCard}>
          <ShieldAlert size={48} color={Theme.colors.primary} style={{ marginBottom: 14 }} />
          <Text style={styles.loginTitle}>ADMINISTRATOR PORTAL</Text>
          <Text style={styles.loginSubtitle}>Access control console. Please enter master passcode.</Text>

          <View style={styles.inputWrapper}>
            <Lock size={18} color={Theme.colors.textMuted} style={styles.inputIcon} />
            <TextInput 
              style={styles.textInput}
              placeholder="Admin Passcode"
              placeholderTextColor={Theme.colors.textMuted}
              value={passwordInput}
              onChangeText={setPasswordInput}
              secureTextEntry
              autoCapitalize="none"
              onSubmitEditing={handleAdminLogin}
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleAdminLogin}>
            <Text style={styles.submitBtnText}>AUTHENTICATE PORTAL</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Admin Subheader / Dashboard metrics */}
      <View style={styles.adminHeader}>
        <View style={[styles.headerContent, { flexDirection: isWeb ? 'row' : 'column', gap: 16 }]}>
          <View style={styles.metricCard}>
            <Users size={22} color={Theme.colors.primary} />
            <View>
              <Text style={styles.metricVal}>{workers.length}</Text>
              <Text style={styles.metricLabel}>Total Workers Registered</Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <Mail size={22} color={Theme.colors.primary} />
            <View>
              <Text style={styles.metricVal}>{inquiries.length}</Text>
              <Text style={styles.metricLabel}>Inquiries Submitted</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.metricCard, styles.logoutCardBtn]} 
            onPress={() => setIsAdminLoggedIn(false)}
          >
            <LogOut size={20} color={Theme.colors.danger} />
            <Text style={styles.logoutBtnText}>Lock Admin Portal</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs Nav */}
      <View style={styles.tabNavContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabNavScroll}
        >
          <TouchableOpacity 
            style={[styles.tabNavItem, activeTab === 'workers' && styles.tabActive]}
            onPress={() => {
              setActiveTab('workers');
              setSelectedWorker(null);
            }}
          >
            <Users size={16} color={activeTab === 'workers' ? Theme.colors.primary : Theme.colors.textMuted} />
            <Text style={[styles.tabNavText, activeTab === 'workers' && styles.tabNavTextActive]}>Worker Candidates</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabNavItem, activeTab === 'inquiries' && styles.tabActive]}
            onPress={() => setActiveTab('inquiries')}
          >
            <Mail size={16} color={activeTab === 'inquiries' ? Theme.colors.primary : Theme.colors.textMuted} />
            <Text style={[styles.tabNavText, activeTab === 'inquiries' && styles.tabNavTextActive]}>Contact Inquiries</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabNavItem, activeTab === 'skills' && styles.tabActive]}
            onPress={() => setActiveTab('skills')}
          >
            <CheckSquare size={16} color={activeTab === 'skills' ? Theme.colors.primary : Theme.colors.textMuted} />
            <Text style={[styles.tabNavText, activeTab === 'skills' && styles.tabNavTextActive]}>Skill Manager</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabNavItem, activeTab === 'security' && styles.tabActive]}
            onPress={() => setActiveTab('security')}
          >
            <Settings size={16} color={activeTab === 'security' ? Theme.colors.primary : Theme.colors.textMuted} />
            <Text style={[styles.tabNavText, activeTab === 'security' && styles.tabNavTextActive]}>Admin Security</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Tab Contents */}
      <ScrollView contentContainerStyle={styles.scrollBody}>
        {activeTab === 'workers' && (
          <View style={styles.tabContentCard}>
            <Text style={styles.sectionTitle}>REGISTERED WORKER REQUESTS</Text>
            
            {selectedWorker ? (
              <View style={styles.workerDetailContainer}>
                <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedWorker(null)}>
                  <Text style={styles.backBtnText}>← Back to Candidates</Text>
                </TouchableOpacity>

                <View style={styles.detailCard}>
                  <Text style={styles.detailTitle}>{selectedWorker.firstName} {selectedWorker.lastName}</Text>
                  <Text style={styles.detailSub}>{selectedWorker.jobTitle} • {selectedWorker.age} yrs • {selectedWorker.gender} • {selectedWorker.country}</Text>

                  <View style={styles.detailDivider} />

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email / Username:</Text>
                    <Text style={styles.detailValue}>{selectedWorker.email}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone / WhatsApp:</Text>
                    <Text style={styles.detailValue}>{selectedWorker.phone}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Registration Date:</Text>
                    <Text style={styles.detailValue}>{selectedWorker.registrationDate || 'N/A'}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Account Password:</Text>
                    <Text style={styles.detailValue} style={{ color: Theme.colors.primary, fontFamily: 'monospace' }}>{selectedWorker.password}</Text>
                  </View>

                  <View style={styles.detailDivider} />

                  <Text style={styles.detailLabel}>Bio / Professional Summary:</Text>
                  <Text style={styles.detailBioText}>{selectedWorker.experience || 'No bio submitted.'}</Text>

                  <View style={styles.detailDivider} />

                  <Text style={styles.detailLabel}>Declared Competencies & Skills:</Text>
                  <View style={styles.skillsWrapper}>
                    {selectedWorker.skills?.map((s, idx) => (
                      <View key={idx} style={styles.skillBadge}>
                        <Text style={styles.skillBadgeText}>{s}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              <View>
                {/* Search Bar */}
                <View style={styles.searchWrapper}>
                  <Search size={18} color={Theme.colors.textMuted} style={styles.searchIcon} />
                  <TextInput 
                    style={styles.searchInput}
                    placeholder="Filter candidates by name, job, skill, or country..."
                    placeholderTextColor={Theme.colors.textMuted}
                    value={workerQuery}
                    onChangeText={setWorkerQuery}
                  />
                </View>

                {filteredWorkers.length === 0 ? (
                  <Text style={styles.emptyText}>No registered workers found matching filters.</Text>
                ) : (
                  <View style={styles.workerListGrid}>
                    {filteredWorkers.map((w) => (
                      <View key={w.id} style={styles.workerListCard}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.workerCardName}>{w.firstName} {w.lastName}</Text>
                          <Text style={styles.workerCardJob}>{w.jobTitle} ({w.country})</Text>
                          <Text style={styles.workerCardEmail}>{w.email}</Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.viewWorkerBtn}
                          onPress={() => setSelectedWorker(w)}
                        >
                          <Eye size={14} color={Theme.colors.white} />
                          <Text style={styles.viewWorkerBtnText}>View</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {activeTab === 'inquiries' && (
          <View style={styles.tabContentCard}>
            <Text style={styles.sectionTitle}>WEBSITE HELPDESK INQUIRIES</Text>
            
            {inquiries.length === 0 ? (
              <Text style={styles.emptyText}>No help inquiries submitted yet.</Text>
            ) : (
              <View style={styles.inquiriesContainer}>
                {inquiries.map((inq) => (
                  <View key={inq.id} style={styles.inquiryCard}>
                    <View style={styles.inquiryHeader}>
                      <Text style={styles.inqName}>{inq.name}</Text>
                      <Text style={styles.inqDate}>{inq.date}</Text>
                    </View>
                    <Text style={styles.inqEmail}>Sender: {inq.email}</Text>
                    
                    <View style={styles.inqMsgBox}>
                      <Text style={styles.inqMsg}>{inq.message}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'security' && (
          <View style={styles.tabContentCard}>
            <Text style={styles.sectionTitle}>ADMIN SECURITY MANAGER</Text>
            <Text style={styles.sectionSubtitle}>Change master administrator credential password.</Text>
            
            <View style={[styles.detailCard, { gap: 16, maxWidth: 500, marginTop: 14 }]}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Current Master Password</Text>
                <TextInput 
                  style={styles.textInput}
                  value={currentAdminPass}
                  onChangeText={setCurrentAdminPass}
                  placeholder="••••••••"
                  placeholderTextColor={Theme.colors.textMuted}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>New Master Password</Text>
                <TextInput 
                  style={styles.textInput}
                  value={newAdminPass}
                  onChangeText={setNewAdminPass}
                  placeholder="••••••••"
                  placeholderTextColor={Theme.colors.textMuted}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Confirm New Master Password</Text>
                <TextInput 
                  style={styles.textInput}
                  value={confirmAdminPass}
                  onChangeText={setConfirmAdminPass}
                  placeholder="••••••••"
                  placeholderTextColor={Theme.colors.textMuted}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity style={styles.savePassBtn} onPress={handleAdminPasswordChange}>
                <Save size={16} color={Theme.colors.white} />
                <Text style={styles.savePassBtnText}>SAVE ADMIN CREDENTIALS</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'skills' && (
          <View style={styles.tabContentCard}>
            <Text style={styles.sectionTitle}>DYNAMIC SKILLS TAXONOMY MANAGER</Text>
            <Text style={styles.sectionSubtitle}>Add new skills or create entire new categories to dynamically populate user onboarding, worker profiles, and recruiter filters.</Text>
            
            <View style={[styles.detailCard, { gap: 16, maxWidth: 650, marginTop: 14 }]}>
              {/* Category Picker Dropdown */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Skill Category</Text>
                <TouchableOpacity 
                  style={styles.dropdownBtn}
                  onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  <Text style={styles.dropdownBtnText}>
                    {isCreatingNewCategory ? "+ Create New Category" : (selectedSkillCategory || "Select Existing Category")}
                  </Text>
                  <ChevronDown size={18} color={Theme.colors.primary} />
                </TouchableOpacity>

                {showCategoryDropdown && (
                  <View style={styles.dropdownListContainer}>
                    <TouchableOpacity 
                      style={styles.dropdownListItem}
                      onPress={() => {
                        setIsCreatingNewCategory(true);
                        setSelectedSkillCategory('');
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <Text style={[styles.dropdownListItemText, isCreatingNewCategory && { color: Theme.colors.primary, fontWeight: 'bold' }]}>
                        + Create New Category
                      </Text>
                    </TouchableOpacity>
                    {Object.keys(skillCategories).map((cat, idx) => (
                      <TouchableOpacity 
                        key={idx}
                        style={styles.dropdownListItem}
                        onPress={() => {
                          setIsCreatingNewCategory(false);
                          setSelectedSkillCategory(cat);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        <Text style={[styles.dropdownListItemText, (!isCreatingNewCategory && selectedSkillCategory === cat) && { color: Theme.colors.primary, fontWeight: 'bold' }]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Dynamic New Category Input */}
              {isCreatingNewCategory && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>New Category Name</Text>
                  <TextInput 
                    style={styles.formInput}
                    value={newCategoryNameInput}
                    onChangeText={setNewCategoryNameInput}
                    placeholder="e.g. Aviation & Airlines"
                    placeholderTextColor={Theme.colors.textMuted}
                  />
                </View>
              )}

              {/* New Skill Name Input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>New Skill Name</Text>
                <TextInput 
                  style={styles.formInput}
                  value={newSkillNameInput}
                  onChangeText={setNewSkillNameInput}
                  placeholder="e.g. VIP Cabin Service"
                  placeholderTextColor={Theme.colors.textMuted}
                />
              </View>

              <TouchableOpacity style={styles.savePassBtn} onPress={handleAddSkill}>
                <Save size={16} color={Theme.colors.white} />
                <Text style={styles.savePassBtnText}>ADD NEW SKILL TO TAXONOMY</Text>
              </TouchableOpacity>
            </View>

            {/* Inventory Listing */}
            <View style={{ marginTop: 30 }}>
              <Text style={[styles.sectionTitle, { fontSize: 14 }]}>CURRENT SYSTEM SKILLS TAXONOMY</Text>
              <View style={styles.skillsCategoryInventoryGrid}>
                {Object.keys(skillCategories).map((cat, idx) => (
                  <View key={idx} style={styles.inventoryCategoryCard}>
                    <Text style={styles.inventoryCategoryTitle}>{cat}</Text>
                    <View style={styles.inventorySkillsWrapper}>
                      {skillCategories[cat]?.map((skill, sIdx) => (
                        <View key={sIdx} style={styles.inventorySkillBadge}>
                          <Text style={styles.inventorySkillBadgeText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    maxWidth: '100%',
  },
  loginContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  loginCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 30,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  loginTitle: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 6,
  },
  loginSubtitle: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  inputWrapper: {
    height: 48,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
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
  submitBtn: {
    backgroundColor: Theme.colors.primary,
    height: 48,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  submitBtnText: {
    color: Theme.colors.white,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  adminHeader: {
    backgroundColor: '#1b1b1b',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1100,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    minWidth: 200,
  },
  metricVal: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  metricLabel: {
    color: Theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  logoutCardBtn: {
    borderWidth: 1,
    borderColor: 'rgba(235, 87, 87, 0.2)',
    backgroundColor: 'rgba(235, 87, 87, 0.05)',
  },
  logoutBtnText: {
    color: Theme.colors.danger,
    fontWeight: 'bold',
    fontSize: 12,
  },
  tabNavContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    backgroundColor: Theme.colors.card,
    width: '100%',
  },
  tabNavScroll: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    minWidth: '100%',
    justifyContent: 'center',
  },
  tabNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Theme.colors.primary,
  },
  tabNavText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  tabNavTextActive: {
    color: Theme.colors.primary,
  },
  scrollBody: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1100,
  },
  tabContentCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 24,
  },
  sectionTitle: {
    color: Theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  sectionSubtitle: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    marginTop: -10,
    marginBottom: 16,
  },
  searchWrapper: {
    height: 46,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: Theme.colors.text,
    fontSize: 14,
    paddingLeft: 8,
    outlineStyle: 'none',
  },
  emptyText: {
    color: Theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: 40,
    fontSize: 14,
  },
  workerListGrid: {
    gap: 12,
  },
  workerListCard: {
    backgroundColor: '#1b1b1b',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  workerCardName: {
    color: Theme.colors.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  workerCardJob: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  workerCardEmail: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  viewWorkerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 116, 49, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 116, 49, 0.3)',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  viewWorkerBtnText: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  workerDetailContainer: {
    gap: 16,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  backBtnText: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  detailCard: {
    backgroundColor: '#1b1b1b',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 8,
    padding: 20,
  },
  detailTitle: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailSub: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  detailDivider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: Theme.colors.border,
  },
  detailLabel: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  detailValue: {
    color: Theme.colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  detailBioText: {
    color: Theme.colors.text,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  skillsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  skillBadge: {
    backgroundColor: 'rgba(255, 116, 49, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 116, 49, 0.3)',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  skillBadgeText: {
    color: Theme.colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  inquiriesContainer: {
    gap: 16,
  },
  inquiryCard: {
    backgroundColor: '#1b1b1b',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  inquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inqName: {
    color: Theme.colors.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  inqDate: {
    color: Theme.colors.textMuted,
    fontSize: 11,
  },
  inqEmail: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  inqMsgBox: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 0.5,
    borderColor: Theme.colors.border,
    borderRadius: 6,
    padding: 12,
    marginTop: 4,
  },
  inqMsg: {
    color: Theme.colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  formGroup: {
    gap: 6,
    width: '100%',
  },
  formLabel: {
    color: Theme.colors.textMuted,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  savePassBtn: {
    backgroundColor: Theme.colors.primary,
    height: 46,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  savePassBtnText: {
    color: Theme.colors.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
  formInput: {
    height: 48,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    color: Theme.colors.text,
    fontSize: 14,
    paddingHorizontal: 12,
    width: '100%',
    outlineStyle: 'none',
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
    paddingHorizontal: 14,
    width: '100%',
  },
  dropdownBtnText: {
    color: Theme.colors.text,
    fontSize: 14,
  },
  dropdownListContainer: {
    backgroundColor: '#1b1b1b',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 6,
    marginTop: 4,
    width: '100%',
    maxHeight: 200,
    overflow: 'scroll',
    zIndex: 1000,
  },
  dropdownListItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  dropdownListItemText: {
    color: Theme.colors.text,
    fontSize: 13,
  },
  skillsCategoryInventoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
  },
  inventoryCategoryCard: {
    backgroundColor: '#1b1b1b',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 8,
    padding: 16,
    width: '100%',
    minWidth: 265,
    flex: 1,
  },
  inventoryCategoryTitle: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 116, 49, 0.1)',
    paddingBottom: 6,
  },
  inventorySkillsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  inventorySkillBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  inventorySkillBadgeText: {
    color: Theme.colors.text,
    fontSize: 11,
    fontWeight: '500',
  }
});
