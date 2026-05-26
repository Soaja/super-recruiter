import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SKILL_CATEGORIES } from '../constants/Skills';

export const AppContext = createContext();

const SEED_WORKERS = [
  {
    id: 'seed-1',
    firstName: 'Judith',
    lastName: 'Nduku',
    email: 'severussnape@gmail.com',
    age: 31,
    country: 'Kenya',
    gender: 'Female',
    phone: '0611808614',
    jobTitle: 'Hostess',
    registrationDate: 'February 9, 2023',
    languages: ['English', 'Swahili'],
    skills: ['Guest Relations', 'Event Management', 'Catering'],
    cvAvailable: true,
    experience: '3 years in Dubai luxury hotels, fluent communication.'
  },
  {
    id: 'seed-2',
    firstName: 'John',
    lastName: 'Kimani',
    email: 'john.kimani@example.com',
    age: 28,
    country: 'Kenya',
    gender: 'Male',
    phone: '0611223344',
    jobTitle: 'Waiter',
    registrationDate: 'March 14, 2023',
    languages: ['English'],
    skills: ['F&B Services', 'Table Setup', 'Order taking'],
    cvAvailable: true,
    experience: '2 years hospitality industry worker.'
  },
  {
    id: 'seed-3',
    firstName: 'Sherzod',
    lastName: 'Turgunov',
    email: 'sherzod.t@example.com',
    age: 35,
    country: 'Uzbekistan',
    gender: 'Male',
    phone: '0611998877',
    jobTitle: 'Construction Worker',
    registrationDate: 'January 25, 2024',
    languages: ['Russian', 'Uzbek'],
    skills: ['Masonry', 'Plastering', 'Concrete Works'],
    cvAvailable: true,
    experience: '5 years on high-rise residential construction projects.'
  },
  {
    id: 'seed-4',
    firstName: 'Anita',
    lastName: 'Shrestha',
    email: 'anita.s@example.com',
    age: 24,
    country: 'Nepal',
    gender: 'Female',
    phone: '0611554433',
    jobTitle: 'Housekeeper',
    registrationDate: 'May 10, 2024',
    languages: ['English', 'Nepali'],
    skills: ['Cleaning', 'Laundry Services', 'Room Setup'],
    cvAvailable: false,
    experience: '1 year housekeeping in premium boutique hotel.'
  }
];

