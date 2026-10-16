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
    "passkey": "Kunci laluan",
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
    "title": "Sambungkan produk desktop",
    "summary": "Semak produk dan perkara yang ingin digunakan olehnya.",
    "fields": {
      "product": "Produk peminta",
      "account": "Akaun",
      "workspace": "Ruang kerja",
      "expires": "Tamat tempoh permintaan"
    },
    "requestedTitle": "Akses yang diminta",
    "itemKinds": {
      "scope": "Skop",
      "capability": "Keupayaan"
    },
    "consentTitle": "Jika anda meluluskan",
    "consentBoundary": "Kelulusan ini tidak menyegerakkan data produk.",
    "noWorkspace": "Akaun peribadi",
    "actions": {
      "approve": "Luluskan sambungan",
      "deny": "Tolak"
    },
    "status": {
      "ready": "Anda boleh meluluskan atau menolak permintaan ini.",
      "submitting": "Menghantar keputusan anda.",
      "approved": "Sambungan diluluskan.",
      "denied": "Sambungan ditolak.",
      "expired": "Permintaan ini tamat tempoh. Mulakan semula dari produk desktop.",
      "consumed": "Permintaan ini sudah digunakan. Semak statusnya dalam produk desktop.",
      "stale": "Maklumat permintaan sudah lapuk. Mulakan semula dari produk desktop.",
      "invalid": "Permintaan sambungan ini tidak boleh dipercayai. Mulakan semula dari produk desktop.",
      "disabled": "Sambungan produk desktop belum tersedia."
    }
  }
} satisfies ZdpAuthMessages;

export default messages;
