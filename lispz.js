var lispz = function() {
  if (!window.lispz_modules) window.lispz_modules = {}
  var logger = window.console.log,
  log = function() { logger.apply(console, arguments) }, references = [{}],
  delims = "(){}[],n".split(''), // characters that are not space separated atoms
  not_delims = delims.join("\\"), delims = delims.join('|\\'),
  stringRE =
    "''|'[\\s\\S]*?[^\\\\]':?|" +
    '""|"(?:.|\\r*\\n)*?[^\\\\]"|' +
    '###+(?:.|\\r*\\n)*?###+|' + '##\\s+.*?\\r*\\n|',
  tkre = new RegExp('(' + stringRE + '\\' + delims + "|[^\\s" + not_delims + "]+)", 'g'),
  opens = new Set("({["), closes = new Set(")}]"), ast_to_js,
  location = {line:1, name:"boot"}, globals = {}, load_index = 0,
  synonyms = {and:'&&', or:'||', is:'===', isnt:'!==', "=>": "lambda"},
  javascript = "",
  slice = function(list, from, to) {
    var line = list.line
    var sliced = [].slice.call(list, from, to)
    sliced.line = line
    return sliced
  },
  jsify = function(atom) {
    var js = ""
    if (/^'\/(?:.|\n)*'$/.test(atom)) {
      js = atom.slice(1, -1).replace(/\n/g, '\\n')
    } else if (/^'.*'$/.test(atom)) {
      js = atom.slice(1, -1).replace(/\\n/g, '\n')
    } else if (/^"(?:.|\r*\n)*"$/.test(atom)) {
      js = atom.replace(/\r*\n/g, '\\n')
    } else if (atom[0] == "-") {
      js = atom // unary minus or negative number
    } else {
      js = atom.replace(/\W/g, function(c) {
        var t = "$hpalcewqgutkri"["!#%&+:;<=>?@\\^~".indexOf(c)];
        return t ? ("_"+t+"_") : (c === "-") ? "_" : c
      })
    }
    return js
  },
  call_to_js = function(func, params) {
    params = slice(arguments, 1)
    if (synonyms[func]) func = synonyms[func]
    if (macros[func]) return macros[func].apply(lispz, params)
    func = ast_to_js(func)
    if (params[0] && params[0][0] === '.') func += ast_to_js(params.shift())
    if (params.length === 1 && params[0] === "arguments") {
      var parts = func.split(".")
      if (parts.length < 2 || /[\(\[\{]/.test(func)){
        params = ".apply(this,arguments)"
      } else {
        var context = parts.slice(0, -1).join(".")
        params = ".apply(" + context + ",arguments)"
      }
    } else {
      params = "(" + map_ast_to_js(params, ',').replace(/,\s*\./, ".") + ")"
    }
    if (func.startsWith("function(){")) func = "(" + func + ")"
    return "(_res_=" + func + params + ")"
  },
  function_to_js = function(params, body) {
    // functions can be created without a parameter list
    if (params instanceof Array && params[0] == "[") {
      body = slice(arguments, 1)
    } else {
      body = slice(arguments, 0)
      params = ["[", "_t_"]  // @ is the sole parameter
    }
    is_array = function(body) {
      return body[body.length-1] instanceof Array
    }
    is_attr = function(body) {
      return body[body.length-1][0] == "."
    }
    is_func = function(body) {
      return body.length > 1 && body[body.length-2] === "("
    }
    function_body_to_js = function() {
      if (body.length === 0) return ""
      var full_body = (body.length === 1 && body[0] instanceof Array) ? body[0] : body
      if (!is_array(full_body) && !is_attr(full_body) && !is_func(full_body)) {
        var end = full_body.length - 1
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
    if (ast[0] instanceof Array || ast[0] === "list" || ast[0] === "") {
      var end = ast.length - 1
      ast[end] = add_return(ast[end])
    } else if (ast[0] === "(") {
      if (ast[1] !== "return") {
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
    var js = map_ast_to_js(slice(arguments), '\n')
    if (!js.startsWith("return")) js = ";return " + js
    return js
  },
  macro_to_js = function(name, pnames, body) {
    if (pnames instanceof Array && pnames[0] == "[") {
      body = slice(arguments, 2)
      pnames = slice(pnames, 1)
    } else {
      body = slice(arguments, 1)
      pnames = ["_t_"]  // @ is the sole parameter
    }
    var pnames_set = new Set(pnames)
    macros[name] = function(pvalues) {
      pvalues = slice(arguments)
      var args = {}
      for (var n = 0, v = 0; n < pnames.length; n++, v++) {
        var pname = pnames[n]
        var pvalue = pvalues[v]
        // if (pname[0] === '?' && v === pvalues.length - 1) args[pname] = "", v-- // skip ?param
        if (pname[0] === '?' && pvalue[0] != "[") args[pname] = "", v-- // skip ?param
        else args[pname] =
          (pname[0] === '*') ? ["list"].concat(slice(pvalues, v)) :
          (pname[0] === '&') ? ["["].concat(slice(pvalues, v)) : pvalue
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
    var its = slice(arguments)
    if (arguments.length === 1 && arguments[0][0] === '[') {
      return "(_res_=[" + map_ast_to_js(its, ',') + "])"
    }
    return map_ast_to_js(its, ',')
  },
  list_to_js = function(its) {
    return (its && its.length) ? map_ast_to_js(slice(arguments), ';\n') : ""
  },
  // A dictionary can be a symbol table or k-value pair
  dict_to_js = function(kvp) {
    var dict = []; kvp = slice(arguments)
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
    parts = slice((arguments.length > 2) ? arguments : parts, 1)
    return map_ast_to_js(parts, ast_to_js(sep))
  },
  run_ast = function(ast) {
    return ast.map(function(code) { return eval(ast_to_js(code)) })
  },
  immediate_to_js = function() {
    var lspz = run_ast(slice(arguments)).join("\n")
    var js = ast_to_js(parse_to_ast(lspz))
    return js
  },
  immediate_from_ast = function() {
    var js = ast_to_js(ast_to_ast.apply(this, arguments))
    return js
  },
  ast_to_ast = function(func, args) {
    args = slice(arguments, 1)
    var actor = lispz[func] ? lispz[func] : lispz.globals[func]
    if (! actor) throw { message: "No immediate function", name: func}
    var ast = actor.apply(lispz, args)
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
      return '(_res_=' + map_ast_to_js(slice(arguments), op) + ')'
    }
  },
  parsers = [
    [/^(\(|\{|\[)$/, function(env) {
      env.stack.push(env.node)
      env.node = [env.atom]
      if (env.atom == "(" && env.line) {
        env.node.line = env.line
        env.line = 0
      }
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
      // atom.unshift('\n', location.name, location.line)
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
      lines_in_atom = (env.atom.match(/\n/g) || []).length
      location.line += lines_in_atom
      if (lines_in_atom) env.line = location.line
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
    var js = (ast instanceof Array) ? macros[ast[0]] ?
      macros[ast[0]].apply(ast, slice(ast, 1)) : list_to_js(ast) : jsify(ast)
    if (ast.line) js = "/*##" + ast.line + "##*/" + js.trimLeft()
    return js
  },
  map_ast_to_js = function(ast, joiner) {
    return ast.map(ast_to_js).filter(function(item){return item.length}).join(joiner)
  },
  base64 = function(content) {
    return btoa(content.replace(/[^\0-\xFF]/, " "))
  },
  data_uri = function(base64_content) {
    return "data:application/json;charset=utf-8;base64," + base64_content
  },
  append_source_map = function(js, name, source) {
    var lines = js.split("\n")
    var source_map = new sourceMap.SourceMapGenerator({file: name})
    source_map.setSourceContent(name, source)
    lines.forEach(function(line, line_number) {
      var re = /(.*?)\/\*##(\d+)##\*\//g, match, column = 0
      while (match = re.exec(line)) {
        column += match.index + match[0].length
        source_map.addMapping({
          source:    name,
          // generated line + 1 for base 1, 2 for function definition
          generated: { line: line_number + 2,  column: column },
          original:  { line: +match[2],        column: 0 }
        })
      }
    })
    var url = data_uri(base64(source_map.toString()))
    return js + "\n//# sourceMappingURL=" + url + "\n//# sourceURL=" + name + ".js\n"
  }
  compile = function(source, name) {
    var last_module = location
    location = { name:name || "", line:1 }
    var ast = parse_to_ast(source)
    location = last_module

    var body, vars = vars_to_js(function(){ body = ast.map(ast_to_js) })
    body.unshift(vars)
    return append_source_map(body.join(";\n"), name + ".lispz", source)
  },
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
    var js = compile(lispz_modules[uri], uri)
    init_func = eval('(function(__module_ready__){\n' + js + '\n})')
    init_func(function(exports) {
      cache[uri.split('/').pop()] = cache[uri] = exports
      var on_readies = pending_module[uri]
      delete pending_module[uri]
      on_readies.forEach(function(call_module) {call_module(exports)})
    })
  },
  load_one = function(uri, on_ready) {
    if (cache[uri]) return on_ready()
    if (pending_module[uri]) return pending_module[uri].push(on_ready)
    pending_module[uri] = [on_ready]; var js = ""
    if (lispz_modules[uri]) return module_init(uri)
    http_request(uri + ".lispz", 'GET', function(err, response_text) {
      if (err) throw err
      var name = uri.split('/').pop()
      lispz_modules[uri] = response_text
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
  window.addEventListener("error", window.onerror)
  other_window_onload = window.onload
  window.onload = function() {
    window.onload = null
    if (other_window_onload) other_window_onload()
    var q = lispz_url.split('#')
    script("ext/source-map.js", function() {
    load(((q.length == 1) ? "core" : "core," + q.pop()),
      function() {
        var to_load = [], to_run = []
        slice(document.querySelectorAll('script[type="text/lispz"]')).forEach(
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
              run("script", script.textContent)
            })
          }
          if (window.onload) window.onload() // someome else set it
        }
        if (to_load.length) load(to_load.join(","), end_run)
        else                end_run()
    })})
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
    'immediate': immediate_to_js, 'lambda': function_to_js,
    "return": return_to_js
  }
  // add all standard binary operations (+, -, etc)
  "+,-,*,/,&&,||,==,===,<=,>=,!=,!==,<,>,^,%,|,&,^".split(',').forEach(binop_to_js)

  return { compile: compile, parsers: parsers, load: load,
           macros: macros, cache: cache, http_request: http_request,
           clone: clone, manifest: manifest, script: script, css: css,
           synonyms: synonyms, globals: globals, tags: {}, slice: slice,
           location: location, path_base: lispz_base_path,
           set_debug_mode: set_debug_mode, log: log, empty_words: empty_words,
           add_reference: add_reference, reload: reload, base64, data_uri
          }
}()