export const AppProvider = ({ children }) => {
  const [workers, setWorkers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // stores logged in worker object
  const [inquiries, setInquiries] = useState([]);
  const [adminPassword, setAdminPassword] = useState('adminpassword');
  const [skillCategories, setSkillCategories] = useState({});

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const storedWorkers = await AsyncStorage.getItem('@workers_data');
      if (storedWorkers) {
        setWorkers(JSON.parse(storedWorkers));
      } else {
        await AsyncStorage.setItem('@workers_data', JSON.stringify(SEED_WORKERS));
        setWorkers(SEED_WORKERS);
      }

      const storedUser = await AsyncStorage.getItem('@current_user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }

      const storedInquiries = await AsyncStorage.getItem('@contact_inquiries');
      if (storedInquiries) {
        setInquiries(JSON.parse(storedInquiries));
      } else {
        await AsyncStorage.setItem('@contact_inquiries', JSON.stringify([]));
        setInquiries([]);
      }

      const storedAdminPassword = await AsyncStorage.getItem('@admin_password');
      if (storedAdminPassword) {
        setAdminPassword(storedAdminPassword);
      } else {
        await AsyncStorage.setItem('@admin_password', 'adminpassword');
        setAdminPassword('adminpassword');
      }

      const storedSkillCategories = await AsyncStorage.getItem('@skill_categories');
      if (storedSkillCategories) {
        setSkillCategories(JSON.parse(storedSkillCategories));
      } else {
        await AsyncStorage.setItem('@skill_categories', JSON.stringify(SKILL_CATEGORIES));
        setSkillCategories(SKILL_CATEGORIES);
      }
    } catch (e) {
      console.log('Error loading data:', e);
      // Fallback
      setWorkers(SEED_WORKERS);
      setSkillCategories(SKILL_CATEGORIES);
    }
  };

  const registerWorker = async (workerData) => {
    try {
      const newWorker = {
        id: 'worker-' + Date.now(),
        registrationDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        cvAvailable: true,
        ...workerData
      };

      const updatedList = [newWorker, ...workers];
      setWorkers(updatedList);
      await AsyncStorage.setItem('@workers_data', JSON.stringify(updatedList));

      // Auto login after successful signup
      setCurrentUser(newWorker);
      await AsyncStorage.setItem('@current_user', JSON.stringify(newWorker));
      return { success: true };
    } catch (e) {
      console.log('Error registering:', e);
      return { success: false, error: e.message };
    }
  };

  const loginWorker = async (email, password) => {
    // Simple authentication logic
    const found = workers.find(w => w.email.toLowerCase() === email.toLowerCase() && w.password === password);
    if (found) {
      setCurrentUser(found);
      await AsyncStorage.setItem('@current_user', JSON.stringify(found));
      return { success: true };
    }
    return { success: false, error: 'Account not found or password incorrect.' };
  };

  const logoutWorker = async () => {
    setCurrentUser(null);
    await AsyncStorage.removeItem('@current_user');
  };

  const updateProfile = async (updatedProfile) => {
    try {
      const updatedList = workers.map(w => w.id === updatedProfile.id ? updatedProfile : w);
      setWorkers(updatedList);
      await AsyncStorage.setItem('@workers_data', JSON.stringify(updatedList));

      setCurrentUser(updatedProfile);
      await AsyncStorage.setItem('@current_user', JSON.stringify(updatedProfile));
      return { success: true };
    } catch (e) {
      console.log('Error updating profile:', e);
      return { success: false, error: e.message };
    }
  };

  const loginWithGoogle = async (googleUser) => {
    try {
      const email = googleUser.email.toLowerCase();
      const found = workers.find(w => w.email.toLowerCase() === email);
      if (found) {
        setCurrentUser(found);
        await AsyncStorage.setItem('@current_user', JSON.stringify(found));
        return { success: true, isNew: false };
      } else {
        const newWorker = {
          id: 'worker-' + Date.now(),
          registrationDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          cvAvailable: true,
          firstName: googleUser.givenName || 'Google',
          lastName: googleUser.familyName || 'User',
          email: email,
          password: 'google-sso-bypass-password',
          age: 28,
          country: 'Nepal',
          gender: 'Male',
          phone: '+381 61 0000000',
          jobTitle: 'Hospitality Staff',
          experience: 'Experienced professional signed up via Google SSO.',
          skills: ['Customer Service', 'Teamwork'],
          languages: ['English']
        };

        const updatedList = [newWorker, ...workers];
        setWorkers(updatedList);
        await AsyncStorage.setItem('@workers_data', JSON.stringify(updatedList));

        setCurrentUser(newWorker);
        await AsyncStorage.setItem('@current_user', JSON.stringify(newWorker));
        return { success: true, isNew: true };
      }
    } catch (e) {
      console.log('Error Google Login:', e);
      return { success: false, error: e.message };
    }
  };

  const submitInquiry = async (name, email, message) => {
    try {
      const newInquiry = {
        id: 'inq-' + Date.now(),
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
      };
      const updatedList = [newInquiry, ...inquiries];
      setInquiries(updatedList);
      await AsyncStorage.setItem('@contact_inquiries', JSON.stringify(updatedList));
      return { success: true };
    } catch (e) {
      console.log('Error submitting inquiry:', e);
      return { success: false, error: e.message };
    }
  };

  const changeUserPassword = async (userId, currentPassword, newPassword) => {
    try {
      const worker = workers.find(w => w.id === userId);
      if (!worker) {
        return { success: false, error: 'User not found' };
      }
      
      const isGoogleBypass = worker.password === 'google-sso-bypass-password';
      
      if (!isGoogleBypass && worker.password !== currentPassword) {
        return { success: false, error: 'Incorrect current password' };
      }

      const updatedWorker = { ...worker, password: newPassword };
      const updatedList = workers.map(w => w.id === userId ? updatedWorker : w);
      
      setWorkers(updatedList);
      await AsyncStorage.setItem('@workers_data', JSON.stringify(updatedList));

      setCurrentUser(updatedWorker);
      await AsyncStorage.setItem('@current_user', JSON.stringify(updatedWorker));
      
      return { success: true };
    } catch (e) {
      console.log('Error changing password:', e);
      return { success: false, error: e.message };
    }
  };

  const changeAdminPassword = async (currentPassword, newPassword) => {
    try {
      if (adminPassword !== currentPassword) {
        return { success: false, error: 'Incorrect current admin password' };
      }

      setAdminPassword(newPassword);
      await AsyncStorage.setItem('@admin_password', newPassword);
      return { success: true };
    } catch (e) {
      console.log('Error changing admin password:', e);
      return { success: false, error: e.message };
    }
  };

  const addAdminSkill = async (category, skillName) => {
    try {
      if (!category || !skillName) {
        return { success: false, error: 'Category and Skill Name are required.' };
      }

      const trimmedCategory = category.trim();
      const trimmedSkill = skillName.trim();

      if (!trimmedCategory || !trimmedSkill) {
        return { success: false, error: 'Category and Skill Name cannot be empty.' };
      }

      const updatedCategories = { ...skillCategories };
      if (!updatedCategories[trimmedCategory]) {
        updatedCategories[trimmedCategory] = [];
      }

      // Check if skill already exists in this category
      const skillExists = updatedCategories[trimmedCategory].some(
        s => s.toLowerCase() === trimmedSkill.toLowerCase()
      );
      if (skillExists) {
        return { success: false, error: 'Skill already exists in this category.' };
      }

      updatedCategories[trimmedCategory] = [...updatedCategories[trimmedCategory], trimmedSkill];

      setSkillCategories(updatedCategories);
      await AsyncStorage.setItem('@skill_categories', JSON.stringify(updatedCategories));

      return { success: true };
    } catch (e) {
      console.log('Error adding skill:', e);
      return { success: false, error: e.message };
    }
  };

  return (
    <AppContext.Provider value={{
      workers,
      currentUser,
      inquiries,
      adminPassword,
      skillCategories,
      registerWorker,
      loginWorker,
      logoutWorker,
      updateProfile,
      loginWithGoogle,
      submitInquiry,
      changeUserPassword,
      changeAdminPassword,
      addAdminSkill
    }}>
      {children}
    </AppContext.Provider>
  );
};
