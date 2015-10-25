var lispz = function() {
  if (!window.lispz_modules) window.lispz_modules = {}
  var delims = "(){}[]n".split(''), // characters that are not space separated atoms
  not_delims = delims.join("\\"), delims = delims.join('|\\'),
  stringRE =
    "''|'[\\s\\S]*?[^\\\\]':?|" +
    '""|"(?:.|\\r*\\n)*?[^\\\\]"|' +
    '###+(?:.|\\r*\\n)*?###+|' + '##\\s+.*?\\r*\\n|',
  tkre = new RegExp('(' + stringRE + '\\' + delims + "|[^\\s" + not_delims + "]+)", 'g'),
  opens = new Set("({["), closes = new Set(")}]"), ast_to_js, slice = [].slice, contexts = [],
  module = {line:0, name:"boot"}, globals = {}, load_index = 0,
  synonyms = {and:'&&',or:'||',is:'===',isnt:'!=='},
  jsify = function(atom) {
    if (/^'.*'$/.test(atom)) return atom.slice(1, -1).replace(/\\n/g, '\n')
    if (/^"(?:.|\r*\n)*"$/.test(atom)) return atom.replace(/\r*\n/g, '\\n')
    switch (atom[0]) {
      case '-': return atom // unary minus or negative number
      default:  return atom.replace(/\W/g, function(c) {
        var t = "$hpalcewqgutkri"["!#%&+:;<=>?@\\^~".indexOf(c)];
        return t ? ("_"+t+"_") : (c === "-") ? "_" : c })
    }
  },
  call_to_js = function(func, params) {
    params = slice.call(arguments, 1)
    contexts.some(function(pre){if (macros[pre+'.'+func]) {func = pre+'.'+func; return true}})
    if (synonyms[func]) func = synonyms[func]
    if (macros[func]) return macros[func].apply(lispz, params)
    func = ast_to_js(func)
    if (params[0] && params[0][0] === '.') func += params.shift()
    return func + '(' + params.map(ast_to_js).join(',') + ')'
  },
  macro_to_js = function(name, pnames, body) {
    body = slice.call(arguments, 2)
    if (pnames[0] === "\n") pnames = pnames.slice(3) // drop line number component
    macros[name] = function(pvalues) {
      pvalues = slice.call(arguments)
      if (pvalues[0] === "\n") pvalues = pvalues.slice(3) // drop line number component
      var args = {}
      pnames.slice(1).forEach(function(pname, i) {
        args[pname] = (pname[0] === '*') ? ["list"].concat(pvalues.slice(i)) :
                      (pname[0] === '&') ? ["["].concat(pvalues.slice(i)) : pvalues[i]
      })
      var expand = function(ast) {
        return (ast instanceof Array) ? ast.map(expand) : args[ast] || ast
      }
      contexts.unshift(name)
      var js = ast_to_js(expand((body.length > 1) ? ["list"].concat(body) : body[0]))
      contexts.shift()
      return js
    }
    return "/*macro "+name+"*/"
  },
  array_to_js = function() {
    var its = slice.call(arguments)
    if (arguments.length === 1 && arguments[0][0] === '[') {
      return "[" + its.map(ast_to_js).join(',') + "]"
    }
    return its.map(ast_to_js).join(',')
  },
  list_to_js = function(its) {
    return slice.call(arguments).map(ast_to_js).join('\n')
  },
  // A dictionary can be a symbol table or k-value pair
  dict_to_js = function(kvp) {
    var dict = []; kvp = slice.call(arguments)
    for (var key, i = 0, l = kvp.length; i < l; i++) {
      if ((key = kvp[i])[kvp[i].length - 1] === ":") {
        dict.push("'"+jsify(key.slice(0, -1))+"':"+ast_to_js(kvp[++i]));
      } else {
        dict.push("'"+jsify(key)+"':"+ast_to_js(key));
      }
    }
    return "{" + dict.join(',') + "}";
  },
  join_to_js = function(sep, parts) {
    parts = slice.call((arguments.length > 2) ? arguments : parts, 1)
    return parts.map(ast_to_js).join(ast_to_js(sep))
  },
  immediate_to_js = function() {
    return slice.call(arguments).map(ast_to_js).map(eval)
  },
  // processing pairs of list elements
  pairs_to_js = function(pairs, tween, sep) {
    var el = [], tween = ast_to_js(tween);
    if (!(pairs.length % 2)) throw {message:"Unmatched pairs"}
    for (var i = 1, l = pairs.length; i < l; i += 2) {
        el.push(ast_to_js(pairs[i]) + tween + ast_to_js(pairs[i + 1]))
    }
    return el.join(ast_to_js(sep))
  },
  binop_to_js = function(op) {
    macros[op] = function(list) { return '(' + slice.call(arguments).map(ast_to_js).join(op) + ')' }
  },
  /*
   * When there was a new-line in the source, we inject it into the prior non-atom
   * if possible. Now we are generating JavaScript we find and process it. This is
   * because comments can't have their own atom or they will screw up argument lists.
   */
  eol_to_js = function(name, number) {
    module = {name:name, line:number}
    var ast = slice.call(arguments, 2)
    var line = ast_to_js(ast)
    if (ast[0] !== "[" && (ast[0] !== "\n" || ast[3] !== "[")) {
      line += "//#" + name + ":" + number + "\n"
    }
    return line
  },
  parsers = [
    [/^(\(|\{|\[)$/, function(env) {
      env.stack.push(env.node)
      env.node = [env.atom]
    }],
    [/^(\)|\}|\])$/, function(env) {
      var f = env.node;
      try { (env.node = env.stack.pop()).push(f) }
      catch(e) { compile_error("Unmatched closing bracket") }
    }],
    /*
     * Record line number for JS comment. Can't add a new element,
     * so only do it if last compiled is not an atom.
     */
    [/^\n$/, function(env) {
      if (!env.node.length) return
      var atom = env.node[env.node.length - 1]
      if (!(atom instanceof Array)) return
      atom.unshift('\n', module.name, module.line)
    }]
  ],
  comment = function(atom) {
    return atom[0] === "#" && atom[1] === "#" && (atom[2] === '#' || atom[2] == ' ')
  },
  compile_error = function(msg, data) {
    var errloc = module.name+".lispz:"+module.line
    console.log(errloc, msg, data)
    return ['throw "compile error for ' + errloc.replace(/["\n]/g," ") +
            " -- " + msg.replace(/"/g,"'") + '"\n']
  },
  parse_to_ast = function(source) {
    var env = { ast: [], stack: [] }
    env.node = env.ast
    tkre.lastIndex = 0
    while ((env.atom = tkre.exec(source.toString())) && (env.atom = env.atom[1])) {
      module.line += (env.atom.match(/\n/g) || []).length
      if (!comment(env.atom) && !parsers.some(function(parser) {
          if (!parser[0].test(env.atom)) return false
          parser[1](env)
          return true
        })) { env.node.push(env.atom); } }
    if (env.stack.length != 0) return compile_error("missing close brace", env)
    return env.ast
  },
  ast_to_js = function(ast) {
    return (ast instanceof Array) ? macros[ast[0]] ?
      macros[ast[0]].apply(this, ast.slice(1)) : list_to_js(ast) : jsify(ast)
  },
  compile = function(name, source) {
    try {
      var last_module = module
      module = {name:name, line:0}
      var js = parse_to_ast(source).map(ast_to_js)
      module = last_module
      return js
    } catch (err) { return compile_error(err.message, source) }
  },
  run = function(name, source) { return compile(name, source).map(eval) },
  //######################### Script Loader ####################################//
  cache = {}, manifest = [], pending = {}
  http_request = function(uri, type, callback) {
    var req = new XMLHttpRequest()
    req.open(type, uri, true)
    if (lispz.debug && uri.indexOf(":") == -1)
      req.setRequestHeader("Cache-Control", "no-cache")
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
  module_init = function(uri, on_readies) {
    lispz_modules[uri](function(exports) {
      cache[uri.split('/').pop()] = cache[uri] = exports
      delete pending[uri]
      on_readies.forEach(function(call_module) {call_module(exports)})
    })
  }
  load_one = function(uri, on_ready) {
    if (cache[uri]) return on_ready()
    if (pending[uri]) return pending[uri].push(on_ready)
    if (lispz_modules[uri]) return module_init(uri, [on_ready])
    pending[uri] = [on_ready]; var js = ""
    http_request(uri + ".lispz", 'GET', function(response) {
      try {
        var name = uri.split('/').pop()
        if (!response.text) return on_ready(response) // probably an error
        js = compile(uri, response.text).join('\n') +
          "//# sourceURL=" + name + ".lispz\n"
        lispz_modules[uri] = new Function('__module_ready__', js)
        module_init(uri, pending[uri])
      } catch (e) {
        delete pending[uri]
        throw e
      }
    })
  },
  // Special to set variables loaded with requires
  requires_to_js = function(list) {
    list = list.slice(list.indexOf("[") + 1)
    return 'var ' + list.map(function(module) {
      var name = module.trim().split('/').pop()
      return jsify(name) + '=lispz.cache["' + name + '"]'
    }) + ';'
  },
  load = function(uris, on_all_ready) {
    uris = uris.split(",")
    var next_uri = function() {
      if (uris.length) load_one(uris.shift().trim(), next_uri)
      else if (on_all_ready) on_all_ready()
    }
    next_uri()
  }
  window.onload = function() {
    var q = document.querySelector('script[src*="lispz.js"]').getAttribute('src').split('#')
    load(((q.length == 1) ? "core" : "core," + q.pop()),
      function() {
        slice.call(document.querySelectorAll('script[type="text/lispz"]')).forEach(
          function (script) { run("script", script.textContent) })
    })
  }
  //#########################    Helpers    ####################################//
  var clone = function (obj) {
    var target = {};
    for (var i in obj) if (obj.hasOwnProperty(i)) target[i] = obj[i];
    return target;
  }
  //#########################   Interface   ####################################//
  var macros = {
    '(': call_to_js, '[': array_to_js, '{': dict_to_js, 'macro': macro_to_js,
    '#join': join_to_js, '#pairs': pairs_to_js, '#binop': binop_to_js,
    '#requires': requires_to_js, 'list': list_to_js,
    '\n': eol_to_js, 'immediate': immediate_to_js
  }
  // add all standard binary operations (+, -, etc)
  "+,-,*,/,&&,||,==,===,<=,>=,!=,!==,<,>,^,%".split(',').forEach(binop_to_js)

  return { compile: compile, run: run, parsers: parsers, load: load,
           macros: macros, cache: cache, http_request: http_request,
           clone: clone, manifest: manifest,
           synonyms: synonyms, globals: globals, tags: {} }
}()
