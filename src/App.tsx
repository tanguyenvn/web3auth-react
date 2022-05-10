import { ADAPTER_EVENTS, CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import { Web3Auth } from "@web3auth/web3auth";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";
import { useEffect, useState } from "react";
import "./App.css";
import RPC from "./evm";

const clientId = "BGV4-kQPMPcy8kEQbVfLt06Wy_lhHuUc8kwYghw9xOPLktP69uYsXKq6tK17B0YE7sVeau57-LkWoqb-kaeJK3I"; // get from https://dashboard.web3auth.io

function App() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
  const [torusWalletPrivider, setTorusWalletPrivider] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const web3AuthCtorParams = {
          clientId,
          chainConfig: { 
            chainNamespace: CHAIN_NAMESPACES.EIP155, 
            chainId: "0x5",
            rpcTarget: "https://goerli.infura.io/v3/5abea0fbee444012b28c18a783050f2f", 
          },
        };
        const web3auth = new Web3Auth(web3AuthCtorParams);

        // OPENLOGIN ADAPTER
        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            clientId,
            network: "testnet",
            uxMode: "redirect",
          },
        });
        web3auth.configureAdapter(openloginAdapter);

        // TORUS WALLET PLUGIN
        const torusPlugin = new TorusWalletConnectorPlugin({
          torusWalletOpts: {},
          walletInitOptions: {
            whiteLabel: {
              theme: { isDark: false, colors: { primary: "#00a8ff" } },
              logoDark: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
              logoLight: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
            },
            useWalletConnect: true,
            enableLogging: true,
          },
        });
        web3auth.addPlugin(torusPlugin);

        subscribeAuthEvents(web3auth, torusPlugin);
        setWeb3auth(web3auth);
        await web3auth.initModal();
      } catch (error) {
        console.error(error);
      }
    }

    const subscribeAuthEvents = (web3auth: Web3Auth, torusPlugin?: TorusWalletConnectorPlugin) => {
      // Can subscribe to all ADAPTER_EVENTS and LOGIN_MODAL_EVENTS
      web3auth.on(ADAPTER_EVENTS.CONNECTED, (data: unknown) => {
        console.log("Yeah!, you are successfully logged in", data);
        let web3authProvider = web3auth.provider as SafeEventEmitterProvider;

        if (web3authProvider) {
          setProvider(web3authProvider)
          setTorusWalletPrivider(torusPlugin?.torusWalletInstance.ethereum);
        }
      });
  
      web3auth.on(ADAPTER_EVENTS.CONNECTING, () => {
        console.log("connecting");
      });
  
      web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
        console.log("disconnected");
      });
  
      web3auth.on(ADAPTER_EVENTS.ERRORED, (error) => {
        console.error("some error or user has cancelled login request", error);
      });
    };

    init();
  }, []);

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const provider = await web3auth.connect();
    setProvider(provider);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    uiConsole(user);
    const privKey = await provider!.request({ method: "eth_private_key" });
    alert(privKey);
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
  };

  const getAccounts = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const userAccount = await rpc.getAccounts();
    uiConsole(userAccount);
  };

  const getBalance = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    uiConsole(balance);
  };

  const signMessage = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(torusWalletPrivider);
    // const result = await rpc.signMessage();
    const result = await rpc.evmSignData(true);
    uiConsole(result);
  };

  const signTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const result = await rpc.signTransaction();
    uiConsole(result);
  };

  const sendTransaction = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const result = await rpc.signAndSendTransaction();
    uiConsole(result);
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  const loggedInView = (
    <>
      <button onClick={getUserInfo} className="card">
        Get User Info
      </button>
      <button onClick={getAccounts} className="card">
        Get Accounts
      </button>
      <button onClick={getBalance} className="card">
        Get Balance
      </button>
      <button onClick={signMessage} className="card">
        Sign Message
      </button>
      <button onClick={signTransaction} className="card">
        Sign Transaction
      </button>
      <button onClick={sendTransaction} className="card">
        Send Transaction
      </button>
      <button onClick={logout} className="card">
        Log Out
      </button>

      <div id="console" style={{whiteSpace: "pre-line"}}>
        <p style={{whiteSpace: "pre-line"}}></p>
      </div>
    </>
  );

  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="http://web3auth.io/" rel="noreferrer">
          Web3Auth
        </a>{" "}
        & ReactJS Example
      </h1>

      <div className="grid">{provider ? loggedInView : unloggedInView}</div>

      <footer className="footer">
        <a href="https://github.com/Web3Auth/Web3Auth/tree/master/examples/react-app" target="_blank" rel="noopener noreferrer">
          Source code {"  "}
          <img className="logo" src="/images/github-logo.png" alt="github-logo" />
        </a>
      </footer>
    </div>
  );
}

export default App;
