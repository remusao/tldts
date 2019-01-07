export interface IOptions {
  allowIcannDomains: boolean;
  allowPrivateDomains: boolean;
  extractHostname: boolean;
  validHosts: string[] | null;
}

export function setDefaults({
  allowIcannDomains = true,
  allowPrivateDomains = false,
  extractHostname = true,
  validHosts = null,
}: Partial<IOptions> = {}): IOptions {
  return {
    allowIcannDomains,
    allowPrivateDomains,
    extractHostname,
    validHosts,
  };
}
