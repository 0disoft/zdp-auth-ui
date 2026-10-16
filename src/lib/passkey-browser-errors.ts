import { WebAuthnError, type WebAuthnErrorCode } from '@simplewebauthn/browser';

/** Classify native failures without parsing localized browser messages or using SDK global state. */
export function identifyPasskeyBrowserError(
  error: unknown,
  creationOptions?: PublicKeyCredentialCreationOptions
): unknown {
  if (!(error instanceof Error) || error instanceof WebAuthnError) return error;

  let code: WebAuthnErrorCode;
  let message: string;
  switch (error.name) {
    case 'AbortError':
      code = 'ERROR_CEREMONY_ABORTED';
      message = 'The browser ceremony was aborted.';
      break;
    case 'InvalidStateError':
      if (!creationOptions) return error;
      code = 'ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED';
      message = 'The authenticator was previously registered.';
      break;
    case 'NotSupportedError':
      if (!creationOptions) return error;
      if (!Array.isArray(creationOptions.pubKeyCredParams)) return error;
      if (!creationOptions.pubKeyCredParams.some(param => param.type === 'public-key')) {
        code = 'ERROR_MALFORMED_PUBKEYCREDPARAMS';
        message = 'No public-key algorithm parameters were provided.';
      } else {
        code = 'ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG';
        message = 'No available authenticator supports the requested algorithms.';
      }
      break;
    case 'TypeError': {
      const length = creationOptions?.user?.id?.byteLength;
      if (length === undefined || (length >= 1 && length <= 64)) return error;
      code = 'ERROR_INVALID_USER_ID_LENGTH';
      message = 'The user ID must contain between 1 and 64 bytes.';
      break;
    }
    case 'UnknownError':
      code = 'ERROR_AUTHENTICATOR_GENERAL_ERROR';
      message = 'The authenticator could not process the request.';
      break;
    default:
      // In particular, do not guess RP-ID validity from SecurityError: parent
      // domains and related origins can be valid. NotAllowedError is ambiguous too.
      return error;
  }
  return new WebAuthnError({ code, message, cause: error });
}
