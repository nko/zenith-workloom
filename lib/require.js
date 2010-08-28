/*
 * Since the deployment environment may or may not support npm, let's provide a custom require function that can
 * allow for a "vendor'd" grouping of dependencies.
 *
 * http://intridea.com/2010/8/24/using-npm-with-heroku-node-js
 *
 */

function _require(library) {
  //require.paths.unshift("vendor/.npm/" + lib + "/active/package/lib");
  return require(library);
}

exports.req = _require;