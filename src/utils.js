function getAccounts (web3) {
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts((err, balance) => {
      if (err) {
        return reject(err)
      }
      return resolve(balance)
    })
  })
}

function getBalance (web3, fromAccount) {
  return new Promise((resolve, reject) => {
    web3.eth.getBalance(fromAccount, (err, balance) => {
      if (err) {
        return reject(err)
      }
      console.log(`Balance: ${balance.toString()}`)
      return resolve(balance)
    })
  })
}

function runBalanceCheck (web3, fromAccount) {
  setTimeout(async () => {
    try {
      await checkBalance(web3, fromAccount)
    } catch (err) {
      console.log(`Error while checking Executor balance!`, err)
    }
  }, 5000)
}

async function checkBalance (web3, fromAccount) {
  const balance = await getBalance(web3, fromAccount)
  console.log(`Executor account: ${fromAccount} balance: ${balance}`)
}

module.exports = {
  getAccounts,
  getBalance,
  runBalanceCheck,
  checkBalance
}
