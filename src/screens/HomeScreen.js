import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, useWindowDimensions } from 'react-native';
import { Theme } from '../constants/Theme';
import { AppContext } from '../context/AppContext';
import { LanguageContext } from '../context/LanguageContext';
import { Briefcase, ShieldCheck, Users, Search, ChevronRight } from 'lucide-react-native';

export default function HomeScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isWeb = width > 768;
  const { currentUser } = useContext(AppContext);
  const { t } = useContext(LanguageContext);

  const dynamicStyles = {
    contentContainer: {
      maxWidth: isWeb ? 1100 : '100%',
    },
    heroContainer: {
      height: isWeb ? 400 : 250,
    },
    heroTitle: {
      fontSize: isWeb ? 42 : 28,
    },
    heroSubtitle: {
      fontSize: isWeb ? 18 : 13,
    },
    heroTagline: {
      fontSize: isWeb ? 16 : 14,
      lineHeight: isWeb ? 24 : 20,
      maxWidth: isWeb ? 700 : '100%',
    },
    servicesGrid: {
      flexDirection: isWeb ? 'row' : 'column',
    },
    serviceCard: {
      flex: isWeb ? 1 : undefined,
      minWidth: isWeb ? 250 : undefined,
    }
  };

  // Dynamically translate standard services
  const services = [
    {
      icon: <Users size={28} color={Theme.colors.primary} />,
      title: t('onboard'),
      desc: t('heroTagline')
    },
    {
      icon: <ShieldCheck size={28} color={Theme.colors.primary} />,
      title: t('personalInfo'),
      desc: t('onboardDesc')
    },
    {
      icon: <Briefcase size={28} color={Theme.colors.primary} />,
      title: t('desiredJobTitle'),
      desc: t('bioPlaceholder')
    },
    {
      icon: <Search size={28} color={Theme.colors.primary} />,
      title: t('searchCandidates'),
      desc: t('noCandidatesText')
    }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.contentContainer, dynamicStyles.contentContainer]}>
      {/* Hero Banner Section */}
      <View style={[styles.heroContainer, dynamicStyles.heroContainer]}>
        <Image 
          source={{ uri: 'https://www.superecruiter.rs/wp-content/uploads/elementor/thumbs/connect-to-people-in-a-virtual-world-gigapixel-standard-scale-6_00x-scaled-pud2qria6pu3g41jwnfa9b3yl78gvucjnf9m0jr8mo.jpg' }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
        <View style={styles.heroContent}>
          <Text style={[styles.heroTitle, dynamicStyles.heroTitle]}>{t('heroTitle')}</Text>
          <Text style={[styles.heroSubtitle, dynamicStyles.heroSubtitle]}>{t('heroSubtitle')}</Text>
          <Text style={[styles.heroTagline, dynamicStyles.heroTagline]}>
            {t('heroTagline')}
          </Text>
        </View>
      </View>

      {/* Main Actions Row */}
      <View style={styles.actionsContainer}>
        {currentUser ? (
          <TouchableOpacity 
            style={[styles.primaryButton, styles.fullWidthBtn]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.buttonText}>{t('goToProfile')}</Text>
            <ChevronRight size={18} color={Theme.colors.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.btnRow}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.buttonText}>{t('registerAsWorker')}</Text>
              <ChevronRight size={18} color={Theme.colors.white} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Register', { isLogin: true })}
            >
              <Text style={styles.secondaryButtonText}>{t('workerLogin')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => navigation.navigate('Search')}
        >
          <Search size={18} color={Theme.colors.primary} />
          <Text style={styles.searchButtonText}>{t('searchAvailableWorkers')}</Text>
        </TouchableOpacity>
      </View>

      {/* Global Locations Map Banner */}
      <View style={styles.locationsCard}>
        <Text style={styles.locationsTitle}>{t('globalTalentHubs')}</Text>
        <Text style={styles.locationsText}>
          {t('locationsList')}
        </Text>
      </View>

      {/* Services Section */}
      <View style={styles.servicesHeader}>
        <Text style={styles.sectionSubtitle}>{t('whatWeDo')}</Text>
        <Text style={styles.sectionTitle}>{t('fullHRTitle')}</Text>
      </View>

      <View style={[styles.servicesGrid, dynamicStyles.servicesGrid]}>
        {services.map((item, index) => (
          <View key={index} style={[styles.serviceCard, dynamicStyles.serviceCard]}>
            <View style={styles.iconContainer}>{item.icon}</View>
            <Text style={styles.serviceTitle}>{item.title}</Text>
            <Text style={styles.serviceDesc}>{item.desc}</Text>
          </View>
        ))}
      </View>

      {/* Contact Callout */}
      <View style={styles.calloutCard}>
        <Text style={styles.calloutTitle}>{t('customStaffingTitle')}</Text>
        <Text style={styles.calloutDesc}>{t('customStaffingDesc')}</Text>
        <TouchableOpacity 
          style={styles.calloutBtn}
          onPress={() => navigation.navigate('Contact')}
        >
          <Text style={styles.calloutBtnText}>{t('getInTouch')}</Text>
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
    paddingBottom: 40,
    alignSelf: 'center',
    width: '100%',
  },
  heroContainer: {
    position: 'relative',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.55,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 13, 13, 0.65)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 10,
    paddingHorizontal: 24,
    paddingVertical: 30,
    justifyContent: 'center',
  },
  heroTitle: {
    fontWeight: '900',
    color: Theme.colors.white,
    letterSpacing: 2,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontWeight: 'bold',
    color: Theme.colors.primary,
    letterSpacing: 4,
    marginBottom: 16,
  },
  heroTagline: {
    color: '#e0e0e0',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginTop: -25,
    zIndex: 20,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    height: 52,
    backgroundColor: Theme.colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fullWidthBtn: {
    width: '100%',
  },
  buttonText: {
    color: Theme.colors.white,
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.card,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: Theme.colors.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  searchButton: {
    height: 52,
    borderWidth: 1.5,
    borderColor: Theme.colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: 'rgba(255, 116, 49, 0.05)',
  },
  searchButtonText: {
    color: Theme.colors.primary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  locationsCard: {
    backgroundColor: Theme.colors.card,
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
  },
  locationsTitle: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 8,
  },
  locationsText: {
    color: Theme.colors.text,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
  servicesHeader: {
    paddingHorizontal: 20,
    marginTop: 35,
    marginBottom: 20,
  },
  sectionSubtitle: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 6,
  },
  sectionTitle: {
    color: Theme.colors.text,
    fontSize: 22,
    fontWeight: 'bold',
  },
  servicesGrid: {
    paddingHorizontal: 20,
    flexWrap: 'wrap',
    gap: 16,
  },
  serviceCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: 10,
    padding: 24,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 116, 49, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceTitle: {
    color: Theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    lineHeight: 22,
  },
  serviceDesc: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  calloutCard: {
    backgroundColor: '#1b1411',
    borderColor: 'rgba(255, 116, 49, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 40,
    padding: 24,
    alignItems: 'center',
  },
  calloutTitle: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  calloutDesc: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  calloutBtn: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  calloutBtnText: {
    color: Theme.colors.white,
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1.5,
  }
});
