require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/Pr0BKmlnupwB5sV_yu2XvDNUZR0jP2p5', // Your Alchemy API URL
      accounts: ['ef77bf13bf973ff15fd8bfca454daa2cebe70c7ec1eb1c401577423dcbe9aae4'] // Replace with your private key (remove this in production)
    }
  }
}
