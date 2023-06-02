require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test"
  },
  networks:{
    sepolia:{
      url:`https://sepolia.infura.io/v3/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY],
    }
  },
};
// mocha: {
//   timeout: 100000000,
//   retries: 3,
// },

// task("accounts", "Prints the list of accounts", async () => {
//   const accounts = await ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });