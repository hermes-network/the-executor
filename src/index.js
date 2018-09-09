const Executor = require('./executor')
const config = require('./config')

async function main () {
  const executor = new Executor({
    wsProviderUrl: config.wsProviderUrl,
    httpProviderUrl: config.httpProviderUrl
  })

  await executor.run()
}

// Start daemon
main().catch(console.error)
