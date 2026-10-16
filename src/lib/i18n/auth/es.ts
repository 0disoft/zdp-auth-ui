import type { ZdpAuthMessages } from '../schema.ts';

const messages = {
  "brand": "8ailors",
  "title": {
    "login": "Iniciar sesión",
    "signup": "Crear cuenta",
    "recovery": "Recuperar cuenta"
  },
  "summary": {
    "login": "Continúa con tu cuenta de 8ailors.",
    "signup": "Crea tu cuenta de 8ailors.",
    "recovery": "Enviaremos las instrucciones de recuperación a tu correo electrónico."
  },
  "fields": {
    "loginId": "ID de acceso",
    "email": "Correo electrónico",
    "password": "Contraseña",
    "name": "Nombre",
    "termsAcceptance": "Acepto los términos obligatorios.",
    "passwordConfirmation": "Confirmar contraseña",
    "minimumAgeConfirmation": "Confirmo que tengo al menos {minimumAge} años."
  },
  "actions": {
    "login": "Iniciar sesión",
    "signup": "Crear cuenta",
    "recovery": "Recibir correo de recuperación",
    "usePasskey": "Continuar con clave de acceso",
    "showPassword": "Mostrar contraseña",
    "hidePassword": "Ocultar contraseña"
  },
  "providers": {
    "groupLabel": "Elige cómo iniciar sesión",
    "passkey": "Passkey",
    "google": "Google",
    "github": "GitHub",
    "email": "Correo electrónico"
  },
  "navigation": {
    "accountHelp": "Ayuda de la cuenta"
  },
  "links": {
    "login": "Ya tengo una cuenta",
    "signup": "Crear una cuenta nueva",
    "recovery": "Olvidé mi contraseña",
    "terms": "Términos",
    "privacy": "Privacidad"
  },
  "status": {
    "waiting": "Comprobando.",
    "error": "Revisa los datos e inténtalo de nuevo."
  },
  "availability": {
    "preparing": "El servicio de cuentas aún no está disponible."
  },
  "feedback": {
    "registered": "Cuenta creada. Inicia sesión para continuar.",
    "invalidInput": "Revisa la información introducida.",
    "expiredPage": "La página ha caducado. Actualízala e inténtalo de nuevo.",
    "signupUnavailable": "No se puede crear la cuenta temporalmente. Inténtalo más tarde.",
    "loginFailed": "Revisa tu ID de acceso y contraseña.",
    "loginUnavailable": "No se puede iniciar sesión temporalmente. Inténtalo más tarde.",
    "passwordMismatch": "Las contraseñas no coinciden."
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
