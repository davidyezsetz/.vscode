"use strict";
const vscode = require('vscode');
const _ = require("lodash");
const builder = require("xmlbuilder");
class PlaceHolderDecorator {
    constructor() {
        this.decorations = [];
        this.load = (config) => {
            this.config = config;
            this.updateCache();
        };
        this.addDecorations = (editor, placeholders) => {
            let decorationType = vscode.window.createTextEditorDecorationType({
                after: {
                    margin: `0 0 0 -7px`,
                    height: `${this.config.placeholder.height}px`,
                    width: `${this.config.placeholder.width}px`
                }
            });
            let options = [];
            _.each(placeholders, (placeholder) => {
                let option = {
                    range: new vscode.Range(placeholder.line, placeholder.character + 1, placeholder.line, placeholder.character + 1),
                    renderOptions: {
                        dark: {
                            after: {
                                contentIconPath: this.cache[placeholder.placeholder]
                            }
                        },
                        light: {
                            after: {
                                contentIconPath: this.cache[placeholder.placeholder]
                            }
                        }
                    }
                };
                options.push(option);
            });
            this.decorations.push(decorationType);
            editor.setDecorations(decorationType, options);
        };
        this.removeDecorations = (editor) => {
            _.each(this.decorations, (item) => {
                editor.setDecorations(item, []);
                item.dispose();
            });
        };
        this.updateCache = () => {
            this.cache = {};
            _.each(this.config.characters, code => this.cache[code] = this.buildUri(code));
        };
        this.buildUri = (code) => {
            let root = builder.create('svg', {}, {}, { headless: true });
            root
                .att("xmlns", "http://www.w3.org/2000/svg")
                .att("viewBox", `0 0 ${this.config.placeholder.width} ${this.config.placeholder.height}`)
                .att("width", this.config.placeholder.width)
                .att("height", this.config.placeholder.height);
            root.ele('rect')
                .att("width", this.config.placeholder.width)
                .att("height", this.config.placeholder.height)
                .att("rx", 2)
                .att("ry", 2)
                .att("style", `fill: ${this.config.placeholder.backgroundColor}`);
            root.ele('text')
                .att("font-weight", this.config.placeholder.fontWeight)
                .att("font-family", this.config.placeholder.fontFamily)
                .att("font-size", `${this.config.placeholder.fontSize}px`)
                .att("fill", this.config.placeholder.color)
                .att("x", this.config.placeholder.textPosX)
                .att("y", this.config.placeholder.textPosY)
                .text(this.config.placeholder.upperCase ? code.toUpperCase() : code.toLowerCase());
            let svg = root.end({
                pretty: false
            });
            return vscode.Uri.parse(`data:image/svg+xml;utf8,${svg}`);
        };
    }
}
exports.PlaceHolderDecorator = PlaceHolderDecorator;
//# sourceMappingURL=placeholder-decorator.js.map