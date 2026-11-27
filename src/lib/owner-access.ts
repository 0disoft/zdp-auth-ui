import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON
} from '@simplewebauthn/browser';
import {
  getOwnerAccessNotificationSlots,
  ownerAccessNotificationPolicies,
  ownerContactSlots,
  type OwnerAccessNotificationPolicy,
  type OwnerContactSlot
} from './owner-contacts';

export { ownerAccessNotificationPolicies, type OwnerAccessNotificationPolicy } from './owner-contacts';

export const ownerAccessCandidateFields = Object.freeze([
  'schema','profile','network','chain_identifier','operation_ref','transaction_bytes_digest',
  'source_commit','source_tree_sha256','sender','signer_public_key_base64','gas_budget_mist',
  'nonce','expires_at'
] as const);
export const ownerAccessApprovalDraftFields = Object.freeze([
  'candidate','binding_digest','receipt_ref','expected_approval_revision',
  'transaction_binding_digest','evidence_manifest_digest'
] as const);
export const ownerAccessApprovalFields = Object.freeze([
  ...ownerAccessApprovalDraftFields,'candidate_digest_confirmation'
] as const);
export const ownerAccessRecoveryStates = Object.freeze([
  'none','collecting','notifying','countdown','cancelled','completed'
] as const);
export const ownerAccessDeliveryStatuses = Object.freeze(['pending','accepted','unknown','rejected'] as const);
export const ownerAccessNotificationStatuses = Object.freeze(['pending','accepted','unknown','rejected'] as const);

export type OwnerAccessCandidate = Readonly<{schema:'doubloon.mainnet-owner-passkey-candidate/v1';
  profile:'mainnet:owner-passkey-contact-recovery:20261112';network:'sui_mainnet';
  chain_identifier:string;operation_ref:string;transaction_bytes_digest:string;source_commit:string;
  source_tree_sha256:string;sender:string;signer_public_key_base64:string;gas_budget_mist:string;
  nonce:string;expires_at:string}>;
export type OwnerAccessApprovalDraft = Readonly<{candidate:OwnerAccessCandidate;binding_digest:string;
  receipt_ref:string;expected_approval_revision:string;transaction_binding_digest:string;
  evidence_manifest_digest:string}>;
export type OwnerAccessApprovalInput = OwnerAccessApprovalDraft & Readonly<{candidate_digest_confirmation:string}>;
export type OwnerAccessApprovalCeremony = Readonly<{candidate_id:string;ceremony_id:string;
  options:PublicKeyCredentialRequestOptionsJSON}>;
export type OwnerAccessApprovalComplete = Readonly<{candidate_id:string;approval_ref:string;
  candidate_digest:string;expires_at:string}>;
export type OwnerAccessApprovalStatus = Readonly<{candidate_id:string;candidate_digest:string;
  expires_at:string;state:'pending'|'approved'|'consumed'|'cancelled'|'expired';approval_ref:string|null}>;
export type OwnerAccessRecoveryState = typeof ownerAccessRecoveryStates[number];
export type OwnerAccessContactSlot = OwnerContactSlot;
export type OwnerAccessRecoveryStatus = Readonly<{recovery_id:string|null;state:OwnerAccessRecoveryState;
  notification_policy:OwnerAccessNotificationPolicy;
  proof_slots:readonly OwnerAccessContactSlot[];notifications:readonly Readonly<{
    slot:OwnerAccessContactSlot;status:typeof ownerAccessNotificationStatuses[number]}>[];
  countdown_at:string|null;ready_at:string|null}>;
export type OwnerAccessContactDelivery = Readonly<{recovery_id:string;slot:OwnerAccessContactSlot;
  challenge_id:string;expires_at:string;delivery_status:typeof ownerAccessDeliveryStatuses[number]}>;
export type OwnerAccessCeremony =
  | Readonly<{ceremony_id:string;kind:'authentication';options:PublicKeyCredentialRequestOptionsJSON}>
  | Readonly<{ceremony_id:string;kind:'registration';options:PublicKeyCredentialCreationOptionsJSON}>;
