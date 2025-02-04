import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";
import { API_URLS } from "./constants";

const chartImgConfigSchema = z
    .object({
        CHARTIMG_API_KEY: z.string(),
    })
    .refine((data) => !!data.CHARTIMG_API_KEY, {
        message: "CHARTIMG_API_KEY must be provided",
    });

export type ChartImgConfig = z.infer<typeof chartImgConfigSchema>;

export async function validateChartImgConfig(
    runtime: IAgentRuntime
): Promise<ChartImgConfig> {
    const config = {
        CHARTIMG_API_KEY: runtime.getSetting("CHARTIMG_API_KEY"),
    };

    return chartImgConfigSchema.parse(config);
}

export function getApiConfig(config: ChartImgConfig) {
    return {
        baseUrl: API_URLS.BASE,
        apiKey: config.CHARTIMG_API_KEY,
        headers: {
            Authorization: `Bearer ${config.CHARTIMG_API_KEY}`,
            accept: "application/json",
        },
    };
}
