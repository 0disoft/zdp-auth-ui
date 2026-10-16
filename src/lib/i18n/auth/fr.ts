import type { ZdpAuthMessages } from '../schema.ts';

const messages = {
  "brand": "8ailors",
  "title": {
    "login": "Se connecter",
    "signup": "Créer un compte",
    "recovery": "Récupérer le compte"
  },
  "summary": {
    "login": "Continuez avec votre compte 8ailors.",
    "signup": "Créez votre compte 8ailors.",
    "recovery": "Nous enverrons les instructions de récupération à votre adresse e-mail."
  },
  "fields": {
    "loginId": "Identifiant",
    "email": "Adresse e-mail",
    "password": "Mot de passe",
    "name": "Nom",
    "termsAcceptance": "J’accepte les conditions obligatoires.",
    "passwordConfirmation": "Confirmer le mot de passe",
    "minimumAgeConfirmation": "Je confirme avoir au moins {minimumAge} ans."
  },
  "actions": {
    "login": "Se connecter",
    "signup": "Créer un compte",
    "recovery": "Recevoir l’e-mail de récupération",
    "usePasskey": "Continuer avec une clé d’accès",
    "showPassword": "Afficher le mot de passe",
    "hidePassword": "Masquer le mot de passe"
  },
  "providers": {
    "groupLabel": "Choisissez une méthode de connexion",
    "passkey": "Passkey",
    "google": "Google",
    "github": "GitHub",
    "email": "Adresse e-mail"
  },
  "navigation": {
    "accountHelp": "Aide du compte"
  },
  "links": {
    "login": "J’ai déjà un compte",
    "signup": "Créer un nouveau compte",
    "recovery": "Mot de passe oublié",
    "terms": "Conditions",
    "privacy": "Confidentialité"
  },
  "status": {
    "waiting": "Vérification en cours.",
    "error": "Vérifiez les informations et réessayez."
  },
  "availability": {
    "preparing": "Le service de comptes n’est pas encore disponible."
  },
  "feedback": {
    "registered": "Compte créé. Connectez-vous pour continuer.",
    "invalidInput": "Vérifiez les informations saisies.",
    "expiredPage": "Cette page a expiré. Actualisez-la et réessayez.",
    "signupUnavailable": "La création de compte est temporairement indisponible. Réessayez plus tard.",
    "loginFailed": "Vérifiez votre identifiant et votre mot de passe.",
    "loginUnavailable": "La connexion est temporairement indisponible. Réessayez plus tard.",
    "passwordMismatch": "Les mots de passe ne correspondent pas."
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
