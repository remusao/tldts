import extractHostnameDefault from './clean-host';

export interface IOptions {
  allowIcannDomains: boolean;
  allowPrivateDomains: boolean;
  extractHostname: (url: string, options: IOptions) => string | null;
  strictHostnameValidation: boolean;
  validHosts: string[];
}

export function setDefaults({
  allowIcannDomains = true,
  allowPrivateDomains = false,
  extractHostname = extractHostnameDefault,
  strictHostnameValidation = false,
  validHosts = [],
}: Partial<IOptions> = {}): IOptions {
  return {
    allowIcannDomains,
    allowPrivateDomains,
    extractHostname,
    strictHostnameValidation,
    validHosts,
  };
}
