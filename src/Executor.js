const Web3Utils = require('web3-utils')
const Web3 = require('web3')
const Web3HDWalletProvider = require("web3-hdwallet-provider")
const Shh = require('web3-shh')
const util = require('util');
const contract = require('truffle-contract');

const GnosisSafeContract = require('../build/contracts/GnosisSafe.json')
const walletMnemonic = 'ill song party come kid carry calm captain state purse weather ozone';

class Executor {
  constructor({wsProviderUrl, httpProviderUrl, appName}) {
    // setup the providers
    console.log(`wsProviderUrl: ${wsProviderUrl}, httpProviderUrl: ${httpProviderUrl}`);
    const httpProvider = new Web3.providers.HttpProvider(httpProviderUrl);
    this.walletProvider = new Web3HDWalletProvider(httpProvider, walletMnemonic);
    this.web3 = new Web3(this.walletProvider)
    // this.web3 = new Web3('http://localhost:8545')

    // const wsProvider = new Web3.providers.WebsocketProvider(wsProviderUrl)
    this.shh = new Shh(wsProviderUrl)
    this.appName = appName
  }

  async start() {
    const version = await this.shh.getVersion();
    console.log(`Shh version: ${version}`);

    const fromAccount = (await getAccounts(this.web3))[0]
    console.log(`Account: ${fromAccount}`);

    // check the balance
    runBalanceCheck(this.web3, fromAccount);

    // listen
    const symKeyID = await this.shh.generateSymKeyFromPassword("hermes");
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
            fromAccount,
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
    fromAccount,
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
    const c = contract({abi: GnosisSafeContract.abi});
    c.setProvider(this.walletProvider);
    const safe = c.at(addr)
    let gas = await safe.execTransaction.estimateGas(
      to,
      value,
      data,
      op,
      safeTxGas,
      dataGas,
      gasPrice,
      gasToken,
      refundReceiver,
      signatures,
      { from: fromAccount });
    gas *= 1.2;
    gas = parseInt(gas);

    const tx = await safe.execTransaction(
      to,
      value,
      data,
      op,
      safeTxGas,
      dataGas,
      gasPrice,
      gasToken,
      refundReceiver,
      signatures,
      { from: fromAccount, gas })
    console.log("tx!!!!!", tx);
  }
}

function getAccounts(web3) {
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts((err, balance) => {
      if (err) {
        return reject(err);
      }
      return resolve(balance);
    });
  });
}

function getBalance(web3, fromAccount) {
  return new Promise((resolve, reject) => {
    web3.eth.getBalance(fromAccount, (err, balance) => {
      if (err) {
        return reject(err);
      }
      console.log(`Balance: ${balance.toString()}`);
      return resolve(balance);
    });
  });
}

function runBalanceCheck(web3, fromAccount) {
  setTimeout(async () => {
    try {
      await checkBalance(web3, fromAccount)
    } catch (err) {
      console.log(`Error while checking Executor balance!`, err)
    }
  }, 5000)
}

async function checkBalance(web3, fromAccount) {
  const balance = await getBalance(web3, fromAccount)
  console.log(`Executor account: ${fromAccount} balance: ${Web3Utils.fromWei(balance, 'ether')}`)
}

module.exports = Executor;
