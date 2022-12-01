import { ITransactionRequestConfig, TYPE_GET_TRANSACTION_HASH, TYPE_GET_TRANSACTION_RECEIPT } from "@ethcontracts/core";
import { PromiEvent } from "web3-core";


export function toWriteResult(promiseResult: PromiEvent<any>) {
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