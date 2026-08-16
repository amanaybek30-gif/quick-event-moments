import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Lang = "en" | "am" | "fr" | "es";

export const LANGUAGES: { code: Lang; initials: string; label: string }[] = [
  { code: "en", initials: "EN", label: "English" },
  { code: "am", initials: "አማ", label: "አማርኛ" },
  { code: "fr", initials: "FR", label: "Français" },
  { code: "es", initials: "ES", label: "Español" },
];

const en = {
  // generic
  next: "Next",
  back: "Back",
  cancel: "Cancel",
  save: "Save",
  close: "Close",
  loading: "Loading...",
  pleaseWait: "Please wait...",
  poweredBy: "Powered by",
  scanQr: "Scan QR",
  guests: "guests",
  free: "Free",
  custom: "Custom price",
  somethingWrong: "Something went wrong",

  // auth
  welcomeBack: "Welcome back",
  createAccount: "Create your account",
  authSubtitle:
    "Set up your own event and collect every photo and video from your guests.",
  continueGoogle: "Continue with Google",
  or: "or",
  emailAddress: "Email address",
  password: "Password",
  signIn: "Sign In",
  signUp: "Sign Up",
  newHere: "New here? Create an account",
  haveAccount: "Already have an account? Sign in",
  welcomeToApp: "Welcome to Momentique!",

  // home
  selfService: "Self-service",
  homeHeadline: "Capture every moment together",
  createNewEvent: "Create New Event",
  createEvent: "Create Event",
  step1Title: "Set up your event",
  step1Desc: "Name, date, venue, cover photo and a welcome message.",
  step2Title: "Share your QR code",
  step2Desc: "Guests scan and upload photos and videos instantly.",
  step3Title: "Collect & download",
  step3Desc: "Everything lands in one gallery, ready to save.",
  myEvents: "My Events",
  tabCreate: "Create",
  tabSettings: "Settings",
  loadingEvents: "Loading your events...",
  noEventsYet: "You haven't created any events yet.",
  existingEvents: "Existing events",
  existingEventsHint:
    "Enter the event password to add one of these to your events.",
  eventPassword: "Event password",
  passwordProtected:
    "This event is password protected. Enter its password to add it to your events.",
  incorrectPassword: "Incorrect password",
  eventAdded: "Event added to your events",
  addToMyEvents: "Add to My Events",
  uploads: "uploads",
  awaitingPayment: "Awaiting payment confirmation",
  paymentDeclined: "Payment declined — contact us",

  // create wizard
  stepOf: "Step {n} of {total}",
  qName: "What's your event called?",
  qNameHint: "This is the name your guests will see.",
  qDate: "When is it happening?",
  qDateHint: "Pick the date of your event.",
  qVenue: "Where is it taking place?",
  qVenueHint: "Add the venue or location.",
  qCover: "Add a cover photo",
  qCoverHint: "A beautiful image for your event page.",
  qWelcome: "Welcome your guests",
  qWelcomeHint: "Shown full screen when guests arrive.",
  qGuests: "How many guests?",
  qGuestsHint: "Swipe the dial to set your guest capacity.",
  qReview: "Ready to go live?",
  qReviewHint: "Review your event, then create it.",
  namePlaceholder: "e.g. Sara & Daniel's Wedding",
  venuePlaceholder: "e.g. Sheraton Addis, Ballroom",
  choosePhoto: "Choose a photo",
  skipForNow: "Skip for now",
  welcomeTitle: "Welcome title",
  welcomeMessagePlaceholder: "Write a short welcome message\nfor your guests...",
  untitledEvent: "Untitled event",
  creating: "Creating...",
  contactForCustom: "Contact us for a custom price",
  eventLive: "Your event is live!",
  eventPending:
    "Payment submitted — your event goes live once we confirm it.",
  createFailed: "Could not create the event. Please try again.",

  // payment
  pay: "Pay",
  amount: "Amount",
  payInstructions:
    "Transfer the amount, then enter your phone number and the transaction ID/number below. We send confirmation by SMS.",
  phoneNumber: "Phone number",
  phonePlaceholder: "e.g. +2519...",
  transactionId: "Transaction ID / Number",
  transactionPlaceholder: "e.g. BFA12345678",
  iHavePaid: "I've paid",
  paymentFieldsRequired:
    "Enter your phone number and transaction ID to continue.",
  needHelp: "Need help? Call",

  // settings
  settings: "Settings",
  signedInAs: "Signed in as",
  faq: "FAQ",
  contactUs: "Contact us",
  emailUs: "Email us",
  callUs: "Call us",
  language: "Language",
  privacy: "Privacy",
  followUs: "Follow us",
  clearCache: "Clear cache",
  cacheCleared: "Cache cleared",
  cacheClearFailed: "Could not clear the cache",
  signOut: "Sign out",
  languageSet: "Language updated",
  privacy1:
    "Momentique stores only what your event needs: event details and the photos and videos uploaded to it. Media is kept in secure cloud storage tied to your event.",
  privacy2:
    "We never sell your data or share it with third parties. Deleting an event removes its gallery. Guests are not required to create an account.",
  privacy3:
    "Questions about your data? Email eventcoordinator@vionevents.com and we'll respond.",
  faq1q: "How do guests upload photos?",
  faq1a:
    "Share your event QR code or link. Guests scan it, open the event page and upload photos or videos straight from their phone — no app or account needed.",
  faq2q: "Who can see my event gallery?",
  faq2a:
    "Anyone with your event link or QR code can view and add media. Only you, the event owner, can edit the event or delete media.",
  faq3q: "Can I download everything at once?",
  faq3a:
    "Yes. Long-press any photo or video in the gallery to enter selection mode, tap select all, then save or share them together.",
  faq4q: "Is there a limit on uploads?",
  faq4a: "There's no upload count limit. Videos can be recorded up to 30 minutes each.",
  faq5q: "How do I install the app?",
  faq5a:
    "Open Momentique in your phone browser and choose 'Add to Home Screen'. It then runs full screen like a native app.",

  // admin
  adminAccess: "Admin access",
  adminPasswordPrompt: "Enter the admin password to continue.",
  unlock: "Unlock",
  wrongAdminPassword: "Wrong admin password",
  adminDashboard: "Admin Dashboard",
  payments: "Payments",
  allEvents: "All events",
  confirm: "Confirm",
  decline: "Decline",
  pending: "Pending",
  confirmed: "Confirmed",
  declined: "Declined",
  paymentConfirmed: "Payment confirmed",
  paymentDeclinedToast: "Payment declined",
  noPendingPayments: "No payments waiting for review.",
  owner: "Owner",
};

