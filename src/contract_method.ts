import { Contract, } from "web3-eth-contract";
import { PromiEvent } from "web3-core";
import { toWeb3Config, toWriteResult } from "./utils";
import { ILogger, ITransactionRequestConfig, BaseContractMethod, TYPE_GET_TRANSACTION_HASH, TYPE_GET_TRANSACTION_RECEIPT } from "@ethcontracts/core";

export class ContractMethod extends BaseContractMethod {

    constructor(public address, logger: ILogger, private method: any) {
        super(logger);
    }

    read<T>(tx: ITransactionRequestConfig): Promise<T> {
        this.logger.log("sending tx with config", tx);
        return this.method.call(
            toWeb3Config(tx) as any
        );
    }

    write(tx: ITransactionRequestConfig) {
        const promiseResult: PromiEvent<Contract> = this.method.send(
            toWeb3Config(tx) as any
        );

        return toWriteResult(promiseResult);


        let onTransactionHash, onTransactionError;
        const txHashPromise = new Promise<string>((res, rej) => {
            onTransactionHash = res;
            onTransactionError = rej;
        });
        let onTransactionReceipt, onTransactionReceiptError;
        const txReceiptPromise = new Promise<any>((res, rej) => {
            onTransactionReceipt = res;
            onTransactionReceiptError = rej;
        });
        promiseResult.once("transactionHash", onTransactionHash)
            .once("receipt", onTransactionReceipt)
            .once("error", onTransactionError).
            once("error", onTransactionReceiptError);

        const getTransactionHash: TYPE_GET_TRANSACTION_HASH = () => {
            return txHashPromise;
        };
        const getTransactionReceipt: TYPE_GET_TRANSACTION_RECEIPT = <T_RECEIPT>(): Promise<T_RECEIPT> => {
            return txReceiptPromise;
        };
        return [getTransactionHash, getTransactionReceipt] as any;
    }

    estimateGas(tx: ITransactionRequestConfig): Promise<number> {
        return this.method.estimateGas(
            toWeb3Config(tx) as any
        );
    }

    encodeABI() {
        return this.method.encodeABI();
    }
}
