import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Dimensions, Platform, useWindowDimensions, Image } from 'react-native';
import { Theme } from '../constants/Theme';
import { AppContext } from '../context/AppContext';
import { LanguageContext } from '../context/LanguageContext';
import { Countries } from '../constants/Countries';
import { Search, SlidersHorizontal, ChevronDown, Check, User, Phone, MapPin, Download, Languages } from 'lucide-react-native';

export default function SearchScreen() {
  const { width } = useWindowDimensions();
  const isWeb = width > 768;
  const { workers } = useContext(AppContext);
  const { t } = useContext(LanguageContext);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedJob, setSelectedJob] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [minAge, setMinAge] = useState(17);
  const [maxAge, setMaxAge] = useState(48);

  // Dropdown states
  const [showCountries, setShowCountries] = useState(false);
  const [showGenders, setShowGenders] = useState(false);
  const [showJobs, setShowJobs] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Helper to map string values to translation keys in Translations.js
  const getTranslationKey = (str) => {
    if (!str) return '';
    if (str === 'All') return 'all';
    return str
      .replace(/&/g, 'And')
      .replace(/\s+(.)/g, (match, group) => group.toUpperCase())
      .replace(/\s+/g, '')
      .replace(/^(.)/, (match, group) => group.toLowerCase());
  };

  // Unique jobs from current workers
  const uniqueJobs = ['All', ...new Set(workers.map(w => w.jobTitle || 'General Labor'))];

  // Unique skills from current workers (dynamically linked to active selected job)
  const uniqueSkills = ['All', ...new Set(
    workers
      .filter(w => selectedJob === 'All' || w.jobTitle === selectedJob)
      .flatMap(w => w.skills || [])
  )];

  // Filtering Logic
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = searchQuery.trim() === '' || 
      `${worker.firstName} ${worker.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (worker.jobTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (worker.skills || []).some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCountry = selectedCountry === 'All' || worker.country === selectedCountry;
    const matchesGender = selectedGender === 'All' || worker.gender === selectedGender;
    const matchesJob = selectedJob === 'All' || worker.jobTitle === selectedJob;
    const matchesSkill = selectedSkill === 'All' || (worker.skills || []).includes(selectedSkill);
    const matchesAge = (worker.age >= minAge) && (worker.age <= maxAge);

    return matchesSearch && matchesCountry && matchesGender && matchesJob && matchesSkill && matchesAge;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.contentContainer, { flexDirection: isWeb ? 'row' : 'column', maxWidth: isWeb ? 1100 : '100%' }]}>
        {/* Left Side: Filter and Query Fields */}
        <View style={[styles.leftColumn, { width: isWeb ? 320 : undefined, height: isWeb ? 'auto' : undefined }]}>
          <Text style={styles.columnTitle}>{t('advancedFilters')}</Text>

          {/* Search Query Input */}
          <View style={styles.searchBar}>
            <Search size={18} color={Theme.colors.textMuted} />
            <TextInput 
              placeholder={t('searchPlaceholder')}
              placeholderTextColor={Theme.colors.textMuted}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Age Selection */}
          <Text style={styles.filterLabel}>{t('ageSpan')}</Text>
          <View style={styles.ageInputRow}>
            <View style={styles.ageBox}>
              <Text style={styles.ageLabel}>{t('minAge')}</Text>
              <TextInput 
                style={styles.ageInput}
                value={String(minAge)}
                onChangeText={v => setMinAge(Math.max(17, parseInt(v) || 17))}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.ageBox}>
              <Text style={styles.ageLabel}>{t('maxAge')}</Text>
              <TextInput 
                style={styles.ageInput}
                value={String(maxAge)}
                onChangeText={v => setMaxAge(Math.min(65, parseInt(v) || 48))}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Country Selection Dropdown */}
          <Text style={styles.filterLabel}>{t('countryOfOrigin')}</Text>
          <TouchableOpacity 
            style={styles.dropdownBtn}
            onPress={() => {
              setShowCountries(!showCountries);
              setShowGenders(false);
              setShowJobs(false);
            }}
          >
            <Text style={styles.dropdownBtnText}>{selectedCountry === 'All' ? 'All Countries' : selectedCountry}</Text>
            <ChevronDown size={18} color={Theme.colors.primary} />
          </TouchableOpacity>

          {showCountries && (
            <View style={styles.dropdownList}>
              <TouchableOpacity 
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedCountry('All');
                  setShowCountries(false);
                }}
              >
                <Text style={[styles.dropdownItemText, selectedCountry === 'All' && { color: Theme.colors.primary }]}>All Countries</Text>
              </TouchableOpacity>
              {Countries.map((c, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedCountry(c);
                    setShowCountries(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, selectedCountry === c && { color: Theme.colors.primary }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Gender Selector Dropdown */}
          <Text style={styles.filterLabel}>{t('gender')}</Text>
          <TouchableOpacity 
            style={styles.dropdownBtn}
            onPress={() => {
              setShowGenders(!showGenders);
              setShowCountries(false);
              setShowJobs(false);
            }}
          >
            <Text style={styles.dropdownBtnText}>{selectedGender === 'All' ? 'All' : selectedGender}</Text>
            <ChevronDown size={18} color={Theme.colors.primary} />
          </TouchableOpacity>

          {showGenders && (
            <View style={styles.dropdownList}>
              {['All', 'Male', 'Female'].map((g, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedGender(g);
                    setShowGenders(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, selectedGender === g && { color: Theme.colors.primary }]}>{g === 'All' ? 'All' : g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Job Selection Dropdown */}
          <Text style={styles.filterLabel}>{t('jobSector')}</Text>
          <TouchableOpacity 
            style={styles.dropdownBtn}
            onPress={() => {
              setShowJobs(!showJobs);
              setShowCountries(false);
              setShowGenders(false);
            }}
          >
            <Text style={styles.dropdownBtnText}>
              {t(getTranslationKey(selectedJob)) || selectedJob}
            </Text>
            <ChevronDown size={18} color={Theme.colors.primary} />
          </TouchableOpacity>
 
          {showJobs && (
            <View style={styles.dropdownList}>
              {uniqueJobs.map((job, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedJob(job);
                    setSelectedSkill('All'); // Dynamically reset selected skill when job changes!
                    setShowJobs(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, selectedJob === job && { color: Theme.colors.primary }]}>
                    {t(getTranslationKey(job)) || job}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
 
          {/* Skill Selection Dropdown */}
          <Text style={styles.filterLabel}>{t('declaredSkills')}</Text>
          <TouchableOpacity 
            style={styles.dropdownBtn}
            onPress={() => {
              setShowSkills(!showSkills);
              setShowCountries(false);
              setShowGenders(false);
              setShowJobs(false);
            }}
          >
            <Text style={styles.dropdownBtnText}>
              {t(getTranslationKey(selectedSkill)) || selectedSkill}
            </Text>
            <ChevronDown size={18} color={Theme.colors.primary} />
          </TouchableOpacity>
 
          {showSkills && (
            <View style={styles.dropdownList}>
              {uniqueSkills.map((skill, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedSkill(skill);
                    setShowSkills(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, selectedSkill === skill && { color: Theme.colors.primary }]}>
                    {t(getTranslationKey(skill)) || skill}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Clear Filters CTA */}
          <TouchableOpacity 
            style={styles.clearBtn}
            onPress={() => {
              setSearchQuery('');
              setSelectedCountry('All');
              setSelectedGender('All');
              setSelectedJob('All');
              setSelectedSkill('All');
              setMinAge(17);
              setMaxAge(48);
            }}
          >
            <Text style={styles.clearBtnText}>{t('clearFilters')}</Text>
          </TouchableOpacity>
        </View>

        {/* Right Side: Results & Candidate Detail Overlay */}
        <View style={styles.rightColumn}>
          <Text style={styles.resultsHeader}>
            {t('discoveredTalent')} ({filteredWorkers.length} {t('profile').toLowerCase()})
          </Text>

          {selectedCandidate ? (
            /* Individual Candidate Full Detail View */
            <View style={styles.candidateDetailCard}>
              <TouchableOpacity 
                style={styles.backToSearchBtn}
                onPress={() => setSelectedCandidate(null)}
              >
                <Text style={styles.backToSearchText}>{t('backToSearch')}</Text>
              </TouchableOpacity>

              <View style={styles.candidateHeader}>
                <View style={styles.detailAvatar}>
                  {selectedCandidate.photoUri ? (
                    <Image source={{ uri: selectedCandidate.photoUri }} style={{ width: '100%', height: '100%', borderRadius: 28 }} />
                  ) : (
                    <Text style={styles.detailAvatarText}>
                      {selectedCandidate.firstName[0]?.toUpperCase()}{selectedCandidate.lastName[0]?.toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={styles.candidateTitleWrap}>
                  <Text style={styles.detailName}>{selectedCandidate.firstName} {selectedCandidate.lastName}</Text>
                  <Text style={styles.detailRole}>{selectedCandidate.jobTitle}</Text>
                </View>
              </View>

              <View style={[styles.detailMetaGrid, { flexDirection: isWeb ? 'row' : 'column', flexWrap: isWeb ? 'wrap' : 'nowrap' }]}>
                <View style={[styles.metaBox, { width: isWeb ? '30%' : '100%' }]}>
                  <Text style={styles.metaLabel}>{t('dateOfReg')}</Text>
                  <Text style={styles.metaValue}>{selectedCandidate.registrationDate}</Text>
                </View>
                
                <View style={[styles.metaBox, { width: isWeb ? '30%' : '100%' }]}>
                  <Text style={styles.metaLabel}>{t('emailPlaceholder')}</Text>
                  <Text style={styles.metaValue}>{selectedCandidate.email}</Text>
                </View>

                <View style={[styles.metaBox, { width: isWeb ? '30%' : '100%' }]}>
                  <Text style={styles.metaLabel}>{t('phonePlaceholder').split(' ')[0]}</Text>
                  <Text style={[styles.metaValue, { color: Theme.colors.primary }]}>{selectedCandidate.phone}</Text>
                </View>

                <View style={[styles.metaBox, { width: isWeb ? '30%' : '100%' }]}>
                  <Text style={styles.metaLabel}>{t('gender')}</Text>
                  <Text style={styles.metaValue}>{selectedCandidate.age} {t('ageValue')}</Text>
                </View>

                <View style={[styles.metaBox, { width: isWeb ? '30%' : '100%' }]}>
                  <Text style={styles.metaLabel}>{t('countryOfOrigin')}</Text>
                  <View style={styles.countryRow}>
                    <MapPin size={14} color={Theme.colors.primary} />
                    <Text style={styles.metaValue}>{selectedCandidate.country}</Text>
                  </View>
                </View>

                <View style={[styles.metaBox, { width: isWeb ? '30%' : '100%' }]}>
                  <Text style={styles.metaLabel}>{t('gender')}</Text>
                  <Text style={styles.metaValue}>{selectedCandidate.gender}</Text>
                </View>
              </View>

              {/* CV Section block */}
              <View style={styles.cvSection}>
                <Text style={styles.cvTitle}>{t('cvTitle')}</Text>
                {selectedCandidate.cvUri ? (
                  <TouchableOpacity 
                    style={styles.cvDownloadBar}
                    activeOpacity={0.8}
                    onPress={() => {
                      const link = document.createElement('a');
                      link.href = selectedCandidate.cvUri;
                      link.download = selectedCandidate.cvName || `${selectedCandidate.firstName}_CV.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download size={20} color={Theme.colors.white} />
                    <View style={{ flex: 1, marginLeft: 10, gap: 2 }}>
                      <Text style={[styles.cvText, { marginLeft: 0 }]}>{selectedCandidate.cvName || `${selectedCandidate.firstName.toUpperCase()}_CV_RESUME.pdf`}</Text>
                      <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }}>{selectedCandidate.cvSize || 'Dynamic PDF'}</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.cvDownloadBar}
                    activeOpacity={0.8}
                    onPress={() => {
                      alert(`${t('cvMockText')} ${selectedCandidate.firstName}`);
                    }}
                  >
                    <Download size={20} color={Theme.colors.white} style={{ marginRight: 10 }} />
                    <Text style={[styles.cvText, { marginLeft: 0 }]}>{selectedCandidate.firstName.toUpperCase()}_CV_RESUME.pdf</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Languages */}
              <View style={styles.langSection}>
                <View style={styles.sectionHeaderRow}>
                  <Languages size={16} color={Theme.colors.primary} />
                  <Text style={styles.cvTitle}>{t('languagesSpoken')}</Text>
                </View>
                <Text style={styles.langText}>
                  {selectedCandidate.languages ? selectedCandidate.languages.join(', ') : 'English'}
                </Text>
              </View>

              {/* Experience Summary */}
              {selectedCandidate.experience && (
                <View style={styles.expSection}>
                  <Text style={styles.cvTitle}>{t('experienceSummary')}</Text>
                  <Text style={styles.expText}>{selectedCandidate.experience}</Text>
                </View>
              )}

              {/* Skills */}
              <Text style={styles.cvTitle}>{t('declaredSkills')}</Text>
              <View style={styles.skillsRow}>
                {selectedCandidate.skills && selectedCandidate.skills.map((s, i) => (
                  <View key={i} style={styles.skillBadge}>
                    <Text style={styles.skillBadgeText}>{s}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            /* Results Scroll List */
            <ScrollView 
              style={styles.workersList} 
              contentContainerStyle={styles.listContent}
              scrollEnabled={isWeb}
            >
              {filteredWorkers.length === 0 ? (
                <View style={styles.noResultsBox}>
                  <SlidersHorizontal size={40} color={Theme.colors.textMuted} style={{ marginBottom: 10 }} />
                  <Text style={styles.noResultsTitle}>{t('noCandidates')}</Text>
                  <Text style={styles.noResultsText}>{t('noCandidatesText')}</Text>
                </View>
              ) : (
                filteredWorkers.map((worker) => (
                  <TouchableOpacity
                    key={worker.id}
                    style={styles.workerCard}
                    onPress={() => setSelectedCandidate(worker)}
                  >
                    <View style={styles.avatar}>
                      {worker.photoUri ? (
                        <Image source={{ uri: worker.photoUri }} style={{ width: '100%', height: '100%', borderRadius: 21 }} />
                      ) : (
                        <Text style={styles.avatarText}>{worker.firstName[0]}{worker.lastName[0]}</Text>
                      )}
                    </View>
                    <View style={styles.workerInfo}>
                      <Text style={styles.workerName}>{worker.firstName} {worker.lastName}</Text>
                      <Text style={styles.workerJob}>{worker.jobTitle}</Text>
                      
                      <View style={styles.metaRow}>
                        <View style={styles.metaTag}>
                          <MapPin size={10} color={Theme.colors.primary} />
                          <Text style={styles.metaTagText}>{worker.country}</Text>
                        </View>
                        <View style={styles.metaTag}>
                          <User size={10} color={Theme.colors.primary} />
                          <Text style={styles.metaTagText}>{worker.age} {t('ageValue').split(' ')[0]}</Text>
                        </View>
                      </View>
                    </View>
                    <ChevronDown size={18} color={Theme.colors.primary} style={{ transform: [{ rotate: '-90deg' }] }} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
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
    flexGrow: 1,
    alignSelf: 'center',
    width: '100%',
    padding: 16,
    gap: 20,
  },
  leftColumn: {
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 20,
  },
  rightColumn: {
    flex: 1,
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 20,
    minHeight: 400,
  },
  columnTitle: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  searchBar: {
    height: 46,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: Theme.colors.text,
    fontSize: 13,
    paddingLeft: 8,
    outlineStyle: 'none',
  },
  filterLabel: {
    color: Theme.colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 8,
  },
  ageInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  ageBox: {
    flex: 1,
  },
  ageLabel: {
    color: Theme.colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 4,
  },
  ageInput: {
    height: 42,
    backgroundColor: '#1b1b1b',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 6,
    color: Theme.colors.text,
    fontSize: 13,
    textAlign: 'center',
    outlineStyle: 'none',
  },
  dropdownBtn: {
    height: 44,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: '#1b1b1b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  dropdownBtnText: {
    color: Theme.colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  dropdownList: {
    maxHeight: 180,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: '#1b1b1b',
    marginBottom: 12,
    overflow: 'scroll',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Theme.colors.border,
  },
  dropdownItemText: {
    color: Theme.colors.text,
    fontSize: 13,
  },
  clearBtn: {
    height: 42,
    borderWidth: 1,
    borderColor: 'rgba(255, 116, 49, 0.2)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(255, 116, 49, 0.03)',
  },
  clearBtnText: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  resultsHeader: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingBottom: 10,
  },
  workersList: {
    flex: 1,
  },
  listContent: {
    gap: 12,
  },
  workerCard: {
    height: 76,
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 116, 49, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  avatarText: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    color: Theme.colors.text,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  workerJob: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  metaTagText: {
    color: Theme.colors.text,
    fontSize: 10,
    fontWeight: '500',
  },
  noResultsBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noResultsTitle: {
    color: Theme.colors.text,
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 6,
  },
  noResultsText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  candidateDetailCard: {
    backgroundColor: '#171717',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 24,
  },
  backToSearchBtn: {
    marginBottom: 20,
  },
  backToSearchText: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  detailAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 116, 49, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
  },
  detailAvatarText: {
    color: Theme.colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  candidateTitleWrap: {
    flex: 1,
  },
  detailName: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  detailRole: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  detailMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  metaBox: {
    backgroundColor: '#202020',
    padding: 12,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: Theme.colors.border,
  },
  metaLabel: {
    color: Theme.colors.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: Theme.colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cvSection: {
    backgroundColor: '#ff743120',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ff743150',
    padding: 16,
    marginBottom: 20,
  },
  cvTitle: {
    color: Theme.colors.text,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cvDownloadBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Theme.colors.primary,
    padding: 12,
    borderRadius: 6,
  },
  cvText: {
    color: Theme.colors.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
  langSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  langText: {
    color: Theme.colors.text,
    fontSize: 13,
    paddingLeft: 24,
  },
  expSection: {
    marginBottom: 20,
  },
  expText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  skillBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 0.5,
    borderColor: Theme.colors.border,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  skillBadgeText: {
    color: Theme.colors.text,
    fontSize: 11,
    fontWeight: '500',
  }
});