export type TranslationKey = keyof typeof en;
type Dict = Record<TranslationKey, string>;

const am: Dict = {
  next: "ቀጣይ",
  back: "ተመለስ",
  cancel: "ሰርዝ",
  save: "አስቀምጥ",
  close: "ዝጋ",
  loading: "በመጫን ላይ...",
  pleaseWait: "እባክዎ ይጠብቁ...",
  poweredBy: "የቀረበው በ",
  scanQr: "QR ኮድ ቃኝ",
  guests: "እንግዶች",
  free: "ነጻ",
  custom: "ልዩ ዋጋ",
  somethingWrong: "የሆነ ችግር ተከስቷል",

  welcomeBack: "እንኳን በደህና ተመለሱ",
  createAccount: "መለያዎን ይክፈቱ",
  authSubtitle: "የራስዎን ዝግጅት ይፍጠሩ እና ከእንግዶችዎ ሁሉንም ፎቶና ቪዲዮ ይሰብስቡ።",
  continueGoogle: "በGoogle ይቀጥሉ",
  or: "ወይም",
  emailAddress: "ኢሜይል አድራሻ",
  password: "የይለፍ ቃል",
  signIn: "ግባ",
  signUp: "ተመዝገብ",
  newHere: "አዲስ ነዎት? መለያ ይክፈቱ",
  haveAccount: "መለያ አለዎት? ይግቡ",
  welcomeToApp: "እንኳን ወደ Momentique በደህና መጡ!",

  selfService: "የራስ አገልግሎት",
  homeHeadline: "እያንዳንዱን ቅጽበት አብረን እንያዝ",
  createNewEvent: "አዲስ ዝግጅት ፍጠር",
  createEvent: "ዝግጅት ፍጠር",
  step1Title: "ዝግጅትዎን ያዘጋጁ",
  step1Desc: "ስም፣ ቀን፣ ቦታ፣ ሽፋን ፎቶ እና የእንኳን ደህና መጡ መልእክት።",
  step2Title: "QR ኮድዎን ያጋሩ",
  step2Desc: "እንግዶች ቃኝተው ወዲያውኑ ፎቶና ቪዲዮ ይጭናሉ።",
  step3Title: "ሰብስቡ እና አውርዱ",
  step3Desc: "ሁሉም በአንድ ጋለሪ ውስጥ ተሰብስቦ ለማስቀመጥ ዝግጁ ይሆናል።",
  myEvents: "የእኔ ዝግጅቶች",
  tabCreate: "ፍጠር",
  tabSettings: "ቅንብሮች",
  loadingEvents: "ዝግጅቶችዎ በመጫን ላይ...",
  noEventsYet: "እስካሁን ምንም ዝግጅት አልፈጠሩም።",
  existingEvents: "ነባር ዝግጅቶች",
  existingEventsHint: "ወደ ዝግጅቶችዎ ለመጨመር የዝግጅቱን የይለፍ ቃል ያስገቡ።",
  eventPassword: "የዝግጅት የይለፍ ቃል",
  passwordProtected: "ይህ ዝግጅት በይለፍ ቃል የተጠበቀ ነው። ወደ ዝግጅቶችዎ ለመጨመር የይለፍ ቃሉን ያስገቡ።",
  incorrectPassword: "የተሳሳተ የይለፍ ቃል",
  eventAdded: "ዝግጅቱ ወደ ዝግጅቶችዎ ተጨምሯል",
  addToMyEvents: "ወደ ዝግጅቶቼ ጨምር",
  uploads: "የተጫኑ",
  awaitingPayment: "የክፍያ ማረጋገጫ በመጠበቅ ላይ",
  paymentDeclined: "ክፍያው ተቀባይነት አላገኘም — ያግኙን",

  stepOf: "ደረጃ {n} ከ {total}",
  qName: "የዝግጅትዎ ስም ማን ይባላል?",
  qNameHint: "እንግዶችዎ የሚያዩት ስም ይህ ነው።",
  qDate: "መቼ ይካሄዳል?",
  qDateHint: "የዝግጅትዎን ቀን ይምረጡ።",
  qVenue: "የት ይካሄዳል?",
  qVenueHint: "ቦታውን ያስገቡ።",
  qCover: "ሽፋን ፎቶ ያክሉ",
  qCoverHint: "ለዝግጅት ገጽዎ የሚያምር ምስል።",
  qWelcome: "እንግዶችዎን ይቀበሉ",
  qWelcomeHint: "እንግዶች ሲገቡ በሙሉ ስክሪን ይታያል።",
  qGuests: "ስንት እንግዶች?",
  qGuestsHint: "የእንግዶች መጠን ለመምረጥ ያንሸራትቱ።",
  qReview: "ለመጀመር ዝግጁ ነዎት?",
  qReviewHint: "ዝግጅትዎን ይመልከቱ፣ ከዚያ ይፍጠሩ።",
  namePlaceholder: "ለምሳሌ የሳራ እና ዳንኤል ሰርግ",
  venuePlaceholder: "ለምሳሌ ሸራተን አዲስ፣ አዳራሽ",
  choosePhoto: "ፎቶ ይምረጡ",
  skipForNow: "ለአሁን ዝለል",
  welcomeTitle: "የእንኳን ደህና መጡ ርዕስ",
  welcomeMessagePlaceholder: "ለእንግዶችዎ አጭር\nየእንኳን ደህና መጡ መልእክት ይጻፉ...",
  untitledEvent: "ስም የሌለው ዝግጅት",
  creating: "በመፍጠር ላይ...",
  contactForCustom: "ለልዩ ዋጋ ያግኙን",
  eventLive: "ዝግጅትዎ ተጀምሯል!",
  eventPending: "ክፍያው ገብቷል — ካረጋገጥን በኋላ ዝግጅትዎ ይጀምራል።",
  createFailed: "ዝግጅቱን መፍጠር አልተቻለም። እባክዎ እንደገና ይሞክሩ።",

  pay: "ክፈል",
  amount: "መጠን",
  payInstructions:
    "መጠኑን ያስተላልፉ፣ ከዚያ ስልክ ቁጥርዎን እና የግብይት መለያ ቁጥሩን ከታች ያስገቡ። ማረጋገጫ በSMS እንልካለን።",
  phoneNumber: "ስልክ ቁጥር",
  phonePlaceholder: "ለምሳሌ +2519...",
  transactionId: "የግብይት መለያ / ቁጥር",
  transactionPlaceholder: "ለምሳሌ BFA12345678",
  iHavePaid: "ከፍያለሁ",
  paymentFieldsRequired: "ለመቀጠል ስልክ ቁጥርዎን እና የግብይት መለያውን ያስገቡ።",
  needHelp: "እርዳታ ይፈልጋሉ? ይደውሉ",

  settings: "ቅንብሮች",
  signedInAs: "የገቡት እንደ",
  faq: "ተደጋጋሚ ጥያቄዎች",
  contactUs: "ያግኙን",
  emailUs: "ኢሜይል ይላኩ",
  callUs: "ይደውሉልን",
  language: "ቋንቋ",
  privacy: "ግላዊነት",
  followUs: "ይከተሉን",
  clearCache: "ማህደረ ትውስታ አጽዳ",
  cacheCleared: "ማህደሩ ጸድቷል",
  cacheClearFailed: "ማህደሩን ማጽዳት አልተቻለም",
  signOut: "ውጣ",
  languageSet: "ቋንቋ ተቀይሯል",
  privacy1:
    "Momentique የሚያስቀምጠው ለዝግጅትዎ የሚያስፈልገውን ብቻ ነው፦ የዝግጅት መረጃና የተጫኑ ፎቶዎችና ቪዲዮዎች። ሚዲያው ከዝግጅትዎ ጋር በተያያዘ ደህንነቱ በተጠበቀ ክላውድ ውስጥ ይቀመጣል።",
  privacy2:
    "መረጃዎን ፈጽሞ አንሸጥም ወይም ለሶስተኛ ወገን አናጋራም። ዝግጅት ሲሰረዝ ጋለሪውም ይሰረዛል። እንግዶች መለያ መክፈት አይጠበቅባቸውም።",
  privacy3:
    "ስለ መረጃዎ ጥያቄ አለዎት? eventcoordinator@vionevents.com ላይ ይላኩልን።",
  faq1q: "እንግዶች ፎቶ እንዴት ይጭናሉ?",
  faq1a:
    "የዝግጅትዎን QR ኮድ ወይም ሊንክ ያጋሩ። እንግዶች ቃኝተው የዝግጅቱን ገጽ ከፍተው በቀጥታ ከስልካቸው ፎቶና ቪዲዮ ይጭናሉ — መተግበሪያ ወይም መለያ አያስፈልግም።",
  faq2q: "የዝግጅቴን ጋለሪ ማን ማየት ይችላል?",
  faq2a:
    "ሊንኩ ወይም QR ኮዱ ያለው ማንኛውም ሰው ማየትና መጨመር ይችላል። ዝግጅቱን ማስተካከል ወይም ሚዲያ መሰረዝ የሚችሉት እርስዎ ባለቤቱ ብቻ ነዎት።",
  faq3q: "ሁሉንም በአንድ ጊዜ ማውረድ እችላለሁ?",
  faq3a:
    "አዎ። በጋለሪው ውስጥ ማንኛውንም ፎቶ ወይም ቪዲዮ ተጭነው ይያዙ፣ ሁሉንም ይምረጡ፣ ከዚያ አንድ ላይ ያስቀምጡ ወይም ያጋሩ።",
  faq4q: "የመጫን ገደብ አለ?",
  faq4a: "የብዛት ገደብ የለም። ቪዲዮዎች እያንዳንዳቸው እስከ 30 ደቂቃ መቀረጽ ይችላሉ።",
  faq5q: "መተግበሪያውን እንዴት እጭናለሁ?",
  faq5a:
    "Momentique በስልክዎ አሳሽ ይክፈቱና 'Add to Home Screen' ይምረጡ። ከዚያ እንደ ተፈጥሯዊ መተግበሪያ በሙሉ ስክሪን ይሰራል።",

  adminAccess: "የአስተዳዳሪ መዳረሻ",
  adminPasswordPrompt: "ለመቀጠል የአስተዳዳሪ የይለፍ ቃል ያስገቡ።",
  unlock: "ክፈት",
  wrongAdminPassword: "የተሳሳተ የአስተዳዳሪ የይለፍ ቃል",
  adminDashboard: "የአስተዳዳሪ ዳሽቦርድ",
  payments: "ክፍያዎች",
  allEvents: "ሁሉም ዝግጅቶች",
  confirm: "አረጋግጥ",
  decline: "አትቀበል",
  pending: "በመጠባበቅ ላይ",
  confirmed: "ተረጋግጧል",
  declined: "ተቀባይነት አላገኘም",
  paymentConfirmed: "ክፍያው ተረጋግጧል",
  paymentDeclinedToast: "ክፍያው አልተቀበለም",
  noPendingPayments: "ግምገማ የሚጠብቅ ክፍያ የለም።",
  owner: "ባለቤት",
};

