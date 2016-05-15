var lispz = function() {
  if (!window.lispz_modules) window.lispz_modules = {}
  var logger = window.console.log,
  log = function() { logger.apply(console, arguments) },
  log_execution_context = function() { lispz.log(arguments) },
  execution_contexts = {}, execution_context = [], references = [{}],
  delims = "(){}[],n".split(''), // characters that are not space separated atoms
  not_delims = delims.join("\\"), delims = delims.join('|\\'),
  stringRE =
    "''|'[\\s\\S]*?[^\\\\]':?|" +
    '""|"(?:.|\\r*\\n)*?[^\\\\]"|' +
    '###+(?:.|\\r*\\n)*?###+|' + '##\\s+.*?\\r*\\n|',
  tkre = new RegExp('(' + stringRE + '\\' + delims + "|[^\\s" + not_delims + "]+)", 'g'),
  opens = new Set("({["), closes = new Set(")}]"), ast_to_js, slice = [].slice,
  location = {line:0, name:"boot"}, globals = {}, load_index = 0,
  synonyms = {and:'&&', or:'||', is:'===', isnt:'!=='}, javascript = "",
  jsify = function(atom) {
    if (/^'\/(?:.|\n)*'$/.test(atom)) return atom.slice(1, -1).replace(/\n/g, '\\n')
    if (/^'.*'$/.test(atom)) return atom.slice(1, -1).replace(/\\n/g, '\n')
    if (/^"(?:.|\r*\n)*"$/.test(atom)) return atom.replace(/\r*\n/g, '\\n')
    switch (atom[0]) {
      case '-': return atom // unary minus or negative number
      default:  return atom.replace(/\W/g, function(c) {
        var t = "$hpalcewqgutkri"["!#%&+:;<=>?@\\^~".indexOf(c)];
        return t ? ("_"+t+"_") : (c === "-") ? "_" : c })
    }
  },
  drop_line_number = function(ast) {
    return (ast instanceof Array && ast[0] === "\n") ? ast.slice(3) : ast
  },
  call_to_js = function(func, params) {
    params = slice.call(arguments, 1)
    if (synonyms[func]) func = synonyms[func]
    if (macros[func]) return macros[func].apply(lispz, params)
    func = ast_to_js(func)
    if (params[0] && params[0][0] === '.') func += ast_to_js(params.shift())
    params = map_ast_to_js(params, ',').replace(/,\s*\./, ".")
    if (func.startsWith("function(){")) {
      func = "(" + func + ")"
    }
    var js = "_res_=" + func +
      ((params === "arguments") ? ".apply(this,arguments)" : ('(' + params + ')'))
    return "(" + js + ")"
  },
  function_to_js = function(params, body) {
    params = drop_line_number(params)
    // functions can be created without a parameter list
    if (params instanceof Array && params[0] == "[") {
      body = slice.call(arguments, 1)
    } else {
      body = slice.call(arguments, 0)
      params = ["["]  // empty parameter list for macro
    }
    function_body_to_js = function() {
      if (body.length === 0) return ""
      var full_body = (body.length === 1 && body[0] instanceof Array) ? body[0] : body
      var end = full_body.length - 1
      if (!(full_body[end] instanceof Array)  &&  full_body[end][0] != ".") {
        full_body[end] = ["(","ref","_res_",full_body[end]]
      }
      body = map_ast_to_js(body, ";\n") + "\n;return _res_"
    }

    var header = "_res_=function("+params.slice(1).map(jsify).join(",")+")"
    var vars = vars_to_js(function_body_to_js)
    return header + "{\n"+vars+"\n"+body+"\n}\n"
  },
  vars_to_js = function(map_to_js) {
    var reference = {}
    references.push(reference)
    try {
      map_to_js()
      var vars = Object.keys(reference)
      if (!reference._res_) vars.push("_res_")
      return "var "+vars.join(",")+";"
    } finally { references.pop() }
  },
  add_reference = function(ast) {
    references[references.length - 1][jsify(ast)] = true
    return []
  },
  add_return = function(ast) {
    if (!ast.length) return ast
    var func = (ast[0] !== "\n") ? 0 : 3 // skip line numbering
    if (ast[func] instanceof Array || ast[func] === "list" || ast[func] === "") {
      var end = ast.length - 1
      ast[end] = add_return(ast[end])
    } else if (ast[func] === "(") {
      if (ast[func + 1] !== "return") {
        ast = ["(", "return", ast]
      }
    } else if (! (ast instanceof Array)) {
      ast = ["(", "return", ast]
    } else {
      throw "no return set for " + JSON.stringify(ast)
    }
    return ast
  },
  return_to_js = function() {
    var js = map_ast_to_js(slice.call(arguments), '\n')
    if (!js.startsWith("return")) js = ";return " + js
    return js
  },
  macro_to_js = function(name, pnames, body) {
    pnames = drop_line_number(pnames)
    if (pnames instanceof Array && pnames[0] == "[") {
      body = slice.call(arguments, 2)
      pnames = pnames.slice(1)
    } else {
      body = slice.call(arguments, 1)
      pnames = []  // empty parameter list for macro
    }
    var pnames_set = new Set(pnames)
    macros[name] = function(pvalues) {
      pvalues = drop_line_number(slice.call(arguments))
      var args = {}
      for (var n = 0, v = 0; n < pnames.length; n++, v++) {
        var pname = pnames[n]
        var pvalue = drop_line_number(pvalues[v])
        // if (pname[0] === '?' && v === pvalues.length - 1) args[pname] = "", v-- // skip ?param
        if (pname[0] === '?' && pvalue[0] != "[") args[pname] = "", v-- // skip ?param
        else args[pname] =
          (pname[0] === '*') ? ["list"].concat(pvalues.slice(v)) :
          (pname[0] === '&') ? ["["].concat(pvalues.slice(v)) : pvalue
      }
      var expand = function(ast) {
        return (ast instanceof Array) ? ast.map(expand) : args[ast] ||
          (pnames_set.has(ast) ? "" : ast)
      }
      var js = ast_to_js(expand((body.length > 1) ? ["list"].concat(body) : body[0]))
      return js
    }
    return "/*macro "+name+"*/"
  },
  array_to_js = function() {
    var its = slice.call(arguments)
    if (arguments.length === 1 && arguments[0][0] === '[') {
      return "(_res_=[" + map_ast_to_js(its, ',') + "])"
    }
    return map_ast_to_js(its, ',')
  },
  list_to_js = function(its) {
    return (its && its.length) ? map_ast_to_js(slice.call(arguments), ';\n') : ""
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
    return "(_res_={" + dict.join(',') + "})";
  },
  join_to_js = function(sep, parts) {
    parts = slice.call((arguments.length > 2) ? arguments : parts, 1)
    return map_ast_to_js(parts, ast_to_js(sep))
  },
  run_ast = function(ast) {
    var context = { context:"run", location: location }
    execution_context.push(context)
    var results = ast.map(function(code) {
      return eval(context.code = ast_to_js( code))
    })
    execution_context.pop()
    return results
  },
  immediate_to_js = function() {
    execution_context.push({ context: "immediate", args: arguments })
    var lspz = run_ast(slice.call(arguments)).join("\n")
    var js = ast_to_js(parse_to_ast(lspz))
    execution_context.pop()
    return js
  },
  immediate_from_ast = function() {
    execution_context.push({ context: "#ast", args: arguments })
    var js = ast_to_js(ast_to_ast.apply(this, arguments))
    execution_context.pop()
    return js
  },
  ast_to_ast = function(func, args) {
    execution_context.push({ context: "#ast", args: arguments })
    args = slice.call(arguments, 1)
    var actor = lispz[func] ? lispz[func] : lispz.globals[func]
    if (! actor) throw { message: "No immediate function", name: func}
    var ast = actor.apply(lispz, args)
    execution_context.pop()
    return ast
  },
  // processing pairs of list elements
  pairs_to_js = function(pairs, tween, sep) {
    var el = [], tween = ast_to_js(tween);
    if (!(pairs.length % 2)) throw {message:"Unmatched pairs",pairs:pairs}
    for (var i = 1, l = pairs.length; i < l; i += 2) {
      var second = pairs[i + 1]
      el.push(ast_to_js(pairs[i]) + tween + ast_to_js(second))
    }
    return el.join(ast_to_js(sep))
  },
  binop_to_js = function(op) {
    macros[op] = function(list) {
      return '(_res_=' + map_ast_to_js(slice.call(arguments), op) + ')'
    }
  },
  /*
   * When there was a new-line in the source, we inject it into the prior non-atom
   * if possible. Now we are generating JavaScript we find and process it. This is
   * because comments can't have their own atom or they will screw up argument lists.
   */
  eol_to_js = function(name, number) {
    location = {name:name, line:number}
    var ast = slice.call(arguments, 2)
    while (ast[0] === "\n") ast = slice.call(ast, 3)
    var line = ast_to_js(ast)
    if (ast[0] !== "["&& line.length > 1 && line[line.length - 1] != "\n") {
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
      (env.node = env.stack.pop()).push(f)
    }],
    /*
     * Record line number for JS comment. Can't add a new element,
     * so only do it if last compiled is not an atom.
     */
    [/^\n$/, function(env) {
      if (!env.node.length) return
      var atom = env.node[env.node.length - 1]
      if (!(atom instanceof Array)) return
      atom.unshift('\n', location.name, location.line)
    }]
  ],
  empty_words = { "of": true, ",": true, "in": true },
  comment = function(atom) {
    return atom[0] === "#" && atom[1] === "#" && (atom[2] === '#' || atom[2] == ' ')
  },
  parse_to_ast = function(source) {
    var env = { ast: [], stack: [] }
    env.node = env.ast
    tkre.lastIndex = 0
    while ((env.atom = tkre.exec(source.toString())) && (env.atom = env.atom[1])) {
      location.line += (env.atom.match(/\n/g) || []).length
      var is_parser = function(parser) {
        if (!parser[0].test(env.atom)) return false
        parser[1](env)
        return true
      }
      if (!comment(env.atom) && !parsers.some(is_parser) && !empty_words[env.atom]) {
        env.node.push(env.atom);
      }
    }
    if (env.stack.length != 0) {
      throw "missing close brace"
    }
    return env.ast
  },
  ast_to_js = function(ast) {
    return (ast instanceof Array) ? macros[ast[0]] ?
      macros[ast[0]].apply(this, ast.slice(1)) : list_to_js(ast) : jsify(ast)
  },
  map_ast_to_js = function(ast, joiner) {
    return ast.map(ast_to_js).filter(function(item){return item.length}).join(joiner)
  },
  compile = function(source, name) {
    var body = compile_to_ast(source, name)
    var vars = vars_to_js(function(){ body = body.map(ast_to_js) })
    body.unshift(vars)
    return body
  },
  compile_to_ast = function(source, name) {
    var last_module = location
    location = { name:name || "", line:0 }
    var context = {
      context: "compile",
      location: location,
      previous: last_module,
      source:   source
    }
    execution_context.push(context)
    var ast = parse_to_ast(source)
    location = last_module
    execution_context.pop()
    return ast
  },
  run = function(name, source) { return run_ast(compile_to_ast(source, name)) }
  //######################### Script Loader ####################################//
  cache = {}, manifest = [], pending_module = {},
  http_request = function(uri, type, callback, headers, body) {
    var req = new XMLHttpRequest()
    req.open(type, uri, true)
    if (lispz.debug_mode && uri.indexOf(":") == -1)
      req.setRequestHeader("Cache-Control", "no-cache")
    for (var key in (headers || {})) req.setRequestHeader(key, headers[key])
    req.onerror = function(err) {
      callback(JSON.stringify({ uri: uri, error: err }, null, 2))
    }
    req.onload = function() {
      manifest.push(req.responseURL)
      if (req.status >= 200 && req.status <= 299) {
        callback(null, req.responseText)
      } else {
        req.onerror({ status: req.statusText, response: req.responseText })
      }
    }
    req.send(body)
  },
  module_init = function(uri) {
    var state = { context: "module", uri: uri, state: "compiling Lispz" }
    execution_context.push(state)
    var js = compile(lispz_modules[uri], uri).join(';\n') +
      "//# sourceURL=" + uri + ".lispz\n"
    state.state = "compiling JavaScript"
    init_func = new Function('__module_ready__', js)
    state.state = "initialising"
    init_func(function(exports) {
      cache[uri.split('/').pop()] = cache[uri] = exports
      var on_readies = pending_module[uri]
      delete pending_module[uri]
      on_readies.forEach(function(call_module) {call_module(exports)})
      execution_context.pop()
    })
  },
  load_one = function(uri, on_ready) {
    if (cache[uri]) return on_ready()
    if (pending_module[uri]) return pending_module[uri].push(on_ready)
    pending_module[uri] = [on_ready]; var js = ""
    if (lispz_modules[uri]) return module_init(uri)
    execution_context.push({ context: "load", uri: uri })
    http_request(uri + ".lispz", 'GET', function(err, response_text) {
      if (err) throw err
      var name = uri.split('/').pop()
      lispz_modules[uri] = response_text
      execution_context.pop()
      module_init(uri)
    })
  },
  reload = function(uris) {
    uris.split(",").forEach(function(uri) {
      delete pending_module[uri]; delete cache[uri]; delete lispz_modules[uri]
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
  },
  set_debug_mode = function(debugging) {
    lispz.debug_mode = debugging
  },
  //##################    where to get scripts    #############################//
  lispz_url = document.querySelector('script[src*="lispz.js"]').getAttribute('src'),
  lispz_base_path = /^(.*?)(?:ext\/)?lispz.js/.exec(lispz_url)[1] || "./",
  css = function(uri) {
    el = document.createElement("link")
    el.setAttribute("type", "text/css")
    el.setAttribute("rel", "stylesheet")
    el.setAttribute("href",  lispz_base_path+uri)
    document.head.appendChild(el)
  },
  script = function(uri, when_loaded) {
    if (cache[uri]) return when_loaded()
    cache[uri] = true
    el = document.createElement("script")
    document.head.appendChild(el)
    el.addEventListener("load",  function(evt) { setTimeout(when_loaded, 20) })
    el.addEventListener("error", function(evt) { console.log(evt); when_loaded(evt) })
    el.setAttribute("src", lispz_base_path+uri)
  }
  // window.onerror = function(msg, url, line, column, error) {
  //   console.debug(arguments)
  //   if (!execution_context.length) return true;
  //   var context = execution_context
  //   execution_context = []
  //   var name = context[0].name
  //   lispz.log_execution_context(context, arguments)
  //   return true
  // }
  window.addEventListener("error", window.onerror)
  other_window_onload = window.onload
  window.onload = function() {
    window.onload = null
    if (other_window_onload) other_window_onload()
    var q = lispz_url.split('#')
    load(((q.length == 1) ? "core" : "core," + q.pop()),
      function() {
        var to_load = [], to_run = []
        slice.call(document.querySelectorAll('script[type="text/lispz"]')).forEach(
          function (script) {
            var src = script.getAttribute("src")
            if (src) {
              var parts = src.split(".")
              if (parts.pop() == "lispz") src = parts.join(".")
              to_load.push(src)
            } else {
              to_run.push(script)
            }
          })
        var end_run = function() {
          if (to_run.length) {
            to_run.forEach(function(script) {
              execution_context = [{ context: "script", script: script}]
              run("script", script.textContent)
            })
          }
          if (window.onload) window.onload() // someome else set it
        }
        if (to_load.length) load(to_load.join(","), end_run)
        else                end_run()
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
    '#requires': requires_to_js, 'list': list_to_js, "#ast": immediate_from_ast,
    'immediate': immediate_to_js, 'lambda': function_to_js, '\n': eol_to_js,
    "return": return_to_js
  }
  // add all standard binary operations (+, -, etc)
  "+,-,*,/,&&,||,==,===,<=,>=,!=,!==,<,>,^,%,|,&,^".split(',').forEach(binop_to_js)

  return { compile: compile, run: run, parsers: parsers, load: load,
           macros: macros, cache: cache, http_request: http_request,
           clone: clone, manifest: manifest, script: script, css: css,
           synonyms: synonyms, globals: globals, tags: {}, slice: slice,
           location: location, execution_contexts: execution_contexts,
           path_base: lispz_base_path, set_debug_mode: set_debug_mode, log: log,
           execution_context: execution_context, empty_words: empty_words,
           compile_to_ast: compile_to_ast, add_reference: add_reference,
           log_execution_context: log_execution_context, reload: reload
          }
}()
