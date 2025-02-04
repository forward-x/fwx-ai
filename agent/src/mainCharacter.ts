import {
    Character,
    Clients,
    defaultCharacter,
    ModelProviderName,
} from "@elizaos/core";
import { chartImgPlugin } from "@elizaos/plugin-chart-img";

export const mainCharacter: Character = {
    ...defaultCharacter,
    clients: [],
    plugins: [chartImgPlugin],
    modelProvider: ModelProviderName.OPENROUTER,
};
