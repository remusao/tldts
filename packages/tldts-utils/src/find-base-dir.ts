import { existsSync } from 'fs';
import { resolve } from 'path';

export default function (target: string): string {
  let baseDir = __dirname;
  while (!existsSync(resolve(baseDir, target))) {
    const parent = resolve(baseDir, '../');
    // `resolve(root, '../')` returns `root` unchanged, so without this guard a
    // missing `target` would loop forever at the filesystem root. Fail loudly.
    if (parent === baseDir) {
      throw new Error(
        `find-base-dir: '${target}' not found in any ancestor of ${__dirname}`,
      );
    }
    baseDir = parent;
  }

  return resolve(baseDir, target);
}
