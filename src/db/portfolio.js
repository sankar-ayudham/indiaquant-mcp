// src/db/portfolio.js
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const db = new sqlite3.Database(':memory:');
const run = promisify(db.run.bind(db));
const all = promisify(db.all.bind(db));

export async function initDb() {
    await run(`CREATE TABLE IF NOT EXISTS portfolio (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT,
        qty INTEGER,
        buy_price REAL,
        side TEXT
    )`);
}

export async function placeVirtualTrade(symbol, qty, side, price) {
    await run(`INSERT INTO portfolio (symbol, qty, buy_price, side) VALUES (?, ?, ?, ?)`, [symbol, qty, price, side]);
    return { status: 'success', symbol, qty, side, execution_price: price };
}

export async function getPortfolio() {
    return await all(`SELECT * FROM portfolio`);
}