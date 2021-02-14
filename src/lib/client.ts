import { ChildProcess, spawn, SpawnOptions } from "child_process";
import * as path from "path";
import fs from "fs";
import http from "http";
import request from "request";
import rp from "request-promise-native";
import { Url } from "url";
import { parseFlags } from "./flags";
import { ClientConfig } from "./proto";
import { getUploPassword } from "./utils";
import {
  ConsensusGET,
  GatewayGET,
  DaemonVersion,
  WalletGET,
  RenterContracts,
  RenterGET,
  RenterRecoveryStatusGET,
  UploConstants,
  Allowance,
  RenterFiles,
  RenterDirectory,
  RenterFile,
  RenterFuse,
  RenterBackups,
} from "../models/models";

interface WalletAddressGET {
  address: string;
}

// https://uplo.tech/docs/#optional-wallet-parameters
interface WalletOptionalParams {
  encryptionpassword?: string;
  dictionary?: string;
  force?: boolean;
}

export class Client {
  // Set spawn to public because of the need for sinon stubbing, not sure if
  // there's a better way.
  // public spawn = spawn;
  protected config: ClientConfig;
  protected process: ChildProcess;
  protected agent: http.Agent;

  constructor(config: ClientConfig = {}) {
    try {
      if (config.dataDirectory) {
        fs.existsSync(config.dataDirectory);
      }
      const defaultConfig: ClientConfig = {
        apiAuthentication: "auto",
        apiHost: "localhost",
        apiPort: 9980,
        hostPort: 9982,
        rpcPort: 9981,
      };
      this.config = { ...defaultConfig, ...config };
      // If strategy is set to 'auto', attempt to read from default uplopassword file.
      if (this.config.apiAuthentication === "auto") {
        this.config.apiAuthenticationPassword = getUploPassword();
      }
      this.agent = new http.Agent({
        keepAlive: true,
        maxSockets: 30,
      });
    } catch (e) {
      throw new Error(e);
    }
  }

  public launch = (binPath: string, spawnOptions: SpawnOptions = {}): ChildProcess => {
    try {
      // Check if uplod exists
      if (fs.existsSync(binPath)) {
        // Create flags
        const flags = parseFlags(this.config);
        // Set euid if avl
        if (process.geteuid) {
          spawnOptions.uid = process.geteuid();
        }

        this.process = spawn(binPath, flags, spawnOptions);

        return this.process;
      } else {
        throw new Error("could not find binary file in filesystem");
      }
    } catch (e) {
      throw new Error(e);
    }
  };

  public makeRequest = async <T>(
    endpoint: string | Url,
    querystring?: object | undefined,
    method: string = "GET",
    timeout: number = 30000
  ): Promise<T> => {
    try {
      const requestOptions = this.mergeDefaultRequestOptions({
        url: endpoint,
        timeout,
        qs: querystring,
        method,
      });
      const data = await rp(requestOptions);
      return data;
    } catch (e) {
      throw e;
    }
  };

  // directly call method that is backwards compatible with Uplo.JS
  public call = (options: rp.OptionsWithUrl | string) => {
    if (typeof options === "string") {
      return this.makeRequest(options);
    } else {
      const endpoint = options.url;
      const method = options.method;
      const qs = options.qs || undefined;
      const timeout = options.timeout || undefined;
      return this.makeRequest(endpoint, qs, method, timeout);
    }
  };

  // DaemonVersion returns the /daemon/version endpoint
  public DaemonVersion = () => {
    return this.makeRequest<DaemonVersion>("/daemon/version");
  };

  // DaemonStop attempts to send a signal to /daemon/stop to initiate the
  // shutdown process
  public DaemonStop = () => {
    return this.makeRequest("/daemon/stop");
  };

  // Consensus returns the /consensus endpoint.
  public Consensus = () => {
    return this.makeRequest<ConsensusGET>("/consensus");
  };

  // Gateway returns the /gateway endpoint
  public Gateway = () => {
    return this.makeRequest<GatewayGET>("/gateway");
  };

  // Wallet returns the /wallet endpoint
  public Wallet = () => {
    return this.makeRequest<WalletGET>("/wallet");
  };

