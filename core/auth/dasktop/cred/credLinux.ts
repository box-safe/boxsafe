/***
 * @fileoverview
 * Manages credentials using Linux secret-tool
 * @module
 * memo/desktop/pass
 ***/
import { exec } from 'child_process';
import { promisify } from 'util';
import { ANSI } from '@util/ANSI';
import { Logger } from '@core/util/logger';

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
const logger = Logger.createModuleLogger('CredentialManager');

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
    logger.error(`Failed to save credential: ${err}`);
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
    logger.error(`Credential not found: ${account}`);
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
    logger.error(`Failed to delete credential: ${account}`);
    return false;
  }
}

