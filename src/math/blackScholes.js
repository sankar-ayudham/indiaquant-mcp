function CND(x) {
    const a1 = 0.31938153, a2 = -0.356563782, a3 = 1.781477937, a4 = -1.821255978, a5 = 1.330274429;
    const L = Math.abs(x);
    const K = 1.0 / (1.0 + 0.2316419 * L);
    let w = 1.0 - 1.0 / Math.sqrt(2 * Math.PI) * Math.exp(-L * L / 2) * (a1 * K + a2 * K * K + a3 * Math.pow(K, 3) + a4 * Math.pow(K, 4) + a5 * Math.pow(K, 5));
    if (x < 0) w = 1.0 - w;
    return w;
}

function ND(x) {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export function calculateGreeks(type, S, K, T, r, v) {
    if (T <= 0) T = 0.00001; 

    const d1 = (Math.log(S / K) + (r + v * v / 2) * T) / (v * Math.sqrt(T));
    const d2 = d1 - v * Math.sqrt(T);

    let delta, gamma, theta, vega;

    gamma = ND(d1) / (S * v * Math.sqrt(T));
    vega = S * ND(d1) * Math.sqrt(T) / 100;

    if (type.toLowerCase() === 'call' || type.toLowerCase() === 'ce') {
        delta = CND(d1);
        theta = (- (S * v * ND(d1)) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * CND(d2)) / 365;
    } else {
        delta = CND(d1) - 1;
        theta = (- (S * v * ND(d1)) / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * CND(-d2)) / 365;
    }

    return { delta, gamma, theta, vega };
}