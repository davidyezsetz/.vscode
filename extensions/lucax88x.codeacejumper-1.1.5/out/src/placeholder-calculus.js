"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class PlaceHolder {
    constructor() {
        this.childrens = [];
    }
}
exports.PlaceHolder = PlaceHolder;
class PlaceHolderCalculus {
    constructor() {
        this.load = (config) => {
            this.config = config;
        };
        this.buildPlaceholders = (lineIndexes) => {
            let placeholders = [];
            let count = 0;
            let candidate = 1;
            let map = [];
            let breakCycles = false;
            for (let key in lineIndexes.indexes) {
                let line = parseInt(key);
                let lineIndex = lineIndexes.indexes[key];
                for (let i = 0; i < lineIndex.length; i++) {
                    if (count + 1 > Math.pow(this.config.characters.length, 2)) {
                        breakCycles = true;
                        break;
                    }
                    let character = lineIndex[i];
                    if (count >= this.config.characters.length) {
                        for (let y = candidate; y < placeholders.length; y++) {
                            let movingPlaceholder = placeholders[y];
                            let previousIndex = movingPlaceholder.index - 1;
                            if (map[previousIndex].length < this.config.characters.length) {
                                _.remove(map[movingPlaceholder.index], item => item === movingPlaceholder);
                                movingPlaceholder.index = previousIndex;
                                map[movingPlaceholder.index].push(movingPlaceholder);
                            }
                            movingPlaceholder.placeholder = this.config.characters[movingPlaceholder.index];
                        }
                        candidate++;
                    }
                    let placeholder = new PlaceHolder();
                    placeholder.index = 0;
                    let last = _.last(placeholders);
                    if (last)
                        placeholder.index = last.index + 1;
                    if (placeholder.index >= this.config.characters.length)
                        placeholder.index = this.config.characters.length - 1;
                    placeholder.placeholder = this.config.characters[placeholder.index];
                    placeholder.line = line;
                    placeholder.character = character;
                    if (!map[placeholder.index])
                        map[placeholder.index] = [];
                    placeholders.push(placeholder);
                    map[placeholder.index].push(placeholder);
                    count++;
                }
                if (breakCycles)
                    break;
            }
            // we assign root to other placeholders   
            _.each(_.filter(map, item => item.length > 1), mappedPlaceholders => {
                let root = mappedPlaceholders[0];
                for (let y = 0; y < mappedPlaceholders.length; y++) {
                    let mappedPlaceholder = mappedPlaceholders[y];
                    // first mappedPlaceholder is the root!
                    if (y > 0)
                        mappedPlaceholder.root = root;
                    let placeholder = new PlaceHolder();
                    placeholder.index = y;
                    placeholder.placeholder = this.config.characters[placeholder.index];
                    placeholder.line = mappedPlaceholder.line;
                    placeholder.character = mappedPlaceholder.character;
                    // add a copy of placeholder as children of root
                    root.childrens.push(placeholder);
                }
            });
            return placeholders;
        };
        this.getIndexByChar = (char) => {
            return this.config.characters.indexOf(char);
        };
        this.isLastChar = (char) => {
            let index = this.config.characters.indexOf(char);
            return index + 1 >= this.config.characters.length;
        };
        this.nextChar = (char) => {
            if (this.isLastChar(char)) {
                return this.config.characters[0];
            }
            else {
                let index = this.config.characters.indexOf(char);
                return this.config.characters[index + 1];
            }
        };
    }
}
exports.PlaceHolderCalculus = PlaceHolderCalculus;
//# sourceMappingURL=placeholder-calculus.js.map