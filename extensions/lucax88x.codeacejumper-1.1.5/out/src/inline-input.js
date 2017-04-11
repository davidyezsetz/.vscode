"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class Input {
    constructor(options) {
        this.text = "";
        this.validateInput = options.validateInput;
        this.resolve = options.resolve;
        this.reject = options.reject;
    }
}
class InlineInput {
    constructor() {
        this.subscriptions = [];
        this.show = (editor, validateInput) => {
            this.setContext(true);
            const promise = new Promise((resolve, reject) => {
                this.input = new Input({ validateInput: validateInput, resolve: resolve, reject: reject });
                vscode.window.onDidChangeActiveTextEditor(() => {
                    this.cancel(editor);
                });
            });
            this.registerCommand('type', this.onType);
            return promise;
        };
        this.dispose = () => {
            this.subscriptions.forEach((d) => d.dispose());
        };
        this.registerTextEditorCommand = (commandId, run) => {
            this.subscriptions.push(vscode.commands.registerTextEditorCommand(commandId, run));
        };
        this.registerCommand = (commandId, run) => {
            this.subscriptions.push(vscode.commands.registerCommand(commandId, run));
        };
        this.onType = (event) => {
            const editor = vscode.window.activeTextEditor;
            if (this.input) {
                this.input.text += event.text;
                this.input.validateInput(this.input.text);
                this.complete(editor);
            }
            else
                vscode.commands.executeCommand('default:type', event);
        };
        this.cancel = (editor) => {
            if (this.input) {
                this.input.reject("canceled");
            }
            this.dispose();
            this.setContext(false);
        };
        this.complete = (editor) => {
            if (this.input) {
                this.input.resolve(this.input.text);
            }
            this.dispose();
            this.setContext(false);
        };
        this.registerTextEditorCommand('extension.aceJump.input.stop', this.cancel);
    }
    setContext(value) {
        vscode.commands.executeCommand('setContext', "aceJumpInput", value);
    }
}
exports.InlineInput = InlineInput;
//# sourceMappingURL=inline-input.js.map