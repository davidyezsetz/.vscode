"use strict";
class PlaceHolderDecorator {
    constructor() {
        this.addDecoration = (editor, placeholder) => {
            let range = new vscode.Range(placeholder.line, placeholder.character, placeholder.line, placeholder.character + 1);
            let content = placeholder.placeholder;
            let decoration = vscode.window.createTextEditorDecorationType({
                after: {
                    contentText: content,
                    backgroundColor: this.config.placeholder.backgroundColor,
                    border: this.config.placeholder.border,
                    color: this.config.placeholder.color,
                    margin: `0 0 0 ${content.length * -7}px`,
                    // height: '13px',
                    width: `${(content.length * 7) + 5}px`
                }
            });
            this.decorations.push(decoration);
            editor.setDecorations(decoration, [range]);
        };
        this.removeDecorations = (editor) => {
            _.each(this.decorations, (item) => {
                editor.setDecorations(item, []);
                item.dispose();
            });
        };
    }
}
exports.PlaceHolderDecorator = PlaceHolderDecorator;
//# sourceMappingURL=placeholder.js.map