const fr: Dict = {
  next: "Suivant",
  back: "Retour",
  cancel: "Annuler",
  save: "Enregistrer",
  close: "Fermer",
  loading: "Chargement...",
  pleaseWait: "Veuillez patienter...",
  poweredBy: "Propulsé par",
  scanQr: "Scanner le QR",
  guests: "invités",
  free: "Gratuit",
  custom: "Prix personnalisé",
  somethingWrong: "Une erreur s'est produite",

  welcomeBack: "Bon retour",
  createAccount: "Créez votre compte",
  authSubtitle:
    "Créez votre événement et rassemblez toutes les photos et vidéos de vos invités.",
  continueGoogle: "Continuer avec Google",
  or: "ou",
  emailAddress: "Adresse e-mail",
  password: "Mot de passe",
  signIn: "Se connecter",
  signUp: "S'inscrire",
  newHere: "Nouveau ici ? Créez un compte",
  haveAccount: "Vous avez déjà un compte ? Connectez-vous",
  welcomeToApp: "Bienvenue sur Momentique !",

  selfService: "Libre-service",
  homeHeadline: "Capturez chaque moment ensemble",
  createNewEvent: "Créer un événement",
  createEvent: "Créer l'événement",
  step1Title: "Configurez votre événement",
  step1Desc: "Nom, date, lieu, photo de couverture et message de bienvenue.",
  step2Title: "Partagez votre QR code",
  step2Desc: "Les invités scannent et envoient photos et vidéos instantanément.",
  step3Title: "Collectez et téléchargez",
  step3Desc: "Tout arrive dans une seule galerie, prêt à enregistrer.",
  myEvents: "Mes événements",
  tabCreate: "Créer",
  tabSettings: "Réglages",
  loadingEvents: "Chargement de vos événements...",
  noEventsYet: "Vous n'avez encore créé aucun événement.",
  existingEvents: "Événements existants",
  existingEventsHint:
    "Saisissez le mot de passe de l'événement pour l'ajouter à vos événements.",
  eventPassword: "Mot de passe de l'événement",
  passwordProtected:
    "Cet événement est protégé par mot de passe. Saisissez-le pour l'ajouter à vos événements.",
  incorrectPassword: "Mot de passe incorrect",
  eventAdded: "Événement ajouté à vos événements",
  addToMyEvents: "Ajouter à mes événements",
  uploads: "fichiers",
  awaitingPayment: "En attente de confirmation du paiement",
  paymentDeclined: "Paiement refusé — contactez-nous",

  stepOf: "Étape {n} sur {total}",
  qName: "Comment s'appelle votre événement ?",
  qNameHint: "C'est le nom que verront vos invités.",
  qDate: "Quand a-t-il lieu ?",
  qDateHint: "Choisissez la date de votre événement.",
  qVenue: "Où se déroule-t-il ?",
  qVenueHint: "Ajoutez le lieu.",
  qCover: "Ajoutez une photo de couverture",
  qCoverHint: "Une belle image pour la page de votre événement.",
  qWelcome: "Accueillez vos invités",
  qWelcomeHint: "Affiché en plein écran à l'arrivée des invités.",
  qGuests: "Combien d'invités ?",
  qGuestsHint: "Faites glisser pour définir votre capacité d'invités.",
  qReview: "Prêt à lancer ?",
  qReviewHint: "Vérifiez votre événement, puis créez-le.",
  namePlaceholder: "ex. Mariage de Sara & Daniel",
  venuePlaceholder: "ex. Sheraton Addis, Salle de bal",
  choosePhoto: "Choisir une photo",
  skipForNow: "Passer pour l'instant",
  welcomeTitle: "Titre de bienvenue",
  welcomeMessagePlaceholder: "Écrivez un court message\nde bienvenue pour vos invités...",
  untitledEvent: "Événement sans titre",
  creating: "Création...",
  contactForCustom: "Contactez-nous pour un prix personnalisé",
  eventLive: "Votre événement est en ligne !",
  eventPending:
    "Paiement envoyé — votre événement sera en ligne dès confirmation.",
  createFailed: "Impossible de créer l'événement. Réessayez.",

  pay: "Payer",
  amount: "Montant",
  payInstructions:
    "Effectuez le transfert, puis saisissez votre numéro de téléphone et l'identifiant de transaction ci-dessous. La confirmation arrive par SMS.",
  phoneNumber: "Numéro de téléphone",
  phonePlaceholder: "ex. +2519...",
  transactionId: "ID / numéro de transaction",
  transactionPlaceholder: "ex. BFA12345678",
  iHavePaid: "J'ai payé",
  paymentFieldsRequired:
    "Saisissez votre numéro de téléphone et l'ID de transaction pour continuer.",
  needHelp: "Besoin d'aide ? Appelez",

  settings: "Réglages",
  signedInAs: "Connecté en tant que",
  faq: "FAQ",
  contactUs: "Contactez-nous",
  emailUs: "Envoyer un e-mail",
  callUs: "Appelez-nous",
  language: "Langue",
  privacy: "Confidentialité",
  followUs: "Suivez-nous",
  clearCache: "Vider le cache",
  cacheCleared: "Cache vidé",
  cacheClearFailed: "Impossible de vider le cache",
  signOut: "Se déconnecter",
  languageSet: "Langue mise à jour",
  privacy1:
    "Momentique ne conserve que le nécessaire : les détails de l'événement et les photos et vidéos envoyées. Les médias sont stockés en toute sécurité dans le cloud, liés à votre événement.",
  privacy2:
    "Nous ne vendons jamais vos données et ne les partageons pas. Supprimer un événement supprime sa galerie. Les invités n'ont pas besoin de compte.",
  privacy3:
    "Des questions sur vos données ? Écrivez à eventcoordinator@vionevents.com.",
  faq1q: "Comment les invités envoient-ils des photos ?",
  faq1a:
    "Partagez le QR code ou le lien de l'événement. Les invités le scannent, ouvrent la page et envoient photos ou vidéos depuis leur téléphone — sans application ni compte.",
  faq2q: "Qui peut voir la galerie de mon événement ?",
  faq2a:
    "Toute personne disposant du lien ou du QR code peut voir et ajouter des médias. Seul vous, le propriétaire, pouvez modifier l'événement ou supprimer des médias.",
  faq3q: "Puis-je tout télécharger d'un coup ?",
  faq3a:
    "Oui. Appuyez longuement sur une photo ou vidéo pour activer la sélection, touchez tout sélectionner, puis enregistrez ou partagez.",
  faq4q: "Y a-t-il une limite d'envois ?",
  faq4a: "Aucune limite de nombre. Les vidéos peuvent durer jusqu'à 30 minutes chacune.",
  faq5q: "Comment installer l'application ?",
  faq5a:
    "Ouvrez Momentique dans le navigateur de votre téléphone et choisissez « Ajouter à l'écran d'accueil ». Elle s'exécute alors en plein écran.",

  adminAccess: "Accès administrateur",
  adminPasswordPrompt: "Saisissez le mot de passe administrateur pour continuer.",
  unlock: "Déverrouiller",
  wrongAdminPassword: "Mot de passe administrateur incorrect",
  adminDashboard: "Tableau de bord admin",
  payments: "Paiements",
  allEvents: "Tous les événements",
  confirm: "Confirmer",
  decline: "Refuser",
  pending: "En attente",
  confirmed: "Confirmé",
  declined: "Refusé",
  paymentConfirmed: "Paiement confirmé",
  paymentDeclinedToast: "Paiement refusé",
  noPendingPayments: "Aucun paiement en attente de vérification.",
  owner: "Propriétaire",
};

