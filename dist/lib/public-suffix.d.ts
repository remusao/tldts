import { IOptions } from './options';
import Trie, { IPublicSuffix } from './suffix-trie';
export default function getPublicSuffix(rules: Trie, hostname: string, options: IOptions): IPublicSuffix;
