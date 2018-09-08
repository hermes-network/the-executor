const Web3Utils = require('web3-utils');
const Shh = require('web3-shh');
const shh = new Shh('ws://eth.oja.me:8547');

const appName = Web3Utils.asciiToHex("hermes-network").slice(0, 10);

async function main() {
  const version = await shh.getVersion();
  console.log(`Shh version: ${version}`);

  const symKeyID = await shh.generateSymKeyFromPassword("hermes");

  const data = {
    name: "I am Hermes client"
  };
  const payload = Web3Utils.asciiToHex(JSON.stringify(data));

  console.log(`symKeyID: ${symKeyID}, payload: ${payload}, data: ${JSON.stringify(data)}`);

  // send a test message
  const message = {
    symKeyID: symKeyID,
    ttl: 100,
    topic: appName,
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

