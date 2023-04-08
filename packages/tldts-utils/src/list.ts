import findBaseDir from './find-base-dir';
import { readFileSync } from 'fs';

export default function (): string {
  return readFileSync(findBaseDir('./publicsuffix/public_suffix_list.dat'), {
    encoding: 'utf-8',
  });
}
