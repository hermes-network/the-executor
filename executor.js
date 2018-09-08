const Web3Utils = require('web3-utils');
const Shh = require('web3-shh');
const shh = new Shh('ws://eth.oja.me:8547');

const appName = Web3Utils.asciiToHex("hermes-network").slice(0, 10);

async function main() {
  const version = await shh.getVersion();
  console.log(`Shh version: ${version}`);

  const symKeyID = await shh.generateSymKeyFromPassword("hermes");
  console.log(symKeyID);

  // listen
  console.log(`Starting to listen messages!`);
  shh.subscribe('messages', {
    symKeyID: symKeyID,
    topics: [appName],
  }, (err, msg) => {
    if (err) {
      console.log(`Error while listening messages!`, err);
      return;
    }
    console.log(msg);
    if(msg !== null) {
      const data = JSON.parse(Web3Utils.hexToAscii(msg.payload));
      console.log('Payload : ', msg.payload, data);
    }
  });
}

// start it off
main().then(() => {
  console.log(``);
}).catch((err) => {
  console.log(`Error: `, err);
});

