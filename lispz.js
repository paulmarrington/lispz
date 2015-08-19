var lispz = function() {
  var delims = "(){}[]".split(''), // characters that are not space separated atoms
  not_delims = delims.join("\\"), delims = delims.join('|\\'),
  stringRE = "'[\\s\\S]*?'|" + '"[\\s\\S]*?[^\\\\]"|""|/\\*(?:.|\\r*\\n)*?\\*/|//.*?\\r*\\n|',
  tkre = new RegExp('(' + stringRE + '\\' + delims + "|[^\\s" + not_delims + "]+)", 'g'),
  opens = new Set("({["), closes = new Set(")}]"), ast_to_js, slice = [].slice, contexts = [],
  jsify = function(atom) {
    if (/^'.*'$/.test(atom)) return atom.slice(1, -1).replace(/\\n/g, '\n')
    if (/^"(?:.|\r*\n)*"$/.test(atom)) return atom.replace(/\r*\n/g, '\\n')
    switch (atom[0]) {
      case '.': return (atom.length > 1) ? "__"+atom : "__"
      case '@': return (atom.length > 1) ? "this."+atom.slice(1) : "this"
      default:  return atom.replace(/\W/g, function(c) {
        var t = "$hpal_cewqgutkri"["!#%&+-:;<=>?@\\^~".indexOf(c)]; return t ? ("_"+t+"_") : c })
    }
  },
  call_to_js = function(func, params) {
    params = slice.call(arguments, 1)
    if (macros[func]) return macros[func].apply(lispz, params)
    func = ast_to_js(func)
    if (params[0] && params[0][0] === '.') func += params.shift()
    return '__=' + func + '(' + params.map(ast_to_js).join(',') + ')'
  },
  macro_to_js = function(name, pnames, body) {
    body = slice.call(arguments, 2)
    macros[name] = function(pvalues) {
      pvalues = slice.call(arguments)
      var args = {}
      pnames.slice(1).forEach(function(pname, i) {
        args[pname] = (pname[0] === '*') ? ["list"].concat(pvalues.slice(i)) : pvalues[i]
      })
      var expand = function(ast) {
        return (ast instanceof Array) ? ast.map(expand) : args[ast] || ast
      }
      contexts.unshift(name)
      return ast_to_js(expand((body.length > 1) ? ["list"].concat(body) : body[0]))
      contexts.shift()
    }
    return "/*macro "+name+"*/"
  },
  array_to_js = function(its) {
    var js_array = (arguments.length === 1 && arguments[0][0] === '[')
    its = slice.call(arguments).map(ast_to_js).join(',')
    return js_array ? "[" + its + "]" : its
  },
  list_to_js = function(its) {
    return slice.call(arguments).map(ast_to_js).join('\n')
  },
  // A dictionary can be a symbol table or k-value pair
  dict_to_js = function(kvp) {
    var dict = []; kvp = slice.call(arguments)
    for (var key, i = 0, l = kvp.length; i < l; i++) {
      if ((key = kvp[i]).slice(-1)[0] === ":") {
        dict.push("'"+ast_to_js(key.slice(0, -1))+"':"+ast_to_js(kvp[++i]));
      } else {
        dict.push("'"+ast_to_js(key)+"':"+ast_to_js(key));
      }
    }
    return "{" + dict.join(',') + "}";
  },
  join_to_js = function(sep, parts) {
    parts = slice.call((arguments.length > 2) ? arguments : parts, 1)
    return parts.map(ast_to_js).join(ast_to_js(sep))
  },
  // processing pairs of list elements
  pairs_to_js = function(pairs, tween, sep) {
    var el = [], tween = ast_to_js(tween);
    for (var i = 1, l = pairs.length; i < l; i += 2) {
        el.push(ast_to_js(pairs[i]) + tween + ast_to_js(pairs[i + 1]))
    }
    return el.join(ast_to_js(sep))
  },
  binop_to_js = function(op) {
    macros[op] = function(list) { return '(' + slice.call(arguments).map(ast_to_js).join(op) + ')' }
  },
  parsers = [
    [/^(\(|\{|\[)$/, function(env) {
      env.stack.push(env.node)
      env.node = [env.atom]
    }],
    [/^(\)|\}|\])$/, function(e) {
      var f = e.node;
      (e.node = e.stack.pop()).push(f)
    }]
  ],
  parse_to_ast = function(source) {
    var env = { ast: [], stack: [] }
    env.node = env.ast
    tkre.lastIndex = 0
    while ((env.atom = tkre.exec(source.toString())) && (env.atom = env.atom[1])) {
      if (!parsers.some(function(parser) {
          if (!parser[0].test(env.atom)) return false
          parser[1](env)
          return true
        })) { env.node.push(env.atom); } }
    return env.ast
  },
  ast_to_js = function(ast) {
    //return (ast instanceof Array) ? macros[ast[0]] ?
    //  macros[ast[0]].apply(this, ast.slice(1)) : list_to_js(ast) : jsify(ast)
    if (!(ast instanceof Array)) return jsify(ast)
    var name = ast[0]
    contexts.some(function(pre){if (macros[pre+'.'+name]) {name = pre+'.'+name; return true}})
    return macros[name] ? macros[name].apply(this, ast.slice(1)) : list_to_js(ast)
    
  },
  compile = function(source) {
    return parse_to_ast(source).map(ast_to_js).join('\n')
  },
  run = function(source) {
    return parse_to_ast(source).map(ast_to_js).map(eval)
  },
  //######################### Script Loader ####################################//
  cache = {}, manifest = [],
  http_request = function(uri, type, callback) {
    var req = new XMLHttpRequest()
    req.open(type, uri, true)
    req.onerror = function(err) {
      callback({ uri: uri, error: err })
    }
    req.onload = function() {
      manifest.push(req.responseURL)
      if (req.status === 200) callback({ uri:uri, text: req.responseText })
      else                    req.onerror(req.statusText) 
    }
    req.send()
  },
  load_one = function(uri, on_ready) {
    if (cache[uri] !== undefined) return on_ready(cache[uri])
    http_request(uri + ".lispz", 'GET', function(response) {
      var name = uri.split('/').pop()
      if (!response.text) return on_ready(response) // probably an error
      var module = new Function('__module_ready__', compile(response.text))
      module(function(exports) { on_ready(cache[name] = cache[uri] = exports) })
    })
  },
  load = function(uri_list, on_all_ready) {
    var uris = uri_list.split(','), outstanding = uris.length
    next_uri = function() {
      if (uris.length) load_one(uris.shift().trim(), next_uri)
      if (!outstanding-- && on_all_ready) on_all_ready()
    }
    next_uri()
  },
  // Special to set variables loaded with requires
  requires_to_js = function(list) {
    return 'var ' + list.slice(1,-1).split(',').map(function(module) {
      var name = module.trim().split('/').pop()
      return name + '=lispz.cache["' + name + '"]'
    }) + ';'
  }
  if (window) window.onload = function() {
    var q = document.querySelector('script[src*="lispz.js"]').getAttribute('src').split('#')
    load((q.length == 1) ? "core,observe" : "core,observe," + q.pop())
  }
  //#########################    Helpers    ####################################//
  var clone = function (obj) {
    var target = {};
    for (var i in obj) if (obj.hasOwnProperty(i)) target[i] = obj[i];
    return target;
  }
  //#########################   Interface   ####################################//
  var macros = {
    '(': call_to_js, '[': array_to_js, '{': dict_to_js, 'macro': macro_to_js, '#join': join_to_js,
    '#pairs': pairs_to_js, '#binop': binop_to_js, '#requires': requires_to_js, 'list': list_to_js
  }
  // add all standard binary operations (+, -, etc)
  "+,-,*,/,&&,||,==,===,<=,>=,!=,!==,<,>,^,%".split(',').forEach(binop_to_js)

  return { compile: compile, run: run, parsers: parsers, load: load, macros: macros, cache: cache,
           http_request: http_request, clone: clone, manifest: manifest}
}()
