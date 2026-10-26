import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter, Alert } from 'react-native';
import { useState, useEffect } from 'react';

export const LANGUAGES = {
  EN: 'en',
  FR: 'fr',
};

export const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English (Anglais)', flag: '🇬🇧', sub: 'English' },
  { code: 'fr', label: 'Français (French)', flag: '🇬🇳', sub: 'Français' },
];

export const translations = {
  en: {
    // Language prompt
    'lang.prompt_title': 'Select Language / Choisir la langue',
    'lang.prompt_msg': 'Which language would you like the app to display in?\nDans quelle langue souhaitez-vous afficher l\'application ?',
    'lang.en': 'English (Anglais)',
    'lang.fr': 'Français (French)',
    'lang.select_preferred': 'Select your preferred language',
    'lang.continue': 'Continue',

    // Common
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.back': 'Back',
    'common.done': 'Done',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.loading': 'Loading...',
    'common.later': 'Later',
    'common.now': 'Now',
    'common.close': 'Close',

    // Auth (Driver)
    'auth.welcome': 'Volta Driver Partner',
    'auth.tagline': 'Earn on your terms in Conakry',
    'auth.driver_login': 'Driver Login',
    'auth.apply_to_drive': 'Apply to Drive',
    'auth.become_or_login': 'Become a driver or login',
    'auth.vehicle_setup': 'Vehicle Setup',
    'auth.how_drive': 'How will you drive with us?',
    'auth.final_details': 'Final Details',
    'auth.upload_docs': 'Upload required documents',
    'auth.enter_phone_sub': 'Enter your phone number to go online.',
    'auth.join_network_sub': 'Join the Volta network.',
    'auth.login_btn': 'Login',
    'auth.phone_placeholder': 'Phone number (+224...)',
    'auth.send_code': 'Continue',
    'auth.enter_code_title': 'Enter Code',
    'auth.enter_code_sub': 'We sent a 4-digit verification code to',
    'auth.verify_btn': 'Verify & Continue',
    'auth.invalid_code': 'Invalid verification code',
    'auth.invalid_phone': 'Enter a valid phone number',
    'auth.profile_title': 'Driver Registration',
    'auth.first_name': 'First Name',
    'auth.last_name': 'Last Name',
    'auth.email': 'Email',
    'auth.save_profile': 'Submit Profile',

    // Driver Dashboard
    'driver.offline': 'OFFLINE',
    'driver.online': 'ONLINE',
    'driver.go_online': 'GO ONLINE',
    'driver.go_offline': 'GO OFFLINE',
    'driver.todays_earnings': "Today's Earnings",
    'driver.online_finding': 'Online · Finding Trips...',
    'driver.you_are_offline': 'You are currently offline',
    'driver.trips_today': 'Trips Today',
    'driver.acceptance_rate': 'Acceptance',
    'driver.rating': 'Rating',

    // Trip Request Modal
    'driver.new_request': 'New Trip Request!',
    'driver.pickup': 'Pick up at',
    'driver.destination': 'Destination',
    'driver.estimated_fare': 'Estimated Fare',
    'driver.accept': 'Accept',
    'driver.decline': 'Decline',

    // Active Trip (Driver)
    'driver.en_route_pickup': 'En route to pickup',
    'driver.arrived_pickup': 'I Have Arrived',
    'driver.start_trip': 'Start Trip',
    'driver.trip_in_progress': 'Trip In Progress',
    'driver.navigate': 'Navigate',
    'driver.complete_trip': 'Complete Trip',
    'driver.call': 'Call Passenger',
    'driver.chat': 'Chat',
    'driver.ride_ended': 'Ride Ended',
    'driver.passenger_paying_cash': 'Passenger Paying Cash',
    'driver.card_payment': 'Card Payment (Stripe)',
    'driver.mobile_payment': 'Mobile Payment (Flutterwave)',
    'driver.confirm_collected': 'Confirm Payment Collected',
    'driver.phone_unavailable': 'Phone Unavailable',
    'driver.customer_no_phone': 'The customer has not provided a phone number.',

    // Menu / Account / Preferences
    'driver.menu_account': 'Account & Profile',
    'driver.menu_earnings': 'Earnings & Wallet',
    'driver.menu_vehicle': 'Vehicle Details',
    'driver.menu_safety': 'Driver Safety',
    'driver.menu_preferences': 'Preferences',
    'driver.menu_language': 'Language / Langue',
    'driver.menu_support': 'Support',
    'driver.menu_logout': 'Log Out',
    'driver.logout_confirm': 'Are you sure you want to log out?',
  },

  fr: {
    // Language prompt
    'lang.prompt_title': 'Choisir la langue / Select Language',
    'lang.prompt_msg': 'Dans quelle langue souhaitez-vous afficher l\'application ?\nWhich language would you like the app to display in?',
    'lang.en': 'English (Anglais)',
    'lang.fr': 'Français (French)',
    'lang.select_preferred': 'Sélectionnez votre langue préférée',
    'lang.continue': 'Continuer',

    // Common
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.back': 'Retour',
    'common.done': 'Terminé',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.loading': 'Chargement...',
    'common.later': 'Plus tard',
    'common.now': 'Maintenant',
    'common.close': 'Fermer',

    // Auth (Driver)
    'auth.welcome': 'Chauffeur Partenaire Volta',
    'auth.tagline': 'Générez des revenus à votre rythme à Conakry',
    'auth.driver_login': 'Connexion Chauffeur',
    'auth.apply_to_drive': 'Candidature Chauffeur',
    'auth.become_or_login': 'Devenez chauffeur ou connectez-vous',
    'auth.vehicle_setup': 'Configuration du véhicule',
    'auth.how_drive': 'Comment allez-vous conduire avec nous ?',
    'auth.final_details': 'Dernières formalités',
    'auth.upload_docs': 'Téléchargez les documents requis',
    'auth.enter_phone_sub': 'Entrez votre numéro pour vous connecter.',
    'auth.join_network_sub': 'Rejoignez le réseau Volta.',
    'auth.login_btn': 'Connexion',
    'auth.phone_placeholder': 'Numéro de téléphone (+224...)',
    'auth.send_code': 'Continuer',
    'auth.enter_code_title': 'Entrez le code',
    'auth.enter_code_sub': 'Code de vérification à 4 chiffres envoyé au',
    'auth.verify_btn': 'Vérifier & Continuer',
    'auth.invalid_code': 'Code de vérification invalide',
    'auth.invalid_phone': 'Entrez un numéro de téléphone valide',
    'auth.profile_title': 'Inscription Chauffeur',
    'auth.first_name': 'Prénom',
    'auth.last_name': 'Nom',
    'auth.email': 'E-mail',
    'auth.save_profile': 'Soumettre le profil',

    // Driver Dashboard
    'driver.offline': 'HORS LIGNE',
    'driver.online': 'EN LIGNE',
    'driver.go_online': 'PASSER EN LIGNE',
    'driver.go_offline': 'PASSER HORS LIGNE',
    'driver.todays_earnings': "Gains d'aujourd'hui",
    'driver.online_finding': 'En ligne · Recherche de courses...',
    'driver.you_are_offline': 'Vous êtes actuellement hors ligne',
    'driver.trips_today': 'Courses du jour',
    'driver.acceptance_rate': 'Acceptation',
    'driver.rating': 'Note',

    // Trip Request Modal
    'driver.new_request': 'Nouvelle demande de course !',
    'driver.pickup': 'Prise en charge à',
    'driver.destination': 'Destination',
    'driver.estimated_fare': 'Tarif estimé',
    'driver.accept': 'Accepter',
    'driver.decline': 'Refuser',

    // Active Trip (Driver)
    'driver.en_route_pickup': 'En route vers le client',
    'driver.arrived_pickup': 'Je suis arrivé',
    'driver.start_trip': 'Démarrer la course',
    'driver.trip_in_progress': 'Course en cours',
    'driver.navigate': 'Itinéraire',
    'driver.complete_trip': 'Terminer la course',
    'driver.call': 'Appeler le passager',
    'driver.chat': 'Message',
    'driver.ride_ended': 'Course terminée',
    'driver.passenger_paying_cash': 'Le passager paie en espèces',
    'driver.card_payment': 'Paiement par carte (Stripe)',
    'driver.mobile_payment': 'Paiement mobile (Flutterwave)',
    'driver.confirm_collected': 'Confirmer l\'encaissement',
    'driver.phone_unavailable': 'Numéro indisponible',
    'driver.customer_no_phone': 'Le client n\'a pas renseigné de numéro de téléphone.',

    // Menu / Account / Preferences
    'driver.menu_account': 'Compte & Profil',
    'driver.menu_earnings': 'Gains & Portefeuille',
    'driver.menu_vehicle': 'Détails du véhicule',
    'driver.menu_safety': 'Sécurité chauffeur',
    'driver.menu_preferences': 'Préférences',
    'driver.menu_language': 'Langue / Language',
    'driver.menu_support': 'Assistance',
    'driver.menu_logout': 'Se déconnecter',
    'driver.logout_confirm': 'Êtes-vous sûr de vouloir vous déconnecter ?',
  }
};

