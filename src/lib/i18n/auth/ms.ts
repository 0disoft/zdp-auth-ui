import type { ZdpAuthMessages } from '../schema.ts';

const messages = {
  "brand": "8ailors",
  "title": {
    "login": "Log masuk",
    "signup": "Cipta akaun",
    "recovery": "Pulihkan akaun"
  },
  "summary": {
    "login": "Teruskan dengan akaun 8ailors anda.",
    "signup": "Cipta akaun 8ailors anda.",
    "recovery": "Kami akan menghantar arahan pemulihan ke e-mel anda."
  },
  "fields": {
    "loginId": "ID log masuk",
    "email": "E-mel",
    "password": "Kata laluan",
    "name": "Nama",
    "termsAcceptance": "Saya bersetuju dengan terma wajib.",
    "passwordConfirmation": "Pengesahan kata laluan",
    "minimumAgeConfirmation": "Saya mengesahkan bahawa saya berumur sekurang-kurangnya {minimumAge} tahun."
  },
  "actions": {
    "login": "Log masuk",
    "signup": "Cipta akaun",
    "recovery": "Terima e-mel pemulihan",
    "usePasskey": "Teruskan dengan kunci laluan",
    "showPassword": "Tunjukkan kata laluan",
    "hidePassword": "Sembunyikan kata laluan"
  },
  "providers": {
    "groupLabel": "Pilih cara log masuk",
    "passkey": "Passkey",
    "google": "Google",
    "github": "GitHub",
    "email": "E-mel"
  },
  "navigation": {
    "accountHelp": "Bantuan akaun"
  },
  "links": {
    "login": "Saya sudah mempunyai akaun",
    "signup": "Cipta akaun baharu",
    "recovery": "Saya terlupa kata laluan",
    "terms": "Terma",
    "privacy": "Privasi"
  },
  "status": {
    "waiting": "Sedang menyemak.",
    "error": "Semak maklumat dan cuba lagi."
  },
  "availability": {
    "preparing": "Perkhidmatan akaun belum tersedia."
  },
  "feedback": {
    "registered": "Akaun berjaya dicipta. Log masuk untuk meneruskan.",
    "invalidInput": "Semak maklumat yang anda masukkan.",
    "expiredPage": "Halaman ini telah tamat tempoh. Muat semula dan cuba lagi.",
    "signupUnavailable": "Penciptaan akaun tidak tersedia buat sementara waktu. Cuba lagi kemudian.",
    "loginFailed": "Semak ID log masuk dan kata laluan anda.",
    "loginUnavailable": "Log masuk tidak tersedia buat sementara waktu. Cuba lagi kemudian.",
    "passwordMismatch": "Kata laluan tidak sepadan."
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
