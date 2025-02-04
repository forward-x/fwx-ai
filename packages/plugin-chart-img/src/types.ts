export interface ChartImgConfig {
    apiKey: string;
    baseUrl?: string;
}

export interface ChartRequestParams {
    symbol: string;
    interval?: string;
    studies?: string[];
    theme?: "light" | "dark";
    width?: number;
    height?: number;
}

export interface ChartResponse {
    url: string;
    status: string;
    timestamp: number;
}
