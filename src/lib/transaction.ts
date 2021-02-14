import { ProcessedTransaction, ProcessedInput, ProcessedOutput } from "../models/models";
import BigNumber from "bignumber.js";
import { toUplocoins } from "./currency";

// export const computeTransactionSet = (
//   pts: ProcessedTransaction[],
//   blockHeight: number
// ) => {
//   // Loop over all transactions and map id of each contract to the most recent revision within set.
//   const revisionMap = {};
//   pts.forEach(pt => {
//     pt.transaction.filecontractrevisions.forEach(rev => {
//       revisionMap[rev.parentid] = rev;
//     });
//   });
//   let sts = [];
//   for (const pt of pts) {
//     // Determine the value of the transaction, assuming it's a regular tx.
//     let outgoingUplocoins = new BigNumber(0);
//     pt.inputs.forEach(input => {
//       if (input.fundtype === 'uplocoin input' && input.walletaddress) {
//         outgoingUplocoins = outgoingUplocoins.plus(input.value);
//       }
//     });
//     let incomingUplocoins = new BigNumber(0);
//     pt.outputs.forEach(output => {
//       if (output.fundtype === 'miner payout' && output.walletaddress) {
//         incomingUplocoins = incomingUplocoins.plus(output.value);
//       }
//       if (output.fundtype === 'uplocoin output' && output.walletaddress) {
//         incomingUplocoins = incomingUplocoins.plus(output.value);
//       }
//     });
//     // create the valued txn assuming it's a regular contract without contracts or revisions.
//     let st = new ValuedTransaction({
//       transaction: pt,
//       confirmedincomingvalue: incomingUplocoins.toString(),
//       confirmedoutgoingvalue: outgoingUplocoins.toString()
//     });

//     // if transaction doesn't contain contracts or revisions we are done.
//     if (
//       pt.transaction.filecontracts.length === 0 &&
//       pt.transaction.filecontractrevisions.length === 0
//     ) {
//       sts.push(st);
//       continue;
//     }

//     // if there are contracts then there can't be revisions in the tx
//     if (pt.transaction.filecontracts.length > 0) {
//       // contract doesn't generate incoming value for wallet.
//       st.confirmedincomingvalue = '0';
//       // contract with a revision doesn't have outgoing value since the outgoing
//       // value is determined by the latest revision.
//       // pt.transaction.filecontracts[0].
//     }
//   }
// };

type ProceedInputOutput = (ProcessedInput | ProcessedOutput)[];
// sumCurrency will map-reduce a slice of inputs or ouputs and sum up the
// currency value based on the currency type.
function sumCurrency(ts: ProceedInputOutput, currency): BigNumber {
  return ts.reduce((sum: BigNumber, t) => {
    if (t.fundtype.indexOf(currency) > -1) {
      return sum.plus(new BigNumber(t.value));
    }
    return sum;
  }, new BigNumber(0));
}

export const computeSingleTransaction = (t: ProcessedTransaction) => {
  // initialize inputs
  let totalUplocoinInput = new BigNumber(0);
  let totalUplofundInput = new BigNumber(0);
  let totalMinerInput = new BigNumber(0);

  // initialize outputs
  let totalUplocoinOutput = new BigNumber(0);
  let totalUplofundOutput = new BigNumber(0);
  let totalMinerOutput = new BigNumber(0);

  if (t.inputs) {
    // filter the wallet inputs to ensure it's associated with the wallet address.
    const walletInputs = t.inputs.filter((i) => i.walletaddress && i.value);
    totalUplocoinInput = sumCurrency(walletInputs, "uplocoin");
    totalUplofundInput = sumCurrency(walletInputs, "uplofund");
    totalMinerInput = sumCurrency(walletInputs, "miner");
  }
  if (t.outputs) {
    const walletOutputs = t.outputs.filter(
      (o) => o.walletaddress && o.value && o.maturityheight === t.confirmationheight
    );
    totalUplocoinOutput = sumCurrency(walletOutputs, "uplocoin");
    totalUplofundOutput = sumCurrency(walletOutputs, "uplofund");
    totalMinerOutput = sumCurrency(walletOutputs, "miner");
  }

  // Calculate totals
  const totalUplocoin = toUplocoins(totalUplocoinOutput.minus(totalUplocoinInput));
  const totalUplofund = totalUplofundOutput.minus(totalUplofundInput);
  const totalMiner = toUplocoins(totalMinerOutput.minus(totalMinerInput));

  return {
    transaction: t,
    totalUplocoin,
    totalUplofund,
    totalMiner,
  };
};
