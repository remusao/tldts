interface IOptions {
    allowIcannDomains: boolean;
    allowPrivateDomains: boolean;
}
export interface IPublicSuffix {
    isIcann: boolean;
    isPrivate: boolean;
    publicSuffix: string | null;
}
export interface IRule {
    exception: boolean;
    isIcann: boolean;
    parts: string[];
    source: string;
}
interface ITrieObject {
    [s: string]: ITrieObject;
}
export default class SuffixTrie {
    exceptions: ITrieObject;
    rules: ITrieObject;
    constructor(rules: IRule[]);
    hasTld(value: string): boolean;
    suffixLookup(hostname: string, options: IOptions): IPublicSuffix | null;
}
export {};