export type OwnerAccessRecoveryCeremony = 'veto'|'rebind';
export type OwnerAccessFeedback = 'saved'|'failed'|'unconfirmed'|'rate_limited'|'expired'|'unavailable'|null;
export type OwnerAccessResult<T> = Readonly<{ok:true;value:T}> |
  Readonly<{ok:false;feedback:Exclude<OwnerAccessFeedback,null>;retryAfter:number|null}>;

/** Consumer-owned persistence for the opaque approval candidate id. */
export interface OwnerAccessApprovalAttemptPort {
  read(digest:string):string|null|Promise<string|null>;
  remember(digest:string,candidateId:string):void|Promise<void>;
  forget(digest:string):void|Promise<void>;
}

/** Browser UI calls only this consumer-owned port. It never receives Core credentials or cookies. */
export interface OwnerAccessClientPort {
  readRecovery(): Promise<OwnerAccessResult<OwnerAccessRecoveryStatus>>;
  beginApproval(input:OwnerAccessApprovalInput,candidateId?:string): Promise<OwnerAccessResult<OwnerAccessApprovalCeremony>>;
  completeApproval(input:{candidate_id:string;ceremony_id:string;credential:AuthenticationResponseJSON}):
    Promise<OwnerAccessResult<OwnerAccessApprovalComplete>>;
  approvalStatus(input:{candidate_id:string}):Promise<OwnerAccessResult<OwnerAccessApprovalStatus>>;
  startRecovery(): Promise<OwnerAccessResult<OwnerAccessRecoveryStatus>>;
  continueRecoveryNotifications(input:{recovery_id:string}):Promise<OwnerAccessResult<OwnerAccessRecoveryStatus>>;
  requestContact(input:{recovery_id:string;slot:OwnerAccessContactSlot}): Promise<OwnerAccessResult<OwnerAccessContactDelivery>>;
  contactDeliveryStatus(input:{recovery_id:string;slot:OwnerAccessContactSlot;challenge_id:string}):
    Promise<OwnerAccessResult<OwnerAccessContactDelivery>>;
  confirmContact(input:{recovery_id:string;slot:OwnerAccessContactSlot;challenge_id:string;code:string}):
    Promise<OwnerAccessResult<OwnerAccessRecoveryStatus>>;
  vetoContact(input:{recovery_id:string;slot:OwnerAccessContactSlot;veto_token:string}):
    Promise<OwnerAccessResult<OwnerAccessRecoveryStatus>>;
  beginRecoveryCeremony(input:{operation:OwnerAccessRecoveryCeremony;recovery_id:string}):
    Promise<OwnerAccessResult<OwnerAccessCeremony>>;
  completeRecoveryCeremony(input:{operation:OwnerAccessRecoveryCeremony;recovery_id:string;
    ceremony_id:string;credential:AuthenticationResponseJSON | RegistrationResponseJSON;label?:string}):
    Promise<OwnerAccessResult<OwnerAccessRecoveryStatus>>;
}

const candidateSchema = 'doubloon.mainnet-owner-passkey-candidate/v1';
const profile = 'mainnet:owner-passkey-contact-recovery:20261112';
const sha = /^sha256:[a-f0-9]{64}$/u,hex40 = /^[a-f0-9]{40}$/u,address = /^0x[a-f0-9]{64}$/u;
const transactionDigest = /^(?:sha256:[a-f0-9]{64}|[1-9A-HJ-NP-Za-km-z]{43,44})$/u;
const base64 = /^[A-Za-z0-9+/]{42}[AEIMQUYcgkosw048]=$/u;
const legacyRecoveryStatusFields = ['recovery_id','state','proof_slots','notifications','countdown_at','ready_at'] as const;
const recoveryStatusFields = [...legacyRecoveryStatusFields,'notification_policy'] as const;
const opaque = (value:unknown,maximum=512) => typeof value === 'string' && value.length > 0 && value.length <= maximum &&
  !/[\u0000-\u001f\u007f]/u.test(value);
