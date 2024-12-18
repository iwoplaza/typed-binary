// @ts-check
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import process from 'node:process';
import arg from 'arg';
import z from 'zod';
import colors from './_colors.mjs';

const ReleaseChannel = z.enum(['alpha']);

/** @typedef {z.infer<typeof ReleaseChannel>} ReleaseChannel */

const args = arg({});
const cwd = new URL(`file:${process.cwd()}/`);
const packageJsonUrl = new URL('./package.json', cwd);

const pkg = JSON.parse(await fs.readFile(packageJsonUrl, 'utf-8'));

/**
 * @param {string} version
 * @returns {z.infer<typeof ReleaseChannel> | null}
 */
function extractChannel(version) {
  if (/[a-zA-Z]/.test(version)) {
    const channel = Object.values(ReleaseChannel.Values).find((c) =>
      version.includes(c),
    );

    if (!channel) {
      throw new Error(`Unrecognized channel: ${channel}`);
    }

    return channel;
  }

  return null;
}

const channel = extractChannel(pkg.version);

/**
 * @param {string} command The command to run
 * @param {string[]} params The command to run
 * @returns {Promise<number>} The exit code of the process
 */
function promiseSpawn(command, params) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, params);

    childProcess.on('close', (code) => {
      if (code === undefined || code !== 0) {
        reject(code);
      } else {
        resolve(code ?? 1);
      }
    });

    childProcess.stdout?.pipe(process.stdout);
    childProcess.stderr?.pipe(process.stderr);
  });
}

async function main() {
  console.log(
    `\
Release channel: ${colors.Cyan}${channel ?? '<LATEST>'}${colors.Reset}
`,
  );

  try {
    await promiseSpawn('pnpm', [
      'publish',
      '--provenance',
      ...(channel ? ['--tag', channel] : []),
      ...args._,
    ]);
  } catch (e) {
    console.error('pnpm publish error code:', e);
    process.exit(1);
  }

  console.log(
    `

-------------------------------------------------------------------------

Package published!
`,
  );
}

main();