  // Renter returns the /renter endpoint. It includes allowance settings and financial metrics.
  public Renter = () => {
    return this.makeRequest<RenterGET>("/renter");
  };

  public PauseUploads = (duration: number) => {
    return this.call({
      url: "/renter/uploads/pause",
      method: "POST",
      qs: {
        duration,
      },
    });
  };

  public ResumeUploads = () => {
    return this.call({
      url: "/renter/uploads/resume",
      method: "POST",
    });
  };

  // Initialize a new wallet by posting to the /wallet/init endpoint
  public InitWallet = (encryptionpassword: string, dictionary: string, force: boolean) => {
    return this.call({
      url: "/wallet/init",
      method: "POST",
      qs: {
        encryptionpassword,
        dictionary,
        force,
      },
    });
  };

  // RestoreWallet restores a wallet from a seed string
  public RestoreWallet = (seed: string, params?: WalletOptionalParams) => {
    return this.call({
      url: "/wallet/init/seed",
      method: "POST",
      qs: {
        seed,
        ...params,
      },
      // long timeout because of how long the scan takes
      timeout: 60000 * 30,
    });
  };

  // UnlockWallet will unlock the uplod wallet with the supplied password
  public UnlockWallet = (encryptionpassword: string) => {
    return this.call({
      url: "/wallet/unlock",
      method: "POST",
      qs: {
        encryptionpassword,
      },
    });
  };

  // ChangePassword will update your current password
  public ChangePassword = (encryptionpassword: string, newpassword: string) => {
    return this.call({
      url: "/wallet/changepassword",
      method: "POST",
      qs: {
        encryptionpassword,
        newpassword,
      },
    });
  };

  // VerifyWalletPassword will verify whether the supplied password is valid
  public VerifyWalletPassword = (password: string) => {
    return this.makeRequest<{ valid: boolean }>("/wallet/verifypassword", {
      password,
    });
  };

  // GetAddress returns a single wallet address generated from uplod
  public GetAddress = () => {
    return this.makeRequest<WalletAddressGET>("/wallet/address");
  };

  // MountFuse attempts to mount the given uplomountpath to the local path with FUSE.
  public MountFuse = (mountpath: string, uplopath: string, readonly: boolean = true, allowother: boolean = false) => {
    return this.call({
      url: "/renter/fuse/mount",
      method: "POST",
      qs: {
        uplopath,
        mount: mountpath,
        readonly,
        allowother,
      },
    });
  };

  // UnmountFuse will unmount the existing mounted FUSE.
  public UnmountFuse = (mountpath: string) => {
    return this.call({
      url: "/renter/fuse/unmount",
      method: "POST",
      qs: {
        mount: mountpath,
      },
    });
  };

  // FuseSettings returns the FUSE api settings. Can be used to detect if FUSE
  // is currently mounted.
  public FuseSettings = () => {
    return this.makeRequest<RenterFuse>("/renter/fuse");
  };

  // GET /renter/backups wrapper
  public RenterBackups = () => {
    return this.makeRequest<RenterBackups>("/renter/backups");
  };

  // GetOrderedAddresses fetches addresses generated by the wallet in reverse
  // order. The last address generated by the wallet will be the first returned.
  // This also means that addresses which weren't generated using the wallet's
  // seed can't be retrieved with this endpoint.
  public GetOrderedAddresses = (count: number) => {
    return this.call({
      url: "/wallet/seedaddrs",
      method: "GET",
      qs: {
        count,
      },
    });
  };

  // GetContracts returns the state of all contracts from the renter.
  public GetContracts = () => {
    return this.makeRequest<RenterContracts>("/renter/contracts");
  };

  // RecoveryScanProgress returns the state of an ongoing contract recovery.
  public RecoveryScanProgress = () => {
    return this.makeRequest<RenterRecoveryStatusGET>("/renter/recoveryscan");
  };

  // Constants return the daemon constants.
  public Constants = () => {
    return this.makeRequest<UploConstants>("/daemon/constants");
  };

  // Sets the allowance on the renter
  public SetAllowance = (args: Allowance) => {
    return this.call({
      url: "/renter",
      method: "POST",
      qs: args,
    });
  };

