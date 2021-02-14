// helpers
const maxUnixTSInSeconds = 9999999999;

function ParseDate(d: Date | number | string): Date {
  if (d instanceof Date) return d;
  if (typeof d === "number") {
    if (d > maxUnixTSInSeconds) return new Date(d);
    return new Date(d * 1000); // go ts
  }
  return new Date(d);
}

function ParseNumber(v: number | string, isInt = false): number {
  if (!v) return 0;
  if (typeof v === "number") return v;
  return (isInt ? parseInt(v, 10) : parseFloat(v)) || 0;
}

function FromArray<T>(Ctor: new (v: any) => T, data?: any[] | any, def = null): T[] | null {
  if (!data || !Object.keys(data).length) return def;
  const d = Array.isArray(data) ? data : [data];
  return d.map((v: any) => new Ctor(v));
}

function ToObject(o: any, typeOrCfg: any = {}, child = false): any {
  if (!o) return null;
  if (typeof o.toObject === "function" && child) return o.toObject();

  switch (typeof o) {
    case "string":
      return typeOrCfg === "number" ? ParseNumber(o) : o;
    case "boolean":
    case "number":
      return o;
  }

  if (o instanceof Date) {
    return typeOrCfg === "string" ? o.toISOString() : Math.floor(o.getTime() / 1000);
  }

  if (Array.isArray(o)) return o.map((v: any) => ToObject(v, typeOrCfg, true));

  const d: any = {};

  for (const k of Object.keys(o)) {
    const v: any = o[k];
    if (!v) continue;
    d[k] = ToObject(v, typeOrCfg[k] || {}, true);
  }

  return d;
}

// structs
// struct2ts:github.com/uplo-tech/Uplo/types.UploPublicKey
export interface UploPublicKey {
  algorithm: string;
  key: string;
}

// struct2ts:github.com/uplo-tech/Uplo/types.UnlockConditions
export interface UnlockConditions {
  timelock: number;
  publickeys: UploPublicKey[];
  signaturesrequired: number;
}

// struct2ts:github.com/uplo-tech/Uplo/types.UplocoinInput
export interface UplocoinInput {
  parentid: string;
  unlockconditions: UnlockConditions;
}

// struct2ts:github.com/uplo-tech/Uplo/types.Currency
export interface Currency {} // tslint:disable-line

// struct2ts:github.com/uplo-tech/Uplo/types.UplocoinOutput
export interface UplocoinOutput {
  value: string;
  unlockhash: string;
}

// struct2ts:github.com/uplo-tech/Uplo/types.FileContract
export interface FileContract {
  filesize: number;
  filemerkleroot: number[];
  windowstart: number;
  windowend: number;
  payout: string;
  validproofoutputs: UplocoinOutput[];
  missedproofoutputs: UplocoinOutput[];
  unlockhash: string;
  revisionnumber: number;
}

// struct2ts:github.com/uplo-tech/Uplo/types.FileContractRevision
export interface FileContractRevision {
  parentid: string;
  unlockconditions: UnlockConditions;
  newrevisionnumber: number;
  newfilesize: number;
  newfilemerkleroot: number[];
  newwindowstart: number;
  newwindowend: number;
  newvalidproofoutputs: UplocoinOutput[];
  newmissedproofoutputs: UplocoinOutput[];
  newunlockhash: number[];
}

// struct2ts:github.com/uplo-tech/Uplo/types.StorageProof
export interface StorageProof {
  parentid: string;
  segment: number[];
  hashset: string[];
}

// struct2ts:github.com/uplo-tech/Uplo/types.UplofundInput
export interface UplofundInput {
  parentid: string;
  unlockconditions: UnlockConditions;
  claimunlockhash: number[];
}

// struct2ts:github.com/uplo-tech/Uplo/types.UplofundOutput
export interface UplofundOutput {
  value: string;
  unlockhash: string;
  claimstart: string;
}

// struct2ts:github.com/uplo-tech/Uplo/types.CoveredFields
export interface CoveredFields {
  wholetransaction: boolean;
  uplocoininputs: number[];
  uplocoinoutputs: number[];
  filecontracts: number[];
  filecontractrevisions: number[];
  storageproofs: number[];
  uplofundinputs: number[];
  uplofundoutputs: number[];
  minerfees: number[];
  arbitrarydata: number[];
  transactionsignatures: number[];
}

// struct2ts:github.com/uplo-tech/Uplo/types.TransactionSignature
export interface TransactionSignature {
  parentid: string;
  publickeyindex: number;
  timelock: number;
  coveredfields: CoveredFields;
  signature: string;
}

// struct2ts:github.com/uplo-tech/Uplo/types.Transaction
export interface Transaction {
  uplocoininputs: UplocoinInput[];
  uplocoinoutputs: UplocoinOutput[];
  filecontracts: FileContract[];
  filecontractrevisions: FileContractRevision[];
  storageproofs: StorageProof[];
  uplofundinputs: UplofundInput[];
  uplofundoutputs: UplofundOutput[];
  minerfees: Currency[];
  arbitrarydata: any[];
  transactionsignatures: TransactionSignature[];
}

