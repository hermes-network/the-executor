const Executor = require('./Executor')

const wsProviderUrl = 'ws://eth.oja.me:8547'
const httpProviderUrl = 'http://eth.oja.me:3304'
const appName = "hermes-network";

async function main() {
  const executor = new Executor({
    wsProviderUrl: wsProviderUrl,
    httpProviderUrl: httpProviderUrl,
    appName: appName
  });

  await executor.start()
}

// start it off
main().then(() => {
  console.log(``);
}).catch((err) => {
  console.log(`Error: `, err);
});
