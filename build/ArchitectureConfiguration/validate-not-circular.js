"use strict";
function validateNotCircular(name, modules) {
    return checkPath([name], modules);
}
function checkPath(path, modules, finished = new Set(), missing = new Set()) {
    const current = path[0];
    const deps = modules.get(current);
    deps.forEach(function (dep) {
        if (path.indexOf(dep) > -1) {
            throw new Error(`[${path.concat[dep].join(", ")}] is circular`);
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
    finished.add(current);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = validateNotCircular;
