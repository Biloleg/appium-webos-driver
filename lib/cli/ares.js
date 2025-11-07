import _ from 'lodash';
import log from '../logger';
import path from 'path';
import { exec } from 'teen_process';
import { fs, system } from 'appium/support';
import { Env } from '@humanwhocodes/env';

const ARES = 'ares.js';
const ARES_DEVICE = 'ares-device.js';
const ARES_INSTALL = 'ares-install.js';
const ARES_LAUNCH = 'ares-launch.js';
//const ARES_PACKAGE = 'ares-package';

const env = new Env();

const WEBOS_CLI_PATH_PREFIX = ['CLI', 'bin'];

/** @type {string} */
let LG_WEBOS_TV_SDK_HOME;
try {
  LG_WEBOS_TV_SDK_HOME = env.require('LG_WEBOS_TV_SDK_HOME');
} catch {
  throw new Error(`Ensure the "LG_WEBOS_TV_SDK_HOME" environment variable
is set; see https://webostv.developer.lge.com/sdk/command-line-interface/installation/
for more information`);
}

/**
 * Verify the existence of the LG WebOS CLI tools.
 *
 * @throws Error if the tools can't be verified
 */
const assertLgHome = _.once(async function assertLgHome() {
  const aresCliPath = path.resolve(LG_WEBOS_TV_SDK_HOME, ...WEBOS_CLI_PATH_PREFIX, ARES);
  try {
    // ensure the cli is executable
    await fs.access(aresCliPath, fs.constants.R_OK | fs.constants.X_OK);
  } catch {
    throw new Error(`Could not verify the appropriate LG WebOS TV ` +
                    `SDK binaries exist. Ensure the ` +
                    `LG_WEBOS_TV_SDK_HOME environment variable is set ` +
                    `and the CLI dir exists inside of it with accessible ` +
                    `permissions`);
  }
});

/**
 * Run an Ares related command
 * @param {string} bin - name of ares binary to run
 * @param {string[]} [args] - list of args to apply
 *
 * @returns {Promise<import('teen_process').ExecResult<string>>}
 */
async function runCmd(bin, args = []) {
  await assertLgHome();
  const _bin = path.resolve(LG_WEBOS_TV_SDK_HOME, ...WEBOS_CLI_PATH_PREFIX, bin);
  log.info(`Running command: ${_bin} ${args.join(' ')}`);
  try {
    return await exec(_bin, args, {shell: system.isWindows()});
  } catch (err) {
    const e = /** @type {import('teen_process').ExecError} */(err);
    const stdout = e.stdout?.replace(/[\r\n]+/, ' ');
    const stderr = e.stderr?.replace(/[\r\n]+/, ' ');
    e.message = `${e.message}. Stdout was: '${stdout}'. Stderr was: '${stderr}'`;
    throw e;
  }
}

/**
 * Run an Ares related command that takes an optional --device flag
 *
 * @param {string} bin - name of ares binary to run
 * @param {string} [deviceName] - device name/ID as shown in ares-setup-device
 * @param {string[]} [args] - array of args to apply to command
 *
 * @returns {Promise<import('teen_process').ExecResult<string>>}
 */
async function runDeviceCmd(bin, deviceName, args = []) {
  if (deviceName) {
    args.push('--device', deviceName);
  }
  return await runCmd(bin, args);
}

/**
 * Retrieve info about a device using ares-device
 *
 * @param {string} [deviceName] - device to explicitly get info for, otherwise default
 * @returns {Promise<Record<string, string>>}
 */
export async function getDeviceInfo(deviceName) {
  log.info(`Getting device info for device: ${deviceName || 'default'}`);
  try {
    let {stdout, stderr} = await runDeviceCmd(ARES_DEVICE, deviceName, ['-i']);
    log.debug(`ares-device stdout: ${stdout}`);
    log.debug(`ares-device stderr: ${stderr}`);
    stdout = stdout.trim();
    const dataParseRe = /^(.+?) : (.+)$/gm;
    const matches = stdout.matchAll(dataParseRe);
    const result = [...matches].reduce((acc, m) => {
      const key = m[1].trim();
      const value = m[2].trim();
      // Skip info/log lines that start with brackets
      if (!key.startsWith('[')) {
        acc[key] = value;
      }
      return acc;
    }, /** @type {Record<string,string>} */({}));
    log.debug(`Parsed device info: ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    log.error(`Failed to get device info: ${error.message}`);
    throw error;
  }
}

/**
 * Launch an installed app by its app id, including params if desired
 *
 * @param {string} appId - the app ID
 * @param {string} [deviceName] - device name to launch an app on
 * @param {import('type-fest').JsonObject} [launchParams] - dictionary of app launch parameters, will be JSON
 * stringified and passed to ares-launch
 */
export async function launchApp(appId, deviceName, launchParams) {
  log.info(`Launching app '${appId}'`);
  const args = [appId];
  if (launchParams) {
    args.push('--params', JSON.stringify(launchParams));
  }
  await runDeviceCmd(ARES_LAUNCH, deviceName, args);
}

/**
 * Close the current app
 * @param {string} appId
 * @param {string} [deviceName] - device name to close current app on
 */
export async function closeApp(appId, deviceName) {
  log.info(`Closing app '${appId}'`);
  await runDeviceCmd(ARES_LAUNCH, deviceName, ['-c', appId]);
}

/**
 * Install an IPK file to the device
 * @param {string} ipkPath - path to .ipk file
 * @param {string} appId - the package ID of the app
 * @param {string} [deviceName] - device name to install app on
 */
export async function installApp(ipkPath, appId, deviceName) {
  log.info(`Installing app '${appId}' from ${ipkPath}`);
  await runDeviceCmd(ARES_INSTALL, deviceName, [ipkPath]);
}

/**
 * Uninstall an app from the device
 * @param {string} appId - the package ID of the app
 * @param {string} [deviceName] - device name to uninstall app on
 */
export async function uninstallApp(appId, deviceName) {
  log.info(`Uninstalling app '${appId}'`);
  await runDeviceCmd(ARES_INSTALL, deviceName, ['-r', appId]);
}
