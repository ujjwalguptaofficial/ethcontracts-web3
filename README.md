# ethcontracts-web3
web3.js wrapper for ethcontracts.js

> It contains web3js client which can be used inside ethcontracts.js.

# install

```
npm i @ethcontracts/web3
```

# Usage

```
import { ERC20 } from "@ethcontracts/core";
import { Web3Client } from "@ethcontracts/web3";
import Web3 from "web3";

// create token with token address
const token = new ERC20("0x8f3cf7ad23cd3cadbd9735aff958023239c6a063");

// create provider
const provider = new Web3.providers.HttpProvider('https://polygon-rpc.com');

// initiate token with provider
await token.init(
    new Web3Client(provider)
);

// call token balance api

const balance = await token.getBalance("0xd5D3F35Bdd08950CCFE0DeAb638F8B5498297076");
console.log("balance", balance);
```

For more documentation, please visit - [https://ujjwalguptaofficial.github.io/ethcontracts-doc/](https://ujjwalguptaofficial.github.io/ethcontracts-doc/)


