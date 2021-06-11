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
  // const accountList = await accounts();
  //   const networkId = await web3.eth.net.getId();
  //   const deployedNetwork = MayorMultipleCandidates.networks[networkId];
  //   const contract = truffleContract({
  //     abi: MayorMultipleCandidates.abi,
  //     unlinked_binary: MayorMultipleCandidates.bytecode,
  //   });
  const contract = truffleContract(MayorMultipleCandidates);
  contract.setProvider(web3.currentProvider);
  // contract.new(accountList[0], 4, { from: accountList[0] });
  const instance = await contract.deployed();

  return instance;
};

export default { contract, accounts, web3 };