// struct2ts:github.com/uplo-tech/Uplo/modules.ProcessedInput
export interface ProcessedInput {
  parentid: string;
  fundtype: string;
  walletaddress: boolean;
  relatedaddress: string;
  value: string;
}

// struct2ts:github.com/uplo-tech/Uplo/modules.ProcessedOutput
export interface ProcessedOutput {
  id: string;
  fundtype: string;
  maturityheight: number;
  walletaddress: boolean;
  relatedaddress: string;
  value: string;
}

// struct2ts:github.com/uplo-tech/Uplo/modules.ValuedTransaction
export interface ValuedTransaction {
  transaction: Transaction;
  transactionid: string;
  confirmationheight: number;
  confirmationtimestamp: number;
  inputs: ProcessedInput[];
  outputs: ProcessedOutput[];
  confirmedincomingvalue: string;
  confirmedoutgoingvalue: string;
}

// struct2ts:github.com/uplo-tech/Uplo/modules.ProcessedTransaction
export interface ProcessedTransaction {
  transaction: Transaction;
  transactionid: string;
  confirmationheight: number;
  confirmationtimestamp: number;
  inputs: ProcessedInput[];
  outputs: ProcessedOutput[];
}

// struct2ts:math/big.Rat
export interface Rat {} // tslint:disable-line

// struct2ts:github.com/uplo-tech/Uplo/node/api.ConsensusGET
export interface ConsensusGET {
  synced: boolean;
  height: number;
  currentblock: number[];
  target: number[];
  difficulty: string;
  blockfrequency: number;
  blocksizelimit: number;
  extremefuturethreshold: number;
  futurethreshold: number;
  genesistimestamp: number;
  maturitydelay: number;
  mediantimestampwindow: number;
  uplofundcount: string;
  uplofundportion: Rat | null;
  initialcoinbase: number;
  minimumcoinbase: number;
  roottarget: number[];
  rootdepth: number[];
  uplocoinprecision: string;
}

// struct2ts:github.com/uplo-tech/Uplo/modules.Peer
export interface Peer {
  inbound: boolean;
  local: boolean;
  netaddress: string;
  version: string;
}

// struct2ts:github.com/uplo-tech/Uplo/node/api.GatewayGET
export interface GatewayGET {
  netaddress: string;
  peers: Peer[];
  online: boolean;
  maxdownloadspeed: number;
  maxuploadspeed: number;
}

// struct2ts:github.com/uplo-tech/Uplo/node/api.DaemonVersion
export interface DaemonVersion {
  version: string;
  gitrevision: string;
  buildtime: string;
}

// struct2ts:github.com/uplo-tech/Uplo/node/api.WalletGET
export interface WalletGET {
  encrypted: boolean;
  height: number;
  rescanning: boolean;
  unlocked: boolean;
  confirmeduplocoinbalance: string;
  unconfirmedoutgoinguplocoins: string;
  unconfirmedincominguplocoins: string;
  uplocoinclaimbalance: string;
  uplofundbalance: string;
  dustthreshold: string;
}

// struct2ts:github.com/uplo-tech/Uplo/node/api.WalletInitPOST
export interface WalletInitPOST {
  primaryseed: string;
}

// struct2ts:github.com/uplo-tech/Uplo/node/api.RenterContract
export interface RenterContract {
  downloadspending: string;
  endheight: number;
  fees: string;
  hostpublickey: UploPublicKey;
  hostversion: string;
  id: string;
  lasttransaction: Transaction;
  netaddress: string;
  renterfunds: string;
  size: number;
  startheight: number;
  storagespending: string;
  StorageSpending: string;
  totalcost: string;
  uploadspending: string;
  goodforupload: boolean;
  goodforrenew: boolean;
}

// struct2ts:github.com/uplo-tech/Uplo/modules.RecoverableContract
export interface RecoverableContract {
  filesize: number;
  filemerkleroot: number[];
  windowstart: number;
  windowend: number;
  payout: string;
  validproofoutputs: UplocoinOutput[];
  missedproofoutputs: UplocoinOutput[];
  unlockhash: string;
  revisionnumber: number;
  id: string;
  hostpublickey: UploPublicKey;
  inputparentid: number[];
  startheight: number;
  txnfee: string;
}

// struct2ts:github.com/uplo-tech/Uplo/node/api.RenterContracts
export interface RenterContracts {
  contracts: RenterContract[];
  inactivecontracts: RenterContract[];
  activecontracts: RenterContract[];
  passivecontracts: RenterContract[];
  refreshedcontracts: RenterContract[];
  disabledcontracts: RenterContract[];
  expiredcontracts: RenterContract[];
  expiredrefreshedcontracts: RenterContract[];
  recoverablecontracts: RecoverableContract[];
}

