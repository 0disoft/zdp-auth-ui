import type { ZdpAuthMessages } from '../schema.ts';

const messages = {
  "brand": "8ailors",
  "title": {
    "login": "Masuk",
    "signup": "Buat akun",
    "recovery": "Pulihkan akun"
  },
  "summary": {
    "login": "Lanjutkan dengan akun 8ailors Anda.",
    "signup": "Buat akun 8ailors Anda.",
    "recovery": "Kami akan mengirim petunjuk pemulihan ke email Anda."
  },
  "fields": {
    "loginId": "ID masuk",
    "email": "Email",
    "password": "Kata sandi",
    "name": "Nama",
    "termsAcceptance": "Saya menyetujui ketentuan wajib.",
    "passwordConfirmation": "Konfirmasi kata sandi",
    "minimumAgeConfirmation": "Saya mengonfirmasi bahwa saya berusia minimal {minimumAge} tahun."
  },
  "actions": {
    "login": "Masuk",
    "signup": "Buat akun",
    "recovery": "Terima email pemulihan",
    "usePasskey": "Lanjutkan dengan passkey",
    "showPassword": "Tampilkan kata sandi",
    "hidePassword": "Sembunyikan kata sandi"
  },
  "providers": {
    "groupLabel": "Pilih cara masuk",
    "passkey": "Passkey",
    "google": "Google",
    "github": "GitHub",
    "email": "Email"
  },
  "navigation": {
    "accountHelp": "Bantuan akun"
  },
  "links": {
    "login": "Saya sudah memiliki akun",
    "signup": "Buat akun baru",
    "recovery": "Saya lupa kata sandi",
    "terms": "Ketentuan",
    "privacy": "Privasi"
  },
  "status": {
    "waiting": "Sedang memeriksa.",
    "error": "Periksa informasi lalu coba lagi."
  },
  "availability": {
    "preparing": "Layanan akun belum tersedia."
  },
  "feedback": {
    "registered": "Akun berhasil dibuat. Masuk untuk melanjutkan.",
    "invalidInput": "Periksa informasi yang Anda masukkan.",
    "expiredPage": "Halaman ini telah kedaluwarsa. Muat ulang lalu coba lagi.",
    "signupUnavailable": "Pembuatan akun sementara tidak tersedia. Coba lagi nanti.",
    "loginFailed": "Periksa ID masuk dan kata sandi Anda.",
    "loginUnavailable": "Proses masuk sementara tidak tersedia. Coba lagi nanti.",
    "passwordMismatch": "Kata sandi tidak cocok."
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
