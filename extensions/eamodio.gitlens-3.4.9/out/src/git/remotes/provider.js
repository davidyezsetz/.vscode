'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const constants_1 = require("../../constants");
function getNameFromRemoteOpenType(type) {
    switch (type) {
        case 'branch': return 'Branch';
        case 'commit': return 'Commit';
        case 'file': return 'File';
        case 'working-file': return 'Working File';
        default: return '';
    }
}
exports.getNameFromRemoteOpenType = getNameFromRemoteOpenType;
class RemoteProvider {
    constructor(domain, path) {
        this.domain = domain;
        this.path = path;
    }
    get baseUrl() {
        return `https://${this.domain}/${this.path}`;
    }
    _openUrl(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return url && vscode_1.commands.executeCommand(constants_1.BuiltInCommands.Open, vscode_1.Uri.parse(url));
        });
    }
    open(type, branchOrShaOrFileName, fileBranch, fileSha, fileRange) {
        switch (type) {
            case 'branch':
                return this.openBranch(branchOrShaOrFileName);
            case 'commit':
                return this.openCommit(branchOrShaOrFileName);
            case 'file':
            case 'working-file':
                return this.openFile(branchOrShaOrFileName, fileBranch, fileSha, fileRange);
        }
    }
    openBranch(branch) {
        return this._openUrl(this.getUrlForBranch(branch));
    }
    openCommit(sha) {
        return this._openUrl(this.getUrlForCommit(sha));
    }
    openFile(fileName, branch, sha, range) {
        return this._openUrl(this.getUrlForFile(fileName, branch, sha, range));
    }
}
exports.RemoteProvider = RemoteProvider;
//# sourceMappingURL=provider.js.map