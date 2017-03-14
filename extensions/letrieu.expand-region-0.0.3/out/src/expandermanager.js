"use strict";
var vscode = require('vscode');
var baseexpander_1 = require('./baseexpander');
var expander = require('./_expander');
var ExpanderManager = (function () {
    function ExpanderManager() {
        this.expandHistory = [];
    }
    ExpanderManager.prototype.expand = function () {
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        var exp;
        var doc = editor.document;
        if (doc.languageId) {
            switch (doc.languageId) {
                case baseexpander_1.LanguageType.HTML:
                    exp = new expander.html();
                    break;
                default:
                    exp = new expander.javascript();
                    break;
            }
        }
        var text = doc.getText();
        var start = doc.offsetAt(editor.selection.start);
        var end = doc.offsetAt(editor.selection.end);
        var result = exp.expand(text, start, end);
        if (result) {
            var startPos = doc.positionAt(result.end);
            var endPos = doc.positionAt(result.start);
            if (this.expandHistory.length > 0) {
                var historyPosition = this.expandHistory[this.expandHistory.length - 1];
                if (historyPosition.resultStart.compareTo(editor.selection.start) !== 0 || historyPosition.resultEnd.compareTo(editor.selection.end) !== 0) {
                    //move to new expand
                    this.expandHistory = [];
                }
            }
            this.expandHistory.push({ start: editor.selection.start, end: editor.selection.end, resultEnd: endPos, resultStart: startPos });
            var newselection = new vscode.Selection(startPos, endPos);
            editor.selection = newselection;
        }
    };
    ExpanderManager.prototype.undoExpand = function () {
        if (this.expandHistory.length > 0) {
            // console.log("undoExpand")
            var editor = vscode.window.activeTextEditor;
            var historyPosition = this.expandHistory.pop();
            console.dir(historyPosition);
            editor.selection = new vscode.Selection(historyPosition.start, historyPosition.end);
        }
    };
    return ExpanderManager;
}());
exports.ExpanderManager = ExpanderManager;
//# sourceMappingURL=expandermanager.js.map