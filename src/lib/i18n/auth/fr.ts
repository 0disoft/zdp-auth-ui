import type { ZdpAuthMessages } from '../schema.ts';

const messages = {
  "brand": "8ailors",
  "title": {
    "login": "Se connecter",
    "signup": "Créer un compte",
    "recovery": "Récupérer le compte"
  },
  "summary": {
    "login": "Continuez avec votre compte {brand}.",
    "signup": "Créez votre compte {brand}.",
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
    "passkey": "Clé d’accès",
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
    "title": "Connecter le produit de bureau",
    "summary": "Vérifiez le produit et ce qu’il demande d’utiliser.",
    "fields": {
      "product": "Produit demandeur",
      "account": "Compte",
      "workspace": "Espace de travail",
      "expires": "Expiration de la demande"
    },
    "requestedTitle": "Accès demandé",
    "itemKinds": {
      "scope": "Portée",
      "capability": "Capacité"
    },
    "consentTitle": "Si vous approuvez",
    "consentBoundary": "Cette approbation ne synchronise pas les données du produit.",
    "noWorkspace": "Compte personnel",
    "actions": {
      "approve": "Approuver la connexion",
      "deny": "Refuser"
    },
    "status": {
      "ready": "Vous pouvez approuver ou refuser cette demande.",
      "submitting": "Envoi de votre décision.",
      "approved": "Connexion approuvée.",
      "denied": "Connexion refusée.",
      "expired": "Cette demande a expiré. Relancez-la depuis le produit de bureau.",
      "consumed": "Cette demande a déjà été utilisée. Consultez son état dans le produit de bureau.",
      "stale": "La demande n’est plus à jour. Relancez-la depuis le produit de bureau.",
      "invalid": "Cette demande de connexion n’est pas fiable. Relancez-la depuis le produit de bureau.",
      "disabled": "La connexion au produit de bureau n’est pas encore disponible."
    }
  }
} satisfies ZdpAuthMessages;

export default messages;
