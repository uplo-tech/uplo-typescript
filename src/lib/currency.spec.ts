import test from "ava";
import BigNumber from "bignumber.js";
import { toHastings, toUplocoins, toHumanReadable } from "./currency";

const HASTINGS_PER_UPLOCOIN = "1000000000000000000000000";

test("converts from uplocoins to hastings correctly", (t) => {
  const maxSC = new BigNumber("100000000000000000000000");
  for (let i = 0; i < 100; i++) {
    const sc = maxSC.times(Math.trunc(Math.random() * 10000) / 10000);
    const expectedHastings = sc.times(HASTINGS_PER_UPLOCOIN);
    t.is(toHastings(sc).toString(), expectedHastings.toString());
  }
});

test("converts from hastings to uplocoins correctly", (t) => {
  const maxH = new BigNumber("10").pow(150);
  for (let i = 0; i < 100; i++) {
    const hastings = maxH.times(Math.trunc(Math.random() * 10000) / 10000);
    const expectedUplocoins = hastings.dividedBy(HASTINGS_PER_UPLOCOIN);
    t.is(toUplocoins(hastings).toString(), expectedUplocoins.toString());
  }
});

test("converts hastings to human readable representation", (t) => {
  t.is(toHumanReadable("1"), "1 H");
  t.is(toHumanReadable("1000"), "1000 H");
  t.is(toHumanReadable("100000000000"), "100000000000 H");
  t.is(toHumanReadable("1000000000000"), "1 pS");
  t.is(toHumanReadable("1234560000000"), "1.235 pS");
  t.is(toHumanReadable("12345600000000"), "12.346 pS");
  t.is(toHumanReadable("123456000000000"), "123.456 pS");
  t.is(toHumanReadable("1000000000000000"), "1 nS");
  t.is(toHumanReadable("1000000000000000000"), "1 uS");
  t.is(toHumanReadable("1000000000000000000000"), "1 mS");
  t.is(toHumanReadable(new BigNumber("1").multipliedBy(HASTINGS_PER_UPLOCOIN)), "1 SC");
  t.is(toHumanReadable(new BigNumber("1000").multipliedBy(HASTINGS_PER_UPLOCOIN)), "1 KS");
  t.is(toHumanReadable(new BigNumber("1000000").multipliedBy(HASTINGS_PER_UPLOCOIN)), "1 MS");
  t.is(toHumanReadable(new BigNumber("1000000000").multipliedBy(HASTINGS_PER_UPLOCOIN)), "1 GS");
  t.is(toHumanReadable(new BigNumber("1000000000000").multipliedBy(HASTINGS_PER_UPLOCOIN)), "1 TS");
  t.is(toHumanReadable(new BigNumber("1234560000000").multipliedBy(HASTINGS_PER_UPLOCOIN)), "1.235 TS");
  t.is(toHumanReadable(new BigNumber("1234560000000000").multipliedBy(HASTINGS_PER_UPLOCOIN)), "1234.56 TS");
});