const record = (value:unknown):value is Record<string,unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const exact = (value:Record<string,unknown>,fields:readonly string[]) => Object.keys(value).length === fields.length &&
  fields.every(field => Object.hasOwn(value,field));
const time = (value:unknown):value is string => typeof value === 'string' && value.length <= 64 &&
  Number.isFinite(Date.parse(value)) && !/[\u0000-\u001f\u007f]/u.test(value);
const slot = (value:unknown):value is OwnerAccessContactSlot => ownerContactSlots.includes(value as OwnerAccessContactSlot);

export function parseOwnerAccessCandidate(value:unknown):OwnerAccessCandidate|null {
  if (!record(value) || !exact(value,ownerAccessCandidateFields) || value.schema !== candidateSchema ||
    value.profile !== profile || value.network !== 'sui_mainnet' ||
    typeof value.chain_identifier !== 'string' || !opaque(value.chain_identifier,128) ||
    typeof value.operation_ref !== 'string' || !opaque(value.operation_ref,256) ||
    typeof value.transaction_bytes_digest !== 'string' || !sha.test(value.transaction_bytes_digest) ||
    typeof value.source_commit !== 'string' || !hex40.test(value.source_commit) ||
    typeof value.source_tree_sha256 !== 'string' || !sha.test(value.source_tree_sha256) ||
    typeof value.sender !== 'string' || !address.test(value.sender) ||
    typeof value.signer_public_key_base64 !== 'string' || !base64.test(value.signer_public_key_base64) ||
    typeof value.gas_budget_mist !== 'string' || !/^[1-9][0-9]{0,19}$/u.test(value.gas_budget_mist) ||
    typeof value.nonce !== 'string' || !sha.test(value.nonce) || !time(value.expires_at)) return null;
  return Object.freeze(structuredClone(value) as OwnerAccessCandidate);
}

export function parseOwnerAccessApprovalDraft(value:unknown):OwnerAccessApprovalDraft|null {
  if (!record(value) || !exact(value,ownerAccessApprovalDraftFields)) return null;
  const candidate = parseOwnerAccessCandidate(value.candidate);
  if (!candidate || !sha.test(String(value.binding_digest)) || !opaque(value.receipt_ref) ||
    !opaque(value.expected_approval_revision,128) || !transactionDigest.test(String(value.transaction_binding_digest)) ||
    !sha.test(String(value.evidence_manifest_digest))) return null;
  return Object.freeze({candidate,binding_digest:String(value.binding_digest),receipt_ref:String(value.receipt_ref),
    expected_approval_revision:String(value.expected_approval_revision),
    transaction_binding_digest:String(value.transaction_binding_digest),
    evidence_manifest_digest:String(value.evidence_manifest_digest)});
}

export function parseOwnerAccessApprovalInput(value:unknown):OwnerAccessApprovalInput|null {
  if (!record(value) || !exact(value,ownerAccessApprovalFields)) return null;
  const {candidate_digest_confirmation,...draftValue} = value;
  const draft = parseOwnerAccessApprovalDraft(draftValue);
  return draft && typeof candidate_digest_confirmation === 'string' && sha.test(candidate_digest_confirmation)
    ? Object.freeze({...draft,candidate_digest_confirmation}) : null;
}

