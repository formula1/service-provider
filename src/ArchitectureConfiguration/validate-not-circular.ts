
function validateNotCircular(name: string, modules: Map<string, Array<string>>) {
  return checkPath([name], modules);
}

function checkPath(
  path: Array<string>,
  modules: Map<string, Array<string>>,
  finished = new Set(),
  missing = new Set()
) {
  const current = path[0];
  const deps = modules.get(current);
  deps.forEach(function(dep){
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
    } else {
      checkPath([ dep ].concat(path), modules, finished, missing);
    }
  });
  finished.add(current);
}

export default validateNotCircular;
