import axios from 'axios';
import chalk from 'chalk';

console.log(chalk.grey('Binance Triangle Arb Scanner'));
console.log(chalk.bgYellow('--------------------------------'));

let binancePairs = []; // Variable to store the pre-loaded pair list

async function loadBinancePairs() {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
    binancePairs = response.data.symbols.map(pair => pair.symbol);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function getAllPairPrices() {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price');
    const prices = {};
    for (const pair of response.data) {
      prices[pair.symbol] = pair.price;
    }
    return prices;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
}

async function getAllPairVolumes() {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
    const volumes = {};
    for (const pair of response.data) {
      volumes[pair.symbol] = pair.volume;
    }
    return volumes;
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
}

function checkPairsExistence(pairs) {
  return pairs.every(pair => binancePairs.includes(pair));
}

async function getAllPairsCombinations() {
  try {
    if (binancePairs.length === 0) {
      // Load the pair list if not already loaded
      await loadBinancePairs();
    }

    const pairPrices = await getAllPairPrices();
    const pairVolumes = await getAllPairVolumes();

    const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
    const pairs = response.data.symbols;

    const baseAssets = new Set(pairs.map(pair => pair.baseAsset));

    const combinations = [];

    // Generate combinations for each base asset
    for (const baseAsset of baseAssets) {
      // Extract symbols with the current base asset
      const baseAssetSymbols = pairs
        .filter(pair => pair.baseAsset === baseAsset)
        .map(pair => pair.symbol);

      // Generate combinations
      for (let i = 0; i < baseAssetSymbols.length; i++) {
        for (let j = i + 1; j < baseAssetSymbols.length; j++) {
          const combination = [baseAssetSymbols[i], baseAssetSymbols[j]];

          // Get the quote asset of the second pair
          const secondPair = pairs.find(pair => pair.symbol === baseAssetSymbols[j]);
          const secondPairQuoteAsset = secondPair.quoteAsset;

          // Get the quote asset of the first pair
          const firstPair = pairs.find(pair => pair.symbol === baseAssetSymbols[i]);
          const firstPairQuoteAsset = firstPair.quoteAsset;

          // Get the symbol of the third pair
          const thirdPairSymbol = `${firstPairQuoteAsset}${secondPairQuoteAsset}`;

          combination.push(thirdPairSymbol);
          combinations.push(combination);
        }
      }
    }

    const sortedCombinations = combinations
      .filter(checkPairsExistence)
      .map(combination => {
        const firstPairPrice = pairPrices[combination[0]];
        const secondPairPrice = pairPrices[combination[1]];
        const thirdPairPrice = pairPrices[combination[2]];
        const ratio = ((1 / firstPairPrice) * secondPairPrice) / thirdPairPrice;
        return {
          combination,
          ratio
        };
      })
      .sort((a, b) => b.ratio - a.ratio);

    for (const { combination, ratio } of sortedCombinations) {
      const firstPairPrice = pairPrices[combination[0]];
      const secondPairPrice = pairPrices[combination[1]];
      const thirdPairPrice = pairPrices[combination[2]];
      
      const firstPairVolume = pairVolumes[combination[0]];
      const secondPairVolume = pairVolumes[combination[1]];
      const thirdPairVolume = pairVolumes[combination[2]];





      if (ratio >= 1.03 && firstPairVolume > 0 && secondPairVolume > 0 && thirdPairVolume > 0) {
        async function getTradingPairSymbols(pair) {
          try {
            const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo');
            const symbols = response.data.symbols;

            for (const symbol of symbols) {
              if (symbol.symbol === pair) {
              const baseAsset = symbol.baseAsset;
              const quoteAsset = symbol.quoteAsset;

              return { baseAsset, quoteAsset };
              }
            }

           throw new Error('Trading pair not found.');
          } catch (error) {
            console.error('Error retrieving trading pair:', error.message);
          }
        }

        async function checkValidPair(pair) {
          try {
            const { baseAsset, quoteAsset } = await getTradingPairSymbols(pair);
            const url = `https://www.binance.com/en/trade/${baseAsset}_${quoteAsset}`;
            const response = await axios.get(url);

            if (response.data.includes("Sorry! The page you’re looking for cannot be found.")) {
              console.log(chalk.grey(`${pair}`), chalk.red(`Pair is not valid`));
            } else {
              console.log(chalk.grey(`${pair}`), chalk.green(`Pair is valid`));
            }
         } catch (error) {
          console.log(chalk.grey(`${pair}`), chalk.red(`Pair is not valid`));
         }
        }
        
        await checkValidPair(combination[0]);
        await checkValidPair(combination[1]);
        await checkValidPair(combination[2]);

        console.log(chalk.grey(`${combination[0]}`), `${firstPairPrice}`);
        console.log(chalk.grey(`${combination[1]}`), `${secondPairPrice}`);
        console.log(chalk.grey(`${combination[2]}`), `${thirdPairPrice}`);
        console.log(chalk.inverse("Profit:"), chalk.cyan(`${(ratio * 100 - 100).toFixed(2)}%`));
        console.log(chalk.bgYellow('--------------------------------'));
      }
    }
    } catch (error) {
    console.error('Error:', error);
    }
  }

getAllPairsCombinations();
