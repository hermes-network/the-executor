const Web3 = require('web3')

const GnosisSafeContract = require('../build/contracts/GnosisSafe.json')

const provider = new Web3.providers.WebsocketProvider('ws://localhost:8546')
const web3 = new Web3(provider)

const submit = async (
  addr,
  to,
  value,
  data,
  op,
  safeTxGas,
  dataGas,
  gasPrice,
  gasToken,
  refundReceiver,
  signatures
) {
  const account = await web3.eth.getAccounts()[0]

  const safe = new web3.eth.Contract(GnosisSafeContract.abi, addr)
  let gas = await safe.methods.execTransaction(
    addr,
    to,
    value,
    data,
    op,
    safeTxGas,
    dataGas,
    gasPrice,
    gasToken,
    refundReceiver,
    signatures
  ).estimateGas({ from: account })

  const tx = await safe.methods.execTransaction(
    addr,
    to,
    value,
    data,
    op,
    safeTxGas,
    dataGas,
    gasPrice,
    gasToken,
    refundReceiver,
    signatures
  ).send({ from: account, gas })
}
