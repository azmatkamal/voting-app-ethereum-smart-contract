import Web3 from "web3";
import truffleContract from "@truffle/contract";
import MayorMultipleCandidates from "./contracts/MayorMultipleCandidates.json";

// const Mayor = JSON.parse(MayorMultipleCandidates);
const ganache_address = "http://127.0.0.1:8545";
// const web3 = new Web3(ganache_address);
const web3 = new Web3(new Web3.providers.HttpProvider(ganache_address));

const accounts = async () => {
  return await web3.eth.getAccounts();
};

const contract = async () => {
  const contract = truffleContract(MayorMultipleCandidates);
  contract.setProvider(web3.currentProvider);
  const instance = await contract.deployed();

  return instance;
};

export default { contract, accounts, web3 };