// struct2ts:github.com/uplo-tech/Uplo/modules.Allowance
export interface Allowance {
  funds: string;
  hosts: number;
  period: number;
  renewwindow: number;
  expectedstorage: number;
  expectedupload: number;
  expecteddownload: number;
  expectedredundancy: number;
}

// struct2ts:github.com/uplo-tech/Uplo/modules.RenterSettings
export interface RenterSettings {
  allowance: Allowance;
  ipviolationcheck: boolean;
  maxuploadspeed: number;
  maxdownloadspeed: number;
}

// struct2ts:github.com/uplo-tech/Uplo/modules.ContractorSpending
export interface ContractorSpending {
  contractfees: string;
  downloadspending: string;
  storagespending: string;
  totalallocated: string;
  uploadspending: string;
  unspent: string;
  contractspending: string;
  withheldfunds: string;
  releaseblock: number;
  previousspending: string;
}

// struct2ts:github.com/uplo-tech/Uplo/node/api.RenterGET
export interface RenterGET {
  settings: RenterSettings;
  financialmetrics: ContractorSpending;
  currentperiod: number;
  nextperiod: number;
}

// struct2ts:github.com/uplo-tech/Uplo/node/api.RenterRecoveryStatusGET
export interface RenterRecoveryStatusGET {
  scaninprogress: boolean;
  scannedheight: number;
}

// struct2ts:github.com/uplo-tech/Uplo/node/api.UploConstants
export interface UploConstants {
  blockfrequency: number;
  blocksizelimit: number;
  extremefuturethreshold: number;
  futurethreshold: number;
  genesistimestamp: number;
  maturitydelay: number;
  mediantimestampwindow: number;
  uplofundcount: string;
  uplofundportion: Rat | null;
  targetwindow: number;
  initialcoinbase: number;
  minimumcoinbase: number;
  roottarget: number[];
  rootdepth: number[];
  defaultallowance: Allowance;
  maxadjustmentup: Rat | null;
  maxadjustmentdown: Rat | null;
  maxtargetadjustmentup: Rat | null;
  maxtargetadjustmentdown: Rat | null;
  uplocoinprecision: string;
}

// struct2ts:github.com/uplo-tech/Uplo/modules.FileInfo
export interface FileInfo {
  accesstime: Date;
  available: boolean;
  changetime: Date;
  ciphertype: string;
  createtime: Date;
  expiration: number;
  filesize: number;
  health: number;
  localpath: string;
  maxhealth: number;
  maxhealthpercent: number;
  modtime: Date;
  numstuckchunks: number;
  ondisk: boolean;
  recoverable: boolean;
  redundancy: number;
  renewing: boolean;
  uplopath: string;
  stuck: boolean;
  stuckhealth: number;
  uploadedbytes: number;
  uploadprogress: number;
}

// struct2ts:github.com/uplo-tech/Uplo/node/api.RenterFiles
export interface RenterFiles {
  files: FileInfo[];
}

// struct2ts:github.com/uplo-tech/Uplo/node/api.RenterFile
export interface RenterFile {
  file: FileInfo;
}

// struct2ts:github.com/uplo-tech/Uplo/modules.DirectoryInfo
export interface DirectoryInfo {
  aggregatehealth: number;
  aggregatelasthealthchecktime: Date;
  aggregatemaxhealth: number;
  aggregatemaxhealthpercentage: number;
  aggregateminredundancy: number;
  aggregatemostrecentmodtime: Date;
  aggregatenumfiles: number;
  aggregatenumstuckchunks: number;
  aggregatenumsubdirs: number;
  aggregatesize: number;
  aggregatestuckhealth: number;
  health: number;
  lasthealthchecktime: Date;
  maxhealthpercentage: number;
  maxhealth: number;
  minredundancy: number;
  mostrecentmodtime: Date;
  numfiles: number;
  numstuckchunks: number;
  numsubdirs: number;
  uplopath: string;
  size: number;
  stuckhealth: number;
}

// struct2ts:github.com/uplo-tech/Uplo/node/api.RenterDirectory
export interface RenterDirectory {
  directories: DirectoryInfo[];
  files: FileInfo[];
}

export interface RenterFuseMountpoint {
  mountpoint: string;
  uplopath: string;
  mountoptions: {
    allowother: boolean;
    readonly: boolean;
  };
}

export interface RenterFuse {
  mountpoints: RenterFuseMountpoint[] | null;
}

export interface RenterBackups {
  backups: {
    name: string;
    creationdate: number;
    size: number;
    uploadprogress: number;
  }[];
  syncedhosts: {
    algorithm: string;
    key: string;
  }[];
  unsyncedhosts: {
    algorithm: string;
    key: string;
  }[];
}

// exports
export { ParseDate, ParseNumber, FromArray, ToObject };
