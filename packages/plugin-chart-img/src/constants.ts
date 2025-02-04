export const API_URLS = {
    BASE: "https://api.chart-img.com/v2/tradingview",
    CHART: "https://api.chart-img.com/v2/tradingview/advanced-chart/storage",
} as const;

export const INTERVALS = {
    "1m": "1m",
    "3m": "3m",
    "5m": "5m",
    "15m": "15m",
    "30m": "30m",
    "1h": "1h",
    "2h": "2h",
    "4h": "4h",
    "6h": "6h",
    "12h": "12h",
    "1d": "1d",
    "1w": "1w",
} as const;

export type StudyType =
    | "MACD"
    | "RSI"
    | "BB"
    | "EMA"
    | "SMA"
    | "CCI"
    | "MFI"
    | "ROC"
    | "Stoch";
export const AVAILABLE_STUDIES: StudyType[] = [
    "MACD",
    "RSI",
    "BB",
    "EMA",
    "SMA",
    "CCI",
    "MFI",
    "ROC",
    "Stoch",
] as const;

export const DEFAULT_INTERVAL = "4h";
export const DEFAULT_THEME = "light";
