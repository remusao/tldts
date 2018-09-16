import { IOptions } from './options';
interface IResult {
    host: string | null;
    isValid: boolean | null;
    isIp: boolean;
    subdomain: string | null;
    domain: string | null;
    publicSuffix: string | null;
    isIcann: boolean | null;
    isPrivate: boolean | null;
}
export declare function update(rules: string): void;
export declare function reset(): void;
export declare function parse(url: string, options?: Partial<IOptions>): IResult;
export declare function isValidHostname(url: string, options?: Partial<IOptions>): boolean;
export declare function getPublicSuffix(url: string, options?: Partial<IOptions>): string | null;
export declare function getDomain(url: string, options?: Partial<IOptions>): string | null;
export declare function getSubdomain(url: string, options?: Partial<IOptions>): string | null;
export declare function getHostname(url: string, options?: Partial<IOptions>): string | null;
export {};
