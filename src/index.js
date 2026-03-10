// src/index.js

// --- CRITICAL MCP FIX ---
const originalConsoleLog = console.log;
console.log = (...args) => { console.error(...args); };
// ------------------------

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { getLivePrice, generateSignal, getOptionsChain, detectUnusualActivity, getSectorHeatmap, scanMarket } from "./services/marketData.js";
import { analyzeSentiment } from "./services/sentiment.js";
import { calculateGreeks } from "./math/blackScholes.js";
import { initDb, placeVirtualTrade, getPortfolio } from "./db/portfolio.js";

await initDb();

const server = new Server({ name: "indiaquant-mcp", version: "1.0.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            { name: "get_live_price", description: "Get real-time price.", inputSchema: { type: "object", properties: { symbol: { type: "string" } }, required: ["symbol"] } },
            { name: "generate_signal", description: "Get BUY/SELL signal.", inputSchema: { type: "object", properties: { symbol: { type: "string" } }, required: ["symbol"] } },
            { name: "calculate_greeks", description: "Calculate Options Greeks.", inputSchema: { type: "object", properties: { type: { type: "string", enum: ["CE", "PE"] }, spot_price: { type: "number" }, strike_price: { type: "number" }, time_to_expiry_years: { type: "number" }, implied_volatility: { type: "number" } }, required: ["type", "spot_price", "strike_price", "time_to_expiry_years", "implied_volatility"] } },
            { name: "place_virtual_trade", description: "Place paper trade.", inputSchema: { type: "object", properties: { symbol: { type: "string" }, qty: { type: "number" }, side: { type: "string", enum: ["BUY", "SELL"] } }, required: ["symbol", "qty", "side"] } },
            { name: "get_portfolio_pnl", description: "Get live P&L.", inputSchema: { type: "object", properties: {} } },
            { name: "analyze_sentiment", description: "Analyze news sentiment.", inputSchema: { type: "object", properties: { symbol: { type: "string" } }, required: ["symbol"] } },
            { name: "get_options_chain", description: "Get options chain & Max Pain.", inputSchema: { type: "object", properties: { symbol: { type: "string" } }, required: ["symbol"] } },
            { name: "detect_unusual_activity", description: "Detect volume spikes.", inputSchema: { type: "object", properties: { symbol: { type: "string" } }, required: ["symbol"] } },
            { name: "get_sector_heatmap", description: "Get daily % change for sectors.", inputSchema: { type: "object", properties: {} } },
            { name: "scan_market", description: "Scan top Nifty stocks.", inputSchema: { type: "object", properties: {} } }
        ]
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;
        if (name === "get_live_price") return { content: [{ type: "text", text: JSON.stringify(await getLivePrice(args.symbol), null, 2) }] };
        if (name === "generate_signal") return { content: [{ type: "text", text: JSON.stringify(await generateSignal(args.symbol), null, 2) }] };
        if (name === "calculate_greeks") return { content: [{ type: "text", text: JSON.stringify(calculateGreeks(args.type, args.spot_price, args.strike_price, args.time_to_expiry_years, 0.07, args.implied_volatility), null, 2) }] };
        if (name === "place_virtual_trade") {
            const liveData = await getLivePrice(args.symbol);
            return { content: [{ type: "text", text: JSON.stringify(await placeVirtualTrade(args.symbol, args.qty, args.side, liveData.price), null, 2) }] };
        }
        if (name === "get_portfolio_pnl") {
            const positions = await getPortfolio();
            let totalPnl = 0;
            const updatedPositions = await Promise.all(positions.map(async (pos) => {
                const live = await getLivePrice(pos.symbol);
                const pnl = (live.price - pos.buy_price) * pos.qty * (pos.side === 'BUY' ? 1 : -1);
                totalPnl += pnl;
                return { ...pos, current_price: live.price, pnl };
            }));
            return { content: [{ type: "text", text: JSON.stringify({ positions: updatedPositions, totalPnl }, null, 2) }] };
        }
        if (name === "analyze_sentiment") return { content: [{ type: "text", text: JSON.stringify(await analyzeSentiment(args.symbol), null, 2) }] };
        if (name === "get_options_chain") return { content: [{ type: "text", text: JSON.stringify(await getOptionsChain(args.symbol), null, 2) }] };
        if (name === "detect_unusual_activity") return { content: [{ type: "text", text: JSON.stringify(await detectUnusualActivity(args.symbol), null, 2) }] };
        if (name === "get_sector_heatmap") return { content: [{ type: "text", text: JSON.stringify(await getSectorHeatmap(), null, 2) }] };
        if (name === "scan_market") return { content: [{ type: "text", text: JSON.stringify(await scanMarket(), null, 2) }] };

        throw new Error(`Tool ${name} not implemented.`);
    } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("IndiaQuant MCP Server running on stdio");