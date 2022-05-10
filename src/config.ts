import { CHAIN_NAMESPACES } from "@web3auth/base";

export const web3AuthParams = {
  chainConfig: { chainNamespace: CHAIN_NAMESPACES.SOLANA },
  clientId: "YOUR_CLIENT_ID",
  uiConfig: {
    appLogo: "https://cryptologos.cc/logos/pancakeswap-cake-logo.svg",
    loginMethodsOrder: ["twitter", "facebook", "google"],
    theme: "dark",
  },
};
