# binance-triangular-arbitrage-scanner
This is a bot that scans for potential arbitrage opportunities on the Binance cryptocurrency exchange. It identifies combinations of three currency pairs where the price ratios allow for profitable trades. The bot checks the validity of each pair and calculates the potential profit percentage.

# Features
- Fetches the pair list, prices, and volumes from the Binance API.
- Generates combinations of pairs using base assets.
- Calculates the price ratios and identifies potential arbitrage opportunities.
- Verifies the validity of each pair on the Binance exchange.
- Prints relevant information for profitable combinations, including prices and profit percentage.
- Uses the axios library for making HTTP requests.
- Utilizes the chalk library for formatting console output.

# Prerequisites
- Node.js and npm installed on your machine.

# Installation
- Clone the repository:
  git clone https://github.com/pmjhacc/binance-triangular-arbitrage-scanner.git
- Navigate to the project directory:
  cd binance-triangular-arbitrage-scanner
- Install the dependencies:
  npm i axios chalk

# Usage
To start scanning for arbitrage opportunities, run the following command:
node index.js

The bot will fetch the necessary data from the Binance API and display any profitable combinations it finds. The output will include the prices of the three pairs, the profit percentage, and whether each pair is valid on the Binance exchange.
You can customize the minimum profit percentage threshold and other parameters by modifying the code in the script file.

# Disclaimer
This bot is provided for educational and informational purposes only. Use it at your own risk. The author is not responsible for any financial losses incurred as a result of using this bot. Always exercise caution and do your own research when trading cryptocurrencies.
Feel free to contribute to the project by submitting pull requests or reporting issues.

Happy trading!
