'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const gitLocator_1 = require("./gitLocator");
const logger_1 = require("../logger");
const spawn_rx_1 = require("spawn-rx");
const fs = require("fs");
const path = require("path");
const tmp = require("tmp");
__export(require("./models/models"));
__export(require("./parsers/blameParser"));
__export(require("./parsers/logParser"));
__export(require("./parsers/stashParser"));
__export(require("./parsers/statusParser"));
__export(require("./remotes/provider"));
let git;
const defaultLogParams = [`log`, `--name-status`, `--full-history`, `-M`, `--date=iso8601`, `--format=%H -%nauthor %an%nauthor-date %ai%nparents %P%nsummary %B%nfilename ?`];
const defaultStashParams = [`stash`, `list`, `--name-status`, `--full-history`, `-M`, `--format=%H -%nauthor-date %ai%nreflog-selector %gd%nsummary %B%nfilename ?`];
function gitCommand(cwd, ...args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const s = yield spawn_rx_1.spawnPromise(git.path, args, { cwd: cwd });
            logger_1.Logger.log('git', ...args, `  cwd='${cwd}'`);
            return s;
        }
        catch (ex) {
            const msg = ex && ex.toString();
            if (msg && (msg.includes('Not a git repository') || msg.includes('is outside repository') || msg.includes('no such path') || msg.includes('does not have any commits'))) {
                logger_1.Logger.warn('git', ...args, `  cwd='${cwd}'`, msg && `\n  ${msg.replace(/\r?\n|\r/g, ' ')}`);
                return '';
            }
            else {
                logger_1.Logger.error(ex, 'git', ...args, `  cwd='${cwd}'`, msg && `\n  ${msg.replace(/\r?\n|\r/g, ' ')}`);
            }
            throw ex;
        }
    });
}
class Git {
    static gitInfo() {
        return git;
    }
    static getGitPath(gitPath) {
        return __awaiter(this, void 0, void 0, function* () {
            git = yield gitLocator_1.findGitPath(gitPath);
            logger_1.Logger.log(`Git found: ${git.version} @ ${git.path === 'git' ? 'PATH' : git.path}`);
            return git;
        });
    }
    static getRepoPath(cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!cwd)
                return '';
            const data = yield gitCommand(cwd, 'rev-parse', '--show-toplevel');
            if (!data)
                return '';
            return data.replace(/\r?\n|\r/g, '').replace(/\\/g, '/');
        });
    }
    static getVersionedFile(repoPath, fileName, branchOrSha) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield Git.show(repoPath, fileName, branchOrSha);
            const suffix = Git.isSha(branchOrSha) ? branchOrSha.substring(0, 8) : branchOrSha;
            const ext = path.extname(fileName);
            return new Promise((resolve, reject) => {
                tmp.file({ prefix: `${path.basename(fileName, ext)}-${suffix}__`, postfix: ext }, (err, destination, fd, cleanupCallback) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    logger_1.Logger.log(`getVersionedFile('${repoPath}', '${fileName}', ${branchOrSha}); destination=${destination}`);
                    fs.appendFile(destination, data, err => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(destination);
                    });
                });
            });
        });
    }
    static isSha(sha) {
        return Git.shaRegex.test(sha);
    }
    static isUncommitted(sha) {
        return Git.uncommittedRegex.test(sha);
    }
    static normalizePath(fileName, repoPath) {
        return fileName && fileName.replace(/\\/g, '/');
    }
    static splitPath(fileName, repoPath, extract = true) {
        if (repoPath) {
            fileName = this.normalizePath(fileName);
            repoPath = this.normalizePath(repoPath);
            const normalizedRepoPath = (repoPath.endsWith('/') ? repoPath : `${repoPath}/`).toLowerCase();
            if (fileName.toLowerCase().startsWith(normalizedRepoPath)) {
                fileName = fileName.substring(normalizedRepoPath.length);
            }
        }
        else {
            repoPath = this.normalizePath(extract ? path.dirname(fileName) : repoPath);
            fileName = this.normalizePath(extract ? path.basename(fileName) : fileName);
        }
        return [fileName, repoPath];
    }
    static validateVersion(major, minor) {
        const [gitMajor, gitMinor] = git.version.split('.');
        return (parseInt(gitMajor, 10) >= major && parseInt(gitMinor, 10) >= minor);
    }
    static blame(repoPath, fileName, sha, startLine, endLine) {
        const [file, root] = Git.splitPath(fileName, repoPath);
        const params = [`blame`, `--root`, `--incremental`];
        if (startLine != null && endLine != null) {
            params.push(`-L ${startLine},${endLine}`);
        }
        if (sha) {
            params.push(sha);
        }
        return gitCommand(root, ...params, `--`, file);
    }
    static branch(repoPath, all) {
        const params = [`branch`];
        if (all) {
            params.push(`-a`);
        }
        return gitCommand(repoPath, ...params);
    }
    static config_get(key, repoPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield gitCommand(repoPath || '', `config`, `--get`, key);
            }
            catch (ex) {
                return '';
            }
        });
    }
    static diff_nameStatus(repoPath, sha1, sha2) {
        const params = [`diff`, `--name-status`, `-M`];
        if (sha1) {
            params.push(sha1);
        }
        if (sha2) {
            params.push(sha2);
        }
        return gitCommand(repoPath, ...params);
    }
    static difftool_dirDiff(repoPath, sha1, sha2) {
        const params = [`difftool`, `--dir-diff`, sha1];
        if (sha2) {
            params.push(sha2);
        }
        return gitCommand(repoPath, ...params);
    }
    static log(repoPath, sha, maxCount, reverse = false) {
        const params = [...defaultLogParams, `-m`];
        if (maxCount && !reverse) {
            params.push(`-n${maxCount}`);
        }
        if (sha) {
            if (reverse) {
                params.push(`--reverse`);
                params.push(`--ancestry-path`);
                params.push(`${sha}..HEAD`);
            }
            else {
                params.push(sha);
            }
        }
        return gitCommand(repoPath, ...params);
    }
    static log_file(repoPath, fileName, sha, maxCount, reverse = false, startLine, endLine) {
        const [file, root] = Git.splitPath(fileName, repoPath);
        const params = [...defaultLogParams, `--follow`];
        if (maxCount && !reverse) {
            params.push(`-n${maxCount}`);
        }
        if (!sha || maxCount > 2) {
            params.push(`--no-merges`);
        }
        else {
            params.push(`-m`);
        }
        if (sha) {
            if (reverse) {
                params.push(`--reverse`);
                params.push(`--ancestry-path`);
                params.push(`${sha}..HEAD`);
            }
            else {
                params.push(sha);
            }
        }
        if (startLine != null && endLine != null) {
            params.push(`-L ${startLine},${endLine}:${file}`);
        }
        params.push(`--`);
        params.push(file);
        return gitCommand(root, ...params);
    }
    static log_search(repoPath, search, maxCount) {
        const params = [...defaultLogParams, `-m`, `-i`];
        if (maxCount) {
            params.push(`-n${maxCount}`);
        }
        return gitCommand(repoPath, ...params, ...search);
    }
    static ls_files(repoPath, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield gitCommand(repoPath, 'ls-files', fileName);
            }
            catch (ex) {
                return '';
            }
        });
    }
    static remote(repoPath) {
        return gitCommand(repoPath, 'remote', '-v');
    }
    static remote_url(repoPath, remote) {
        return gitCommand(repoPath, 'remote', 'get-url', remote);
    }
    static show(repoPath, fileName, branchOrSha) {
        const [file, root] = Git.splitPath(fileName, repoPath);
        branchOrSha = branchOrSha.replace('^', '');
        if (Git.isUncommitted(branchOrSha))
            return Promise.reject(new Error(`sha=${branchOrSha} is uncommitted`));
        return gitCommand(root, 'show', `${branchOrSha}:./${file}`);
    }
    static stash_apply(repoPath, stashName, deleteAfter) {
        if (!stashName)
            return undefined;
        return gitCommand(repoPath, 'stash', deleteAfter ? 'pop' : 'apply', stashName);
    }
    static stash_delete(repoPath, stashName) {
        if (!stashName)
            return undefined;
        return gitCommand(repoPath, 'stash', 'drop', stashName);
    }
    static stash_list(repoPath) {
        return gitCommand(repoPath, ...defaultStashParams);
    }
    static stash_save(repoPath, message, unstagedOnly = false) {
        const params = [`stash`, `save`, `--include-untracked`];
        if (unstagedOnly) {
            params.push(`--keep-index`);
        }
        if (message) {
            params.push(message);
        }
        return gitCommand(repoPath, ...params);
    }
    static status(repoPath, porcelainVersion = 1) {
        const porcelain = porcelainVersion >= 2 ? `--porcelain=v${porcelainVersion}` : '--porcelain';
        return gitCommand(repoPath, 'status', porcelain, '--branch');
    }
    static status_file(repoPath, fileName, porcelainVersion = 1) {
        const [file, root] = Git.splitPath(fileName, repoPath);
        const porcelain = porcelainVersion >= 2 ? `--porcelain=v${porcelainVersion}` : '--porcelain';
        return gitCommand(root, 'status', porcelain, file);
    }
}
Git.shaRegex = /^[0-9a-f]{40}( -)?$/;
Git.uncommittedRegex = /^[0]+$/;
exports.Git = Git;
//# sourceMappingURL=git.js.map