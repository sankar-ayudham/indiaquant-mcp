// tests/math.test.js
import { calculateGreeks } from '../src/math/blackScholes.js';

describe('Black-Scholes Options Math', () => {
    test('Calculates Call option Greeks correctly', () => {
        // Spot: 100, Strike: 100, Time: 1 year, Rate: 5%, Vol: 20%
        const greeks = calculateGreeks('CE', 100, 100, 1, 0.05, 0.2);
        
        expect(greeks.delta).toBeGreaterThan(0.5); // Call delta > 0.5 for ATM with positive rate
        expect(greeks.delta).toBeLessThan(1);
        expect(greeks.gamma).toBeGreaterThan(0);
        expect(greeks.vega).toBeGreaterThan(0);
        expect(greeks.theta).toBeLessThan(0); // Time decay hurts buyers
    });

    test('Calculates Put option Greeks correctly', () => {
        const greeks = calculateGreeks('PE', 100, 100, 1, 0.05, 0.2);
        
        expect(greeks.delta).toBeLessThan(0); // Put delta is negative
        expect(greeks.delta).toBeGreaterThan(-1);
        expect(greeks.gamma).toBeGreaterThan(0); // Gamma is always positive for long options
    });
});