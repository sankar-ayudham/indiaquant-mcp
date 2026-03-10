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

## ☁️ Bonus: 24/7 Cloud Deployment Architecture
While this implementation uses the `StdioServerTransport` for direct integration with the local Claude Desktop app, it is architected to be easily deployable for 24/7 cloud availability. 

**To deploy this to a free tier (like Render, Railway, or Fly.io):**
1. **Transport Swap:** Replace `StdioServerTransport` with `SSEServerTransport` (Server-Sent Events).
2. **HTTP Wrapper:** Wrap the MCP server in a lightweight `Express.js` application.
3. **Endpoints:** Expose a `/message` POST endpoint and an `/sse` GET endpoint. 
4. **Database Migration:** Swap the in-memory SQLite (`:memory:`) to a persistent storage solution (like a mounted disk `.sqlite` file, or a free-tier PostgreSQL database on Supabase) to ensure the virtual portfolio survives server restarts.
5. **AI Agent Connection:** Any remote AI agent framework (LangChain, LlamaIndex, or cloud-hosted Claude) can then connect to the live SSE URL URL to access the market tools 24/7.