export function parseOwnerAccessRecoveryStatus(value:unknown):OwnerAccessRecoveryStatus|null {
  if (!record(value)) return null;
  const hasPolicy = Object.hasOwn(value,'notification_policy');
  if (!exact(value,hasPolicy ? recoveryStatusFields : legacyRecoveryStatusFields) ||
    hasPolicy && !ownerAccessNotificationPolicies.includes(value.notification_policy as OwnerAccessNotificationPolicy) ||
    !ownerAccessRecoveryStates.includes(value.state as OwnerAccessRecoveryState) ||
    !(value.recovery_id === null || opaque(value.recovery_id,256)) ||
    !Array.isArray(value.proof_slots) || value.proof_slots.length > ownerContactSlots.length ||
    !value.proof_slots.every(slot) || new Set(value.proof_slots).size !== value.proof_slots.length ||
    !Array.isArray(value.notifications) || value.notifications.length > ownerContactSlots.length ||
    !(value.countdown_at === null || time(value.countdown_at)) || !(value.ready_at === null || time(value.ready_at))) return null;
  if (value.state === 'none' ? value.recovery_id !== null : value.recovery_id === null) return null;
  const seen = new Set<string>(), notifications: Array<{slot:OwnerAccessContactSlot;
    status:typeof ownerAccessNotificationStatuses[number]}> = [];
  for (const item of value.notifications) {
    if (!record(item) || !exact(item,['slot','status']) || !slot(item.slot) || seen.has(item.slot) ||
      !ownerAccessNotificationStatuses.includes(item.status as typeof ownerAccessNotificationStatuses[number])) return null;
    seen.add(item.slot); notifications.push(Object.freeze({slot:item.slot,
      status:item.status as typeof ownerAccessNotificationStatuses[number]}));
  }
  const policy = hasPolicy ? value.notification_policy as OwnerAccessNotificationPolicy : 'all-contacts-v1';
  const requiredNotices = getOwnerAccessNotificationSlots(policy);
  if (!notifications.every(item => requiredNotices.includes(item.slot))) return null;
  if (value.state === 'countdown' || value.state === 'completed') {
    if (value.proof_slots.length < 2 || notifications.length !== requiredNotices.length ||
      !requiredNotices.every(required => notifications.some(item => item.slot === required && item.status === 'accepted')) ||
      value.countdown_at === null || value.ready_at === null ||
      Date.parse(value.ready_at) - Date.parse(value.countdown_at) < 86_400_000) return null;
  }
  return Object.freeze({recovery_id:value.recovery_id as string|null,state:value.state as OwnerAccessRecoveryState,
    notification_policy:policy,
    proof_slots:Object.freeze([...value.proof_slots]) as unknown as readonly OwnerAccessContactSlot[],
    notifications:Object.freeze(notifications),countdown_at:value.countdown_at,ready_at:value.ready_at});
}

export function parseOwnerAccessContactDelivery(value:unknown):OwnerAccessContactDelivery|null {
  if (!record(value) || !exact(value,['recovery_id','slot','challenge_id','expires_at','delivery_status']) ||
    !opaque(value.recovery_id,256) || !slot(value.slot) || !opaque(value.challenge_id,256) || !time(value.expires_at) ||
    !ownerAccessDeliveryStatuses.includes(value.delivery_status as typeof ownerAccessDeliveryStatuses[number])) return null;
  return Object.freeze(value as unknown as OwnerAccessContactDelivery);
}

function requestOptions(value:unknown,expectedRpId:string):PublicKeyCredentialRequestOptionsJSON|null {
  if (!record(value)) return null;
  const publicKey = value.publicKey;
  if (!record(publicKey) || typeof publicKey.challenge !== 'string' || publicKey.challenge.length < 16 ||
    publicKey.rpId !== expectedRpId || publicKey.userVerification !== 'required' ||
    publicKey.allowCredentials !== undefined && (!Array.isArray(publicKey.allowCredentials) ||
      publicKey.allowCredentials.some(item => !record(item) || typeof item.id !== 'string' || item.type !== 'public-key'))) return null;
  return structuredClone(publicKey) as unknown as PublicKeyCredentialRequestOptionsJSON;
}

