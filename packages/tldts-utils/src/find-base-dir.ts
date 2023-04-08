import { existsSync } from 'fs';
import { resolve } from 'path';

export default function (target: string): string {
  let baseDir = __dirname;
  while (!existsSync(resolve(baseDir, target))) {
    baseDir = resolve(baseDir, '../');
  }

  return resolve(baseDir, target);
}
