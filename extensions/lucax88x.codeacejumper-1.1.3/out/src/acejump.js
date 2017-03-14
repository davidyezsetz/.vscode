"use strict";
const vscode = require('vscode');
const _ = require('lodash');
const placeholder_decorator_1 = require('./placeholder-decorator');
const config_1 = require('./config');
const inline_input_1 = require('./inline-input');
const placeholder_calculus_1 = require('./placeholder-calculus');
class Selection {
}
class AceJump {
    constructor() {
        this.config = new config_1.Config();
        this.placeholderCalculus = new placeholder_calculus_1.PlaceHolderCalculus();
        this.placeHolderDecorator = new placeholder_decorator_1.PlaceHolderDecorator();
        this.isJumping = false;
        this.configure = (context) => {
            let disposables = [];
            disposables.push(vscode.commands.registerCommand('extension.aceJump', () => {
                if (!this.isJumping) {
                    this.isJumping = true;
                    this.jump()
                        .then(() => {
                        this.isJumping = false;
                    })
                        .catch(() => {
                        this.isJumping = false;
                    });
                }
            }));
            for (let i = 0; i < disposables.length; i++) {
                context.subscriptions.push(disposables[i]);
            }
            vscode.workspace.onDidChangeConfiguration(this.loadConfig);
            this.loadConfig();
        };
        this.loadConfig = () => {
            let config = vscode.workspace.getConfiguration("aceJump");
            this.config.placeholder.backgroundColor = config.get("placeholder.backgroundColor");
            this.config.placeholder.color = config.get("placeholder.color");
            this.config.placeholder.border = config.get("placeholder.border");
            this.config.placeholder.width = config.get("placeholder.width");
            this.config.placeholder.height = config.get("placeholder.height");
            this.config.placeholder.textPosX = config.get("placeholder.textPosX");
            this.config.placeholder.textPosY = config.get("placeholder.textPosY");
            this.config.placeholder.fontSize = config.get("placeholder.fontSize");
            this.config.placeholder.fontWeight = config.get("placeholder.fontWeight");
            this.config.placeholder.fontFamily = config.get("placeholder.fontFamily");
            this.config.placeholder.upperCase = config.get("placeholder.upperCase");
            this.config.finder.pattern = config.get("finder.pattern");
            this.config.finder.range = config.get("finder.range");
            this.placeholderCalculus.load(this.config);
            this.placeHolderDecorator.load(this.config);
        };
        this.jump = () => {
            return new Promise((jumpResolve, jumpReject) => {
                let editor = vscode.window.activeTextEditor;
                if (!editor) {
                    jumpReject();
                    return;
                }
                const promise = new Promise((resolve, reject) => {
                    vscode.window.setStatusBarMessage("AceJump: Type");
                    let firstInlineInput = new inline_input_1.InlineInput().show(editor, (v) => v)
                        .then((value) => {
                        if (!value) {
                            reject();
                            return;
                        }
                        ;
                        if (value && value.length > 1)
                            value = value.substring(0, 1);
                        let selection = this.getSelection(editor);
                        let lineIndexes = this.find(editor, selection, value);
                        if (lineIndexes.count <= 0) {
                            reject("AceJump: no matches");
                            return;
                        }
                        let placeholders = this.placeholderCalculus.buildPlaceholders(lineIndexes);
                        if (placeholders.length === 0)
                            return;
                        if (placeholders.length === 1) {
                            let placeholder = _.first(placeholders);
                            resolve(placeholder);
                        }
                        else {
                            this.prepareForJumpTo(editor, placeholders).then((placeholder) => {
                                resolve(placeholder);
                            }).catch(() => {
                                reject();
                            });
                        }
                    }).catch(() => {
                        reject();
                    });
                })
                    .then((placeholder) => {
                    this.setSelection(editor, placeholder);
                    vscode.window.setStatusBarMessage("AceJump: Jumped!", 1000);
                    jumpResolve();
                })
                    .catch((reason) => {
                    vscode.window.setStatusBarMessage((reason) ? reason : "AceJump: canceled");
                    jumpReject();
                });
            });
        };
        this.getSelection = (editor) => {
            let selection = new Selection();
            if (!editor.selection.isEmpty) {
                selection.text = editor.document.getText(editor.selection);
                if (editor.selection.anchor.line > editor.selection.active.line) {
                    selection.startLine = editor.selection.active.line;
                    selection.lastLine = editor.selection.anchor.line;
                }
                else {
                    selection.startLine = editor.selection.anchor.line;
                    selection.lastLine = editor.selection.active.line;
                }
            }
            else {
                selection.startLine = Math.max(editor.selection.active.line - this.config.finder.range, 0);
                selection.lastLine = Math.min(editor.selection.active.line + this.config.finder.range, editor.document.lineCount);
                selection.text = editor.document.getText(new vscode.Range(selection.startLine, 0, selection.lastLine, 0));
            }
            return selection;
        };
        this.setSelection = (editor, placeholder) => {
            editor.selection = new vscode.Selection(new vscode.Position(placeholder.line, placeholder.character), new vscode.Position(placeholder.line, placeholder.character));
        };
        this.find = (editor, selection, value) => {
            let lineIndexes = {
                count: 0,
                indexes: {}
            };
            for (let i = selection.startLine; i < selection.lastLine; i++) {
                let line = editor.document.lineAt(i);
                let indexes = this.indexesOf(line.text, value);
                lineIndexes.count += indexes.length;
                lineIndexes.indexes[i] = indexes;
            }
            return lineIndexes;
        };
        this.indexesOf = (str, char) => {
            if (char.length === 0) {
                return [];
            }
            let indices = [];
            //splitted by spaces
            let words = str.split(new RegExp(this.config.finder.pattern));
            //current line index
            let index = 0;
            for (var i = 0; i < words.length; i++) {
                if (words[i][0] && words[i][0].toLowerCase() === char.toLowerCase()) {
                    indices.push(index);
                }
                ;
                // increment by word and white space
                index += words[i].length + 1;
            }
            return indices;
        };
        this.prepareForJumpTo = (editor, placeholders) => {
            return new Promise((resolve, reject) => {
                this.placeHolderDecorator.addDecorations(editor, placeholders);
                vscode.window.setStatusBarMessage("AceJump: Jump To");
                new inline_input_1.InlineInput().show(editor, (v) => v)
                    .then((value) => {
                    this.placeHolderDecorator.removeDecorations(editor);
                    if (!value)
                        return;
                    let placeholder = _.find(placeholders, placeholder => placeholder.placeholder === value.toLowerCase());
                    if (placeholder.root)
                        placeholder = placeholder.root;
                    if (placeholder.childrens.length > 1) {
                        this.prepareForJumpTo(editor, placeholder.childrens)
                            .then((placeholder) => {
                            resolve(placeholder);
                        })
                            .catch(() => {
                            reject();
                        });
                    }
                    else {
                        resolve(placeholder);
                    }
                }).catch(() => {
                    this.placeHolderDecorator.removeDecorations(editor);
                    reject();
                });
            });
        };
    }
}
exports.AceJump = AceJump;
//# sourceMappingURL=acejump.js.map