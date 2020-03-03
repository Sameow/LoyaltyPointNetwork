const loyaltyPointsProgram = artifacts.require("loyalty");

module.exports = function(deployer, network, accounts) {
	return deployer
    	.then(() => {
        return deployer.deploy(loyaltyPointsProgram, {from: accounts[0]});
    	});
};