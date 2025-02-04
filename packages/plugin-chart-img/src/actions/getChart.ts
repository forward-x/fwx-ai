import {
    ActionExample,
    composeContext,
    Content,
    elizaLogger,
    generateObject,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
    type Action,
} from "@elizaos/core";
import axios from "axios";
import OpenAI from "openai";
// Custom parameter serialization helper
function serializeParams(params: Record<string, any>): string {
    const parts: string[] = [];

    Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            // Handle arrays by repeating the parameter
            value.forEach((item) => {
                parts.push(
                    `${encodeURIComponent(key)}=${encodeURIComponent(item)}`
                );
            });
        } else if (value !== undefined && value !== null) {
            parts.push(
                `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
            );
        }
    });

    return parts.join("&");
}
import { z } from "zod";
import {
    INTERVALS,
    AVAILABLE_STUDIES,
    DEFAULT_INTERVAL,
    DEFAULT_THEME,
    API_URLS,
} from "../constants";
import { getApiConfig, validateChartImgConfig } from "../environment";
import { getChartTemplate } from "../templates/chart";

export const GetChartSchema = z.object({
    symbol: z.string(),
    interval: z.string().default(DEFAULT_INTERVAL),
    studies: z.array(z.string()).default([]),
    theme: z.enum(["light", "dark"]).default(DEFAULT_THEME),
});

export type GetChartContent = z.infer<typeof GetChartSchema> & Content;

export const isGetChartContent = (obj: any): obj is GetChartContent => {
    return GetChartSchema.safeParse(obj).success;
};

export default {
    name: "GET_CHART",
    similes: [
        "GENERATE_CHART",
        "CREATE_CHART",
        "SHOW_CHART",
        "DISPLAY_CHART",
        "CHART_VIEW",
        "TRADING_CHART",
    ],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        await validateChartImgConfig(runtime);
        return true;
    },
    description:
        "Generate a trading chart for a specific symbol with optional technical indicators",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ): Promise<boolean> => {
        elizaLogger.log("Starting Chart-img GET_CHART handler...");

        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        try {
            const chartContext = composeContext({
                state,
                template: getChartTemplate,
            });

            const result = await generateObject({
                runtime,
                context: chartContext,
                modelClass: ModelClass.SMALL,
                schema: GetChartSchema,
            });

            if (!isGetChartContent(result.object)) {
                elizaLogger.error("Invalid chart request format");
                return false;
            }

            const content = result.object;
            elizaLogger.log("Generated chart content:", content);

            // Validate interval
            if (!INTERVALS[content.interval]) {
                throw new Error(
                    `Invalid interval: ${content.interval}. Available intervals: ${Object.keys(INTERVALS).join(", ")}`
                );
            }

            // Validate studies
            if (content.studies.length > 0) {
                const invalidStudies = content.studies.filter(
                    (study) =>
                        AVAILABLE_STUDIES.filter((x) => x === study).length > 0
                );
                if (invalidStudies.length > 0) {
                    throw new Error(
                        `Invalid studies: ${invalidStudies.join(", ")}. Available studies: ${AVAILABLE_STUDIES.join(", ")}`
                    );
                }
            }

            const config = await validateChartImgConfig(runtime);
            const { apiKey } = getApiConfig(config);

            const reqBody = {
                symbol: content.symbol,
                interval: INTERVALS[content.interval],
                studies: content.studies,
                theme: content.theme,
            };

            const response = await axios.post(API_URLS.CHART, reqBody, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    accept: "application/json",
                },
            });

            elizaLogger.log("req ja ", JSON.stringify(reqBody));
            elizaLogger.log("response 1 ja ", typeof response);
            elizaLogger.log("response 1 ja ", typeof response.data);
            elizaLogger.log("response 1 ja ", JSON.stringify(response.data));

            if (!response.data) {
                throw new Error("No chart data received");
            }

            const openai = new OpenAI({
                baseURL: "https://openrouter.ai/api/v1",
                apiKey: "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",
            });
            const response2 = await openai.chat.completions.create({
                model: "openai/gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `Analyze this chart as a professional technical analyst and provide:

Market Context:
Identify the symbol
Determine overall market condition and trend strength
Specify key support and resistance levels
Recommend an action (buy, sell, hold)


Technical Indicators:
                         Select exactly 3 technical indicators that best suit this chart:
At least one trend indicator (EMA, SMA, VWAP)
At least one momentum indicator (RSI, MACD, Stochastic)
At least one volatility indicator (Bollinger Bands, ATR)

                            No need to provide the exact values of the indicators. Just mention the indicator names.`,
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: response.data.url,
                                },
                            },
                        ],
                    },
                ],
                store: true,
            });

            elizaLogger.log("response 2 ja", response2);

            const symbolDisplay = content.symbol.replace(":", "/");
            const studiesDisplay =
                content.studies.length > 0
                    ? ` with ${content.studies.join(" and ")}`
                    : "";

            if (callback) {
                callback({
                    text: `Generated ${content.interval} chart for ${symbolDisplay}${studiesDisplay}`,
                    content: {
                        chartData: response.data,
                        params: {
                            symbol: content.symbol,
                            interval: content.interval,
                            studies: content.studies,
                            theme: content.theme,
                        },
                        timestamp: new Date().toISOString(),
                    },
                });
            }

            return true;
        } catch (error) {
            elizaLogger.error("Error in GET_CHART handler:", error);

            let errorMessage;
            if (error.response?.status === 401) {
                errorMessage =
                    "Invalid API key. Please check your Chart-img API key.";
            } else if (error.response?.status === 429) {
                errorMessage = "Rate limit exceeded. Please try again later.";
            } else if (error.response?.status === 400) {
                errorMessage =
                    "Invalid request parameters. Please check your input.";
            } else {
                errorMessage = `Error generating chart: ${error.message}`;
            }

            if (callback) {
                callback({
                    text: errorMessage,
                    error: {
                        message: error.message,
                        statusCode: error.response?.status,
                        requiresValidKey: error.response?.status === 401,
                    },
                });
            }
            return false;
        }
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Show me a chart for BINANCE:ETHUSDT",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll generate a chart for ETH/USDT.",
                    action: "GET_CHART",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Here's your ETH/USDT chart with 4h interval.",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Create a BTC daily chart with MACD and RSI",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "I'll generate a daily BTC chart with the requested indicators.",
                    action: "GET_CHART",
                },
            },
            {
                user: "{{agent}}",
                content: {
                    text: "Generated daily chart for BTC/USDT with MACD and RSI",
                },
            },
        ],
    ] as ActionExample[][],
} as Action;
