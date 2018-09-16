import { IOptions } from './options';
import Trie from './suffix-trie';
export interface IPublicSuffix {
    isIcann: boolean;
    isPrivate: boolean;
    publicSuffix: string | null;
}
export default function getPublicSuffix(rules: Trie, hostname: string, options: IOptions): IPublicSuffix;