const es: Dict = {
  next: "Siguiente",
  back: "Atrás",
  cancel: "Cancelar",
  save: "Guardar",
  close: "Cerrar",
  loading: "Cargando...",
  pleaseWait: "Por favor espera...",
  poweredBy: "Desarrollado por",
  scanQr: "Escanear QR",
  guests: "invitados",
  free: "Gratis",
  custom: "Precio personalizado",
  somethingWrong: "Algo salió mal",

  welcomeBack: "Bienvenido de nuevo",
  createAccount: "Crea tu cuenta",
  authSubtitle:
    "Crea tu propio evento y reúne todas las fotos y vídeos de tus invitados.",
  continueGoogle: "Continuar con Google",
  or: "o",
  emailAddress: "Correo electrónico",
  password: "Contraseña",
  signIn: "Iniciar sesión",
  signUp: "Registrarse",
  newHere: "¿Nuevo aquí? Crea una cuenta",
  haveAccount: "¿Ya tienes cuenta? Inicia sesión",
  welcomeToApp: "¡Bienvenido a Momentique!",

  selfService: "Autoservicio",
  homeHeadline: "Captura cada momento juntos",
  createNewEvent: "Crear nuevo evento",
  createEvent: "Crear evento",
  step1Title: "Configura tu evento",
  step1Desc: "Nombre, fecha, lugar, foto de portada y mensaje de bienvenida.",
  step2Title: "Comparte tu código QR",
  step2Desc: "Los invitados lo escanean y suben fotos y vídeos al instante.",
  step3Title: "Recopila y descarga",
  step3Desc: "Todo llega a una sola galería, listo para guardar.",
  myEvents: "Mis eventos",
  tabCreate: "Crear",
  tabSettings: "Ajustes",
  loadingEvents: "Cargando tus eventos...",
  noEventsYet: "Todavía no has creado ningún evento.",
  existingEvents: "Eventos existentes",
  existingEventsHint:
    "Introduce la contraseña del evento para añadirlo a tus eventos.",
  eventPassword: "Contraseña del evento",
  passwordProtected:
    "Este evento está protegido con contraseña. Introdúcela para añadirlo a tus eventos.",
  incorrectPassword: "Contraseña incorrecta",
  eventAdded: "Evento añadido a tus eventos",
  addToMyEvents: "Añadir a mis eventos",
  uploads: "archivos",
  awaitingPayment: "Esperando confirmación del pago",
  paymentDeclined: "Pago rechazado — contáctanos",

  stepOf: "Paso {n} de {total}",
  qName: "¿Cómo se llama tu evento?",
  qNameHint: "Este es el nombre que verán tus invitados.",
  qDate: "¿Cuándo será?",
  qDateHint: "Elige la fecha de tu evento.",
  qVenue: "¿Dónde se celebra?",
  qVenueHint: "Añade el lugar o la ubicación.",
  qCover: "Añade una foto de portada",
  qCoverHint: "Una bonita imagen para la página de tu evento.",
  qWelcome: "Da la bienvenida a tus invitados",
  qWelcomeHint: "Se muestra a pantalla completa cuando llegan los invitados.",
  qGuests: "¿Cuántos invitados?",
  qGuestsHint: "Desliza para elegir la capacidad de invitados.",
  qReview: "¿Listo para publicar?",
  qReviewHint: "Revisa tu evento y créalo.",
  namePlaceholder: "ej. Boda de Sara y Daniel",
  venuePlaceholder: "ej. Sheraton Addis, Salón",
  choosePhoto: "Elegir una foto",
  skipForNow: "Omitir por ahora",
  welcomeTitle: "Título de bienvenida",
  welcomeMessagePlaceholder: "Escribe un breve mensaje\nde bienvenida para tus invitados...",
  untitledEvent: "Evento sin título",
  creating: "Creando...",
  contactForCustom: "Contáctanos para un precio personalizado",
  eventLive: "¡Tu evento está activo!",
  eventPending: "Pago enviado — tu evento se activará cuando lo confirmemos.",
  createFailed: "No se pudo crear el evento. Inténtalo de nuevo.",

  pay: "Pagar",
  amount: "Importe",
  payInstructions:
    "Realiza la transferencia y luego introduce tu número de teléfono y el ID de la transacción. Enviamos la confirmación por SMS.",
  phoneNumber: "Número de teléfono",
  phonePlaceholder: "ej. +2519...",
  transactionId: "ID / número de transacción",
  transactionPlaceholder: "ej. BFA12345678",
  iHavePaid: "Ya he pagado",
  paymentFieldsRequired:
    "Introduce tu número de teléfono y el ID de transacción para continuar.",
  needHelp: "¿Necesitas ayuda? Llama al",

  settings: "Ajustes",
  signedInAs: "Sesión iniciada como",
  faq: "Preguntas frecuentes",
  contactUs: "Contáctanos",
  emailUs: "Envíanos un correo",
  callUs: "Llámanos",
  language: "Idioma",
  privacy: "Privacidad",
  followUs: "Síguenos",
  clearCache: "Borrar caché",
  cacheCleared: "Caché borrada",
  cacheClearFailed: "No se pudo borrar la caché",
  signOut: "Cerrar sesión",
  languageSet: "Idioma actualizado",
  privacy1:
    "Momentique solo guarda lo que tu evento necesita: los datos del evento y las fotos y vídeos subidos. Los archivos se guardan de forma segura en la nube vinculados a tu evento.",
  privacy2:
    "Nunca vendemos tus datos ni los compartimos con terceros. Al eliminar un evento se elimina su galería. Los invitados no necesitan cuenta.",
  privacy3:
    "¿Dudas sobre tus datos? Escribe a eventcoordinator@vionevents.com.",
  faq1q: "¿Cómo suben fotos los invitados?",
  faq1a:
    "Comparte el código QR o el enlace del evento. Los invitados lo escanean, abren la página y suben fotos o vídeos desde su móvil — sin app ni cuenta.",
  faq2q: "¿Quién puede ver la galería de mi evento?",
  faq2a:
    "Cualquiera con el enlace o el QR puede ver y añadir archivos. Solo tú, el propietario, puedes editar el evento o borrar archivos.",
  faq3q: "¿Puedo descargar todo a la vez?",
  faq3a:
    "Sí. Mantén pulsada una foto o vídeo para activar el modo selección, pulsa seleccionar todo y guarda o comparte.",
  faq4q: "¿Hay límite de subidas?",
  faq4a: "No hay límite de cantidad. Los vídeos pueden durar hasta 30 minutos cada uno.",
  faq5q: "¿Cómo instalo la app?",
  faq5a:
    "Abre Momentique en el navegador de tu móvil y elige «Añadir a pantalla de inicio». Se ejecutará a pantalla completa.",

  adminAccess: "Acceso de administrador",
  adminPasswordPrompt: "Introduce la contraseña de administrador para continuar.",
  unlock: "Desbloquear",
  wrongAdminPassword: "Contraseña de administrador incorrecta",
  adminDashboard: "Panel de administración",
  payments: "Pagos",
  allEvents: "Todos los eventos",
  confirm: "Confirmar",
  decline: "Rechazar",
  pending: "Pendiente",
  confirmed: "Confirmado",
  declined: "Rechazado",
  paymentConfirmed: "Pago confirmado",
  paymentDeclinedToast: "Pago rechazado",
  noPendingPayments: "No hay pagos pendientes de revisión.",
  owner: "Propietario",
};

const DICTS: Record<Lang, Dict> = { en: en as Dict, am, fr, es };

const STORAGE_KEY = "mv_lang";

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (k) => (en as Dict)[k],
});

const readLang = (): Lang => {
  const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
  return stored && stored in DICTS ? stored : "en";
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(readLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      let value = DICTS[lang][key] ?? (en as Dict)[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          value = value.replace(`{${k}}`, String(v));
        }
      }
      return value;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useI18n = () => useContext(LanguageContext);
