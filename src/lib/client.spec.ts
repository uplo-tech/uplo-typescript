import test from "ava";
import { some } from "lodash";
import proxyquire from "proxyquire";
import sinon from "sinon";

const pathStub = sinon.stub().callsFake((...a) => ({
  args: [...a],
}));
const c = proxyquire("./client", {
  child_process: {
    spawn: pathStub,
  },
});
const Client = c.Client;

// Global constants
const BIN_PATH = "/Users";

test("can create client with no config", (t) => {
  const client = new Client({});
  const f = client.launch(BIN_PATH);
  const a = f.args;
  const path = a[0];
  const flags: string[] = a[1];
  // This should match daemon path passed into the function
  t.is(path, BIN_PATH);

  // Check that default flags are passed in
  const hasApiAddr = flags.includes("--api-addr=localhost:8480");
  const hasHostAddr = flags.includes("--host-addr=:8482");
  const hasRpcAddr = flags.includes("--rpc-addr=:8481");
  t.true(hasApiAddr);
  t.true(hasHostAddr);
  t.true(hasRpcAddr);
});

test("can replace client config", (t) => {
  const client = new Client({
    agent: "custom-agent",
    apiAuthentication: true,
    apiAuthenticationPassword: "foo",
    apiHost: "1.1.1.1",
    apiPort: 1337,
    dataDirectory: "bar",
    hostPort: 1339,
    modules: {
      consensus: true,
      explorer: true,
      gateway: true,
      host: true,
      miner: false,
      renter: true,
      transactionPool: true,
      wallet: true,
    },
    rpcPort: 1338,
  });
  const f = client.launch(BIN_PATH);
  const a: string[] = f.args[1];

  t.is(a.length, 7);
  t.true(some(a, (x) => x.includes("--agent=custom-agent")));
  t.true(some(a, (x) => x.includes("--api-addr=1.1.1.1:1337")));
  t.true(some(a, (x) => x.includes("--authenticate-api=true")));
  t.true(some(a, (x) => x.includes("--host-addr=:1339")));
  // skipping module test here because we have a seperate unit test for parseModules
  t.true(some(a, (x) => x.includes("--rpc-addr=:1338")));
  t.true(some(a, (x) => x.includes("--uplo-directory=bar")));
});
