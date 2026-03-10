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
        side TEXT,
        stop_loss REAL,
        target_price REAL,
        status TEXT DEFAULT 'OPEN'
    )`);
}

export async function placeVirtualTrade(symbol, qty, side, price, stop_loss = null, target = null) {
    await run(
        `INSERT INTO portfolio (symbol, qty, buy_price, side, stop_loss, target_price) VALUES (?, ?, ?, ?, ?, ?)`, 
        [symbol, qty, price, side, stop_loss, target]
    );
    return { status: 'success', symbol, qty, side, execution_price: price, stop_loss, target };
}

export async function getPortfolio() {
    return await all(`SELECT * FROM portfolio WHERE status = 'OPEN'`);
}

export async function updateTradeStatus(id, newStatus) {
    await run(`UPDATE portfolio SET status = ? WHERE id = ?`, [newStatus, id]);
}