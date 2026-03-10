import YahooFinance from 'yahoo-finance2';

// Initialize the new v3 client
const yahooFinance = new YahooFinance();

async function test() {
    try {
        console.log("Fetching price for RELIANCE.NS...");
        const quote = await yahooFinance.quote('RELIANCE.NS');
        console.log("Success! Price is:", quote.regularMarketPrice);
    } catch (error) {
        console.error("THE EXACT ERROR IS:", error.message);
        console.error(error);
    }
}

test();