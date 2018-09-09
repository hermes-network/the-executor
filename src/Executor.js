const Web3Utils = require('web3-utils')
const Web3 = require('web3')
const Shh = require('web3-shh')

const GnosisSafeContract = require('../build/contracts/GnosisSafe.json')

class Executor {
  constructor({providerUrl, appName}) {
    const provider = new Web3.providers.WebsocketProvider(providerUrl)
    this.web3 = new Web3('http://localhost:8545')
    this.shh = new Shh(provider)
    this.appName = appName
  }

  async start() {
    const version = await this.shh.getVersion();
    console.log(`Shh version: ${version}`);

    const symKeyID = await this.shh.generateSymKeyFromPassword("hermes");
    console.log(symKeyID);

    // listen
    const appName4Bytes = Web3Utils.asciiToHex(this.appName).slice(0, 10);
    console.log(`Starting to listen messages!`);
    this.shh.subscribe('messages', {
      symKeyID: symKeyID,
      topics: [appName4Bytes],
    }, async (err, msg) => {
      if (err) {
        console.log(`Error while listening messages!`, err);
        return;
      }
      console.log(msg);
      if (msg !== null) {
        try {
          const msgJson = JSON.parse(Web3Utils.hexToAscii(msg.payload))
          console.log(`Incoming request!`, msgJson);
          const {
            to,
            value,
            data,
            operation,
            safeTxGas,
            gasPrice,
            gasToken,
            refundReceiver,
            nonce,
            safeAddress,
            signedMessage
          } = msgJson;
          const dataGas = 0;

          // call the contract
          await this.submit(
            safeAddress,
            to,
            value,
            data,
            operation,
            safeTxGas,
            dataGas,
            gasPrice,
            gasToken,
            refundReceiver,
            signedMessage
          )
        } catch (err) {
          console.log(`Error while executing the message!`, err);
        }
      }
    });
  }

  async submit(
    addr,
    to,
    value,
    data,
    op,
    safeTxGas,
    dataGas,
    gasPrice,
    gasToken,
    refundReceiver,
    signatures
  ) {
    const account = (await this.web3.eth.getAccounts())[0]

    const safe = new this.web3.eth.Contract(GnosisSafeContract.abi, addr)
    let gas = await safe.methods.execTransaction(
      to,
      value,
      data,
      op,
      safeTxGas,
      dataGas,
      gasPrice,
      gasToken,
      refundReceiver,
      signatures
    ).estimateGas({ from: account });
    gas *= 1.2;
    gas = parseInt(gas);

    const tx = await safe.methods.execTransaction(
      to,
      value,
      data,
      op,
      safeTxGas,
      dataGas,
      gasPrice,
      gasToken,
      refundReceiver,
      signatures
    ).send({ from: account, gas })
    console.log("tx!!!!!", tx);
  }
}

module.exports = Executor;
