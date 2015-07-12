// why empty list is '[' then slice it off to jsify it
// ((test a).b c)
var lispz = function() {
    var alias;
    // characters that are not space separated atoms (n becomes linefeed in regex)
    var delimiters = "(){}[];'`|n".split('');
    var not_delimiters = delimiters.join("\\");
    delimiters = delimiters.join('|\\')
        // Keep state stack for when we start a new inner list ()[]{}
    var push_state = function(env) {
        env.stack.push(env.list);
        env.list = [env.atom]
    };
    var pop_state = function(env) {
        var list = env.list;
        (env.list = env.stack.pop()).push(list);
    };
    // when a list is closed we process it given the opening command/type
    var list2js = function(env, list) {
        return env.list2js[list[0]](env, list)
    };
    // processing pairs of list elements
    var pairs = function(env, fore, tween, aft) {
        return function(env, list) {
            var el = [];
            for (var i = 1, l = list.length; i < l; i += 2) {
                el.push(list2js(env, list[i]) + tween + list2js(env, list[i + 1]))
            };
            return fore + el.join(',') + aft
        }
    };
    // Convert a list of lists to a list of js fragments
    var lists2list = function(env, lists) {
      return lists.map(function(list) { return list2js(env, list) })
    };
    // convert a list to a javascript call
    var call2js = function(env, list) {
      var js = ' ';
      if (env.list2js[list[1][1]]) {
        return env.list2js[list[1][1]](env, list.slice(1))
      }
      var params = lists2list(env, list.slice(2))
      return " " + list2js(env, list[1]) + "(" + params.join(',') + ')'
    };
    // Take symbols javascript doesn't recognise and convert
    replacements = {
        '!': "$bang$", '#': "$hash$", '%': "$percent$", '&': "$ampersand",
        '*': "$star$", '+': "$plus$", '-': "$dash$", '/': "$slash$",
        ':': "$colon$", ';': "$semicolon$", '<': "$less$", '=': "$equal",
        '>': "$greater$", '?': "$question$", '@': "$at$", '\\': "$slosh$",
        '^': "$caret$", '~': "$tilde$"
    }
    var jsify = function(atom) {
        return atom.replace(/\W/g, function(symbol) {
            var rep = replacements[symbol];
            return rep ? rep : symbol
        })
    };
    // pull function params from a list
    var list2params = function(list) {
        return list.slice(1).map(function(p) { return jsify(p[1]) });
    };
    // convert a list to a function definition
    var lambda2js = function(env, list) {
        return "(function(" + list2params(list[1]).join(',') + "){return " +
            lists2list(env, list.slice(2)).join(",") + "})"
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
        env.list.push(["atom", env.atom])
      }
    };
    // Create a lambda that expands a named macro
    var build_macro = function(env, list) {
      var macro_name = list2js(env, list[1]);
      var macro_params = {}, body = list.slice(3);
      list2params(list[2]).forEach(function(p, i) { macro_params[p] = i + 1 })
      var clone = function(macro_body, replacements) {
        if ((macro_body[0] === "atom") && macro_params[macro_body[1]]) {
          return replacements[macro_params[macro_body[1]]]
        }
        return macro_body.map(function(element){
          if (element instanceof Array) { return clone(element, replacements); }
          return element;
        })
      }
      env.list2js[macro_name] = function(env, replacements) {
        return lists2list(env, clone(body, replacements)).join();
      }
      return '';
    };
    // Environment under which a lispz command executes
    var env = {
        line_number: 1, skip: false, atom: "", stack: [], list: ['['],
        lambda2js: lambda2js, atom2list: atom2list,
        // We find atoms using this regex - fast in a good js system
        tkre: new RegExp('(".*?[^\\\\]"|""|\\' + delimiters + "|[^\\s" + not_delimiters + "]+)", 'g'),
        // Called for delimiters when they are found in the input stream
        delimiter: { // start gathering a list or performing other delimiter function
            '(': push_state, '[': push_state, '{': push_state,
            ')': pop_state, ']': pop_state, '}': pop_state,
            ';': function(env) { env.skip = true },
            '\n': function(env) { env.list.push(["raw"," //#"+(env.line_number++)+"\n"]) }
        },
        // called for closing delimiters when encountered in the stream
        list2js: { // process a list once gathered.
            '(': call2js,
            '[': function(env, list) { // list of atoms (array)
                return '[' + lists2list(env, list.slice(1)).join(',') + ']'
              },
            '{': pairs(env, '({', ':', '})'), // {a:1,b:2}
            'var': pairs(env, 'var ', '=', ';\n'), // var a=1,b=2;
            'set!': pairs(env, ' ', '=', '\n'), // var a=1,b=2;
            'lambda': lambda2js, 'macro': build_macro, 'alias': alias,
            'atom': function(env, list) { return jsify(list[1]) },
            'raw': function(env, list) { return list[1] }
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
    }
    binop("+,-,*,/,&&,||,==,===,<=,>=,!=".split(','));
    // use a different name for a lambdas, such as and for &&
    var alias = function(env, list) {
        for (var i = 0, l = list.length; i < l; i += 2) env.alias[list[i]] = list[i + 1]
    }
    alias(env, "and,&&,or,||,is,==,isnt,!=,not,!".split(','));
    // generate javascript from lispz
    var compile = function(source) {
        env.tkre.lastIndex = 0; env.list = ['[']; env.stack = [];
        env.line_number = 1; env.source = source;
        while (next_atom(env)) {
            if (!env.skip) {
              env.atom2list(env);
            } else if (env.atom === '\n') {
              env.skip = false;
            }
        };
        js = lists2list(env,env.list.slice(1)).join('');
        return js;
    };
    return { compile: compile }
}()