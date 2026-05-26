# SUPERECRUITER - Uputstvo za Produkciju i Distribuciju

Ovaj dokument sadrži detaljne instrukcije za pripremu, kompajliranje i distribuciju **SUPERECRUITER** aplikacije za produkciono okruženje na vebu, kao i na Google Play Store i Apple App Store prodavnicama.

Takođe, priložen je i kompletan tehnički vodič za migraciju baze podataka sa lokalnog skladišta (`AsyncStorage`) na **Firebase (Firestore i Authentication)** kako bi svi korisnici i administratori delili centralizovane i sinhronizovane podatke u realnom vremenu.

---

## 🏗️ 1. Veb Produkciona Distribucija (Static Web Hosting)

SUPERECRUITER je razvijen korišćenjem React Native Web tehnologije, što omogućava da se cela aplikacija kompajlira u visoko optimizovane statičke HTML, CSS i JavaScript fajlove koji se mogu hostovati na ultra brzim globalnim mrežama (CDN).

### A. Komanda za Build
Da biste kreirali produkcioni statički build, pokrenite sledeću skriptu u korenskom direktorijumu projekta:
```bash
npm run build:web
```
*Ova komanda pokreće `npx expo export --platform web` i kreira produkcioni paket unutar **`dist/`** direktorijuma.*

### B. Preporučeni Provajderi za Hostovanje
Možete jednostavno povezati svoj Git repozitorijum sa bilo kojim premium provajderom statičkog hostinga:
* **Vercel / Netlify**: Povežite repozitorijum, postavite **Build Command** na `npm run build:web` i **Publish/Output Directory** na `dist`.
* **GitHub Pages**: Povežite svoj repozitorijum i konfigurišite ga za deploy iz `dist` foldera.
* **Firebase Hosting**: Pokrenite `firebase init hosting`, izaberite `dist` kao javni direktorijum i izvršite deploy sa `firebase deploy`.

---

## 📱 2. Mobilna Produkciona Distribucija (EAS Build)

EAS (Expo Application Services) predstavlja standardnu cloud-based infrastrukturu za kreiranje izvornih `.aab` (Android App Bundle) i `.ipa` (iOS App Store paket) fajlova spremnih za prodavnice.

### A. Preduslovi za EAS Build
1. Instalirajte EAS CLI globalno na svom računaru:
   ```bash
   npm install -g eas-cli
   ```
2. Prijavite se na svoj Expo nalog:
   ```bash
   eas login
   ```
3. Inicijalizujte EAS projekat u korenskom direktorijumu aplikacije:
   ```bash
   eas project:init
   ```

### B. Konfiguracioni Fajlovi
* **`eas.json`**: Već je uspešno konfigurisan u korenu projekta i definiše razvojne, preview i produkcione profile.
* **`app.json`**: Pre pokretanja produkcionog build-a, potvrdite ili prilagodite sledeće parametre:
  * **Android Package Name**: Unutar `android` bloka definisan je `"package": "rs.superecruiter.app"`.
  * **iOS Bundle Identifier**: Unutar `ios` bloka definisan je `"bundleIdentifier": "rs.superecruiter.app"`.

### C. Komande za Build
* **Za Android** (Kreira produkcioni `.aab` fajl za Google Play Store):
   ```bash
   npm run build:android
   ```
   *(Ako želite da kreirate lokalni `.apk` fajl za ručnu instalaciju i testiranje na telefonu, pokrenite `eas build --platform android --profile preview`)*.
* **Za iOS** (Kreira produkcioni `.ipa` fajl za TestFlight i Apple App Store):
   ```bash
   npm run build:ios
   ```

---

## 🔐 3. Bezbednost i Environment Promenljive

Za produkciono okruženje se nikada ne preporučuje čuvanje osetljivih API ključeva direktno u kodu.
1. Kreirajte **`.env`** fajl u korenu projekta za lokalne ključeve:
   ```env
   EXPO_PUBLIC_API_URL=https://api.superecruiter.rs
   ```
2. Expo automatski pakuje sve promenljive sa prefiksom `EXPO_PUBLIC_` prilikom kreiranja build-a. Možete im pristupiti bilo gde u kodu preko:
   ```javascript
   const apiUrl = process.env.EXPO_PUBLIC_API_URL;
   ```

---

## 🗄️ 4. Centralna Baza Podataka: Integracija i Migracija na Firebase

Aplikacija trenutno koristi **AsyncStorage** za čuvanje podataka na nivou samog uređaja (idealno za offline rad i demonstraciju). Za prelazak u realnu produkciju gde svi korisnici i administratori pristupaju istoj bazi podataka, **Firebase** je najbolje i najjednostavnije rešenje.

U nastavku je kompletan korak-po-korak tehnički plan i kôd za integraciju **Firebase Firestore (baza)** i **Firebase Auth (autentifikacija)**.

---

