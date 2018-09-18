interface IOptions {
    allowIcannDomains: boolean;
    allowPrivateDomains: boolean;
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
    suffixLookup(hostname: string, options: IOptions): any;
}
export {};
