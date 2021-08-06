// Load dependencies

const { assertEqual } = require('./helper');
const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

// Load compiled artifacts
const CtrToken = artifacts.require('CtrToken.sol');

// Common variables
let token;

// Start test block
contract('CtrToken', accounts => {

    const [initialHolder, recipient, anotherAccount] = accounts;
    const name = 'Creator Platform';
    const symbol = 'CTR';
    const initialSupply = new BN(150).mul(new BN(10).pow(new BN(24)));


    beforeEach(async function () {
        token = await CtrToken.new(initialHolder);
        this.token = token;
    });

    it('Has a name', async function () {
        expect(await token.name()).to.equal(name);
    });

    it('Has a symbol', async function () {
        expect(await token.symbol()).to.equal(symbol);
    });

    it('Has 18 decimals', async function () {
        expect(await token.decimals()).to.be.bignumber.equal('18');
    });

    describe('Test all basic token functions', async () => {

        it('Test contract initiated values', async function () {
            const expectedTotalSupply = new BN(150).mul(new BN(10).pow(new BN(24))); // 24 ~ 1M 10^6 & 10^18 decimals
            assertEqual(expectedTotalSupply, await token.totalSupply(), "Wrong total supply");
            assertEqual(expectedTotalSupply, await token.balanceOf(initialHolder), "Wrong admin balance");
        });

        it(`Test token burn`, async () => {
            let adminBalance = await token.balanceOf(initialHolder);
            let burnAmount = new BN(10).pow(new BN(18));
            let totalSupply = await token.totalSupply();

            // Expected values
            let adminBalanceAfter = adminBalance.sub(burnAmount);
            let totalSupplyAfter = totalSupply.sub(burnAmount);

            await token.burn(burnAmount, { from: initialHolder });

            assertEqual(adminBalanceAfter, await token.balanceOf(initialHolder));
            assertEqual(totalSupplyAfter, await token.totalSupply());
        });

        it(`Test token burnFrom`, async () => {
            let adminBalance = await token.balanceOf(initialHolder);
            let userBalance = await token.balanceOf(recipient);
            let totalSupply = await token.totalSupply();
            let burnAmount = new BN(10).pow(new BN(18));

            // Expected values
            let adminBalanceAfter = adminBalance.sub(burnAmount);
            let totalSupplyAfter = totalSupply.sub(burnAmount);

            await token.approve(recipient, burnAmount, { from: initialHolder });
            await token.burnFrom(initialHolder, burnAmount, { from: recipient });

            assertEqual(adminBalanceAfter, await token.balanceOf(initialHolder));
            assertEqual(totalSupplyAfter, await token.totalSupply());
            assertEqual(userBalance, await token.balanceOf(recipient));
        });
    });

    describe('decrease allowance', function () {
        describe('when the spender is not the zero address', function () {
            const spender = recipient;

            function shouldDecreaseApproval (amount) {
                describe('when there was no approved amount before', function () {
                    it('reverts', async function () {
                        await expectRevert(this.token.decreaseAllowance(
                            spender, amount, { from: initialHolder }), 'ERC20: decreased allowance below zero',
                        );
                    });
                });

                describe('when the spender had an approved amount', function () {
                    const approvedAmount = amount;

                    beforeEach(async function () {
                        ({ logs: this.logs } = await this.token.approve(spender, approvedAmount, { from: initialHolder }));
                    });

                    it('emits an approval event', async function () {
                        const { logs } = await this.token.decreaseAllowance(spender, approvedAmount, { from: initialHolder });

                        expectEvent.inLogs(logs, 'Approval', {
                            owner: initialHolder,
                            spender: spender,
                            value: new BN(0),
                        });
                    });

                    it('decreases the spender allowance subtracting the requested amount', async function () {
                        await this.token.decreaseAllowance(spender, approvedAmount.subn(1), { from: initialHolder });

                        expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal('1');
                    });

                    it('sets the allowance to zero when all allowance is removed', async function () {
                        await this.token.decreaseAllowance(spender, approvedAmount, { from: initialHolder });
                        expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal('0');
                    });

                    it('reverts when more than the full allowance is removed', async function () {
                        await expectRevert(
                            this.token.decreaseAllowance(spender, approvedAmount.addn(1), { from: initialHolder }),
                            'ERC20: decreased allowance below zero',
                        );
                    });
                });
            }

            describe('when the sender has enough balance', function () {
                const amount = initialSupply;

                shouldDecreaseApproval(amount);
            });

            describe('when the sender does not have enough balance', function () {
                const amount = initialSupply.addn(1);

                shouldDecreaseApproval(amount);
            });
        });

        describe('when the spender is the zero address', function () {
            const amount = initialSupply;
            const spender = ZERO_ADDRESS;

            it('reverts', async function () {
                await expectRevert(this.token.decreaseAllowance(
                    spender, amount, { from: initialHolder }), 'ERC20: decreased allowance below zero',
                );
            });
        });
    });

    describe('increase allowance', function () {
        const amount = initialSupply;

        describe('when the spender is not the zero address', function () {
            const spender = recipient;

            describe('when the sender has enough balance', function () {
                it('emits an approval event', async function () {
                    const { logs } = await this.token.increaseAllowance(spender, amount, { from: initialHolder });

                    expectEvent.inLogs(logs, 'Approval', {
                        owner: initialHolder,
                        spender: spender,
                        value: amount,
                    });
                });

                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        await this.token.increaseAllowance(spender, amount, { from: initialHolder });

                        expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal(amount);
                    });
                });

                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        await this.token.approve(spender, new BN(1), { from: initialHolder });
                    });

                    it('increases the spender allowance adding the requested amount', async function () {
                        await this.token.increaseAllowance(spender, amount, { from: initialHolder });

                        expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal(amount.addn(1));
                    });
                });
            });

            describe('when the sender does not have enough balance', function () {
                const amount = initialSupply.addn(1);

                it('emits an approval event', async function () {
                    const { logs } = await this.token.increaseAllowance(spender, amount, { from: initialHolder });

                    expectEvent.inLogs(logs, 'Approval', {
                        owner: initialHolder,
                        spender: spender,
                        value: amount,
                    });
                });

                describe('when there was no approved amount before', function () {
                    it('approves the requested amount', async function () {
                        await this.token.increaseAllowance(spender, amount, { from: initialHolder });

                        expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal(amount);
                    });
                });

                describe('when the spender had an approved amount', function () {
                    beforeEach(async function () {
                        await this.token.approve(spender, new BN(1), { from: initialHolder });
                    });

                    it('increases the spender allowance adding the requested amount', async function () {
                        await this.token.increaseAllowance(spender, amount, { from: initialHolder });

                        expect(await this.token.allowance(initialHolder, spender)).to.be.bignumber.equal(amount.addn(1));
                    });
                });
            });
        });

        describe('when the spender is the zero address', function () {
            const spender = ZERO_ADDRESS;

            it('reverts', async function () {
                await expectRevert(
                    this.token.increaseAllowance(spender, amount, { from: initialHolder }), 'ERC20: approve to the zero address',
                );
            });
        });
    });

    describe('_transfer', function () {
        it('reverts', async function () {
            const amount = initialSupply.addn(1);
            describe('when the sender does not have enough balance', async function () {
                await expectRevert(token.transfer(recipient, amount),
                    `ERC20: transfer amount exceeds balance`,
                );
            });
        });

        describe('when the sender transfers all balance', function () {
            const amount = initialSupply;

            it('transfers the requested amount', async function () {
                await this.token.transfer(recipient, amount);
                expect(await this.token.balanceOf(initialHolder)).to.be.bignumber.equal('0');
                expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(amount);
            });

            it('emits a transfer all balance event', async function () {
                const { logs } = await this.token.transfer(recipient, amount);
                expectEvent.inLogs(logs, 'Transfer', {
                    from: initialHolder,
                    to: recipient,
                    value: amount,
                });
            });
        });

        describe('when the sender transfers zero tokens', function () {
            const amount = new BN('0');

            it('transfers the requested amount', async function () {
                await this.token.transfer(recipient, amount);
                expect(await this.token.balanceOf(initialHolder)).to.be.bignumber.equal(initialSupply);
                expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal('0');
            });

            it('emits a transfer zero event', async function () {
                const {logs} = await this.token.transfer(recipient, amount);
                expectEvent.inLogs(logs, 'Transfer', {
                    from: initialHolder,
                    to: recipient,
                    value: amount,
                });
            });
        });
    });

    describe('_approve', function () {
    });
});
