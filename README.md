# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

---

### Project Quick Running and Deployment on Lisk Sepolia Network

1. ensure you have metamask account
2. make **.env** then copy all at **example.env**
3. fill **ACCOUNT_METAMASK_PRIVATE_KEY** with your metamask account private key
4. now run for compile and testing Contract:
   ```console
   npx hardhat test
   ```
5. Check configuration in **ignition/modules/DonateMeModule.ts** if has need passing constructor parameter to contract or if not just leave it right that.
6. check again in **hardhat.config.ts** for configration network is that right or not.
7. and then run for deploy to sepolia lisk network:
   ```console
   npx hardhat ignition deploy ./ignition/modules/DonateMeModule.ts --network sepolia_lisk
   ```
