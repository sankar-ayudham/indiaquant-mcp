// tests/portfolio.test.js
import { initDb, placeVirtualTrade, getPortfolio } from '../src/db/portfolio.js';

describe('Portfolio Risk Manager Integration', () => {
    beforeAll(async () => {
        await initDb(); 
    });

    test('Places a virtual trade with stop-loss and target successfully', async () => {
        const trade = await placeVirtualTrade('RELIANCE.NS', 10, 'BUY', 2500, 2400, 2700);
        expect(trade.status).toBe('success');
        expect(trade.symbol).toBe('RELIANCE.NS');
        expect(trade.execution_price).toBe(2500);
        expect(trade.stop_loss).toBe(2400);
    });

    test('Retrieves open positions accurately', async () => {
        const positions = await getPortfolio();
        expect(positions.length).toBe(1);
        expect(positions[0].symbol).toBe('RELIANCE.NS');
        expect(positions[0].qty).toBe(10);
        expect(positions[0].status).toBe('OPEN');
    });
});