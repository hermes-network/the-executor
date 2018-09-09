const Executor = require('./executor')
const config = require('./config')

async function main () {
  let appName = 'hermes-network'
  if (config.network === 'ropsten') {
    appName = 'ropsten-hermes-network'
  }

  const executor = new Executor({
    wsProviderUrl: config.wsProviderUrl,
    httpProviderUrl: config.httpProviderUrl,
    appName: appName
  })

  await executor.start()
}

// Start daemon
main().catch(console.error)
