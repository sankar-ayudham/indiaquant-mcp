# IndiaQuant MCP 4 - Real-Time Indian Market AI Assistant

A production-ready Model Context Protocol (MCP) server that empowers AI agents with real-time quantitative analysis, options Greek modeling, and virtual trading capabilities for the Indian Stock Market.

## 🚀 Architecture & System Design
* **Protocol Layer:** Uses `@modelcontextprotocol/sdk` via `StdioServerTransport` for Claude Desktop integration.
* **Market Data:** Powered by `yahoo-finance2`. Handles `.NS` suffix appending for NSE tickers and mitigates stdout leakage via `suppressNotices`.
* **Quant Engine:** Uses `technicalindicators` for localized RSI, MACD, and Bollinger Bands calculations.
* **Options Math Engine:** Pure mathematical implementation of the Black-Scholes model to compute Delta, Gamma, Theta, and Vega from scratch. Calculates "Max Pain" dynamically.
* **Virtual Portfolio:** Utilizes an in-memory `sqlite3` database for lightning-fast concurrent read/writes.

## ⚙️ Setup Guide
1. Clone the repository.
2. Run `npm install`.
3. Configure `claude_desktop_config.json` with the absolute path to `src/index.js` and add your `NEWSAPI_KEY`.
4. Restart Claude Desktop and prompt: *"Show me the max pain for Nifty this expiry."*