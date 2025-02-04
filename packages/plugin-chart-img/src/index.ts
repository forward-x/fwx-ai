import { Plugin } from "@elizaos/core";
import getChart from "./actions/getChart";

export const chartImgPlugin: Plugin = {
    name: "chart-img",
    description: "Chart-img Plugin for generating trading charts",
    actions: [getChart],
    evaluators: [],
    providers: [],
};

export default chartImgPlugin;
