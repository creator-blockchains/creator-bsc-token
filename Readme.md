# CreatorChain Token
This is development repo for CreatorChain token.
Token is ERC20 standard from [openzeppelin](https://openzeppelin.com).

# Run in local
1. Install dependencies:
```
yarn install
```

2. Define your .env file then compile smart contracts: 
```
yarn compile
```

3. Start local network
```
yarn start-local
```
Option 2: using truffle
```
yarn start-local-tf
```
Option 3: using docker
```
docker run --detach --publish 8545:8545 trufflesuite/ganache-cli:latest
```

4. Run test:
```
yarn test
```

5. Deploy to local network:
```
yarn deploy-token
```