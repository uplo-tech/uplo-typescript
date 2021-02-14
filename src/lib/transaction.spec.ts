import test from "ava";
import { computeSingleTransaction } from "./transaction";
import badTxData from "../mock/bad_tx.json";
import goodTxData from "../mock/good_tx.json";

test("test computeSingleTransaction", (t) => {
  for (let i = 0; i < badTxData.confirmedtransactions.length; i++) {
    const badResult = computeSingleTransaction(badTxData.confirmedtransactions[i]);
    const goodResult = computeSingleTransaction(goodTxData.confirmedtransactions[i]);
    t.log(`Bad Result: ${badResult.totalUplocoin.toFixed(0)} Good Result: ${goodResult.totalUplocoin.toFixed(0)}`);
    if (!badResult.totalUplocoin.isEqualTo(goodResult.totalUplocoin)) {
      t.fail();
    }
  }
  t.pass();
});
