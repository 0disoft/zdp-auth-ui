import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON
} from '@simplewebauthn/browser';

/*
 * mf:anchor zdp.auth-ui.passkey-browser-ceremony
 * purpose: Locate passkey browser ceremony helpers that wrap WebAuthn registration and authentication prompts.
 * search: passkey, WebAuthn, startRegistration, startAuthentication, browser ceremony
 * invariant: Helpers may start browser ceremonies only; challenge creation, verification, session issue, and credential storage stay server-owned.
 * risk: authn, privacy
 */
export async function startPasskeyRegistration(
  options: PublicKeyCredentialCreationOptionsJSON
): Promise<RegistrationResponseJSON> {
  return startRegistration({ optionsJSON: options });
}

export async function startPasskeyAuthentication(
  options: PublicKeyCredentialRequestOptionsJSON
): Promise<AuthenticationResponseJSON> {
  return startAuthentication({ optionsJSON: options });
}
