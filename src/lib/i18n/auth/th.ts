import type { ZdpAuthMessages } from '../schema.ts';

const messages = {
  "brand": "8ailors",
  "title": {
    "login": "เข้าสู่ระบบ",
    "signup": "สร้างบัญชี",
    "recovery": "กู้คืนบัญชี"
  },
  "summary": {
    "login": "ดำเนินการต่อด้วยบัญชี 8ailors ของคุณ",
    "signup": "สร้างบัญชี 8ailors ของคุณ",
    "recovery": "เราจะส่งคำแนะนำการกู้คืนไปยังอีเมลของคุณ"
  },
  "fields": {
    "loginId": "รหัสเข้าสู่ระบบ",
    "email": "อีเมล",
    "password": "รหัสผ่าน",
    "name": "ชื่อ",
    "termsAcceptance": "ฉันยอมรับข้อกำหนดที่จำเป็น",
    "passwordConfirmation": "ยืนยันรหัสผ่าน",
    "minimumAgeConfirmation": "ฉันยืนยันว่าฉันมีอายุอย่างน้อย {minimumAge} ปี"
  },
  "actions": {
    "login": "เข้าสู่ระบบ",
    "signup": "สร้างบัญชี",
    "recovery": "รับอีเมลกู้คืน",
    "usePasskey": "ดำเนินการต่อด้วยพาสคีย์",
    "showPassword": "แสดงรหัสผ่าน",
    "hidePassword": "ซ่อนรหัสผ่าน"
  },
  "providers": {
    "groupLabel": "เลือกวิธีเข้าสู่ระบบ",
    "passkey": "Passkey",
    "google": "Google",
    "github": "GitHub",
    "email": "อีเมล"
  },
  "navigation": {
    "accountHelp": "ความช่วยเหลือเกี่ยวกับบัญชี"
  },
  "links": {
    "login": "ฉันมีบัญชีแล้ว",
    "signup": "สร้างบัญชีใหม่",
    "recovery": "ฉันลืมรหัสผ่าน",
    "terms": "ข้อกำหนด",
    "privacy": "ความเป็นส่วนตัว"
  },
  "status": {
    "waiting": "กำลังตรวจสอบ",
    "error": "โปรดตรวจสอบข้อมูลแล้วลองอีกครั้ง"
  },
  "availability": {
    "preparing": "บริการบัญชียังไม่พร้อมใช้งาน"
  },
  "feedback": {
    "registered": "สร้างบัญชีแล้ว โปรดเข้าสู่ระบบเพื่อดำเนินการต่อ",
    "invalidInput": "โปรดตรวจสอบข้อมูลที่กรอก",
    "expiredPage": "หน้านี้หมดอายุแล้ว โปรดรีเฟรชและลองอีกครั้ง",
    "signupUnavailable": "ไม่สามารถสร้างบัญชีได้ชั่วคราว โปรดลองอีกครั้งภายหลัง",
    "loginFailed": "โปรดตรวจสอบรหัสเข้าสู่ระบบและรหัสผ่าน",
    "loginUnavailable": "ไม่สามารถเข้าสู่ระบบได้ชั่วคราว โปรดลองอีกครั้งภายหลัง",
    "passwordMismatch": "รหัสผ่านไม่ตรงกัน"
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
