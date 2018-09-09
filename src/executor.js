const Web3 = require('web3')
const Web3Utils = require('web3-utils')
const Web3HDWalletProvider = require('web3-hdwallet-provider')
const Shh = require('web3-shh')
const Contract = require('truffle-contract')

const { getAccounts, runBalanceCheck } = require('./utils')
const { mnemonic, sharedSecret, channel, network } = require('./config')
const GnosisSafeContract = require('../build/contracts/GnosisSafe.json')

class Executor {
  constructor ({ wsProviderUrl, httpProviderUrl }) {
    // Setup the providers
    console.log(`wsProviderUrl: ${wsProviderUrl}, httpProviderUrl: ${httpProviderUrl}`)

    const httpProvider = new Web3.providers.HttpProvider(httpProviderUrl)
    this.walletProvider = new Web3HDWalletProvider(httpProvider, mnemonic)

    this.web3 = new Web3(this.walletProvider)
    this.shh = new Shh(wsProviderUrl)
  }

  async run () {
    const version = await this.shh.getVersion()
    console.log(`Shh version: ${version}`)

    this.account = (await getAccounts(this.web3))[0]
    console.log(`Account: ${this.account}`)

    // check the balance
    runBalanceCheck(this.web3, this.account)

    let ch = network.concat(channel)
    const topics = [Web3Utils.asciiToHex(ch).slice(0, 10)]
    const symKeyID = await this.shh.generateSymKeyFromPassword(sharedSecret)

    // Listen
    console.log(`Starting to listen messages!`)
    this.shh.subscribe('messages', { symKeyID, topics }, (e, m) => this.onMessage(e, m))
  }

  async onMessage (err, msg) {
    if (err) {
      console.log('Error onMessage:', err)
      return
    }

    if (msg === null) {
      return
    }

    try {
      const msgJson = JSON.parse(Web3Utils.hexToAscii(msg.payload))
      console.log(`Incoming request!`, msgJson)

      await this.submit(msgJson)
    } catch (err) {
      console.log(`Error while executing the message!`, err)
    }
  }

  async submit (msg) {
    const {
      to,
      value,
      data,
      operation,
      safeTxGas,
      dataGas,
      gasPrice,
      gasToken,
      refundReceiver,
      safeAddress,
      signedMessage
    } = msg

    const Safe = Contract({ abi: GnosisSafeContract.abi })
    Safe.setProvider(this.walletProvider)
    const safe = Safe.at(safeAddress)

    let gas = await safe.execTransaction.estimateGas(
      to,
      value,
      data,
      operation,
      safeTxGas,
      dataGas,
      gasPrice,
      gasToken,
      refundReceiver,
      signedMessage,
      { from: this.account }
    )

    gas *= 1.2
    gas = parseInt(gas)

    const tx = await safe.execTransaction(
      to,
      value,
      data,
      operation,
      safeTxGas,
      dataGas,
      gasPrice,
      gasToken,
      refundReceiver,
      signedMessage,
      { from: this.account, gas }
    )

    console.log('TX:', tx)
  }
}

module.exports = Executor
