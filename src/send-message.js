const Web3Utils = require('web3-utils');
const Web3 = require('web3')
const Shh = require('web3-shh');

const ethUtils = require('ethereumjs-util');
const abi = require('ethereumjs-abi');

const providerUrl = 'ws://eth.oja.me:8547'
const appName = "hermes-network"

let web3, shh, symKeyID, accounts;

async function main() {
  const provider = new Web3.providers.WebsocketProvider(providerUrl)
  web3 = new Web3(provider)
  shh = new Shh(provider);

  const version = await shh.getVersion();
  accounts = await web3.eth.getAccounts();
  console.log(`Shh version: ${version}, web3 accounts`, accounts[0]);

  symKeyID = await shh.generateSymKeyFromPassword('hermes');

  const to = '0x8bb55e49ee999900475638f61A3789BCB10fF10D';
  const value = 0;
  const data = '0x8bb55e49ee999900475638f61A3789BCB10fF10D';
  const operation = 0;
  const safeTxGas = 0;
  const dataGas = 0;
  const gasPrice = 0;
  const gasToken = 0;
  const refundReceiver = 0x0000000000000000000000000000000000000000;
  const nonce = 0;

  let signedMessage = rpcSignPacked(web3, accounts[0],
    to,
    value,
    data,
    operation,
    safeTxGas,
    dataGas,
    gasPrice,
    gasToken,
    refundReceiver,
    nonce
  );

  // let msgHash = createMsgHash(
  //   to,
  //   value,
  //   data,
  //   operation,
  //   safeTxGas,
  //   dataGas,
  //   gasPrice,
  //   gasToken,
  //   refundReceiver,
  //   nonce
  // );
  //
  // let signedMessage = createSignedMsg(accounts, msgHash);

  let toSend = {
    to: to,
    value: value,
    data: data,
    operation: operation,
    safeTxGas: safeTxGas,
    gasPrice: gasPrice,
    gasToken: gasToken,
    refundReceiver: refundReceiver,
    nonce: nonce,
    safeAddress: '0x8bb55e49ee999900475638f61A3789BCB10fF10D',
    signedMessage: signedMessage
  };
  await send(toSend);
}

async function send(data) {
  const payload = Web3Utils.asciiToHex(data);

  // send a test message
  const appName4Bytes = Web3Utils.asciiToHex(appName).slice(0, 10);
  const message = {
    symKeyID: symKeyID,
    ttl: 100,
    topic: appName,
    powTarget: 2.0,
    powTime: 2,
    payload: payload
  };

  const result = await shh.post(message);
  console.log(result);
  return result;
}

async function rpcSignPacked(web3, acc) {
  const params = Array.from(arguments).slice(2);
  const packedHash = Web3Utils.soliditySha3(...params);
  return new Promise(function (resolve, reject) {
    web3.eth.sign(acc, packedHash, function (error, result) {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });
  });
}

// start it off
main().then(() => {
  console.log(``);
}).catch((err) => {
  console.log(`Error: `, err);
});

