var Mayor = artifacts.require("MayorMultipleCandidates");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(Mayor, accounts[0], 3);
};
