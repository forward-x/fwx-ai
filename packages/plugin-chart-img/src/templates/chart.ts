export const getChartTemplate = `
Extract the following parameters for chart generation:
- **symbol** (string): Trading pair symbol (e.g., "BINANCE:ETHUSDT", "NASDAQ:AAPL")
- **interval** (string, optional): Time interval for the chart (default: "4h")
  Available intervals: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 12h, 1d, 1w
- **studies** (string[], optional): Technical indicators to include
  Available studies: MACD, RSI, BB (Bollinger Bands), EMA, SMA, CCI, MFI, ROC, Stoch
- **theme** (string, optional): Chart theme ("light" or "dark", default: "dark")

Provide the values in the following JSON format:

\`\`\`json
{
    "symbol": "BINANCE:ETHUSDT",
    "interval": "4h",
    "studies": ["MACD", "RSI"],
    "theme": "dark"
}
\`\`\`

Example request: "Show me ETH/USDT chart with MACD"
Example response:
\`\`\`json
{
    "symbol": "BINANCE:ETHUSDT",
    "interval": "4h",
    "studies": ["MACD"]
}
\`\`\`

Example request: "Generate a daily BTC chart with RSI and Bollinger Bands"
Example response:
\`\`\`json
{
    "symbol": "BINANCE:BTCUSDT",
    "interval": "1d",
    "studies": ["RSI", "BB"]
}
\`\`\`

Here are the recent user messages for context:
{{recentMessages}}

Based on the conversation above, if the request is for a chart, extract the appropriate parameters and respond with a JSON object. If the request is not related to chart generation, respond with null.`;