  // Retrieves all the files from uplod
  public GetFiles = () => {
    return this.makeRequest<RenterFiles>("/renter/files");
  };

  public GetFile = (uplopath: string) => {
    const resolvedPath = path.posix.join("/renter/file", uplopath);
    return this.makeRequest<RenterFile>(resolvedPath);
  };

  // Upload helps upload a local file to Uplo
  public Upload = (uplopath: string, source: string, datapieces?: number, paritypieces?: number) => {
    const resolvedPath = path.posix.join("/renter/upload", uplopath);

    return this.call({
      url: encodeURI(resolvedPath),
      method: "POST",
      qs: {
        source,
        datapieces,
        paritypieces,
      },
    });
  };

  // GetDir returns the uplopath directory
  public GetDir = (uplodir: string) => {
    const resolvedPath = path.posix.join("/renter/dir", uplodir);
    return this.makeRequest<RenterDirectory>(resolvedPath);
  };

  // Will create an empty dir at the given dirpath
  public CreateDir = (dirpath: string, { recursive = false } = {}) => {
    const sep = path.posix.sep;
    if (!recursive) {
      const resolvedPath = path.posix.join("/renter/dir", dirpath);
      return this.call({
        url: resolvedPath,
        method: "POST",
        qs: {
          action: "create",
        },
      });
    }
    return dirpath.split(sep).reduce((parentDir, childDir) => {
      const currDir = path.posix.resolve(parentDir);
      try {
        if (childDir !== "") {
          const resolvedPath = path.posix.join("/renter/dir", path.join(parentDir, childDir));
          this.call({
            url: resolvedPath,
            method: "POST",
            qs: {
              action: "create",
            },
          });
        }
      } catch (e) {
        console.log("error ", e); // tslint:disable-line
      }
      return path.join(parentDir, currDir);
    }, "");
  };

  // Rename allows you to rename a uplopath with newuplopath
  public RenameFile = (uplopath: string, newuplopath: string) => {
    const resolvedPath = path.posix.join("/renter/rename", uplopath);
    return this.call({
      url: resolvedPath,
      method: "POST",
      qs: {
        newuplopath,
      },
    });
  };

  // RenameDir allows you to rename a dir uplopath to a new uplopath
  public RenameDir = (dirpath: string, newpath: string) => {
    const resolvedPath = path.posix.join("/renter/dir", dirpath);
    return this.call({
      url: resolvedPath,
      method: "POST",
      qs: {
        action: "rename",
        newuplopath: newpath,
      },
    });
  };

  // hasExistingWallet is a helper resolves a boolean value stating whether the
  // daemon has an exiting wallet attached or not.
  public hasExistingWallet = async (): Promise<boolean> => {
    const w = await this.Wallet();
    // if wallet is not encrypted, and it's locked, then a wallet has not be
    // initiated.
    if (!w.encrypted && !w.unlocked) {
      return true;
    } else {
      return false;
    }
  };

  // Checks if uplod responds to a /version call
  public isRunning = async (): Promise<boolean> => {
    if (this.process) {
      try {
        await this.DaemonVersion();
        return true;
      } catch (e) {
        return false;
      }
    } else {
      try {
        await this.DaemonVersion();
        return true;
      } catch (e) {
        return false;
      }
    }
  };

  public getConnectionUrl = (): string => {
    if (!this.config.apiAuthenticationPassword) {
      this.config.apiAuthenticationPassword = getUploPassword();
    }
    return `http://:${this.config.apiAuthenticationPassword}@${this.config.apiHost}:${this.config.apiPort}`;
  };

  private mergeDefaultRequestOptions = (opts: rp.OptionsWithUrl): rp.OptionsWithUrl => {
    // These are the default config sourced from the Uplo Agent
    const defaultOptions: request.CoreOptions = {
      baseUrl: this.getConnectionUrl(),
      headers: {
        "User-Agent": this.config.agent || "Uplo-Agent",
      },
      json: true,
      pool: this.agent,
      timeout: 30000,
    };
    const formattedOptions = { ...defaultOptions, ...opts };
    return formattedOptions;
  };
}
