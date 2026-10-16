import type { ZdpAuthMessages } from '../schema.ts';

const messages = {
  "brand": "8ailors",
  "title": {
    "login": "Masuk",
    "signup": "Buat akun",
    "recovery": "Pulihkan akun"
  },
  "summary": {
    "login": "Lanjutkan dengan akun {brand} Anda.",
    "signup": "Buat akun {brand} Anda.",
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
    "passkey": "Kunci sandi (Passkey)",
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
    "title": "Hubungkan produk desktop",
    "summary": "Tinjau produk dan hal yang ingin diaksesnya.",
    "fields": {
      "product": "Produk peminta",
      "account": "Akun",
      "workspace": "Ruang kerja",
      "expires": "Masa berlaku permintaan"
    },
    "requestedTitle": "Akses yang diminta",
    "itemKinds": {
      "scope": "Cakupan",
      "capability": "Kemampuan"
    },
    "consentTitle": "Jika Anda menyetujui",
    "consentBoundary": "Persetujuan ini tidak menyinkronkan data produk.",
    "noWorkspace": "Akun pribadi",
    "actions": {
      "approve": "Setujui koneksi",
      "deny": "Tolak"
    },
    "status": {
      "ready": "Anda dapat menyetujui atau menolak permintaan ini.",
      "submitting": "Mengirim keputusan Anda.",
      "approved": "Koneksi disetujui.",
      "denied": "Koneksi ditolak.",
      "expired": "Permintaan ini kedaluwarsa. Mulai lagi dari produk desktop.",
      "consumed": "Permintaan ini sudah digunakan. Periksa statusnya di produk desktop.",
      "stale": "Informasi permintaan sudah usang. Mulai lagi dari produk desktop.",
      "invalid": "Permintaan koneksi ini tidak dapat dipercaya. Mulai lagi dari produk desktop.",
      "disabled": "Koneksi produk desktop belum tersedia."
    }
  }
} satisfies ZdpAuthMessages;

export default messages;
