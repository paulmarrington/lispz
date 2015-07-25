var lispz = function() {
    // characters that are not space separated atoms (n becomes linefeed in regex)
    var delims = "(){}[]n".split('');
    var not_delims = delims.join("\\");
    delims = delims.join('|\\')
    var stringRE = "'{1,2}[\\s\\S]*?'{1,2}|" + '"[\\s\\S]*?[^\\\\]"|""|';
    // Keep state stack for when we start a new inner list ()[]{}
    var push_state = function(env) {
        env.stack.push(env.list);
        env.list = [env.atom]
    };
    var pop_state = function(env) {
        var list = env.list;
        if (env.stack.length) return (env.list = env.stack.pop()).push(list);
        return console.log("Too many closing braces on line "+env.line_number);
    };
    // when a list is closed we process it given the opening command/type
    var list2js = function(env, list) {
      return env.list2js[list[0]](env, list)
    };
    // processing pairs of list elements
    var dot_pairs = function(env, list) {
      var el = [], pairs = list[1], fore = list2js(env, list[2]);
      var tween = list2js(env, list[3]), aft = list2js(env, list[4]);
      for (var i = 1, l = pairs.length; i < l; i += 2) {
          el.push(list2js(env, pairs[i]) + tween + list2js(env, pairs[i + 1]))
      };
      return fore + el.join(',') + aft
    }
    // A dictionary can be a symbol table or k-value pair
    var dot_dict = function(env, list) {
      var dict = [], kvp = list[1];
      for (var i = 1, l = kvp.length; i < l; i++) {
        var key = (kvp[i][0] == ".atom") ? kvp[i][1] : list2js(env, kvp[i]);
        if (key.slice(-1) === ":") {
          dict.push(key.slice(0, -1)+":"+list2js(env, kvp[++i]));
        } else {
          dict.push(key+":"+key);
        }
      }
      return "{" + dict.join(',') + "}";
    }
    // Convert a list of lists to a list of js fragments
    var lists2list = function(env, lists) {
      return lists.map(function(list, index, parent) {
        env.parent = parent; env.parent_index = index;
        return list2js(env, list);
      }).filter(function(a) { return a && a.length });
    };
    // convert a list to a javascript call
    var call2js = function(env, list) {
      var js = ' ';
      if (env.list2js[list[1][1]]) {
        return env.list2js[list[1][1]](env, list.slice(1))
      }
      var params = lists2list(env, list.slice(2))
      return " __at__=" + list2js(env, list[1]) + "(" + params.join(',') + ')\n'
    };
    // Convert (js parameters) to javascript
    params2js = function(env, list) {
      return lists2list(env, list.slice(1)).join('');
    }
    // Take symbols javascript doesn't recognise and convert
    replacements = {
        '!': "$bang$", '#': "$hash$", '%': "$percent$", '&': "$ampersand",
        '*': "$star$", '+': "$plus$", '-': "$dash$", '/': "$slash$",
        ':': "$colon$", ';': "$semicolon$", '<': "$less$", '=': "$equal",
        '>': "$greater$", '?': "$question$", '@': "$at$", '\\': "$slosh$",
        '^': "$caret$", '~': "$tilde$"
    };
    // modify strings with new lines to look like a js string
    var multiline = function(atom) {
      var lines = atom.split(/\r*\n/g);
      if (lines.length > 3 && !lines[0].length && lines[1][0] == ' ') {
        lines = lines.slice(1);
        var spaces = lines[0].search(/\S|$/);
        for (var i = 0, l = lines.length; i < l; i++) {
          if (lines[i].slice(0, spaces).trim().length == 0)
            lines[i] = lines[i].slice(spaces);
        }
      }
      return '"'+lines.join('\\n')+'"';
    };
    // Account for "strings" and "symbols" and convert rest to something js-y
    var jsify = function(atom) {
      var last = atom.length - 1;
      if (atom[0] === '"' && atom[last] === '"') return multiline(atom.slice(1,last));
      if (atom[0] === "'" && atom[last] === "'") return atom.slice(1,last);
      return atom.replace(/\W/g, function(symbol) {
          var rep = replacements[symbol];
          return rep ? rep : symbol
      })
    };
    // pull function params from a list
    var list2params = function(list) {
      return list.slice(1).map(function(p, i) { return jsify(p[1]) });
    };
    // convert a list to a function definition
    var lambda2js = function(env, list) {
      return "(function(" + list2params(list[1]).join(',') + "){" +
          lists2list(env, list.slice(2)).join(" ") + "})"
    };
    // retrieve the next atom from the input stream. Returns false on no more
    var next_atom = function(env) {
        if (!(env.atom = env.tkre.exec(env.source))) return false;
        if (env.alias[env.atom = env.atom[1]]) env.atom = env.alias[env.atom];
        return env.atom;
    };
    // convert an atom to a simple list
    var atom2list = function(env) {
      if (env.delimiter[env.atom]) {
        env.delimiter[env.atom](env)
      } else {
        if (env.atom[0] == '@') env.atom = "__at__." + env.atom.slice(1);
        env.list.push([".atom", env.atom])
      }
    };
    // Create a lambda that expands a named macro
    var build_macro = function(env, list, async) {
      var macro_name = list2js(env, list[1]);
      var macro_params = {".callback":list[2].length}, body = list.slice(3);
      list2params(list[2]).forEach(function(p, i) { macro_params[p] = i + 1 })
      var clone = function(macro_body, replacements) {
        if (macro_body[0] === ".atom") {
          var is_ref = (macro_body[1][0] === '*'); // *rest
          var name = is_ref ? macro_body[1].slice(1) : macro_body[1];
          if (macro_params[name]) { // replace with param or list of rest
            if (name === ".callback") async = true;
            if (!is_ref) return replacements[macro_params[name]];
            macro_body = replacements.slice(macro_params[name]);
            macro_body.unshift("[");
            return macro_body;
          }
        }
        return macro_body.map(function(element){
          if (element instanceof Array) { return clone(element, replacements); }
          return element;
        })
      }
      if (async) {
        env.list2js[macro_name] = function(env, replacements) {
          callback = ["lambda", ["(",[".atom","__at__"]]];
          callback = callback.concat(env.parent.slice(++env.parent_index));
          env.parent.length = env.parent_index;
          replacements = replacements.concat([callback]);
          return lists2list(env, clone(body, replacements)).join('');
        }
      } else {
        env.list2js[macro_name] = function(env, replacements) {
          return lists2list(env, clone(body, replacements)).join('');
        }
      }
      return '';
    };
    // use a different name for a lambdas, such as and for &&
    var alias = function(env, list) {
        for (var i = 1, l = list.length; i < l; i += 2)
          env.alias[list[i][1]] = list[i + 1][1]
    };
    // put raw javascript at end of last atom
    var append_raw = function(env, raw) {
      var list = env.list.length ? env.list : env.stack[env.stack.length - 1];
      list.push([".raw", raw]);
    };
    // Environment under which a lispz command executes
    var env = {
        line_number: 1, atom: "", stack: [], list: ['['],
        // We find atoms using this regex - fast in a good js system
        tkre: new RegExp('('+stringRE+'\\'+delims+"|[^\\s"+not_delims+"]+)", 'g'),
        // Called for delimiters when they are found in the input stream
        delimiter: { // start gathering a list or performing other delimiter function
            '(': push_state, '[': push_state, '{': push_state,
            ')': pop_state, ']': pop_state, '}': pop_state,
            '\n': function(env) { append_raw(env, " //#"+(env.line_number++)+"\n") }
        },
        // called for closing delimiters when encountered in the stream
        list2js: { // process a list once gathered.
            '(': call2js,
            '[': function(env, list) { // list of atoms (array)
                   return '[' + lists2list(env, list.slice(1)).join(',') + ']'
                 },
            'lambda': lambda2js, 'macro': build_macro,
            'async': function(env, list) { return build_macro(env, list, true) },
            '.atom': function(env, list) { return jsify(list[1]) },
            '.raw': function(env, list) { return list[1] },
            '.js': params2js, ".pairs": dot_pairs, ".dict": dot_dict, 'alias': alias
        },
        alias: {}
    };
    // add all standard binary operations (+, -, etc)
    var binop = function(ops) {
        ops.forEach(function(op) {
            env.list2js[op] = function(env, list) {
                return '(' + lists2list(env, list.slice(1)).join(op) + ')'
            }
        })
    };
    binop("+,-,*,/,&&,||,==,===,<=,>=,!=".split(','));
    // generate javascript from lispz
    var compile = function(source) {
      env.tkre.lastIndex = 0; env.list = ['[']; env.stack = [];
      env.line_number = 1; env.source = source;
      while (next_atom(env)) atom2list(env);
      js = lists2list(env,env.list.slice(1)).join('');
      return js;
    };
    // To run a lispz statement, wrap it in a function
    var run = function(script) {
      var js = "var __at__;\n"+compile(script);
      return (new Function(js))();
    }
    // lispz script loader (needed now to get core.lispz)
    var load_cache = {};
    load = function(uri, callback) {
      if (!callback) callback = function(){return {}};
      if (load_cache[uri] !== undefined) return callback(load_cache[uri]);

      var req = new XMLHttpRequest();
      req.open("GET", uri+".lispz", true);
      req.onerror = function (err) {
        callback("The script " + uri + " is not accessible.");
      }
      req.onload = function() {
        if (req.status != 200) return req.error(req.statusText);
        var js = "var __at__;\n"+compile(req.responseText);
        callback(null, load_cache[uri] = run(req.responseText));
      }
      req.send();
    };
    window.onload = function(){ load('core') }
    return { compile:compile, env:env, load:load, run:run }
}()
