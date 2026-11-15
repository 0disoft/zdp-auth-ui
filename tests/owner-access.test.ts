import {expect,test} from 'bun:test';
import {
  ownerAccessApprovalMatches, ownerAccessCandidateDigest, parseOwnerAccessApprovalDraft,
  parseOwnerAccessApprovalInput, parseOwnerAccessApprovalCeremony, parseOwnerAccessRecoveryStatus
} from '../src/lib/owner-access';

const sha = (char:string) => 'sha256:'+char.repeat(64);
const candidate = () => ({schema:'doubloon.mainnet-owner-passkey-candidate/v1',
  profile:'mainnet:owner-passkey-contact-recovery:20261112',network:'sui_mainnet',
  chain_identifier:'4btiuiMPvEENsttpZC7CZ53DruC3MAgfznDbASZ7DR6S',
  operation_ref:'mainnet:publication:doubloon-owner-genesis-20261112',transaction_bytes_digest:sha('a'),
  source_commit:'b'.repeat(40),source_tree_sha256:sha('c'),sender:'0x'+'d'.repeat(64),
  signer_public_key_base64:'A6EHv/POEL4dcN0Y50vAmWfk1jCbpQ1fHdyGZBJVMbg=',gas_budget_mist:'100000000',
  nonce:sha('e'),expires_at:'2026-11-15T12:00:00.000Z'});
const draft = () => ({candidate:candidate(),binding_digest:sha('1'),receipt_ref:'receipt:owner-synthetic',
  expected_approval_revision:'7',transaction_binding_digest:sha('2'),evidence_manifest_digest:sha('3')});

test('candidate confirmation is the stable sorted JSON digest and is rechecked before handoff',async()=>{
  const value = parseOwnerAccessApprovalDraft(draft());expect(value).not.toBeNull();
  const digest = await ownerAccessCandidateDigest(value!.candidate);
  expect(digest).toMatch(/^sha256:[a-f0-9]{64}$/u);
  const input = parseOwnerAccessApprovalInput({...value,candidate_digest_confirmation:digest});
  expect(input).not.toBeNull();expect(await ownerAccessApprovalMatches(input!)).toBe(true);
  expect(await ownerAccessApprovalMatches({...input!,candidate_digest_confirmation:sha('f')})).toBe(false);
});

test('approval rejects raw/extra fields and malformed candidate pins',()=>{
  expect(parseOwnerAccessApprovalDraft({...draft(),extra:true})).toBeNull();
  for (const mutate of [(v:any)=>v.candidate.sender='fixture@example.test',
    (v:any)=>v.candidate.profile='legacy',(v:any)=>v.binding_digest='raw',
    (v:any)=>v.expected_approval_revision='',(v:any)=>v.candidate.expires_at='soon']) {
    const value=draft();mutate(value);expect(parseOwnerAccessApprovalDraft(value)).toBeNull();
  }
});

test('Core recovery projection is exact, redacted and fail-closed',()=>{
  const status = {recovery_id:'recovery-opaque',state:'countdown',proof_slots:['email_a','phone_b'],
    notifications:[{slot:'email_a',status:'accepted'},{slot:'email_b',status:'unknown'},
      {slot:'phone_a',status:'pending'},{slot:'phone_b',status:'rejected'}],
    countdown_at:'2026-11-15T12:00:00.000Z',ready_at:'2026-11-16T12:00:00.000Z'};
  expect(parseOwnerAccessRecoveryStatus(status)).toEqual(status);
  expect(parseOwnerAccessRecoveryStatus({...status,contact:'raw@example.test'})).toBeNull();
  expect(parseOwnerAccessRecoveryStatus({...status,proof_slots:['email_a','email_a']})).toBeNull();
  expect(parseOwnerAccessRecoveryStatus({...status,state:'authority_granted'})).toBeNull();
  expect(parseOwnerAccessRecoveryStatus({...status,recovery_id:null})).toBeNull();
  expect(parseOwnerAccessRecoveryStatus({recovery_id:null,state:'none',proof_slots:[],notifications:[],
    countdown_at:null,ready_at:null})?.state).toBe('none');
});

test('Core passkey options retain the expected RP and required user verification',()=>{
  const ceremony={candidate_id:'candidate-opaque',ceremony_id:'ceremony-opaque',options:{publicKey:{
    challenge:'synthetic-challenge-at-least-16',rpId:'8ailors.xyz',userVerification:'required',timeout:60000}}};
  expect(parseOwnerAccessApprovalCeremony(ceremony,'8ailors.xyz')?.options.rpId).toBe('8ailors.xyz');
  expect(parseOwnerAccessApprovalCeremony(ceremony,'evil.example')).toBeNull();
  expect(parseOwnerAccessApprovalCeremony({...ceremony,options:{...ceremony.options,publicKey:{...ceremony.options.publicKey,userVerification:'preferred'}}},'8ailors.xyz')).toBeNull();
});
