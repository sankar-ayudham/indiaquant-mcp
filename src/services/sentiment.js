import axios from 'axios';

const BULLISH_WORDS = ['surge', 'profit', 'up', 'growth', 'buy', 'beat', 'record', 'high', 'dividend', 'win', 'rally'];
const BEARISH_WORDS = ['loss', 'drop', 'crash', 'down', 'miss', 'sell', 'low', 'debt', 'lawsuit', 'warning', 'plunge'];

export async function analyzeSentiment(symbol) {
    // FIX: Hardcoded to bypass Windows environment variable quirks
    const apiKey = "0dc8fbb385ea47a99e2142f7bfab720b"; 

    const query = symbol.replace('.NS', '').replace('.BO', '');
    const url = `https://newsapi.org/v2/everything?q=${query}+stock&sortBy=publishedAt&language=en&pageSize=10&apiKey=${apiKey}`;

    try {
        const response = await axios.get(url);
        const articles = response.data.articles;
        
        let score = 0;
        const headlines = articles.map(a => a.title);

        headlines.forEach(headline => {
            const lower = headline.toLowerCase();
            BULLISH_WORDS.forEach(word => { if (lower.includes(word)) score += 1; });
            BEARISH_WORDS.forEach(word => { if (lower.includes(word)) score -= 1; });
        });

        const normalizedConfidence = Math.min(100, Math.max(0, 50 + (score * 10)));
        let signal = score > 0 ? 'BULLISH' : score < 0 ? 'BEARISH' : 'NEUTRAL';

        return { symbol, signal, confidence_score: normalizedConfidence, recent_headlines: headlines.slice(0, 3) };
    } catch (error) {
        throw new Error(`NewsAPI Error: ${error.message}`);
    }
}