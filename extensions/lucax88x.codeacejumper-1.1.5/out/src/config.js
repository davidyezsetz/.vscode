"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Config {
    constructor() {
        this.characters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
        this.placeholder = new PlaceHolderConfig();
        this.finder = new FinderConfig();
    }
}
exports.Config = Config;
class PlaceHolderConfig {
    constructor() {
        this.backgroundColor = "yellow";
        this.color = "black";
        this.border = "dotted thin black";
        this.width = 12;
        this.height = 14;
        this.textPosX = 2;
        this.textPosY = 12;
        this.fontSize = 14;
        this.fontWeight = "normal";
        this.fontFamily = "Consolas";
        this.upperCase = false;
    }
}
class FinderConfig {
    constructor() {
        this.skipSelection = false;
        this.onlyInitialLetter = true;
    }
}
//# sourceMappingURL=config.js.map