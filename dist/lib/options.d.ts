export interface IOptions {
    allowIcannDomains: boolean;
    allowPrivateDomains: boolean;
    extractHostname: (url: string, options: IOptions) => string | null;
    strictHostnameValidation: boolean;
    validHosts: string[];
}
export declare const defaultOptions: IOptions;
export declare function setDefaults(options?: Partial<IOptions>): IOptions;
