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
    'common.manage': 'Manage',
    'common.or': 'or',
    'common.cash': 'Cash',
    'common.card': 'Credit Card',
    'common.mobile_money': 'Mobile Money',

    // Navigation
    'nav.home': 'Home',
    'nav.rides': 'Rides',
    'nav.wallet': 'Wallet',
    'nav.account': 'Account',

    // Auth
    'auth.welcome': 'Welcome to Volta',
    'auth.tagline': 'Luxury African Ride-Hailing',
    'auth.phone_placeholder': 'Phone number (+224...)',
    'auth.send_code': 'Continue',
    'auth.enter_code_title': 'Enter Code',
    'auth.enter_code_sub': 'We sent a 4-digit verification code to',
    'auth.verify_btn': 'Verify & Continue',
    'auth.invalid_code': 'Invalid verification code',
    'auth.invalid_phone': 'Enter a valid phone number',
    'auth.profile_title': 'Complete Profile',
    'auth.profile_sub': 'Please add your name so drivers can recognize you.',
    'auth.first_name': 'First Name',
    'auth.last_name': 'Last Name',
    'auth.email': 'Email (Optional)',
    'auth.save_profile': 'Save & Continue',
    'auth.network_error': 'Network error. Please check your connection.',

    // Home Screen
    'home.where_to': 'Where to, {name}?',
    'home.where_to_default': 'Where to?',
    'home.airport': 'Airport',
    'home.office': 'Office',
    'home.add_office_title': 'Add Office Address',
    'home.add_office_msg': "You haven't saved your office address yet. Would you like to add it to your saved places now?",
    'home.add_office_btn': 'Add Office',

    // Search Screen
    'search.plan_route': 'Plan Route',
    'search.select_airport': 'Select Airport',
    'search.pickup_placeholder': 'Current Location',
    'search.dropoff_placeholder': 'Enter destination',
    'search.search_airport_placeholder': 'Search airport name...',
    'search.finding_airports': 'Finding nearby airports...',
    'search.searching_terminals': 'Searching international & local terminals',
    'search.no_airports': 'No nearby airports detected',
    'search.type_airport_hint': 'Type your airport destination in the search box above.',
    'search.nearby_airports': 'Nearby Airports',
    'search.saved_places': 'Saved Places',
    'search.recent_places': 'Recent Searches',
    'search.home': 'Home',
    'search.work': 'Work',
    'search.mom': 'Mom',
    'search.set_address_title': 'Set {name} Address',
    'search.set_address_msg': "You haven't set an address for {name} yet. Would you like to add an actual address now?",
    'search.add_address_btn': 'Add Address',

    // Booking Screen
    'booking.route_from': 'Current Location →',
    'booking.calculating': 'Calculating your route',
    'booking.fetching_pricing': 'Fetching live dynamic pricing...',
    'booking.swipe_more': 'Swipe for more',
    'booking.slide_to_book': 'Slide to Book · {name}',
    'booking.payment': 'Payment',
    'booking.payment_method_title': 'Payment Method',
    'booking.payment_method_msg': 'Choose how you want to settle this trip at completion:',
    'booking.pay_flutterwave': 'Flutterwave (GNF Local)',
    'booking.pay_stripe': 'Stripe Card (USD)',
    'booking.pay_cash': 'Cash to Driver (GNF)',
    'booking.bike': 'Bike',
    'booking.bike_desc': 'Fast and cheap way through traffic.',
    'booking.regular': 'Regular',
    'booking.regular_desc': 'Everyday rides for up to 4 people.',
    'booking.suv': 'SUV',
    'booking.suv_desc': 'Extra space for luggage and groups.',
    'booking.delivery': 'Delivery Bike',
    'booking.delivery_desc': 'Quick package delivery across town.',
    'booking.min': 'min',
    'booking.km': 'km',

    // Matching
    'matching.finding_driver': 'Finding your driver...',
    'matching.contacting_fleet': 'Contacting nearby Volta drivers...',
    'matching.cancel': 'Cancel Request',

    // Active Trip
    'active.driver_on_way': 'Driver on the way',
    'active.driver_arrived': 'Driver has arrived',
    'active.trip_in_progress': 'Trip in progress',
    'active.heading_to': 'Heading to',
    'active.call': 'Call',
    'active.chat': 'Chat',
    'active.cancel_ride': 'Cancel Ride',
    'active.phone_unavailable': 'Phone Unavailable',
    'active.driver_no_phone': 'The driver has not provided a phone number.',

    // Chat
    'chat.driver_title': 'Driver',
    'chat.placeholder': 'Type a message to driver...',
    'chat.send': 'Send',

    // Receipt
    'receipt.title': 'Trip Receipt',
    'receipt.completed': 'Trip Completed!',
    'receipt.fare': 'Total Paid',
    'receipt.done': 'Back to Home',

    // Saved Places Screen
    'places.title': 'Saved Places',
    'places.add_new': 'Add New Place',
    'places.place_name': 'Place Name (e.g. Gym, Client)',
    'places.address': 'Street Address',
    'places.save': 'Save Location',
    'places.no_places': 'No saved places yet',

    // History
    'history.title': 'Ride History',
    'history.no_rides': 'No rides yet',
    'history.no_rides_sub': 'Your completed and cancelled rides will show here.',

    // Wallet
    'wallet.title': 'Volta Wallet',
    'wallet.balance': 'Current Balance',
    'wallet.add_funds': 'Add Funds',
    'wallet.transactions': 'Recent Transactions',
    'wallet.no_transactions': 'No recent transactions',

    // Account Screen
    'account.title': 'Account',
    'account.tier': 'Volta Black Member',
    'account.profile_details': 'Profile Details',
    'account.ride_history': 'Ride History',
    'account.wallet_payments': 'Wallet & Payments',
    'account.promotions': 'Promotions',
    'account.settings': 'Settings',
    'account.support': 'Support',
    'account.language': 'Language / Langue',
    'account.logout': 'Log Out',
    'account.logout_confirm': 'Are you sure you want to log out?',
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
    'common.manage': 'Gérer',
    'common.or': 'ou',
    'common.cash': 'Espèces',
    'common.card': 'Carte Bancaire',
    'common.mobile_money': 'Mobile Money',

    // Navigation
    'nav.home': 'Accueil',
    'nav.rides': 'Trajets',
    'nav.wallet': 'Portefeuille',
    'nav.account': 'Compte',

    // Auth
    'auth.welcome': 'Bienvenue sur Volta',
    'auth.tagline': 'Transport VTC & Mobilité de Luxe',
    'auth.phone_placeholder': 'Numéro de téléphone (+224...)',
    'auth.send_code': 'Continuer',
    'auth.enter_code_title': 'Entrez le code',
    'auth.enter_code_sub': 'Code de vérification à 4 chiffres envoyé au',
    'auth.verify_btn': 'Vérifier & Continuer',
    'auth.invalid_code': 'Code de vérification invalide',
    'auth.invalid_phone': 'Entrez un numéro de téléphone valide',
    'auth.profile_title': 'Complétez votre profil',
    'auth.profile_sub': 'Ajoutez votre nom pour que les chauffeurs puissent vous identifier.',
    'auth.first_name': 'Prénom',
    'auth.last_name': 'Nom de famille',
    'auth.email': 'Adresse e-mail (Optionnel)',
    'auth.save_profile': 'Enregistrer & Continuer',
    'auth.network_error': 'Erreur réseau. Vérifiez votre connexion internet.',

    // Home Screen
    'home.where_to': 'Où allez-vous, {name} ?',
    'home.where_to_default': 'Où allez-vous ?',
    'home.airport': 'Aéroport',
    'home.office': 'Bureau',
    'home.add_office_title': 'Ajouter l\'adresse du bureau',
    'home.add_office_msg': "Vous n'avez pas encore enregistré l'adresse de votre bureau. Souhaitez-vous l'ajouter maintenant ?",
    'home.add_office_btn': 'Ajouter le bureau',

    // Search Screen
    'search.plan_route': 'Planifier l\'itinéraire',
    'search.select_airport': 'Sélectionner l\'aéroport',
    'search.pickup_placeholder': 'Position actuelle',
    'search.dropoff_placeholder': 'Entrez votre destination',
    'search.search_airport_placeholder': 'Rechercher un aéroport...',
    'search.finding_airports': 'Recherche des aéroports à proximité...',
    'search.searching_terminals': 'Recherche des terminaux nationaux et internationaux',
    'search.no_airports': 'Aucun aéroport détecté à proximité',
    'search.type_airport_hint': 'Saisissez le nom de votre aéroport dans la barre de recherche ci-dessus.',
    'search.nearby_airports': 'Aéroports à proximité',
    'search.saved_places': 'Lieux enregistrés',
    'search.recent_places': 'Recherches récentes',
    'search.home': 'Domicile',
    'search.work': 'Travail / Bureau',
    'search.mom': 'Maman',
    'search.set_address_title': 'Définir l\'adresse de {name}',
    'search.set_address_msg': "Vous n'avez pas encore défini d'adresse pour {name}. Souhaitez-vous l'ajouter maintenant ?",
    'search.add_address_btn': 'Ajouter une adresse',

    // Booking Screen
    'booking.route_from': 'Position actuelle →',
    'booking.calculating': 'Calcul de votre itinéraire',
    'booking.fetching_pricing': 'Tarification dynamique en direct...',
    'booking.swipe_more': 'Glissez pour voir plus',
    'booking.slide_to_book': 'Glisser pour commander · {name}',
    'booking.payment': 'Paiement',
    'booking.payment_method_title': 'Moyen de paiement',
    'booking.payment_method_msg': 'Choisissez le mode de règlement de votre course :',
    'booking.pay_flutterwave': 'Flutterwave (GNF Local)',
    'booking.pay_stripe': 'Carte Bancaire Stripe (USD)',
    'booking.pay_cash': 'Espèces au chauffeur (GNF)',
    'booking.bike': 'Moto',
    'booking.bike_desc': 'Le moyen le plus rapide d\'éviter les embouteillages.',
    'booking.regular': 'Standard',
    'booking.regular_desc': 'Courses confortables au quotidien jusqu\'à 4 passagers.',
    'booking.suv': 'SUV Prestige',
    'booking.suv_desc': 'Espace supplémentaire pour bagages et déplacements en groupe.',
    'booking.delivery': 'Livraison Moto',
    'booking.delivery_desc': 'Livraison express de plis et colis à travers la ville.',
    'booking.min': 'min',
    'booking.km': 'km',

    // Matching
    'matching.finding_driver': 'Recherche d\'un chauffeur...',
    'matching.contacting_fleet': 'Connexion avec les chauffeurs Volta à proximité...',
    'matching.cancel': 'Annuler la demande',

    // Active Trip
    'active.driver_on_way': 'Chauffeur en route',
    'active.driver_arrived': 'Le chauffeur est arrivé',
    'active.trip_in_progress': 'Course en cours',
    'active.heading_to': 'En route vers',
    'active.call': 'Appeler',
    'active.chat': 'Message',
    'active.cancel_ride': 'Annuler la course',
    'active.phone_unavailable': 'Numéro indisponible',
    'active.driver_no_phone': 'Le chauffeur n\'a pas renseigné de numéro de téléphone.',

    // Chat
    'chat.driver_title': 'Chauffeur',
    'chat.placeholder': 'Écrivez un message au chauffeur...',
    'chat.send': 'Envoyer',

    // Receipt
    'receipt.title': 'Reçu de course',
    'receipt.completed': 'Course terminée avec succès !',
    'receipt.fare': 'Montant total payé',
    'receipt.done': 'Retour à l\'accueil',

    // Saved Places Screen
    'places.title': 'Lieux enregistrés',
    'places.add_new': 'Ajouter un nouveau lieu',
    'places.place_name': 'Nom du lieu (ex. Salle de sport, Bureau)',
    'places.address': 'Adresse ou quartier',
    'places.save': 'Enregistrer le lieu',
    'places.no_places': 'Aucun lieu enregistré pour le moment',

    // History
    'history.title': 'Historique des trajets',
    'history.no_rides': 'Aucun trajet effectué',
    'history.no_rides_sub': 'Vos courses terminées et annulées apparaîtront ici.',

    // Wallet
    'wallet.title': 'Portefeuille Volta',
    'wallet.balance': 'Solde disponible',
    'wallet.add_funds': 'Recharger le compte',
    'wallet.transactions': 'Transactions récentes',
    'wallet.no_transactions': 'Aucune transaction récente',

    // Account Screen
    'account.title': 'Compte',
    'account.tier': 'Membre Volta Black',
    'account.profile_details': 'Détails du profil',
    'account.ride_history': 'Historique des courses',
    'account.wallet_payments': 'Portefeuille & Paiements',
    'account.promotions': 'Promotions',
    'account.settings': 'Paramètres',
    'account.support': 'Assistance & Support',
    'account.language': 'Langue / Language',
    'account.logout': 'Se déconnecter',
    'account.logout_confirm': 'Êtes-vous sûr de vouloir vous déconnecter ?',
  }
};

let currentLanguage = 'en';

// Initialize language from storage
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
