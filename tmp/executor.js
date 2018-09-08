const { Executor } = require('./dist');

const providerUrl = 'ws://eth.oja.me:8547'
const appName = "hermes-network";

async function main() {
  const executor = new Executor({
    providerUrl: providerUrl,
    appName: appName
  });
}

// start it off
main().then(() => {
  console.log(``);
}).catch((err) => {
  console.log(`Error: `, err);
});

