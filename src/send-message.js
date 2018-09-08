const Web3Utils = require('web3-utils');
const Shh = require('web3-shh');

const providerUrl = 'ws://eth.oja.me:8547'
const appName = "hermes-network";

async function main() {
  const shh = new Shh(providerUrl);

  const version = await shh.getVersion();
  console.log(`Shh version: ${version}`);

  const symKeyID = await shh.generateSymKeyFromPassword("hermes");

  const data = {
    name: "I am Hermes client"
  };
  const payload = Web3Utils.asciiToHex(JSON.stringify(data));

  console.log(`symKeyID: ${symKeyID}, payload: ${payload}, data: ${JSON.stringify(data)}`);

  // send a test message
  const appName4Bytes = Web3Utils.asciiToHex(appName).slice(0, 10);
  const message = {
    symKeyID: symKeyID,
    ttl: 100,
    topic: appName4Bytes,
    powTarget: 2.0,
    powTime: 2,
    payload: payload
  };
  console.log(message);

  const result = await shh.post(message);
  console.log(result);
}

// start it off
main().then(() => {
  console.log(``);
}).catch((err) => {
  console.log(`Error: `, err);
});

