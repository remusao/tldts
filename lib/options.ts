import extractHostnameDefault from './extract-hostname';

export interface IOptions {
  allowIcannDomains: boolean;
  allowPrivateDomains: boolean;
  extractHostname: (url: string) => string | null;
  validHosts: string[];
}

export function setDefaults({
  allowIcannDomains = true,
  allowPrivateDomains = false,
  extractHostname = extractHostnameDefault,
  validHosts = [],
}: Partial<IOptions> = {}): IOptions {
  return {
    allowIcannDomains,
    allowPrivateDomains,
    extractHostname,
    validHosts,
  };
}
