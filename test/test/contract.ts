import { ERC20 } from "@ethcontracts/core";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { IDeployedPayload } from "./interface";
import toWeb3Provider from "ethers-to-web3";
import { Web3Client } from "@ethcontracts/web3";
import { testERC20 } from "./erc20";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import Web3 from "web3";
import { TransactionReceipt } from "web3-core";


describe("contracts", () => {

  const payload = {


  } as IDeployedPayload;

  before(async () => {
    const [signer1, signer2, signer3, signer4] = await ethers.getSigners();
    payload.deployer = signer1;
    payload.signer2 = signer2;
    payload.signer3 = signer3;
    payload.signer4 = signer4;
  })

  it('deploy erc20 token', async () => {
    const contract = await ethers.getContractFactory('MyToken');

    const deployedContract = await contract.deploy("MyToken", "MT");
    payload.erc20Token1 = deployedContract;

    await payload.erc20Token1.mint(payload.deployer.address, 900000000000);
    await payload.erc20Token1.mint(payload.signer2.address, 900000000000);
    await payload.erc20Token1.mint(payload.signer4.address, 900000000000);
  });

  describe("read only tx with read only provider", () => {
    let erc20: ERC20;

    before(async () => {
      erc20 = new ERC20(payload.erc20Token1.address);
      const client = new Web3Client(toWeb3Provider(payload.deployer.provider));
      await erc20.init(client);
    })

    it('name', async () => {
      const name = await erc20.getName();
      expect(name).equal('MyToken');
    })
  })

  describe("fail write tx", () => {
    let erc20: ERC20;

    before(async () => {
      erc20 = new ERC20(payload.erc20Token1.address);
      const client = new Web3Client(toWeb3Provider(payload.deployer));
      await erc20.init(client);
    })

    it('transfer', async () => {
      // try {
      const [txHashPromise] = await erc20.transferFrom(payload.signer2.address, payload.signer4.address, "1234566666666666666666666666666");
      try {
        const txHash = await txHashPromise();
        throw "there should be error";
      } catch (error) {
        expect(error.message).contains("ERC20: insufficient allowance");
      }
      // } catch (error) {

      // }
    })
  })

  describe('wallet address', () => {
    it('read only provider', async () => {
      const client = new Web3Client(
        new Web3.providers.HttpProvider('https://polygon-rpc.com')
      );
      await client.init();
      expect(client.walletAddress).equal(undefined);
    })

    it('write provider', async () => {
      const client = new Web3Client(toWeb3Provider(payload.deployer) as any);
      await client.init();
      expect(client.walletAddress).equal(payload.deployer.address);
    })
  })

  describe('check for balance on chain', async () => {
    var client: Web3Client;

    before(async () => {
      client = new Web3Client(toWeb3Provider(payload.deployer as any));
      await client.init();
    })

    it('when address provided', async () => {
      const balance: any = await client.getBalance(payload.signer2.address);
      expect(balance.toString()).equal('10000000000000000000000');
    })

    it('when address not provided', async () => {
      const balance: any = await client.getBalance();
      expect(balance.toString()).equal('9999997402096589066680');
    })
  })


  describe('sendTransaction', async () => {

    var client: Web3Client;

    before(async () => {
      client = new Web3Client(toWeb3Provider(payload.signer3 as any));
      await client.init();
    })


    it('transfer ether to', async () => {
      const from = payload.signer3.address.toLowerCase();
      const to = payload.signer2.address;

      const beforeBalanceFrom: string = await client.getBalance();
      const beforeBalanceTo = await client.getBalance<string>(to);
      const amount = 5;
      const [getTxHash, getTxReceipt] = client.sendTransaction({
        value: amount,
        //ethers.utils.parseUnits(amount.toString(), "wei"),
        // amount,
        to: to,
        from
      });

      const txHash = await getTxHash();
      expect(txHash).to.be.string;
      const receipt = await getTxReceipt<TransactionReceipt>();

      expect(receipt.transactionHash).equal(txHash);
      expect(receipt.blockHash).to.be.string;
      expect(receipt.to.toLowerCase()).equal(to.toLowerCase());
      expect(receipt.from.toLowerCase()).equal(from);

      // const afterBalanceFrom = await client.getBalance<BigNumber>();
      const afterBalanceFrom = await client.getBalance<string>();
      const aftereBalanceTo = await client.getBalance(to);

      console.log("beforeBalanceFrom", beforeBalanceFrom);
      console.log("afterBalanceFrom", afterBalanceFrom);
      console.log("diff", BigInt(beforeBalanceFrom) - BigInt(afterBalanceFrom));

      // expect(afterBalanceFrom).equal(beforeBalanceFrom.sub(amount));
      expect(aftereBalanceTo).equal(BigInt(beforeBalanceTo) + BigInt(amount));
    })
  })

  describe("erc20", () => {
    testERC20(
      payload, (user: SignerWithAddress) => {
        return new Web3Client(toWeb3Provider(user));
      }
    )
  })

})