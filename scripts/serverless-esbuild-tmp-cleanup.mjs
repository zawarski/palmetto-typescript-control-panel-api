/**
 * Remove the temp folders serverless-esbuild leaks on every package/deploy.
 *
 * serverless-esbuild (1.54+) zips each artifact through a folder named
 * `<artifact>-<pid>-<timestamp>-<8 hex>` under os.tmpdir(), then deletes it with a
 * non-recursive remove that fails on a directory and swallows the error
 * (dist/utils/effect-fs.js `safeFileRemove`). With `package.individually` that is
 * one folder per function per run, which piles up to tens of GB in $TMPDIR.
 *
 * Only folders created by this process (matching pid) for this service's
 * artifacts are removed. Delete this plugin once serverless-esbuild passes
 * `{ recursive: true }` to that remove.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

export default class ServerlessEsbuildTmpCleanup {
  constructor(serverless) {
    this.serverless = serverless;
    const cleanup = () => this.cleanup();
    this.hooks = {
      'after:package:createDeploymentArtifacts': cleanup,
      'after:deploy:function:packageFunction': cleanup,
    };
    // Packaging that fails midway skips the after hooks.
    process.once('exit', cleanup);
  }

  cleanup() {
    const { service } = this.serverless;
    const artifacts = [service.service, ...service.getAllFunctions()];
    const suffix = new RegExp(`^-${process.pid}-\\d+-[0-9a-f]{8}$`);
    const tmp = os.tmpdir();

    let entries;
    try {
      entries = fs.readdirSync(tmp);
    } catch {
      return;
    }

    entries
      .filter((entry) => artifacts.some((name) => entry.startsWith(name) && suffix.test(entry.slice(name.length))))
      .forEach((entry) => fs.rmSync(path.join(tmp, entry), { recursive: true, force: true }));
  }
}
