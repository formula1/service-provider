"use strict";
function validateNotCircular(name, modules) {
    return checkPath([name], modules);
}
function checkPath(path, modules, finished, missing) {
    if (finished === void 0) { finished = new Set(); }
    if (missing === void 0) { missing = new Set(); }
    var current = path[0];
    if (modules.has(current)) {
        var deps = modules.get(current);
        deps.forEach(function (dep) {
            if (path.indexOf(dep) > -1) {
                throw new Error("[" + path.concat[dep].join(", ") + "] is circular");
            }
            if (finished.has(dep)) {
                return;
            }
            if (missing.has(dep)) {
                return;
            }
            if (!modules.has(dep)) {
                missing.add(dep);
            }
            else {
                checkPath([dep].concat(path), modules, finished, missing);
            }
        });
    }
    finished.add(current);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = validateNotCircular;
