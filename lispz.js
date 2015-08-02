var lispz = function() {
    // characters that are not space separated atoms
    var delims = "(){}[]".split(''), not_delims = delims.join("\\"), delims = delims.join('|\\');
    var stringRE = "'{1,2}[\\s\\S]*?'{1,2}|" + '"[\\s\\S]*?[^\\\\]"|""|' + "###+.*?###+|";
    var tkre = new RegExp('('+stringRE+'\\'+delims+"|[^\\s"+not_delims+"]+)", 'g');
    var opens = new Set("({["), closes = new Set(")}]"), ast_to_js, macro, slice = [].slice;
    var lambda_to_js = function(params, body) {
      return '(function('+params.slice(1,-1).join(',')+'){return '+
        slice.call(arguments, 1,-1).map(ast_to_js).join(',')+"})";
    },  call_to_js = function(params, body) {
      return (macros[params]) ? macros[params].apply(lispz, slice.call(arguments, 1)) :
        '(' + ast_to_js(params) + '(' + slice.call(arguments,1,-1).map(ast_to_js).join(',') + '))';
    },  macro_to_js = function(name, pnames, body) { body = slice.call(arguments, 2, -1);
      macros[name] = function(pvalues) { pvalues = slice.call(arguments); 
        var args = {}; pnames.slice(1,-1).forEach(function(pname, i){args[pname] = pvalues[i]});
        var expand = function(ast) { return (ast instanceof Array) ? ast.map(expand) : args[ast] || ast };
	return ast_to_js(expand((body.length > 1) ? ["["].concat(body,"]") : body[0]));
      }; return '""';
    },  array_to_js = function() {
      return '[' + slice.call(arguments,0,-1).map(ast_to_js).join(',') + ']';
    },  macros = { '(':call_to_js, '[':array_to_js, lambda:lambda_to_js, macro:macro_to_js };
    var parse_to_ast = function(source) {
      var ast = node = [], stack = []; tkre.lastIndex = 0;
      while ((atom = tkre.exec(source.toString())) && (atom = atom[1]))
        if (/^###.*###$/.test(atom))  {}
        else if (opens.has(atom))     { stack.push(node); node = [atom]; }
        else if (closes.has(atom))    { var fin = node;fin.push(atom);(node = stack.pop()).push(fin); }
        else if (/^".*"$/.test(atom)) { node.push(atom.replace(/\r*\n/g, ' ')); }
        else if (/^'.*'$/.test(atom)) { node.push(atom.slice(1,-1)); }
        else                          { node.push(atom); }
      return ast;
    }
    var ast_to_string = function(ast) {
      return (ast instanceof Array) ? (ast.map(ast_to_string).join(" ")) : ast;
    }
    var ast_to_js = function(ast) {
      return (ast instanceof Array) ? macros[ast[0]] ? macros[ast[0]].apply(this, ast.slice(1))
        : array_to_js(ast) : ast;
    }
    var compile = function(source) {
      var ast = parse_to_ast(source);
      ast = ast.length < 2 ? ast : ["["].concat(ast, "]");
      console.log("AST",ast);
      console.log('STR',ast_to_string(ast));
      return ast_to_js(ast);
    } 
    var run = function(source) { return eval(compile(source)); };
    return { compile:compile, run:run, macro:macro };
}()
