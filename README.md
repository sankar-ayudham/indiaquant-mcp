# IndiaQuant MCP 4 - Real-Time Indian Market AI Assistant

A production-ready Model Context Protocol (MCP) server that empowers AI agents with real-time quantitative analysis, options Greek modeling, and virtual trading capabilities for the Indian Stock Market.

## 🚀 Architecture & System Design
* **Protocol Layer:** Uses `@modelcontextprotocol/sdk` via `StdioServerTransport` for Claude Desktop integration. Reroutes rogue `console.log` output to `stderr` to protect the JSON-RPC stream.
* **Market Data:** Powered by `yahoo-finance2`. Built with defensive programming (artificial delays) to bypass strict free-tier rate limits (429 Too Many Requests).
* **Quant Engine:** Uses `technicalindicators` for localized RSI, MACD, and Bollinger Bands calculations. Integrates real-time NewsAPI sentiment analysis to adjust technical confidence scores.
* **Options Math Engine:** Pure mathematical implementation of the Black-Scholes model to compute Delta, Gamma, Theta, and Vega from scratch. Calculates "Max Pain" dynamically.
* **Virtual Portfolio:** Utilizes an in-memory `sqlite3` database for lightning-fast concurrent read/writes, equipped with auto-stop-loss and risk management calculations.

## ⚙️ Setup Guide
1. Clone the repository and run `npm install`.
2. Configure `claude_desktop_config.json` with the absolute path to `src/index.js`.
3. Restart Claude Desktop and prompt: *"Show me the max pain for Nifty this expiry."*

## ☁️ Bonus: 24/7 Cloud Deployment Architecture
To deploy this to a free tier (like Render or Fly.io):
1. Replace `StdioServerTransport` with `SSEServerTransport` (Server-Sent Events).
2. Wrap the MCP server in a lightweight `Express.js` application.
3. Expose a `/message` POST endpoint and an `/sse` GET endpoint. 
4. Swap the in-memory SQLite (`:memory:`) to a persistent `.sqlite` file on a mounted disk.