function creationOptions(value:unknown,expectedRpId:string):PublicKeyCredentialCreationOptionsJSON|null {
  if (!record(value)) return null;
  const publicKey = value.publicKey;
  if (!record(publicKey) || typeof publicKey.challenge !== 'string' || publicKey.challenge.length < 16 ||
    !record(publicKey.rp) || publicKey.rp.id !== expectedRpId || !record(publicKey.user) ||
    typeof publicKey.user.id !== 'string' || !publicKey.user.id || typeof publicKey.user.name !== 'string' ||
    typeof publicKey.user.displayName !== 'string' || !Array.isArray(publicKey.pubKeyCredParams) ||
    !publicKey.pubKeyCredParams.length || publicKey.pubKeyCredParams.length > 16 ||
    publicKey.pubKeyCredParams.some(item => !record(item) || item.type !== 'public-key' ||
      !Number.isSafeInteger(item.alg)) || !record(publicKey.authenticatorSelection) ||
    publicKey.authenticatorSelection.userVerification !== 'required' ||
    publicKey.excludeCredentials !== undefined && (!Array.isArray(publicKey.excludeCredentials) ||
      publicKey.excludeCredentials.some(item => !record(item) || typeof item.id !== 'string' ||
        item.type !== 'public-key'))) return null;
  return structuredClone(publicKey) as unknown as PublicKeyCredentialCreationOptionsJSON;
}

export function parseOwnerAccessApprovalCeremony(value:unknown,expectedRpId:string):OwnerAccessApprovalCeremony|null {
  if (!record(value) || !exact(value,['candidate_id','ceremony_id','options']) || !opaque(value.candidate_id,256) ||
    !opaque(value.ceremony_id,256)) return null;
  const options = requestOptions(value.options,expectedRpId);
  return options ? Object.freeze({candidate_id:value.candidate_id as string,
    ceremony_id:value.ceremony_id as string,options}) : null;
}

export function parseOwnerAccessCeremony(value:unknown,expectedRpId:string,
  kind:'authentication'|'registration'='authentication'):OwnerAccessCeremony|null {
  if (!record(value) || !exact(value,['ceremony_id','options']) || !opaque(value.ceremony_id,256)) return null;
  const options = kind === 'registration' ? creationOptions(value.options,expectedRpId) : requestOptions(value.options,expectedRpId);
  return options ? Object.freeze({ceremony_id:value.ceremony_id as string,kind,options}) as OwnerAccessCeremony : null;
}

export function parseOwnerAccessApprovalComplete(value:unknown):OwnerAccessApprovalComplete|null {
  if (!record(value) || !exact(value,['candidate_id','approval_ref','candidate_digest','expires_at']) ||
    !opaque(value.candidate_id,256) || !opaque(value.approval_ref,256) ||
    typeof value.candidate_digest !== 'string' || !sha.test(value.candidate_digest) || !time(value.expires_at)) return null;
  return Object.freeze(value as unknown as OwnerAccessApprovalComplete);
}

export function parseOwnerAccessApprovalStatus(value:unknown):OwnerAccessApprovalStatus|null {
  if (!record(value) || !exact(value,['candidate_id','candidate_digest','expires_at','state','approval_ref']) ||
    !opaque(value.candidate_id,256) || typeof value.candidate_digest !== 'string' || !sha.test(value.candidate_digest) ||
    !time(value.expires_at) || !['pending','approved','consumed','cancelled','expired'].includes(String(value.state))) return null;
  const terminal = value.state === 'approved' || value.state === 'consumed';
  if (terminal ? !opaque(value.approval_ref,256) : value.approval_ref !== null) return null;
  return Object.freeze(value as unknown as OwnerAccessApprovalStatus);
}

export function ownerAccessCanonicalJson(value:unknown):string {
  return JSON.stringify(sort(value));
  function sort(input:unknown):unknown {
    if (Array.isArray(input)) return input.map(sort);
    if (record(input)) return Object.fromEntries(Object.keys(input).sort().map(key => [key,sort(input[key])]));
    return input;
  }
}

export async function ownerAccessCandidateDigest(candidate:OwnerAccessCandidate):Promise<string> {
  const bytes = new TextEncoder().encode(ownerAccessCanonicalJson(candidate));
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
  return 'sha256:' + Array.from(digest, byte => byte.toString(16).padStart(2,'0')).join('');
}

export async function ownerAccessApprovalMatches(value:OwnerAccessApprovalInput):Promise<boolean> {
  return value.candidate_digest_confirmation === await ownerAccessCandidateDigest(value.candidate);
}
