// ClientConfig is the object that is passed to configure the instantiation of the Uplo Daemon.
export interface ClientConfig {
  apiHost?: string;
  apiPort?: number;
  hostPort?: number;
  rpcPort?: number;
  agent?: string;
  apiAuthentication?: "auto" | boolean;
  apiAuthenticationPassword?: string;
  dataDirectory?: string;
  modules?: ModuleConfig;
}

// ModuleConfig defines modules available in Uplo.
export interface ModuleConfig {
  consensus: boolean;
  explorer: boolean;
  feeManager: boolean;
  gateway: boolean;
  host: boolean;
  miner: boolean;
  renter: boolean;
  transactionPool: boolean;
  wallet: boolean;
}

// UplodFlags defines all the possible configurable flag values for the Uplo Daemon.
export interface UplodFlags {
  agent?: string;
  "api-addr"?: string;
  "authenticate-api"?: boolean;
  "disable-api-security"?: boolean;
  "host-addr"?: string;
  modules?: string;
  "no-boostrap"?: boolean;
  profile?: string;
  "profile-directory"?: string;
  "rpc-addr"?: string;
  "uplo-directory"?: string;
  "temp-password"?: string;
}

//