let currentLanguage = 'en';

(async () => {
  try {
    const saved = await AsyncStorage.getItem('@volta_language');
    if (saved === 'fr' || saved === 'en') {
      currentLanguage = saved;
    }
  } catch (e) {}
})();

export const getLanguage = () => currentLanguage;

export const setLanguage = async (lang) => {
  if (lang !== 'fr' && lang !== 'en') return;
  currentLanguage = lang;
  try {
    await AsyncStorage.setItem('@volta_language', lang);
  } catch (e) {}
  DeviceEventEmitter.emit('LANGUAGE_CHANGED', lang);
};

export const t = (key, paramsOrFallback = {}) => {
  const langDict = translations[currentLanguage] || translations.en;
  let text = langDict[key] || translations.en[key];

  if (!text) {
    if (typeof paramsOrFallback === 'string') return paramsOrFallback;
    return key;
  }

  if (typeof paramsOrFallback === 'object') {
    Object.keys(paramsOrFallback).forEach((k) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(paramsOrFallback[k]));
    });
  }

  return text;
};

export const promptLanguageSelection = (onSelect) => {
  Alert.alert(
    'Language / Langue',
    'Which language would you like the app to display in?\n\nDans quelle langue souhaitez-vous afficher l\'application ?',
    [
      {
        text: 'English (Anglais)',
        onPress: async () => {
          await setLanguage('en');
          if (onSelect) onSelect('en');
        },
      },
      {
        text: 'Français (French)',
        onPress: async () => {
          await setLanguage('fr');
          if (onSelect) onSelect('fr');
        },
      },
    ],
    { cancelable: false }
  );
};

export const useTranslation = () => {
  const [lang, setLangState] = useState(currentLanguage);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('LANGUAGE_CHANGED', (newLang) => {
      setLangState(newLang);
    });
    return () => {
      if (sub && sub.remove) sub.remove();
    };
  }, []);

  return {
    t: (key, params) => t(key, params),
    language: lang,
    isFrench: lang === 'fr',
    setLanguage: (l) => setLanguage(l),
    promptLanguage: (cb) => promptLanguageSelection(cb),
  };
};

export default {
  t,
  getLanguage,
  setLanguage,
  useTranslation,
  promptLanguageSelection,
  LANGUAGES,
  LANGUAGE_OPTIONS,
};
