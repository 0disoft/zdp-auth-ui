import type { ZdpAuthMessages } from '../schema.ts';

const messages = {
  "brand": "8ailors",
  "title": {
    "login": "साइन इन करें",
    "signup": "खाता बनाएँ",
    "recovery": "खाता पुनर्प्राप्त करें"
  },
  "summary": {
    "login": "अपने 8ailors खाते से आगे बढ़ें।",
    "signup": "अपना 8ailors खाता बनाएँ।",
    "recovery": "हम पुनर्प्राप्ति निर्देश आपके ईमेल पर भेजेंगे।"
  },
  "fields": {
    "loginId": "लॉगिन आईडी",
    "email": "ईमेल",
    "password": "पासवर्ड",
    "name": "नाम",
    "termsAcceptance": "मैं आवश्यक शर्तों से सहमत हूँ।",
    "passwordConfirmation": "पासवर्ड की पुष्टि करें",
    "minimumAgeConfirmation": "मैं पुष्टि करता/करती हूँ कि मेरी आयु कम से कम {minimumAge} वर्ष है।"
  },
  "actions": {
    "login": "साइन इन करें",
    "signup": "खाता बनाएँ",
    "recovery": "पुनर्प्राप्ति ईमेल पाएँ",
    "usePasskey": "पासकी से आगे बढ़ें",
    "showPassword": "पासवर्ड दिखाएँ",
    "hidePassword": "पासवर्ड छिपाएँ"
  },
  "providers": {
    "groupLabel": "साइन इन करने का तरीका चुनें",
    "passkey": "पासकी",
    "google": "Google",
    "github": "GitHub",
    "email": "ईमेल"
  },
  "navigation": {
    "accountHelp": "खाता सहायता"
  },
  "links": {
    "login": "मेरा पहले से खाता है",
    "signup": "नया खाता बनाएँ",
    "recovery": "मैं पासवर्ड भूल गया",
    "terms": "शर्तें",
    "privacy": "गोपनीयता"
  },
  "status": {
    "waiting": "जाँच की जा रही है।",
    "error": "जानकारी जाँचें और फिर प्रयास करें।"
  },
  "availability": {
    "preparing": "खाता सेवा अभी उपलब्ध नहीं है।"
  },
  "feedback": {
    "registered": "खाता बन गया। आगे बढ़ने के लिए साइन इन करें।",
    "invalidInput": "दर्ज की गई जानकारी जाँचें।",
    "expiredPage": "यह पेज समाप्त हो गया है। रीफ़्रेश करके फिर प्रयास करें।",
    "signupUnavailable": "अभी खाता नहीं बनाया जा सकता। थोड़ी देर बाद प्रयास करें।",
    "loginFailed": "अपनी लॉगिन आईडी और पासवर्ड जाँचें।",
    "loginUnavailable": "अभी साइन इन नहीं किया जा सकता। थोड़ी देर बाद प्रयास करें।",
    "passwordMismatch": "पासवर्ड मेल नहीं खा रहे हैं।"
  },
  "productLink": {
    "title": "डेस्कटॉप उत्पाद कनेक्ट करें",
    "summary": "उत्पाद और उसके द्वारा मांगे गए उपयोग की समीक्षा करें।",
    "fields": {
      "product": "अनुरोध करने वाला उत्पाद",
      "account": "खाता",
      "workspace": "वर्कस्पेस",
      "expires": "अनुरोध की समय-सीमा"
    },
    "requestedTitle": "अनुरोधित पहुँच",
    "itemKinds": {
      "scope": "दायरा",
      "capability": "क्षमता"
    },
    "consentTitle": "स्वीकृति देने पर",
    "consentBoundary": "इस स्वीकृति से उत्पाद डेटा सिंक नहीं होता।",
    "noWorkspace": "व्यक्तिगत खाता",
    "actions": {
      "approve": "कनेक्शन स्वीकृत करें",
      "deny": "अस्वीकार करें"
    },
    "status": {
      "ready": "आप इस अनुरोध को स्वीकार या अस्वीकार कर सकते हैं।",
      "submitting": "आपका निर्णय भेजा जा रहा है।",
      "approved": "कनेक्शन स्वीकृत हुआ।",
      "denied": "कनेक्शन अस्वीकृत हुआ।",
      "expired": "इस अनुरोध की अवधि समाप्त हो गई। डेस्कटॉप उत्पाद से फिर शुरू करें।",
      "consumed": "यह अनुरोध पहले ही उपयोग हो चुका है। डेस्कटॉप उत्पाद में स्थिति देखें।",
      "stale": "अनुरोध की जानकारी पुरानी हो गई है। डेस्कटॉप उत्पाद से फिर शुरू करें।",
      "invalid": "इस कनेक्शन अनुरोध पर भरोसा नहीं किया जा सकता। डेस्कटॉप उत्पाद से फिर शुरू करें।",
      "disabled": "डेस्कटॉप उत्पाद कनेक्शन अभी उपलब्ध नहीं है।"
    }
  }
} satisfies ZdpAuthMessages;

export default messages;
