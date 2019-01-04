export interface IPublicSuffix {
  isIcann: boolean;
  isPrivate: boolean;
  publicSuffix: string | null;
}

export interface ISuffixLookupOptions {
  allowIcannDomains: boolean;
  allowPrivateDomains: boolean;
}
