export const appConfig = {
  network: (process.env.NEXT_PUBLIC_SUI_NETWORK ?? "testnet").toLowerCase(),
  packageId: process.env.NEXT_PUBLIC_PACKAGE_ID ?? "",
  platformId: process.env.NEXT_PUBLIC_PLATFORM_ID ?? "",
  moduleName: process.env.NEXT_PUBLIC_MODULE_NAME ?? "streampay_sc",
};

export const isChainConfigured =
  appConfig.packageId.length > 0 && appConfig.platformId.length > 0;
