'use strict';
const acejump_1 = require('./acejump');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let aceJump = new acejump_1.AceJump();
    aceJump.configure(context);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map