import extractHostname from './clean-host';

export interface IOptions {
  allowIcannDomains: boolean;
  allowPrivateDomains: boolean;
  extractHostname: (url: string, options: IOptions) => string | null;
  strictHostnameValidation: boolean;
  validHosts: string[];
}

// This is the set of possible options which can be used to customize tldjs,
// with their default values.
export const defaultOptions: IOptions = {
  allowIcannDomains: true,
  allowPrivateDomains: false,
  extractHostname,
  strictHostnameValidation: false,
  validHosts: [],
};

export function setDefaults(options?: Partial<IOptions>): IOptions {
  if (options === undefined) {
    return defaultOptions;
  }

  // Merge options
  return Object.assign({}, defaultOptions, options);
}
