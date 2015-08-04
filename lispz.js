var lispz = function() {
  // characters that are not space separated atoms
  var delims = "(){}[]".split(''),
  not_delims = delims.join("\\"),
  delims = delims.join('|\\'),
  stringRE = "'[\\s\\S]*?'|" + '"[\\s\\S]*?[^\\\\]"|""|/\\*(?:.|\\r*\\n)*?\\*/|//.*?\\r*\\n|',
  tkre = new RegExp('(' + stringRE + '\\' + delims + "|[^\\s" + not_delims + "]+)", 'g'),
  opens = new Set("({["),
  closes = new Set(")}]"),
  ast_to_js, slice = [].slice,
  jsify = function(atom) {
    return /^'.*'$/.test(atom) ? atom.slice(1, -1) : /^"(?:.|\r*\n)*"$/.test(atom)
      ? atom.replace(/\r*\n/g, '\\n') : atom.replace(/\W/g, function(c) {
        var t = "bhpalmcewqgutkri"["!#%&+-:;<=>?@\\^~".indexOf(c)]; return t ? ("$"+t+"$") : c });
  },
  call_to_js = function(params, body) {
    return (macros[params]) ? macros[params].apply(lispz, slice.call(arguments, 1)) :
      ast_to_js(params) + '(' + slice.call(arguments, 1).map(ast_to_js).join(',') + ')';
  },
  macro_to_js = function(name, pnames, body) {
    body = slice.call(arguments, 2);
    macros[name] = function(pvalues) {
      pvalues = slice.call(arguments);
      var args = {};
      pnames.slice(1).forEach(function(pname, i) {
        args[pname] = (pname[0] === '*') ? ["["].concat(pvalues.slice(i)) : pvalues[i]
      });
      var expand = function(ast) {
        return (ast instanceof Array) ? ast.map(expand) : args[ast] || ast
      };
      return ast_to_js(expand((body.length > 1) ? ["["].concat(body, "]") : body[0]));
    };
    return '""';
  },
  array_to_js = function(its) {
    its = slice.call(arguments, 0);
    var js = its.map(ast_to_js).join(',');
    return (its.length === 1 && its[0][0] === '[') ? "[" + js + "]" : js
  },
  join_to_js = function(parts) {
    return slice.call(arguments).map(ast_to_js).join('');
  },
  macros = {
    '(': call_to_js,
    '[': array_to_js,
    macro: macro_to_js,
    join: join_to_js
  },
  parsers = [
    [/^(\(|\{|\[)$/, function(env) {
      env.stack.push(env.node);
      env.node = [env.atom];
    }],
    [/^(\)|\}|\])$/, function(e) {
      var f = e.node;
      (e.node = e.stack.pop()).push(f);
    }]
  ],
  parse_to_ast = function(source) {
    var env = {
      ast: [],
      stack: []
    };
    env.node = env.ast;
    tkre.lastIndex = 0;
    while ((env.atom = tkre.exec(source.toString())) && (env.atom = env.atom[1]))
      if (!parsers.some(function(parser) {
          if (!parser[0].test(env.atom)) return false;
          parser[1](env);
          return true
        })) { env.node.push(env.atom); }
    return env.ast;
  },
  ast_to_js = function(ast) {
    return (ast instanceof Array) ? macros[ast[0]] ?
      macros[ast[0]].apply(this, ast.slice(1)) : array_to_js(ast) : jsify(ast);
  },
  compile = function(source) {
    return parse_to_ast(source).map(ast_to_js).join(';\n');
  },
  run = function(source) {
    return eval(compile(source));
  },
  //######################### Script Loader ####################################//
  cache = {},
  load_one = function(uri, callback) {
    if (cache[uri] !== undefined) return callback(cache[uri]);
    var req = new XMLHttpRequest(),
      done = function(response) {
        callback(cache[uri.split('/').pop()] = cache[uri] = response);
      };
    req.open("GET", uri + ".lispz", true);
    req.onerror = function(err) {
      done({
        uri: uri,
        error: err
      });
    }
    req.onload = function() {
      return (req.status != 200) ? req.onerror(req.statusText) : done(run(req.responseText));
    };
    req.send();
  },
  load = function(uri_list, callback) {
    if (!callback) callback = function() {
      return {}
    };
    var outstanding = uri_list.length,
      uris = uri_list.slice();
    var next_uri = function() {
      if (uris.length) load_one(uris.shift(), next_uri);
      if (!outstanding--) callback();
    };
    next_uri();
  };
if (window) window.onload = function() {
  load(['core'], function() {});
};
//######################### Script Loader ####################################//
return { compile: compile, run: run, parsers: parsers, load: load };
}()
