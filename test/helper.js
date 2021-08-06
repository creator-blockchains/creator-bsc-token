// Load dependencies
const BN = web3.utils.BN;

// Enable and inject BN dependency
require("chai")
    .use(require("chai-as-promised"))
    .use(require("chai-bn")(BN))
    .should();

// Common
const assertEqual = function (epxectedValue, actualValue, errorStr) {
    assert(new BN(epxectedValue).should.be.a.bignumber.that.equals(new BN(actualValue)), errorStr);
}

module.exports = {
    assertEqual,
};