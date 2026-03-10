// src/services/marketData.js
import YahooFinance from 'yahoo-finance2';
import { RSI, MACD, BollingerBands } from 'technicalindicators';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const formatSymbol = (symbol) => symbol.endsWith('.NS') || symbol.endsWith('.BO') || symbol.startsWith('^') ? symbol : `${symbol}.NS`;

export async function getLivePrice(symbol) {
    const quote = await yahooFinance.quote(formatSymbol(symbol));
    return { symbol, price: quote.regularMarketPrice, changePercent: quote.regularMarketChangePercent, volume: quote.regularMarketVolume };
}

export async function generateSignal(symbol, period = 14) {
    const queryOptions = { period1: '3mo', interval: '1d' };
    const result = await yahooFinance.historical(formatSymbol(symbol), queryOptions);
    const closes = result.map(candle => candle.close);
    
    const rsiResult = RSI.calculate({ values: closes, period });
    const macdResult = MACD.calculate({ values: closes, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false });
    const bbResult = BollingerBands.calculate({ period: 20, values: closes, stdDev: 2 });
    
    const latestRSI = rsiResult[rsiResult.length - 1];
    const latestMACD = macdResult[macdResult.length - 1];
    const latestBB = bbResult[bbResult.length - 1];
    const lastClose = closes[closes.length - 1];

    const recentHighs = closes.slice(-10).sort((a, b) => b - a);
    const isDoubleTop = (recentHighs[0] - recentHighs[1]) / recentHighs[0] < 0.01 && latestRSI > 65;

    let signal = "HOLD"; let confidence = 50;

    if (latestRSI < 30 && latestMACD.histogram > 0 && lastClose <= latestBB.lower) {
        signal = "BUY"; confidence = 85;
    } else if ((latestRSI > 70 && latestMACD.histogram < 0) || isDoubleTop) {
        signal = "SELL"; confidence = isDoubleTop ? 95 : 85;
    }

    return { symbol, signal, confidence, pattern_detected: isDoubleTop ? "Double Top" : "None", indicators: { RSI: latestRSI, MACD: latestMACD.histogram } };
}

export async function getOptionsChain(symbol) {
    const options = await yahooFinance.options(formatSymbol(symbol));
    if (!options || !options.options || options.options.length === 0) throw new Error("No options data found.");
    
    const expiry = options.options[0];
    let minPain = Infinity;
    let maxPainStrike = 0;

    const allStrikes = [...expiry.calls, ...expiry.puts].map(o => o.strike);
    const uniqueStrikes = [...new Set(allStrikes)];

    uniqueStrikes.forEach(strikePrice => {
        let totalPain = 0;
        expiry.calls.forEach(call => { if (call.strike < strikePrice) totalPain += (strikePrice - call.strike) * (call.openInterest || 0); });
        expiry.puts.forEach(put => { if (put.strike > strikePrice) totalPain += (put.strike - strikePrice) * (put.openInterest || 0); });
        
        if (totalPain < minPain) { minPain = totalPain; maxPainStrike = strikePrice; }
    });

    return { symbol, expiry_date: expiry.expirationDate, max_pain_strike: maxPainStrike, calls_count: expiry.calls.length, puts_count: expiry.puts.length };
}

export async function detectUnusualActivity(symbol) {
    const quote = await yahooFinance.quote(formatSymbol(symbol));
    const avgVolume = quote.averageDailyVolume10Day || 1;
    const currentVolume = quote.regularMarketVolume || 0;
    const volumeSpike = currentVolume > (avgVolume * 2);
    
    return {
        symbol, current_volume: currentVolume, average_volume: avgVolume,
        unusual_activity_detected: volumeSpike,
        alert: volumeSpike ? "High Volume Spike Detected (>200% of 10-day average)" : "Normal Volume"
    };
}

export async function getSectorHeatmap() {
    const sectors = ['^CNXIT', '^NSEBANK', '^CNXAUTO', '^CNXFMCG', '^CNXPHARMA'];
    const heatmap = {};
    for (const sector of sectors) {
        try {
            const quote = await yahooFinance.quote(sector);
            heatmap[sector.replace('^', '')] = `${quote.regularMarketChangePercent.toFixed(2)}%`;
        } catch (e) { heatmap[sector] = "Data unavailable"; }
    }
    return heatmap;
}

export async function scanMarket() {
    const scanList = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS'];
    const results = [];
    for (const sym of scanList) {
        const sig = await generateSignal(sym);
        if (sig.signal === 'BUY' || sig.signal === 'SELL') results.push({ symbol: sym, signal: sig.signal, RSI: sig.indicators.RSI.toFixed(2) });
    }
    return results.length > 0 ? results : { message: "No immediate BUY/SELL setups found." };
}