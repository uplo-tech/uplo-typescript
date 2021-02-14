import fs from "fs";
import os from "os";
import path from "path";

/**
 * Works similarly to Object.assign, but checks properties for undefined or
 * null values, skipping them if detected.
 * @param target
 * @param sources
 */
export function assignDefined(target: object, ...sources: object[]) {
  for (const source of sources) {
    for (const key of Object.keys(source)) {
      const val = source[key];
      if (val !== undefined && val !== null) {
        target[key] = val;
      }
    }
  }
  return target;
}

/**
 * Retrieves the API password using the UPLO_API_PASSWORD env variable or
 * attempt to read the local dir with fs.
 */
export function getUploPassword() {
  try {
    let configPath;
    switch (process.platform) {
      case "win32":
        configPath = path.join(process.env.LOCALAPPDATA as string, "Uplo");
        break;
      case "darwin":
        configPath = path.join(os.homedir(), "Library", "Application Support", "Uplo");
        break;
      default:
        configPath = path.join(os.homedir(), ".uplo");
    }
    const password = process.env.UPLO_API_PASSWORD
      ? process.env.UPLO_API_PASSWORD
      : fs.readFileSync(path.join(configPath, "apipassword")).toString();
    return password.trim() || "";
  } catch (err) {
    // if apipassword doesn't exist, we'll just return an empty string
    return "";
  }
}
