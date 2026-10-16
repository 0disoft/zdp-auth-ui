import type { ZdpAuthMessages } from '../schema.ts';

const messages = {
  "brand": "8ailors",
  "title": {
    "login": "Sign in",
    "signup": "Create account",
    "recovery": "Recover account"
  },
  "summary": {
    "login": "Continue with your {brand} account.",
    "signup": "Start with only the details we need.",
    "recovery": "We will send recovery instructions to your email."
  },
  "fields": {
    "minimumAgeConfirmation": "I confirm I am at least {minimumAge} years old.",
    "loginId": "Login ID",
    "email": "Email",
    "password": "Password",
    "passwordConfirmation": "Confirm password",
    "name": "Name",
    "termsAcceptance": "I agree to the required terms."
  },
  "actions": {
    "login": "Sign in",
    "signup": "Create account",
    "recovery": "Send recovery email",
    "usePasskey": "Continue with passkey",
    "showPassword": "Show password",
    "hidePassword": "Hide password"
  },
  "providers": {
    "groupLabel": "Choose sign-in method",
    "passkey": "Passkey",
    "google": "Google",
    "github": "GitHub",
    "email": "Email"
  },
  "navigation": {
    "accountHelp": "Account help"
  },
  "links": {
    "login": "I already have an account",
    "signup": "Create a new account",
    "recovery": "I forgot my password",
    "terms": "Terms",
    "privacy": "Privacy"
  },
  "status": {
    "waiting": "Checking now.",
    "error": "Check the details and try again."
  },
  "availability": {
    "preparing": "Account access is not available yet."
  },
  "feedback": {
    "registered": "Account created. Sign in to continue.",
    "invalidInput": "Check the information you entered.",
    "expiredPage": "This page expired. Refresh and try again.",
    "signupUnavailable": "Account creation is temporarily unavailable. Try again shortly.",
    "loginFailed": "Check your login ID and password.",
    "loginUnavailable": "Sign in is temporarily unavailable. Try again shortly.",
    "passwordMismatch": "Passwords do not match."
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
