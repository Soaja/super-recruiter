import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Platform, Dimensions, useWindowDimensions, Linking } from 'react-native';
import { Theme } from '../constants/Theme';
import { LanguageContext } from '../context/LanguageContext';
import { AppContext } from '../context/AppContext';
import { Phone, Mail, MapPin, Globe, Send, CheckCircle } from 'lucide-react-native';

export default function ContactScreen() {
  const { width } = useWindowDimensions();
  const isWeb = width > 768;
  const { t, locale } = useContext(LanguageContext);
  const { submitInquiry } = useContext(AppContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Anti-spam states
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 9) + 1; // 1-9
    const n2 = Math.floor(Math.random() * 9) + 1; // 1-9
    setNum1(n1);
    setNum2(n2);
    setCaptchaAnswer('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const getInquiryLabel = () => {
    switch (locale) {
      case 'sr':
      case 'hr':
        return 'Vaša Poruka / Sadržaj Upita';
      case 'de':
        return 'Ihre Nachricht / Anfragetext';
      case 'tr':
        return 'Mesajınız / Talep İçeriği';
      case 'ro':
        return 'Mesajul dumneavoastră / Conținutul solicitării';
      case 'pl':
        return 'Twoja wiadomość / Treść zapytania';
      default:
        return 'Your Message / Inquiry Content';
    }
  };

  const getInquiryPlaceholder = () => {
    switch (locale) {
      case 'sr':
      case 'hr':
        return 'Detaljno opišite vaš upit ili pitanje...';
      case 'de':
        return 'Beschreiben Sie Ihre Anfrage im Detail...';
      case 'tr':
        return 'Talebinizi detaylı olarak açıklayın...';
      case 'ro':
        return 'Descrieți solicitarea dumneavoastră în detaliu...';
      case 'pl':
        return 'Opisz szczegółowo swoje zapytanie...';
      default:
        return 'Describe your request or inquiry in detail...';
    }
  };

  const getCaptchaLabel = () => {
    switch (locale) {
      case 'sr':
      case 'hr':
        return 'Sigurnosna Anti-Spam Zaštita';
      case 'de':
        return 'Anti-Spam-Sicherheitsfrage';
      case 'tr':
        return 'Anti-Spam Güvenlik Koruması';
      case 'ro':
        return 'Protecție anti-spam de securitate';
      case 'pl':
        return 'Zabezpieczenie przed spamem (Anti-Spam)';
      default:
        return 'Anti-Spam Security Protection';
    }
  };

  const getCaptchaPlaceholder = (n1, n2) => {
    switch (locale) {
      case 'sr':
      case 'hr':
        return `Koliko je ${n1} + ${n2}?`;
      case 'de':
        return `Was ist ${n1} + ${n2}?`;
      case 'tr':
        return `${n1} + ${n2} kaçtır?`;
      case 'ro':
        return `Cât este ${n1} + ${n2}?`;
      case 'pl':
        return `Ile to jest ${n1} + ${n2}?`;
      default:
        return `What is ${n1} + ${n2}?`;
    }
  };

  const handleSend = () => {
    // 1. Honeypot check (catches automated spambots)
    if (honeypot) {
      console.log('Spam bot execution blocked via honeypot.');
      return;
    }

    if (!name || !email || !message) {
      showAlert(t('error'), t('fillContactForm'));
      return;
    }

    // 2. Math Captcha check
    const correctAnswer = num1 + num2;
    if (parseInt(captchaAnswer) !== correctAnswer) {
      showAlert(t('error') || 'Error', locale === 'sr' ? 'Pogrešan odgovor na anti-spam zaštitu.' : 'Incorrect anti-spam security question answer.');
      return;
    }

    // Save inquiry to local database
    submitInquiry(name, email, message);

    const recipient = 'office@superecruiter.rs';
    const subject = `SUPERECRUITER Inquiry from ${name}`;
    const body = `Hello SUPERECRUITER Team,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoUrl).catch((err) => {
      console.log('Error opening mail client:', err);
    });

    setSubmitted(true);
    showAlert(t('success'), t('inquirySuccessText'));
    generateCaptcha();
  };

  const showAlert = (title, msg) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.contentContainer, { maxWidth: isWeb ? 1000 : '100%' }]}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>{t('getInTouchContact')}</Text>
        <Text style={styles.title}>{t('contactTeam')}</Text>
        <Text style={styles.headerDesc}>
          {t('contactDesc')}
        </Text>
      </View>

      <View style={[styles.grid, { flexDirection: isWeb ? 'row' : 'column' }]}>
        {/* Contact info cards */}
        <View style={styles.leftColumn}>
          <View style={styles.infoCard}>
            <Phone size={24} color={Theme.colors.primary} />
            <View>
              <Text style={styles.cardLabel}>{t('directPhone')}</Text>
              <Text style={styles.cardValue}>+38161 18086141</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Mail size={24} color={Theme.colors.primary} />
            <View>
              <Text style={styles.cardLabel}>{t('emailSupport')}</Text>
              <Text style={styles.cardValue}>office@superecruiter.rs</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <MapPin size={24} color={Theme.colors.primary} />
            <View>
              <Text style={styles.cardLabel}>{t('hqLocation')}</Text>
              <Text style={styles.cardValue}>Kneza Miloša 4, Belgrade, Serbia</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Globe size={24} color={Theme.colors.primary} />
            <View>
              <Text style={styles.cardLabel}>{t('officialWebsite')}</Text>
              <Text style={styles.cardValue}>www.superecruiter.rs</Text>
            </View>
          </View>
        </View>

        {/* Contact Form */}
        <View style={styles.rightColumn}>
          {submitted ? (
            <View style={styles.successContainer}>
              <CheckCircle size={48} color={Theme.colors.success} style={{ marginBottom: 12 }} />
              <Text style={styles.successTitle}>{t('messageSentSuccess')}</Text>
              <Text style={styles.successText}>
                {t('inquirySuccessText')}
              </Text>
              <TouchableOpacity 
                style={styles.resetBtn}
                onPress={() => {
                  setName('');
                  setEmail('');
                  setMessage('');
                  setSubmitted(false);
                }}
              >
                <Text style={styles.resetBtnText}>{t('sendAnotherMessage')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.formTitle}>{t('submitRequest')}</Text>

              <Text style={styles.fieldLabel}>{t('firstName').split(' ')[0]} {t('lastName')}</Text>
              <TextInput 
                style={styles.textInput}
                placeholder={t('firstName')}
                placeholderTextColor={Theme.colors.textMuted}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.fieldLabel}>{t('emailPlaceholder')}</Text>
              <TextInput 
                style={styles.textInput}
                placeholder={t('emailPlaceholder')}
                placeholderTextColor={Theme.colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.fieldLabel}>{getInquiryLabel()}</Text>
              <TextInput 
                style={[styles.textInput, { height: 100, paddingVertical: 10 }]}
                placeholder={getInquiryPlaceholder()}
                placeholderTextColor={Theme.colors.textMuted}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
              />

              {/* Honeypot field (hidden from screen readers & users, catches bots) */}
              <TextInput
                style={styles.honeypot}
                value={honeypot}
                onChangeText={setHoneypot}
                placeholder="Leave this empty"
                autoCompleteType="off"
              />

              {/* Math Captcha Anti-Spam Challenge */}
              <Text style={styles.fieldLabel}>{getCaptchaLabel()}</Text>
              <View style={styles.captchaRow}>
                <View style={styles.captchaQuestionContainer}>
                  <Text style={styles.captchaQuestionText}>
                    {getCaptchaPlaceholder(num1, num2)}
                  </Text>
                </View>
                <TextInput 
                  style={[styles.textInput, styles.captchaInput]}
                  placeholder="?"
                  placeholderTextColor={Theme.colors.textMuted}
                  value={captchaAnswer}
                  onChangeText={setCaptchaAnswer}
                  keyboardType="numeric"
                />
                <TouchableOpacity 
                  style={styles.refreshCaptchaBtn} 
                  onPress={generateCaptcha}
                >
                  <Text style={styles.refreshText}>↻</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.sendBtn}
                onPress={handleSend}
              >
                <Send size={16} color={Theme.colors.white} />
                <Text style={styles.sendBtnText}>{t('submitRequest').toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  subtitle: {
    color: Theme.colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    color: Theme.colors.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  headerDesc: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 600,
  },
  grid: {
    gap: 24,
  },
  leftColumn: {
    flex: 1,
    gap: 16,
  },
  rightColumn: {
    flex: 1.2,
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 24,
  },
  infoCard: {
    backgroundColor: Theme.colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardLabel: {
    color: Theme.colors.textMuted,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardValue: {
    color: Theme.colors.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  form: {
    gap: 12,
  },
  formTitle: {
    color: Theme.colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  fieldLabel: {
    color: Theme.colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  textInput: {
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    color: Theme.colors.text,
    fontSize: 14,
    paddingHorizontal: 12,
    outlineStyle: 'none',
  },
  sendBtn: {
    backgroundColor: Theme.colors.primary,
    height: 46,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  sendBtnText: {
    color: Theme.colors.white,
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  successTitle: {
    color: Theme.colors.text,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  successText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  resetBtn: {
    borderWidth: 1,
    borderColor: Theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  resetBtnText: {
    color: Theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  captchaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  captchaQuestionContainer: {
    backgroundColor: 'rgba(255, 116, 49, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 116, 49, 0.25)',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
  },
  captchaQuestionText: {
    color: Theme.colors.primary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  captchaInput: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    maxWidth: 100,
  },
  refreshCaptchaBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 6,
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshText: {
    color: Theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  honeypot: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    width: 0,
    height: 0,
    opacity: 0,
  }
});
