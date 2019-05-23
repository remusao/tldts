export interface IOptions {
  allowIcannDomains: boolean;
  allowPrivateDomains: boolean;
  detectIp: boolean;
  extractHostname: boolean;
  mixedInputs: boolean;
  validHosts: string[] | null;
  validateHostname: boolean;
}

function setDefaultsImpl({
  allowIcannDomains = true,
  allowPrivateDomains = false,
  detectIp = true,
  extractHostname = true,
  mixedInputs = true,
  validHosts = null,
  validateHostname = true,
}: Partial<IOptions>): IOptions {
  return {
    allowIcannDomains,
    allowPrivateDomains,
    detectIp,
    extractHostname,
    mixedInputs,
    validHosts,
    validateHostname,
  };
}

const DEFAULT_OPTIONS = setDefaultsImpl({});

export function setDefaults(options?: Partial<IOptions>): IOptions {
  if (options === undefined) {
    return DEFAULT_OPTIONS;
  }

  return setDefaultsImpl(options);
}