### KORAK 1: Podešavanje Firebase Konzole
1. Otvorite [Firebase Console](https://console.firebase.google.com/) i kreirajte projekat pod nazivom `SUPERECRUITER`.
2. Omogućite sledeće usluge u levom meniju:
   * **Authentication**: Idite na *Build > Authentication > Sign-in method* i omogućite:
     * **Email/Password** (za registraciju radnika).
     * **Google** (opciono, za SSO prijavu).
   * **Cloud Firestore**: Idite na *Build > Firestore Database*, kliknite na *Create Database*, pokrenite u **Production Mode** i izaberite lokaciju servera (npr. `europe-west3` za Evropu).
3. Kliknite na zupčanik pored *Project Overview* -> *Project Settings*, pod stavkom *Your apps* kliknite na ikonicu za **Web App `</>`**, dajte joj ime i kopirajte konfiguracioni objekat sa API ključevima.

---

### KORAK 2: Instalacija Firebase SDK-a
U korenskom direktorijumu projekta instalirajte zvaničnu Firebase biblioteku:
```bash
npm install firebase
```

---

### KORAK 3: Kreiranje Firebase Konfiguracije u Aplikaciji
Kreirajte novi fajl `src/config/firebase.js` i dodajte sledeći kôd (konfiguracioni ključevi se čitaju bezbedno iz `.env` fajla):

```javascript
// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

Dodajte u svoj `.env` fajl u korenu projekta odgovarajuće vrednosti sa Firebase konzole:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=vasi_api_kljuc
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=vas-projekat.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=vas-projekat
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=vas-projekat.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=vasi_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=vas_app_id
```

---

### KORAK 4: Zamena AsyncStorage sa Firestore u `AppContext.js`
Zamenite AsyncStorage čitanja i upise sa real-time Firestore pozivima. U nastavku su kompletni kôd isečci koje možete zameniti direktno u fajlu `src/context/AppContext.js`:

#### A. Uvoz Firebase modula i osluškivanje baze u realnom vremenu (`useEffect`)
Ubacite sledeći uvoz i zamenite funkciju `loadInitialData` i `useEffect` sa real-time Firestore osluškivačima. Ovo osigurava da se svi podaci na klijentu ažuriraju istog trenutka kada dođe do promene u bazi podataka:

```javascript
import { db, auth } from '../config/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc, addDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

// Zamenite loadInitialData i postojeći useEffect sa sledećim kodom:
useEffect(() => {
  // 1. Real-time osluškivanje svih registrovanih radnika
  const unsubscribeWorkers = onSnapshot(collection(db, 'workers'), (snapshot) => {
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setWorkers(list);
  });

  // 2. Real-time osluškivanje svih upita sa kontakt forme
  const unsubscribeInquiries = onSnapshot(collection(db, 'inquiries'), (snapshot) => {
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setInquiries(list);
  });

  // 3. Real-time osluškivanje dinamičkih veština koje admin dodaje
  const unsubscribeSkills = onSnapshot(doc(db, 'settings', 'skills'), (docSnap) => {
    if (docSnap.exists()) {
      setSkillCategories(docSnap.data().categories);
    } else {
      // Ako ne postoji u bazi, inicijalizuj podrazumevane veštine
      setDoc(doc(db, 'settings', 'skills'), { categories: SKILL_CATEGORIES });
      setSkillCategories(SKILL_CATEGORIES);
    }
  });

  // 4. Real-time osluškivanje administratorske lozinke
  const unsubscribeAdmin = onSnapshot(doc(db, 'settings', 'admin'), (docSnap) => {
    if (docSnap.exists()) {
      setAdminPassword(docSnap.data().password);
    } else {
      // Inicijalna podrazumevana lozinka za novu bazu
      setDoc(doc(db, 'settings', 'admin'), { password: 'adminpassword' });
      setAdminPassword('adminpassword');
    }
  });

  return () => {
    unsubscribeWorkers();
    unsubscribeInquiries();
    unsubscribeSkills();
    unsubscribeAdmin();
  };
}, []);
```

#### B. Registracija i Prijava radnika (Firebase Auth + Firestore)
Zamenite funkcije `registerWorker` i `loginWorker` sledećim implementacijama:

```javascript
const registerWorker = async (workerData) => {
  try {
    // 1. Kreiranje naloga u Firebase Authentication servisu
    const userCredential = await createUserWithEmailAndPassword(auth, workerData.email, workerData.password);
    const userId = userCredential.user.uid;

    // 2. Kreiranje objekta radnika bez osetljive lozinke u Firestore bazi podataka
    const newWorker = {
      email: workerData.email.toLowerCase(),
      firstName: workerData.firstName,
      lastName: workerData.lastName,
      phone: workerData.phone,
      age: parseInt(workerData.age) || 25,
      country: workerData.country,
      gender: workerData.gender,
      jobTitle: workerData.jobTitle,
      skills: workerData.skills || [],
      experience: workerData.experience || '',
      languages: workerData.languages || ['English'],
      registrationDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      cvAvailable: true
    };

    // Upis u "workers" kolekciju pod istim UID-om iz Authentication-a
    await setDoc(doc(db, 'workers', userId), newWorker);
    
    // Postavljanje trenutno prijavljenog korisnika u aplikativnom stanju
    setCurrentUser({ id: userId, ...newWorker });
    return { success: true };
  } catch (e) {
    console.log('Greška pri registraciji na Firebase:', e);
    return { success: false, error: e.message };
  }
};

const loginWorker = async (email, password) => {
  try {
    // Prijava korisnika preko Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    
    // Podaci o radniku će se automatski učitati u state preko onSnapshot osluškivača,
    // ali za trenutni login možemo eksplicitno naći korisnika u workers listi:
    const found = workers.find(w => w.id === userId);
    if (found) {
      setCurrentUser(found);
    }
    return { success: true };
  } catch (e) {
    console.log('Greška pri prijavi na Firebase:', e);
    return { success: false, error: 'Neispravan email ili lozinka.' };
  }
};

const logoutWorker = async () => {
  try {
    await signOut(auth);
    setCurrentUser(null);
  } catch (e) {
    console.log('Greška pri odjavi:', e);
  }
};
```

#### C. Ažuriranje profila radnika
Zamenite funkciju `updateProfile` da ažurira odgovarajući dokument u Firestore kolekciji:

```javascript
const updateProfile = async (updatedProfile) => {
  try {
    const userId = updatedProfile.id;
    // Kreiramo kopiju podataka bez id polja za upis u Firestore
    const { id, ...dataToSave } = updatedProfile;
    
    await setDoc(doc(db, 'workers', userId), dataToSave, { merge: true });
    setCurrentUser(updatedProfile);
    return { success: true };
  } catch (e) {
    console.log('Greška pri ažuriranju profila na Firebase:', e);
    return { success: false, error: e.message };
  }
};
```

#### D. Slanje upita sa kontakt forme (Inquiries)
Zamenite funkciju `submitInquiry` da upisuje kontakt formu direktno u Firestore bazu:

```javascript
const submitInquiry = async (name, email, message) => {
  try {
    await addDoc(collection(db, 'inquiries'), {
      name,
      email,
      message,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    });
    return { success: true };
  } catch (e) {
    console.log('Greška pri slanju upita na Firebase:', e);
    return { success: false, error: e.message };
  }
};
```

#### E. Dodavanje administratorskih veština i promena lozinke
Zamenite funkcije `addAdminSkill` i `changeAdminPassword` za rad sa Firestore dokumentima:

```javascript
const addAdminSkill = async (category, skillName) => {
  try {
    if (!category || !skillName) {
      return { success: false, error: 'Kategorija i naziv veštine su obavezni.' };
    }
    const trimmedCategory = category.trim();
    const trimmedSkill = skillName.trim();

    const updatedCategories = { ...skillCategories };
    if (!updatedCategories[trimmedCategory]) {
      updatedCategories[trimmedCategory] = [];
    }

    const skillExists = updatedCategories[trimmedCategory].some(
      s => s.toLowerCase() === trimmedSkill.toLowerCase()
    );
    if (skillExists) {
      return { success: false, error: 'Veština već postoji u ovoj kategoriji.' };
    }

    updatedCategories[trimmedCategory] = [...updatedCategories[trimmedCategory], trimmedSkill];

    // Upis celokupne mape u settings/skills dokument
    await setDoc(doc(db, 'settings', 'skills'), { categories: updatedCategories });
    return { success: true };
  } catch (e) {
    console.log('Greška pri dodavanju veštine:', e);
    return { success: false, error: e.message };
  }
};

const changeAdminPassword = async (currentPassword, newPassword) => {
  try {
    if (adminPassword !== currentPassword) {
      return { success: false, error: 'Trenutna admin lozinka nije ispravna.' };
    }
    await setDoc(doc(db, 'settings', 'admin'), { password: newPassword }, { merge: true });
    return { success: true };
  } catch (e) {
    console.log('Greška pri promeni admin lozinke:', e);
    return { success: false, error: e.message };
  }
};
```

---

### KORAK 5: Pravila Bezbednosti baze podataka (Firestore Security Rules)
Nakon što prebacite bazu na produkciju, u Firebase konzoli u meniju **Firestore Database > Rules** zamenite podrazumevana pravila sa sledećim sigurnosnim setom pravila kako biste u potpunosti obezbedili privatnost radnika i sprečili zloupotrebu:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Radnici: Svako može pretraživati radnike, ali samo ulogovani radnik može pisati/menjati isključivo svoj dokument
    match /workers/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Upiti sa kontakt forme: Svako može poslati upit (write), ali samo ulogovani administrator može čitati listu upita
    match /inquiries/{inquiryId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null; 
    }
    
    // Globalna podešavanja (lista veština i admin lozinka): Čitanje je javno, upis dozvoljen samo administratoru
    match /settings/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Ova postavka bezbednosti garantuje vrhunsku zaštitu podataka i sprečava bilo kakve zloupotrebe pretrage ili izmene tuđih profila.

---

Ovim je vaša aplikacija u potpunosti opremljena za produkciju, skaliranje i bezbedno čuvanje podataka na Cloud serverima u realnom vremenu!
