import { base64URLStringToBuffer, bufferToBase64URLString } from '@simplewebauthn/browser';
import type {
  AuthenticationResponseJSON, PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON, RegistrationResponseJSON
} from '@simplewebauthn/browser';

// Keep JSON conversion compatible with SimpleWebAuthn while passing the owner's
// signal directly to the browser, without the SDK's global abort service.
export async function startAuthentication(
  options: PublicKeyCredentialRequestOptionsJSON,
  signal: AbortSignal,
  conditional: boolean
): Promise<AuthenticationResponseJSON> {
  const credential = requirePublicKeyCredential(await navigator.credentials.get({
    publicKey: {
      ...options,
      challenge: base64URLStringToBuffer(options.challenge),
      extensions: options.extensions as AuthenticationExtensionsClientInputs | undefined,
      allowCredentials: conditional ? [] : options.allowCredentials?.length
        ? options.allowCredentials.map(credentialDescriptor) : undefined
    },
    signal,
    ...(conditional ? { mediation: 'conditional' as const } : {})
  }));
  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    id: credential.id,
    rawId: bufferToBase64URLString(credential.rawId),
    type: 'public-key',
    response: {
      authenticatorData: bufferToBase64URLString(response.authenticatorData),
      clientDataJSON: bufferToBase64URLString(response.clientDataJSON),
      signature: bufferToBase64URLString(response.signature),
      userHandle: response.userHandle ? bufferToBase64URLString(response.userHandle) : undefined
    },
    clientExtensionResults: credential.getClientExtensionResults(),
    authenticatorAttachment: attachment(credential)
  };
}

export async function startRegistration(
  options: PublicKeyCredentialCreationOptionsJSON,
  signal: AbortSignal
): Promise<RegistrationResponseJSON> {
  const credential = requirePublicKeyCredential(await navigator.credentials.create({
    publicKey: {
      ...options,
      challenge: base64URLStringToBuffer(options.challenge),
      extensions: options.extensions as AuthenticationExtensionsClientInputs | undefined,
      user: { ...options.user, id: base64URLStringToBuffer(options.user.id) },
      excludeCredentials: options.excludeCredentials?.map(credentialDescriptor)
    },
    signal
  }));
  const response = credential.response as AuthenticatorAttestationResponse;
  const publicKey = optionalResponseValue(() => response.getPublicKey());
  const authenticatorData = optionalResponseValue(() => response.getAuthenticatorData());
  return {
    id: credential.id,
    rawId: bufferToBase64URLString(credential.rawId),
    type: 'public-key',
    response: {
      attestationObject: bufferToBase64URLString(response.attestationObject),
      clientDataJSON: bufferToBase64URLString(response.clientDataJSON),
      transports: optionalResponseValue(() => response.getTransports()),
      publicKeyAlgorithm: optionalResponseValue(() => response.getPublicKeyAlgorithm()),
      publicKey: publicKey ? bufferToBase64URLString(publicKey) : undefined,
      authenticatorData: authenticatorData ? bufferToBase64URLString(authenticatorData) : undefined
    },
    clientExtensionResults: credential.getClientExtensionResults(),
    authenticatorAttachment: attachment(credential)
  };
}

function requirePublicKeyCredential(credential: Credential | null): PublicKeyCredential {
  if (!credential || credential.type !== 'public-key') {
    throw new TypeError('The browser did not return a public-key credential.');
  }
  return credential as PublicKeyCredential;
}

function credentialDescriptor(item: { id: string; type: string; transports?: string[] }): PublicKeyCredentialDescriptor {
  return {
    ...item, id: base64URLStringToBuffer(item.id), type: item.type as PublicKeyCredentialType,
    // Preserve newer transport hints even when the DOM typings lag the browser.
    transports: item.transports as AuthenticatorTransport[] | undefined
  };
}

function attachment(credential: PublicKeyCredential): 'platform' | 'cross-platform' | undefined {
  const value = credential.authenticatorAttachment;
  return value === 'platform' || value === 'cross-platform' ? value : undefined;
}

// Older browsers and some passkey extensions omit or throw from L3 metadata APIs.
function optionalResponseValue<T>(read: () => T): T | undefined {
  try { return read(); } catch { return undefined; }
}
