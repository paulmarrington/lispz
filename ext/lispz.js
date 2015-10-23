var lispz = function() {
  var delims = "(){}[]n".split(''), // characters that are not space separated atoms
  not_delims = delims.join("\\"), delims = delims.join('|\\'),
  stringRE =
    "''|'[\\s\\S]*?[^\\\\]':?|" +
    '""|"(?:.|\\r*\\n)*?[^\\\\]"|' +
    '###+(?:.|\\r*\\n)*?###+|' + '##\\s+.*?\\r*\\n|',
  tkre = new RegExp('(' + stringRE + '\\' + delims + "|[^\\s" + not_delims + "]+)", 'g'),
  opens = new Set("({["), closes = new Set(")}]"), ast_to_js, slice = [].slice, contexts = [],
  module = {line:0, name:"boot"}, modules = {}, globals = {}, load_index = 0,
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
  cache = {}, manifest = [], pending = {},
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
  load_one = function(uri, on_ready) {
    if (cache[uri] !== undefined) return on_ready(cache[uri])
    if (pending[uri]) return pending[uri].push(on_ready)
    pending[uri] = [on_ready]; var js = ""
    http_request(uri + ".lispz", 'GET', function(response) {
      try {
        var name = uri.split('/').pop()
        if (!response.text) return on_ready(response) // probably an error
        js = compile(uri, response.text).join('\n') +
          "//# sourceURL=" + name + ".lispz\n"
        modules[uri] = new Function('__module_ready__', js)
        modules[uri](function(exports) {
          cache[name] = cache[uri] = exports
          var on_readies = pending[uri]
          delete pending[uri]
          on_readies.forEach(function(call_module) {call_module(exports)})
        })
      } catch (e) {
        delete pending[uri]
        console.log(js)
        throw e.stack
      }
    })
  },
  load = function(uris, on_all_ready) {
    uris = uris.split(",")
    var next_uri = function() {
      if (uris.length) load_one(uris.shift().trim(), next_uri)
      else if (on_all_ready) on_all_ready()
    }
    next_uri()
  },
  // Special to set variables loaded with requires
  requires_to_js = function(list) {
    list = list.slice(list.indexOf("[") + 1)
    return 'var ' + list.map(function(module) {
      var name = module.trim().split('/').pop()
      return jsify(name) + '=lispz.cache["' + name + '"]'
    }) + ';'
  }
  if (window) window.onload = function() {
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

  return { compile: compile, run: run, parsers: parsers, load: load, macros: macros, cache: cache,
           http_request: http_request, clone: clone, manifest: manifest, modules: modules,
           synonyms: synonyms, globals: globals }
}()
[object Object][object Object][object Object][object Object][object Object][object Object][object Object][object Object][object Object][object Object][object Object][object Object][object Object][object Object][object Object][object Object]

/*bootstrap.riot.html*/

riot.tag('panel', ' <div class="panel { context }" name=outer> <div class=panel-heading if="{ opts.heading }" name=heading ><bars-menu align=right name="{ opts.menu }" owner="{ opts.owner }"></bars-menu> <h3 class=panel-title>{ opts.heading }</h3></div> <div class="panel-body" name=body><yield></yield></div> <div class=panel-footer if="{ opts.footer }" name=footer >{ opts.footer }</div> </div>', 'panel .panel { position: relative; } panel .panel-title { cursor: default; } panel .panel-body { position: absolute; top: 40px; bottom: 10px; left: 0; right: 0; }', function(opts) {var tag=this;//#riot-tags:2

tag.context=("panel-"+(opts.context||"default"));//#riot-tags:3

tag.on("mount",(function(){switch(false){case !opts.height:var px=opts.height;//#riot-tags:6

switch(false){case !("%"===opts.height.slice(-1))//#riot-tags:7
:var px=((window.innerHeight*opts.height.slice(0,-1))/100);//#riot-tags:8
}//#riot-tags:9

tag.outer.style.height=(px+"px");//#riot-tags:10
}//#riot-tags:11
}))//#riot-tags:12

});

riot.tag('bars-menu', '<div name=dropdown class="dropdown { right: opts.align === \'right\' }"> <a style="text-decoration: none" data-toggle="dropdown" name=bars class="glyphicon glyphicon-menu-hamburger dropdown-toggle" aria-hidden="true" ></a> <ul class="dropdown-menu { dropdown-menu-right: opts.align === \'right\' }"> <li each="{ items }" class="{ dropdown-header: header && title, divider: divider, disabled: disabled }"><a onclick="{ goto }" href="#"> <span class="pointer right float-right" if="{ children }"></span> { title } </a></li> </ul> </div>', 'bars-menu > div.right { float: right } bars-menu span.caret { margin-left: -11px } bars-menu a.dropdown-toggle { cursor: pointer }', function(opts) {var tag=this,root=null;//#riot-tags:2

lispz.load("message"//#core:48
,(function(){var message=lispz.cache["message"];
message.listen(opts.name,(function(items){root=(items||[]);//#riot-tags:5

tag.items=items;//#riot-tags:6

tag.update()//#riot-tags:7
}))//#riot-tags:8
//#riot-tags:9

tag.on("mount",(function(){$(tag.dropdown).on("show.bs.dropdown",(function(){tag.items=root;//#riot-tags:12

tag.update()//#riot-tags:13
}))//#riot-tags:14
}))//#riot-tags:15
//#riot-tags:16

tag.goto=(function(ev){switch(false){case !ev.item.topic:message.send((opts.owner+"-"+ev.item.topic)//#riot-tags:19
,{'item':ev.item,'owner':opts.owner,'action':"select"})}//#riot-tags:20

switch(false){case !ev.item.children:tag.items=ev.item.children;//#riot-tags:22

ev.currentTarget.blur()//#riot-tags:23

ev.stopPropagation()//#riot-tags:24
}//#riot-tags:25
});//#riot-tags:26
}))//#riot-tags:27

});

riot.tag('tree', '<tree-component name=base></tree-component>', function(opts) {var tag=this;//#riot-tags:2

lispz.load("message"//#core:48
,(function(){var message=lispz.cache["message"];
message.listen(opts.name,(function(items){tag.children={'base':{'children':items}};//#riot-tags:5

tag.update()
tag.update()//#riot-tags:6
}))//#riot-tags:7
}))//#riot-tags:8

});

riot.tag('tree-component', '<ul class="dropdown-menu"> <li each="{ item, i in items }" class="{ dropdown-header: item.header && item.title, divider: item.divider, disabled: item.disabled }" ><a onclick="{ parent.goto }" href="#"> <span if="{ item.children }" class="glyphicon glyphicon-triangle-right" aria-hidden="true"></span>{ item.title }</a> <tree-component if="{ item.children }" name="{ item.title }"> </li> </ul>', 'tree-component ul { display: inherit !important; position: inherit !important; } tree-component:not([name=base]) > ul { display: none !important; } tree-component:not([name=base]).open > ul { margin-left: 9px; margin-right: 9px; display: inherit !important; } tree-component span.glyphicon { margin-left: -18px; }', function(opts) {var tag=this;//#riot-tags:2

lispz.load("message,dict"//#core:48
,(function(){var message=lispz.cache["message"],dict=lispz.cache["dict"];
tag.on("update",(function(data){switch(false){case !(opts.name&&tag.parent.children):tag.items=tag.parent.children[opts.name]["children"];//#riot-tags:6

switch(false){case !(tag.items&&tag.items.length)//#riot-tags:7
:tag.children=dict.from_list(tag.items,"title");//#riot-tags:8
}//#riot-tags:9
}//#riot-tags:10
}))//#riot-tags:11
//#riot-tags:12

tag.goto=(function(ev){var item=ev.item.item;//#riot-tags:14

var topic=(item.topic||item.title);//#riot-tags:15

switch(false){case !topic:message.send(topic,{'item':item,'action':"select"})}//#riot-tags:17

switch(false){case !item.children:var tree=ev.currentTarget.nextElementSibling;//#riot-tags:19

tree.classList.toggle("open")//#riot-tags:20

tree.parentElement.classList.toggle("bg-info")//#riot-tags:21
}//#riot-tags:22

ev.stopPropagation()//#riot-tags:23
});//#riot-tags:24
}))//#riot-tags:25

});

riot.tag('sidebar', '<a aria-hidden="true" name=hamburger class="glyphicon glyphicon-menu-hamburger"></a> <div id=sidebar class="container bg-primary"><yield></yield></div>', 'sidebar > a { text-decoration: none !important; position: absolute !important; z-index: 2000; } #sidebar { z-index: 1000; position: fixed; width: 0; height: 100%; overflow-y: auto; -webkit-transition: all 0.5s ease; -moz-transition: all 0.5s ease; -o-transition: all 0.5s ease; transition: all 0.5s ease; padding-right: 0; overflow: hidden; } #sidebar.toggled { width: auto; padding-right: 15px; }', function(opts) {var tag=this;//#riot-tags:2

lispz.load("message,dom"//#core:48
,(function(){var message=lispz.cache["message"],dom=lispz.cache["dom"];
tag.hamburger.onclick=(function(){tag.sidebar.classList.toggle("toggled")//#riot-tags:5

setTimeout((function(){message.send("page-content-wrapper-padding",tag.sidebar.offsetWidth)//#riot-tags:7
}),300)//#riot-tags:8
});//#riot-tags:9

tag.on("mount",setTimeout((function(){message.send("page-content-wrapper-padding",tag.sidebar.offsetWidth)//#riot-tags:11
}),300))//#riot-tags:12
}))//#riot-tags:13

});

riot.tag('page-content', '<div id=page_content_wrapper> <div class="{ container-fluid: opts.fluid, container: !opts.fluid }"> <yield></yield> </div> </div>', '#page_content_wrapper { width: 100%; position: absolute; }', function(opts) {var tag=this;//#riot-tags:2

lispz.load("message"//#core:48
,(function(){var message=lispz.cache["message"];
message.listen("page-content-wrapper-padding",(function(px){tag.page_content_wrapper.style.paddingLeft=(px+"px");//#riot-tags:5
}))//#riot-tags:6
}))//#riot-tags:7

});

riot.tag('bootstrap', '<div id=page-wrapper><yield></yield></div>', '.pointer { border: 5px solid transparent; display: inline-block; width: 0; height: 0; vertical-align: middle; } .pointer.float-right { float: right; margin-top: 5px; } .pointer.up { border-bottom: 5px solid; } .pointer.right { border-left: 5px solid; } .pointer.down { border-top: 5px solid; } .pointer.left { border-right: 5px solid; }', function(opts) {var tag=this;//#riot-tags:2

lispz.load("dom,net,jquery,riot,message,bootstrap"//#core:48
,(function(){var dom=lispz.cache["dom"],net=lispz.cache["net"],jquery=lispz.cache["jquery"],riot=lispz.cache["riot"],message=lispz.cache["message"],bootstrap=lispz.cache["bootstrap"];
var bootswatch_themes=["cerulean","cosmo","cyborg","darkly","flatly","journal","lumen","paper","readable","sandstone","simplex","slate","spacelab","superhero","united","yeti"];//#riot-tags:6
//#riot-tags:11

message.listen("change-bootstrap-theme",(function(theme){switch(false){case !!((typeof(theme)!=="undefined"))//#riot-tags:13
:var theme=bootswatch_themes[lispz.globals.random(bootswatch_themes.length)];//#riot-tags:14
}//#riot-tags:15

net.css(("https://bootswatch.com/"+theme+"/bootstrap.css"))//#riot-tags:16
}))//#riot-tags:17

dom.append_$_("head",dom.element("meta",{'name':"viewport",'content':"width=device-width, initial-scale=1"}//#riot-tags:19
))//#riot-tags:20
}))//#riot-tags:21

});


/*codemirror.riot.html*/

riot.tag('codemirror', '<div name=wrapper> </div>', function(opts) {var tag=this;//#riot-tags:2

lispz.load("codemirror"//#core:48
,(function(){var codemirror=lispz.cache["codemirror"];
tag.cm=CodeMirror(tag.wrapper,opts);//#riot-tags:4
}))//#riot-tags:5

});


/*firepad.riot.html*/

riot.tag('firepad', ' <panel height="{ opts.height }" heading="{ heading }" menu="{ menu }" owner="{ _id }"> <div name=wrapper class=wrapper></div> </panel>', 'firepad .wrapper { position: absolute; top: 0; bottom: 0; left: 0; right: 0; height: initial; } firepad .CodeMirror { position: absolute; top: 0; bottom: 0; left: 5px; right: 0; height: initial; } a.powered-by-firepad { display: none; } div.firepad-toolbar { margin-top: -25px; }', function(opts) {var tag=this;//#riot-tags:2

tag.menu="CodeMirror-menu";//#riot-tags:3

tag.heading="Edit";//#riot-tags:4

lispz.load("firebase,codemirror,firepad,message,dict"//#core:48
,(function(){var firebase=lispz.cache["firebase"],codemirror=lispz.cache["codemirror"],firepad=lispz.cache["firepad"],message=lispz.cache["message"],dict=lispz.cache["dict"];
var filename_key=("codemirror/"+opts.name+"/filename");//#riot-tags:6

var cm=codemirror.open(tag._id,tag.tags.panel.wrapper);//#riot-tags:7

var pad={'setText':(function(contents){cm.setValue(contents)})//#riot-tags:9
,'on_ready':(function(act){act()})//#riot-tags:10
};//#riot-tags:11
//#riot-tags:12

var open=(function(packet){codemirror.set_mode(cm,packet.key)//#riot-tags:14

tag.heading=packet.key.split("/").slice(-1)[0];//#riot-tags:15

localStorage[filename_key]=packet.key;//#riot-tags:16

switch(false){case !packet.contents:pad.setText(packet.contents)}//#riot-tags:17

tag.update()//#riot-tags:18
});//#riot-tags:19
//#riot-tags:20

switch(false){case !opts.db:var db=firebase.attach(("firepads/"+opts.name),opts.db);//#riot-tags:23

pad=Firepad.fromCodeMirror(db,cm,{'richTextShortcuts':false,'richTextToolbar':false}//#riot-tags:25
);//#riot-tags:26

pad.on_ready=(function(act){pad.on("ready",act)});//#riot-tags:27
;break;case !true:var contents=("codemirror/"+opts.name+"/contents");//#riot-tags:29

var filename=localStorage[filename_key];//#riot-tags:30

switch(false){case !filename:setTimeout((function(){open({'key':filename,'contents':localStorage[contents]})//#riot-tags:33
}),100)}//#riot-tags:34

cm.on("change",(function(){localStorage[contents]=cm.getValue();//#riot-tags:36
}))//#riot-tags:37
//#riot-tags:38
}//#riot-tags:39
//#riot-tags:40

pad.on_ready((function(){message.dispatch(("firepad/"+opts.name),{'open':open})//#riot-tags:42
}))//#riot-tags:43
}))//#riot-tags:44

});


/*lispz-repl.riot.html*/

riot.tag('lispz-repl', '<div id=lispz_repl_div class="{ hidden:hidden }"> <input type=text name=usings autocomplete=on size=20 placeholder="(package-list (* to reload))"> <input type=text name=code autocomplete=on size=50 placeholder="(Lispz code - enter to execute)"> </div>', 'lispz-repl {position: absolute; bottom: 0;} lispz-repl .hidden {display: none}', function(opts) {var tag=this;//#riot-tags:2

tag.hidden=true;//#riot-tags:3

var run=(function(){var source=tag.usings.value.split(" ").map((function(pkg){switch(false){case !(pkg[0]==="*"):var pkg=pkg.slice(1);//#riot-tags:7

delete(lispz.cache[pkg])//#riot-tags:8

delete(lispz.cache[pkg.split("/").slice(-1)[0]])//#riot-tags:9
}//#riot-tags:10

return pkg
//#riot-tags:11
})).join(",");//#riot-tags:12

switch(false){case !source:var source=("(using ["+source+"] "+tag.code.value+")");//#riot-tags:14
;break;case !true:var source=tag.code.value;//#riot-tags:15
}//#riot-tags:16

console.log(lispz.run("lispz-repl",source))//#riot-tags:17

tag.code.select()//#riot-tags:18
});//#riot-tags:19
//#riot-tags:20

var toggle_show_repl=(function(){tag.hidden=!(tag.hidden);
tag.update()//#riot-tags:22

tag.code.focus()
tag.code.select()//#riot-tags:23
});//#riot-tags:24
//#riot-tags:25

document.body.addEventListener("keydown",(function(ev){switch(false){case !(ev.altKey&&ev.shiftKey&&(ev.keyCode===82)):toggle_show_repl()//#riot-tags:27
}}))//#riot-tags:28

tag.code.addEventListener("keypress",(function(ev){switch(false){case !(ev.keyCode===13):run()}}))//#riot-tags:30

});
