// tests/math.test.js
import { calculateGreeks } from '../src/math/blackScholes.js';

describe('Black-Scholes Options Math', () => {
    test('Calculates Call option Greeks correctly', () => {
        const greeks = calculateGreeks('CE', 100, 100, 1, 0.05, 0.2);
        expect(greeks.delta).toBeGreaterThan(0.5); 
        expect(greeks.delta).toBeLessThan(1);
        expect(greeks.gamma).toBeGreaterThan(0);
        expect(greeks.vega).toBeGreaterThan(0);
        expect(greeks.theta).toBeLessThan(0); 
    });

    test('Calculates Put option Greeks correctly', () => {
        const greeks = calculateGreeks('PE', 100, 100, 1, 0.05, 0.2);
        expect(greeks.delta).toBeLessThan(0); 
        expect(greeks.delta).toBeGreaterThan(-1);
        expect(greeks.gamma).toBeGreaterThan(0); 
    });
});