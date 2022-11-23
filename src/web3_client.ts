import { BaseContract, BaseWeb3Client, global } from "@ethcontracts/core";
import Web3 from "web3";
import { Web3Contract } from "./contract";

export class Web3Client extends BaseWeb3Client {
    private web3_: Web3;

    constructor(provider: any) {
        super(global.logger);
        this.web3_ = new Web3(provider);
    }

    getContract(address: string, abi: any): BaseContract {
        const cont = new this.web3_.eth.Contract(abi, address);
        return new Web3Contract(address, cont as any, this.logger);
    }

}