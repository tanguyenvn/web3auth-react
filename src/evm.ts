import Web3 from "web3";

export default class EthereumRpc {
  private provider: any;

  constructor(provider: any) {
    this.provider = provider;
  }
  async getAccounts(): Promise<string[]> {
    try {
      const web3 = new Web3(this.provider as any);
      const accounts = await web3.eth.getAccounts();
      return accounts;
    } catch (error: unknown) {
      console.error((error as Error).message);
      throw error;
    }
  }

  async getBalance(): Promise<string> {
    try {
      const web3 = new Web3(this.provider as any);
      const accounts = await web3.eth.getAccounts();
      const balance = await web3.eth.getBalance(accounts[0]);
      return balance;
    } catch (error) {
      console.error((error as Error).message);
      throw error;
    }
  }

  async signMessage() {
    try {
      const web3 = new Web3(this.provider as any);
      const accounts = await web3.eth.getAccounts();
      const message = "0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad";
      (web3.currentProvider as any)?.send(
        {
          method: "eth_sign",
          params: [accounts[0], message],
          from: accounts[0],
        },
        (err: Error, result: any) => {
          if (err) {
            return console.error(err);
          }
          return result;
        }
      );
    } catch (error) {
      console.error((error as Error).message);
      throw error;
    }
  }

  async evmSignData (isEIP712?: boolean): Promise<string | unknown> {
    try {
      const accountRes = await this.provider.request({ method: 'eth_requestAccounts' }) as any
      const address = accountRes[0]

      const data = {
        "domain":{
            "chainId":5,
            "name":"da.systems",
            "verifyingContract":"0x0000000000000000000000000000000020210722",
            "version":"1"
        },
        "message":{
            "DAS_MESSAGE":"EDIT RECORDS OF ACCOUNT torusio.bit",
            "inputsCapacity":"217.9999 CKB",
            "outputsCapacity":"217.9998 CKB",
            "fee":"0.0001 CKB",
            "digest":"0xcf2852803df85cc7234fead400b91730627a2429660e09e041b88206d54710d4",
            "action":{
                "action":"edit_records",
                "params":"0x01"
            },
            "inputs":[
                {
                    "capacity":"217.9999 CKB",
                    "lock":"das-lock,0x01,0x05397d6d6369314c625c7f4cd0837426aa1555e4...",
                    "type":"account-cell-type,0x01,0x",
                    "data":"{ account: torusio.bit, expired_at: 1683542508 }",
                    "extraData":"{ status: 0, records_hash: 0xf2ca3ba4d42aa2f33f6dc72392aee862ea3d04caf32aeb8ae06113913c9a06f3 }"
                }
            ],
            "outputs":[
                {
                    "capacity":"217.9998 CKB",
                    "lock":"das-lock,0x01,0x05397d6d6369314c625c7f4cd0837426aa1555e4...",
                    "type":"account-cell-type,0x01,0x",
                    "data":"{ account: torusio.bit, expired_at: 1683542508 }",
                    "extraData":"{ status: 0, records_hash: 0x55478d76900611eb079b22088081124ed6c8bae21a05dd1a0d197efcc7c114ce }"
                }
            ]
        },
        "primaryType":"Transaction",
        "types":{
            "EIP712Domain":[
                {
                    "name":"chainId",
                    "type":"uint256"
                },
                {
                    "name":"name",
                    "type":"string"
                },
                {
                    "name":"verifyingContract",
                    "type":"address"
                },
                {
                    "name":"version",
                    "type":"string"
                }
            ],
            "Action":[
                {
                    "name":"action",
                    "type":"string"
                },
                {
                    "name":"params",
                    "type":"string"
                }
            ],
            "Cell":[
                {
                    "name":"capacity",
                    "type":"string"
                },
                {
                    "name":"lock",
                    "type":"string"
                },
                {
                    "name":"type",
                    "type":"string"
                },
                {
                    "name":"data",
                    "type":"string"
                },
                {
                    "name":"extraData",
                    "type":"string"
                }
            ],
            "Transaction":[
                {
                    "name":"DAS_MESSAGE",
                    "type":"string"
                },
                {
                    "name":"inputsCapacity",
                    "type":"string"
                },
                {
                    "name":"outputsCapacity",
                    "type":"string"
                },
                {
                    "name":"fee",
                    "type":"string"
                },
                {
                    "name":"action",
                    "type":"Action"
                },
                {
                    "name":"inputs",
                    "type":"Cell[]"
                },
                {
                    "name":"outputs",
                    "type":"Cell[]"
                },
                {
                    "name":"digest",
                    "type":"bytes32"
                }
            ]
        }
    }

      let res
      if (isEIP712) {
        res = await this.provider.request({
          method: 'eth_signTypedData_v4',
          params: [address, JSON.stringify(data)],
        })
      }
      else {
        res = await this.provider.request({
          method: 'personal_sign',
          params: [data, address]
        })
      }
      return res
    }
    catch (err) {
      console.error(err)
      throw err
    }
  }

  async signTransaction(): Promise<string> {
    try {
      const web3 = new Web3(this.provider as any);
      const accounts = await web3.eth.getAccounts();
      const txRes = await web3.eth.signTransaction({
        from: accounts[0],
        to: accounts[0],
        value: web3.utils.toWei("0.01"),
      });
      return txRes.raw;
    } catch (error) {
      console.error((error as Error).message);
      throw error;
    }
  }

  async signAndSendTransaction(): Promise<string> {
    try {
      const web3 = new Web3(this.provider as any);
      const accounts = await web3.eth.getAccounts();

      const txRes = await web3.eth.sendTransaction({
        from: accounts[0],
        to: accounts[0],
        value: web3.utils.toWei("0.01"),
      });
      return txRes.transactionHash;
    } catch (error) {
      console.error((error as Error).message);
      throw error;
    }
  }
}
