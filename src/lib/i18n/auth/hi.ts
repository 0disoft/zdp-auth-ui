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
    "passkey": "Passkey",
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
    "title": "Connect desktop product",
    "summary": "Review the product and what it is asking to use.",
    "fields": {
      "product": "Requesting product",
      "account": "Account",
      "workspace": "Workspace",
      "expires": "Request expires"
    },
    "requestedTitle": "Requested access",
    "itemKinds": {
      "scope": "Scope",
      "capability": "Capability"
    },
    "consentTitle": "If you approve",
    "consentBoundary": "This approval does not sync product data.",
    "noWorkspace": "Personal account",
    "actions": {
      "approve": "Approve connection",
      "deny": "Deny"
    },
    "status": {
      "ready": "You can approve or deny this request.",
      "submitting": "Sending your decision.",
      "approved": "Connection approved.",
      "denied": "Connection denied.",
      "expired": "This request expired. Start again from the desktop product.",
      "consumed": "This request was already used. Check the desktop product for its status.",
      "stale": "This request is out of date. Start again from the desktop product.",
      "invalid": "This connection request is not trusted. Start again from the desktop product.",
      "disabled": "Desktop product connection is not available yet."
    }
  }
} satisfies ZdpAuthMessages;

export default messages;
