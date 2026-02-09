/***
 * @fileoverview
 * Manages credentials using Linux secret-tool
 * @module
 * memo/desktop/pass
 ***/
import { exec } from 'child_process';
import { promisify } from 'util';
import { ANSI } from '@util/ANSI';

const execAsync = promisify(exec);

interface CredentialArgs {
  password: string;
  label: string;
  account: string;
  service?: string;
}

interface LookupArgs {
  account: string;
  service?: string;
}

const DEFAULT_SERVICE = 'box-safe';

/**
 * Saves credential to the system keyring
 */
export async function setCredLinux({
  password,
  label,
  account,
  service = DEFAULT_SERVICE,
}: CredentialArgs): Promise<boolean> {
  try {
    await execAsync(
      `echo -n "${password}" | secret-tool store --label="${label}" service ${service} account ${account}`
    );
    return true;
  } catch (err) {
    console.error(`${ANSI.Red}[Error] Failed to save credential: ${err}${ANSI.Reset}`);
    return false;
  }
}

/**
 * Retrieves credential from the keyring
 */
export async function getCredLinux({
  account,
  service = DEFAULT_SERVICE,
}: LookupArgs): Promise<string | null> {
  try {
    const { stdout } = await execAsync(
      `secret-tool lookup service ${service} account ${account}`
    );
    return stdout.trim();
  } catch (err) {
    console.error(`${ANSI.Red}[Error] Credential not found: ${account}${ANSI.Reset}`);
    return null;
  }
}

/**
 * Deletes credential from the keyring
 */
export async function deleteCredLinux({
  account,
  service = DEFAULT_SERVICE,
}: LookupArgs): Promise<boolean> {
  try {
    await execAsync(`secret-tool clear service ${service} account ${account}`);
    return true;
  } catch (err) {
    console.error(`${ANSI.Red}[Error] Failed to delete credential: ${account}${ANSI.Reset}`);
    return false;
  }
}

