const loyalty = artifacts.require("loyalty");

contract("Test case", async accounts => {
    let loyaltyPointsProgram;
    const owner = accounts[0];
    const shopOwner1 = accounts[1];
    const shopOwner2 = accounts[2];
    const customer1 = accounts[3];
    const customer2 = accounts[4];

    it("Deployment of contract", async () => {
        loyaltyPointsProgram = await loyalty.deployed();
        assert.equal(owner, await loyaltyPointsProgram._owner.call(), "Contract deployed with wrong owner.");
    });

    it("Network owner onboards 2 shops and returns shopId1 and shopId2", async () => {
        assert.equal(await loyaltyPointsProgram.onboardShop.call(shopOwner1, {from:owner}), 0, "ShopID not 0.");
        await loyaltyPointsProgram.onboardShop(shopOwner1, {from:owner});
        assert.equal(await loyaltyPointsProgram.onboardShop.call(shopOwner2, {from:owner}), 1, "ShopID not 1.");
        await loyaltyPointsProgram.onboardShop(shopOwner2, {from:owner});
    });

    it("shop1 issues 10 points to customer1", async () => {
        await loyaltyPointsProgram.issuePoint(0, 10, customer1, {from:shopOwner1});
        assert.equal(await loyaltyPointsProgram.pointBalance(0, customer1), 10, "customer1 does not have 10 points from shop1.");
    });

    it("customer1 transfers 2 points to customer2", async () => {
        await loyaltyPointsProgram.transferPoint(0, 2, customer2, {from:customer1});
        assert.equal(await loyaltyPointsProgram.pointBalance(0, customer1), 8, "customer1 did not transfer correctly.");
        assert.equal(await loyaltyPointsProgram.pointBalance(0, customer2), 2, "customer2 did not receive correctly.");
        assert.equal(await loyaltyPointsProgram.totalBalance(0), 10, "Shop1 should still have 10 points.");
    });

    it("customer2 is not able to redeem points at shop2", async () => {
        try {
            await loyaltyPointsProgram.redeemPoint(1, 2, 0, {from: customer2});
            assert.fail("Redemption should have thrown an error");
        }
        catch (err) {
            assert.equal(err.message,
                "Returned error: VM Exception while processing transaction: revert Not enough points to redeem -- Reason given: Not enough points to redeem.");
        }
        assert.equal(await loyaltyPointsProgram.totalBalance(1), 0, "Points redeemed from shop2.");
    });

    it("customer2 redeems 1 point at shop1 with transactionId 0", async () => {
        let ans = await loyaltyPointsProgram.redeemPoint(0, 1, 0, {from: customer2});
        assert.equal(ans.logs[0].event, 'Redeem', "Redeem event not emitted");
        assert.equal(ans.logs[0].args[0], '0', "Redeem event has wrong shopId");
        assert.equal(ans.logs[0].args[1], '1', "Redeem event has wrong points");
        assert.equal(ans.logs[0].args[2], '0', "Redeem event has wrong transactionId");
        assert.equal(await loyaltyPointsProgram.pointBalance(0, customer1), 8, "Balance of customer1 should be 8.");
        assert.equal(await loyaltyPointsProgram.pointBalance(0, customer2), 1, "Balance of customer2 should be 1.");
        assert.equal(await loyaltyPointsProgram.totalBalance(0), 9, "Shop1 should still have 9 points to be redeemed.");
        assert.equal(await loyaltyPointsProgram.totalBalance(1), 0, "Shop2 should still have 0 points to be redeemed.");
    });

})