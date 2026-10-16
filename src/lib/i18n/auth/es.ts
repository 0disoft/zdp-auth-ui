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
    "passkey": "Clave de acceso",
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
    "title": "Conectar el producto de escritorio",
    "summary": "Revisa el producto y lo que solicita usar.",
    "fields": {
      "product": "Producto solicitante",
      "account": "Cuenta",
      "workspace": "Espacio de trabajo",
      "expires": "Caducidad de la solicitud"
    },
    "requestedTitle": "Acceso solicitado",
    "itemKinds": {
      "scope": "Ámbito",
      "capability": "Capacidad"
    },
    "consentTitle": "Si lo apruebas",
    "consentBoundary": "Esta aprobación no sincroniza los datos del producto.",
    "noWorkspace": "Cuenta personal",
    "actions": {
      "approve": "Aprobar la conexión",
      "deny": "Rechazar"
    },
    "status": {
      "ready": "Puedes aprobar o rechazar esta solicitud.",
      "submitting": "Enviando tu decisión.",
      "approved": "Conexión aprobada.",
      "denied": "Conexión rechazada.",
      "expired": "Esta solicitud ha caducado. Iníciala de nuevo desde el producto de escritorio.",
      "consumed": "Esta solicitud ya se usó. Consulta su estado en el producto de escritorio.",
      "stale": "La solicitud está desactualizada. Iníciala de nuevo desde el producto de escritorio.",
      "invalid": "No se puede confiar en esta solicitud de conexión. Iníciala de nuevo desde el producto de escritorio.",
      "disabled": "La conexión con el producto de escritorio aún no está disponible."
    }
  }
} satisfies ZdpAuthMessages;

export default messages;
