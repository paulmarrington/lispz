window.lispz_modules={}

lispz_modules['bootstrap']="(using [net github]\n  (var build (lambda [target-repo]\n    (return (github.build target-repo \"bootstrap\" [[\n      {repo: \"twbs/bootstrap\" files: [[\n        {base: \"dist\" exclude: '/\\.map$|\\.min\\.|npm.js$/'}\n        {base: \"dist/fonts\" copy-to: \"fonts\"}\n      ]]}\n    ]]))\n  ))\n  (lispz.css \"ext/bootstrap.css\")\n  (when (net.script \"ext/bootstrap.js\") [] (export {build}))\n)\n"

lispz_modules['cdnjs']="### Load packages from CDN and other web sources - listing them when possible ###\n(using [net github]\n  (var cdnjs-actors {\n    list-all: (promise [repo path]\n      (var base \"http://api.cdnjs.com/libraries?fields=assets&search=\")\n      (when (net.json-request (+ base repo.name)) [json]\n        ## select the correct repo for the name\n        (var filtered (json.results.filter (lambda [it]\n          (return (=== it.name repo.name))\n        )))\n        ((get filtered 0).assets.some (lambda [it]\n          (return-if (contains it.version \"alpha\") false)\n          (set! repo.base (+\n            \"https://cdnjs.cloudflare.com/ajax/libs/\"\n            repo.name \"/\" it.version \"/\"\n          ))\n          (resolve-promise it.files)\n          (return true) ## found the one we want\n        ))\n      )\n    )\n    read: (promise [repo path]\n      (var uri (+ repo.base path))\n      (when (net.http-get uri [response] (resolve-promise response)))\n    )\n    repo: (lambda [target-repo name] (return {name lispz: {}}))\n  })\n\n  (export {\n    build: (github.builder.bind null cdnjs-actors)\n  })\n)\n"

lispz_modules['codemirror']="(using  [net diff_match_patch message dict github]\n  (var options (localStorage.getItem \"CodeMirror-options\"))\n  (cond options (var options (JSON.parse options))\n        (else)  (var options {\n    lineNumbers:        true\n    foldGutter:         true\n##  gutters:            [\"CodeMirror-lint-markers\"\n##                       \"CodeMirror-foldgutter\"]\n    lint:               true\n    matchBrackets:      true\n    autoCloseBrackets:  true\n    matchTags:          true\n    showTrailingSpace:  true\n    inputStyle:         \"textarea\" ## change to \"contenteditable\" after vim cursor bug fix\n    autofocus:          true\n    dragDrop:           false\n    smartIndent:        true\n    indentUnit:         2\n    indentWithTabs:     false\n    cursorScrollMargin: 5\n    scrollbarStyle:     \"overlay\"\n    extraKeys:          {\n      'Cmd-Left':         \"goLineStartSmart\"\n      'Ctrl-Q':           \"fold_at_cursor\"\n      'Ctrl-Space':       \"autocomplete\"\n      'Ctrl-/':           \"toggleComment\"\n      'Ctrl-<':           \"goColumnLeft\"\n      'Ctrl->':           \"goColumnRight\"\n      'Ctrl-Shift-F':     \"clearSearch\"\n      'Ctrl-=':           \"toMatchingTag\"\n      'Alt-S':            \"view_source\"\n      'Ctrl-`':           \"insertSoftTab\"\n      'Ctrl-,':           \"delLineLeft\"\n      'Ctrl-.':           \"killLine\"\n      'Shift-Ctrl-,':     \"delWrappedLineLeft\"\n      'Shift-Ctrl-.':     \"delWrappedLineRight\"\n      'Ctrl-9':           \"delWordBefore\"\n      'Ctrl-0':           \"delWordAfter\"\n      'Ctrl-6':           \"transposeChars\"\n      'Ctrl-Left':        \"goWordLeft\"\n      'Ctrl-Right':       \"goWordRight\"\n      'Ctrl-Home':        \"goLineLeft\"\n      'Ctrl-Shift-Home':  \"goLineLeftSmart\"\n      'Ctrl-End':         \"goLineRight\"\n      ## paredit keys that defer if not in lisp code\n      'Backspace':        \"subpar_backward_delete\"\n      'Delete':           \"subpar_forward_delete\"\n      'Ctrl-D':           \"subpar_forward_delete\"\n\n      'Shift-9':          \"subpar_open_bracket\"\n      '[':                \"subpar_open_square_bracket\"\n      'Shift-[':          \"subpar_open_braces\"\n\n      'Shift-0':          \"subpar_close_bracket\"\n      ']':                \"subpar_close_square_bracket\"\n      'Shift-]':          \"subpar_close_braces\"\n\n      'Shift-\\'':          \"subpar_double_quote\"\n\n      'Ctrl-Alt-F':       \"subpar_forward\"\n      'Ctrl-Alt-B':       \"subpar_backward\"\n      'Ctrl-Alt-U':       \"subpar_backward_up\"\n      'Ctrl-Alt-D':       \"subpar_forward_down\"\n      'Ctrl-Alt-P':       \"subpar_backward_down\"\n      'Ctrl-Alt-N':       \"subpar_forward_up\"\n\n      'Shift-Ctrl-[':     \"subpar_backward_barf\"\n      'Ctrl-Alt-Right':   \"subpar_backward_barf\"\n      'Ctrl-]':           \"subpar_backward_barf\"\n\n      'Shift-Ctrl-]':     \"subpar_forward_barf\"\n      'Ctrl-Left':        \"subpar_forward_barf\"\n\n      'Shift-Ctrl-9':     \"subpar_backward_slurp\"\n      'Ctrl-Alt-Left':    \"subpar_backward_slurp\"\n      'Ctrl-[':           \"subpar_backward_slurp\"\n\n      'Shift-Ctrl-0':     \"subpar_forward_slurp\"\n      'Ctrl-Right':       \"subpar_forward_slurp\"\n\n      'Alt-Up':           \"subpar_splice_delete_backward\"\n      'Alt-Down':         \"subpar_splice_delete_forward\"\n      'Alt-S':            \"subpar_splice\"\n      'Ctrl-Alt-/':       \"subpar_indent_selection\"\n\n      'Alt-Enter':        \"lispz_run_selection\"\n     }\n  }))\n  ## write changed options back to persistent storage\n  (var update-options (=>\n    (localStorage.setItem \"CodeMirror-options\" (JSON.stringify options))\n  ))\n  ## Context menu for code editor\n  (var topic \"CodeMirror-command\")\n  (var menu [[\n    ### {title: \"File\" children: [[\n      {topic meta: \"save\" title: \"Save\"}\n    ]]} ###\n    {title: \"Edit\" children: [[\n      {topic meta: \"autocomplete\" title: \"Auto-Complete\" }\n      {topic meta: \"redo\" title: \"Redo\"}\n      {topic meta: \"undo\" title: \"Undo\"}\n      {topic meta: \"redoSelection\" title: \"Redo Selection\"}\n      {topic meta: \"undoSelection\" title: \"Undo Selection\"}\n      {divider: true}\n      {topic meta: \"toggleOverwrite\" title: \"Insert/Overwrite\"}\n      {topic meta: \"toggleComment\" title: \"Comment/Uncomment\" }\n      {topic meta: \"insertSoftTab\" title: \"Insert Soft Tab\" }\n      {topic meta: \"defaultTab\" title: \"Tab or Indent\"}\n      {title: \"Delete\" children: [[\n        {topic meta: \"deleteLine\" title: \"Line\"}\n        {topic meta: \"killLine\" title: \"Line Right\" }\n        {topic meta: \"delLineLeft\" title: \"Line Left\" }\n        {divider: true}\n        {topic meta: \"delWrappedLineLeft\" title: \"Wrapped Line Left\" }\n        {topic meta: \"delWrappedLineRight\" title: \"Wrapped Line Right\" }\n        {divider: true}\n        {topic meta: \"delWordBefore\" title: \"Word Left\" }\n        {topic meta: \"delWordAfter\" title: \"Word Right\" }\n        {divider: true}\n        {topic meta: \"delGroupBefore\" title: \"Group Before\"}\n        {topic meta: \"delGroupAfter\" title: \"Group After\"}\n        {divider: true}\n        {topic meta: \"delCharBefore\" title: \"Character Left\"}\n        {topic meta: \"delCharAfter\" title: \"Character Right\"}\n      ]]}\n      {topic meta: \"indentAuto\" title: \"Auto Indent\"}\n      {topic meta: \"indentLess\" title: \"Indent Left\"}\n      {topic meta: \"indentMore\" title: \"Indent Right\"}\n      {topic meta: \"newlineAndIndent\" title: \"New line and indent\"}\n      {divider: true}\n      {topic meta: \"transposeChars\" title: \"Transpose Characters\" }\n      {divider: true}\n      {topic meta: \"selectAll\" title: \"Select All\"}\n      {topic meta: \"singleSelection\" title: \"Single Selection\"}\n    ]]}\n    {title: \"Go\" children: [[\n      {topic meta: \"goDocStart\" title: \"Document Start\"}\n      {topic meta: \"goDocEnd\" title: \"Document End\"}\n      {divider: true}\n      {topic meta: \"goCharLeft\" title: \"Char Left\"}\n      {topic meta: \"goCharRight\" title: \"Char Right\"}\n      {divider: true}\n      {topic meta: \"goColumnLeft\" title: \"Column Left\" }\n      {topic meta: \"goColumnRight\" title: \"Column Right\" }\n      {divider: true}\n      {topic meta: \"goGroupLeft\" title: \"Group Left\"}\n      {topic meta: \"goGroupRight\" title: \"Group Right\"}\n      {divider: true}\n      {topic meta: \"goWordLeft\" title: \"Word Left\" }\n      {topic meta: \"goWordRight\" title: \"Word Right\" }\n      {divider: true}\n      {topic meta: \"goLineStart\" title: \"Line Start\"}\n      {topic meta: \"goLineStartSmart\" title: \"Smart Line Start\" }\n      {topic meta: \"goLineEnd\" title: \"Line End\"}\n      {divider: true}\n      {topic meta: \"goLineLeft\" title: \"Line Left\" }\n      {topic meta: \"goLineLeftSmart\" title: \"Smart Line Left\" }\n      {topic meta: \"goLineRight\" title: \"Line Right\" }\n      {divider: true}\n      {topic meta: \"goLineUp\" title: \"Line Up\"}\n      {topic meta: \"goLineDown\" title: \"Line Down\"}\n      {divider: true}\n      {topic meta: \"goPageUp\" title: \"Page Up\"}\n      {topic meta: \"goPageDown\" title: \"Page Down\"}\n    ]]}\n    {title: \"Search\" children: [[\n      {topic meta: \"find\" title: \"Find...\"}\n      {topic meta: \"findNext\" title: \"Find Next\"}\n      {topic meta: \"findPrev\" title: \"Find Previous\"}\n      {topic meta: \"clearSearch\" title: \"Clear Search\" }\n      {divider: true}\n      {topic meta: \"replace\" title: \"Replace\"}\n      {topic meta: \"replaceAll\" title: \"Replace All\"}\n      ## {divider: true} appears to only work for XML\n      ## {topic meta: \"toMatchingTag\" title: \"Matching Tag\" }\n    ]]}\n    {title: \"View\" children: [[\n      {topic meta: \"view_keyboard_shortcuts\" title: \"Keyboard Shortcuts\" }\n      {topic meta: \"fold_at_cursor\" title: \"Fold at Cursor\" }\n      {title: \"Theme\" children: [[\n        {title: \"Dark\" children: [[\n          {topic meta: \"set_option,theme,3024-night\" title: \"3024\"}\n          {topic meta: \"set_option,theme,ambiance\" title: \"Ambience\"}\n          {topic meta: \"set_option,theme,ambiance-mobile\" title: \"Ambience (mobile)\"}\n          {topic meta: \"set_option,theme,base16-dark\" title: \"Base 16\"}\n          {topic meta: \"set_option,theme,blackboard\" title: \"Blackboard\"}\n          {topic meta: \"set_option,theme,cobalt\" title: \"Cobalt\"}\n          {topic meta: \"set_option,theme,colorforth\" title: \"Colour Forth\"}\n          {topic meta: \"set_option,theme,erlang-dark\" title: \"Erlang Dark\"}\n          {topic meta: \"set_option,theme,lesser-dark\" title: \"Lesser Dark\"}\n          {topic meta: \"set_option,theme,mbo\" title: \"MBO\"}\n          {topic meta: \"set_option,theme,midnight\" title: \"Midnight\"}\n          {topic meta: \"set_option,theme,monokai\" title: \"Monokai\"}\n          {topic meta: \"set_option,theme,night\" title: \"Night\"}\n          {topic meta: \"set_option,theme,paraiso-dark\" title: \"Paraiso\"}\n          {topic meta: \"set_option,theme,pastel-on-dark\" title: \"Pastel\"}\n          {topic meta: \"set_option,theme,rubyblue\" title: \"Ruby Blue\"}\n          {topic meta: \"set_option,theme,the-matrix\" title: \"The Matrix\"}\n          {topic meta: \"set_option,theme,tomorrow-night-bright\" title: \"Tomorrow Night\"}\n          {topic meta: \"set_option,theme,tomorrow-night-eighties\" title: \"Tomorrow Night Eighties\"}\n          {topic meta: \"set_option,theme,twilight\" title: \"Twilight\"}\n          {topic meta: \"set_option,theme,vibrant-ink\" title: \"Vibrant Ink\"}\n          {topic meta: \"set_option,theme,xq-dark\" title: \"XQ Dark\"}\n          {topic meta: \"set_option,theme,zenburn\" title: \"Zenburn\"}\n        ]]}\n        {title: \"Light\" children: [[\n          {topic meta: \"set_option,theme,3024-day\" title: \"3024\"}\n          {topic meta: \"set_option,theme,base16-light\" title: \"Base 16\"}\n          {topic meta: \"set_option,theme,default\" title: \"Default\"}\n          {topic meta: \"set_option,theme,eclipse\" title: \"Eclipse\"}\n          {topic meta: \"set_option,theme,elegant\" title: \"Elegant\"}\n          {topic meta: \"set_option,theme,mdn-line\" title: \"MDN\"}\n          {topic meta: \"set_option,theme,neat\" title: \"Neat\"}\n          {topic meta: \"set_option,theme,neo>Neo\"}\n          {topic meta: \"set_option,theme,paraiso-light\" title: \"Paraiso\"}\n          {topic meta: \"set_option,theme,solarized\" title: \"Solarized\"}\n          {topic meta: \"set_option,theme,xq-light\" title: \"XQ Light\"}\n        ]]}\n      ]]}\n    ]]}\n    {title: \"Settings\" children: [[\n      {title: \"Keyboard\" children: [[\n        {topic meta: \"set_mode,default\" title: \"Code Mirror\"}\n        {topic meta: \"set_mode,emacs\" title: \"Emacs\"}\n        {topic meta: \"set_mode,sublime\" title: \"Sublime\"}\n        {topic meta: \"set_mode,vim\" title: \"Vi\"}\n      ]]}\n      {divider: true}\n      {topic meta: \"toggle_option,smartIndent\" title: \"Auto-indent\"}\n      {title: \"Indent\" children: [[\n        {topic meta: \"set_option,indentUnit,2\" title: \"2\"}\n        {topic meta: \"set_option,indentUnit,4\" title: \"4\"}\n      ]]}\n      {topic meta: \"toggle_option,autoCloseBrackets\" title: \"Close Brackets\"}\n      {topic meta: \"toggle_option,matchBrackets\" title: \"Match Brackets\"}\n      {topic meta: \"toggle_option,matchTags\" title: \"Match Tags\"}\n      {divider: true}\n      {title: \"Scroll Margin\" children: [[\n        {topic meta: \"set_option,cursorScrollMargin,0\" title: \"0\"}\n        {topic meta: \"set_option,cursorScrollMargin,2\" title: \"2\"}\n        {topic meta: \"set_option,cursorScrollMargin,4\" title: \"4\"}\n      ]]}\n      {topic meta: \"toggle_option,continueComments\" title: \"Comment Continuation\"}\n      {topic meta: \"toggle_option,showTrailingSpace\" title: \"Show Trailing Spaces\"}\n      {topic meta: \"toggle_option,dragDrop\" title: \"Toggle Drag and Drop\"}\n      {topic meta: \"toggle_option,lineNumbers\" title: \"Toggle Line Numbers\"}\n      {topic meta: \"toggle_option,lineWrapping\" title: \"Toggle Line Wrap\"}\n    ]]}\n  ]])\n  (var listener (lambda [cm data]\n    (var args (data.item.meta.split \",\"))\n    (var command (args.shift))\n    (args.unshift cm)\n    ((get CodeMirror.commands command).apply CodeMirror args)\n  ))\n  (var open (lambda [owner wrapper]\n    (var cm (CodeMirror wrapper options))\n    (set! cm.listener (lambda [data] (listener cm data)))\n    (message.send \"CodeMirror-menu\" menu)\n    (message.listen (+ owner \"-\" \"CodeMirror-command\") cm.listener)\n    (return cm)\n  ))\n  (var close (lambda [cm]\n    (message.remove cm.listener)\n  ))\n  (var spaces \"                \")\n  (var extra-commands {\n    view_keyboard_shortcuts: (lambda [cm]\n      (var keys [[]])\n      (var one-map (lambda [map]\n        ((Object.keys map).forEach (lambda [key]\n          (cond\n            (is key \"fallthrough\") (do\n                (var more (get map key))\n                (cond (is (typeof more) \"string\") (var more [[more]]))\n                (more.forEach (lambda [map]\n                  (one-map (get CodeMirror.keyMap map))))\n              )\n            (else) (keys.push (+ key \": \" (get map key)))\n          )\n        ))\n      ))\n      (one-map cm.options.extraKeys)\n      (var core (get CodeMirror.keyMap cm.options.keyMap))\n      (cond (not core.fallthrough)\n        (set! core.fallthrough CodeMirror.keyMap.default.fallthrough))\n      (one-map core)\n      (window.open\n        (+ \"data:text/html,\" (encodeURIComponent (keys.join \"<br>\")))\n        \"Keys\" \"width=300,height=600\")\n    )\n    fold_at_cursor: (lambda [cm]\n      (cm.foldCode (cm.getCursor))\n    )\n    toggle_option: (lambda [cm name]\n      (CodeMirror.commands.set_option cm name (not (cm.getOption name)))\n    )\n    set_option: (lambda [cm name value]\n      (cm.setOption name value)\n      (dict.update! options name value)\n      (update-options)\n    )\n    set_mode: (lambda [cm mode]\n      (CodeMirror.commands.set_option cm \"keyMap\" mode)\n    )\n    auto_complete: (lambda [cm]\n      (var not-only (lambda []\n        (var result (CodeMirror.hint.anyword.apply null arguments))\n        (return-if (isnt result.list.length 1) result)\n        (var size (- result.to.ch result.from.ch))\n        (return-if (isnt (do (get list 0).length) size) result)\n        (set! result.list [[]])\n        (return result)\n      ))\n    )\n  })\n  ## Editing modes dependent on file type\n  (var mode-extensions {\n    apl: \"apl\" as3: \"apl\" asf: \"apl\"\n    c: \"clike\" cpp: \"clike\" h: \"clike\" cs: \"clike\"\n    chh: \"clike\" hh: \"clike\" h__: \"clike\" hpp: \"clike\"\n    hxx: \"clike\" cc: \"clike\" cxx: \"clike\" c__: \"clike\"\n    \"c++\": \"clike\" stl: \"clike\" sma: \"clike\"\n    java: \"clike\" scala: \"clike\" clj: \"clojure\"\n    cpy: \"cobol\" cbl: \"cobol\"cob: \"cobol\"\n    coffee: \"coffeescript\" coffeescript: \"coffeescript\"\n    \"gwt.coffee\": \"coffeescript\"\n    vlx: \"commonlisp\" fas: \"commonlisp\" lsp: \"commonlisp\"\n    el: \"commonlisp\" css: \"css\" less: \"css\"\n    dl: \"d\" d: \"d\" diff: \"diff\" dtd: \"dtd\" dylan: \"dylan\"\n    ecl: \"ecl\" e: \"eiffel\" erl: \"erlang\" hrl: \"erlang\"\n    f: \"fortran\" for: \"fortran\" FOR: \"fortran\"\n    f95: \"fortran\" f90: \"fortran\" f03: \"fortran\"\n    gas: \"gas\" gfm: \"gfm\" feature: \"gherkin\" go: \"go\"\n    groovy: \"groovy\" \"html.haml\": \"haml\" hx: \"haxe\"\n    lhs: \"haskell\" gs: \"haskell\" hs: \"haskell\"\n    asp: \"htmlembedded\" jsp: \"htmlembedded\"\n    ejs: \"htmlembedded\" http: \"http\"\n    html: \"htmlmixed\" htm: \"htmlmixed\" \".py.jade\": \"jade\"\n    js: \"javascript\" json: \"javascript\" jinja2: \"jinja2\"\n    jl: \"julia\" ls: \"livescript\" lua: \"lua\"\n    markdown: \"markdown\" mdown: \"markdown\" mkdn: \"markdown\"\n    md: \"markdown\" mkd: \"markdown\" mdwn: \"markdown\"\n    mdtxt: \"markdown\" mdtext: \"markdown\"\n    mdx: \"mirc\" dcx: \"mirc\"\n    ml: \"mllike\" fs: \"mllike\" fsi: \"mllike\"\n    mli: \"mllike\" fsx: \"mllike\" fsscript: \"mllike\"\n    nginx: \"nginx\" nt: \"ntriples\" mex: \"octave\"\n    pas: \"pascal\" pegjs: \"pegjs\" ps: \"perl\"\n    php: \"php\" \"lib.php\": \"php\"\n    pig: \"pig\" ini: \"properties\" properties: \"properties\"\n    pp: \"puppet\" py: \"python\" q: \"q\" r: \"r\"\n    rpm: \"rpm\" \"src.rpm\": \"rpm\" rst: \"rst\" rb: \"ruby\"\n    rs: \"rust\" sass: \"sass\" scm: \"scheme\" ss: \"scheme\"\n    sh: \"shell\" sieve: \"sieve\"\n    sm: \"smalltalk\" st: \"smalltalk\" tpl: \"smartymixed\"\n    solr: \"solr\" sparql: \"sparql\" sql: \"sql\"\n    stex: \"stex\" tex: \"stex\" tcl: \"tcl\" tw: \"tiddlywiki\"\n    tiki: \"tiki\" toml: \"toml\" ttl: \"turtle\" vb: \"vb\"\n    bas: \"vbscript\" vbs: \"vbscript\" vtl: \"velocity\"\n    v: \"verilog\" xml: \"xml\"\n    xquery: \"xquery\" xq: \"xquery\" xqy: \"xquery\"\n    yaml: \"yaml\" yml: \"yaml\" z80: \"z80\" asm: \"z80\"\n  })\n  (var saved-mode-extensions localStorage.CodeMirror-mode-extensions)\n  (cond saved-mode-extensions (var mode-extensions\n    (dict.merge mode-extensions saved-mode-extensions)\n  ))\n\n  (var set-mode (lambda [cm name]\n    (var try-mode (lambda [exts]\n      (var ext (exts.join \".\"))\n      (return? (get mode-extensions ext))\n      (return-if (get CodeMirror.modes ext) ext)\n      (return false)\n    ))\n    (var mode ((=>\n      (var parts (name.split \".\"))\n      (cond (> parts.length 2) (return? (try-mode (parts.slice -2))))\n      (return? (try-mode (parts.slice -1)))\n      (return  \"text\")\n    )))\n    (cm.setOption \"mode\" mode)\n    (CodeMirror.autoLoadMode cm mode)\n  ))\n\n  ## CodeMirror lispz mode\n  (var init-lispz-mode (=>\n  (CodeMirror.defineSimpleMode \"lispz\" {\n    start: [[\n      {regex: '/\"\"/'                                 token: \"string\"}\n      {regex: '/\"/'                   next: \"string\" token: \"string\"}\n      {regex: '/\\'(?:[^\\\\]|\\\\.)*?\\'/'                token: \"variable-2\"}\n      {regex: '/###/'                next: \"comment\" token: \"comment\" }\n      {regex: '/(\\()([!\\s\\(\\[\\{\\)\\}\\]]*?!)/'\n                                indent: true  token: [[null \"error\"]]}\n      {regex: '/(\\()([^\\s\\(\\[\\{\\)\\}\\]]+)/'\n                                indent: true  token: [[null \"keyword\"]]}\n      {regex: '/true|false|null|undefined|debugger/' token: \"atom\"}\n      {regex: '/0x[a-f\\d]+|[-+]?(?:\\.\\d+|\\d+\\.?\\d*)(?:e[-+]?\\d+)?/i'\n                                                     token: \"number\"}\n      {regex: '/## .*/'                              token: \"comment\"}\n      {regex: '/[\\{\\(\\[]/'        indent: true}\n      {regex: '/[\\}\\)\\]]/'      dedent: true}\n      {regex: '/[^\\s\\(\\{\\[\\)\\]\\}]+/'                 token: \"variable\"}\n      {regex: '/\\s+/' next: \"start\"}\n    ]]\n    comment: [[\n      {regex: '/###/' token: \"comment\" next: \"start\"}\n      {regex: '/.*/' token: \"comment\"}\n    ]]\n    string: [[\n      {regex: '/[^\\\\]\"/' token: \"string\" next: \"start\"}\n      {regex: '/./' token: \"string\"}\n    ]]\n    meta: { lineComment: \"## \" dontIndentStates: [[\"comment\" \"string\"]] }\n  })\n  (CodeMirror.defineMIME \"text/lispz\" \"lispz\")\n  ## Update htmlmixed to understand lispz scripts\n  (cond (is (typeof (get CodeMirror.mimeModes \"text/html\")) \"string\")\n        (dict.update! CodeMirror.mimeModes \"text/html\" {name: \"htmlmixed\"}))\n  (var mode (get CodeMirror.mimeModes \"text/html\"))\n  (cond (not mode.scriptTypes) (set! mode.scriptTypes [[]]))\n  (mode.scriptTypes.push {matches: '/^text\\/lispz$/' mode: \"lispz\"})\n  (set! CodeMirror.mimeModes.htmlmixed mode)\n\n  ## paredit keys that defer if not in lisp code\n  (var lisp-modes {lispz: true clojure: true commonlisp: true scheme: true})\n  (set! subpar.core.run_selection (lambda [cm]\n    (cond (cm.somethingSelected) (var source (cm.doc.getSelection))\n          (else)                 (var source (cm.doc.getValue))\n    )\n    (console.log (lispz.run \"lispz-repl\" source))\n  ))\n  (var subpart (lambda [cmd opt]\n    (return (lambda [cm]\n      (var mode (cm.getModeAt (cm.getCursor)))\n      (cond (get lisp-modes mode.name)  ((get subpar.core cmd) cm opt)\n            (else)                      (return CodeMirror.Pass)\n      )\n    ))\n  ))\n  (dict.insert! CodeMirror.commands {\n    ## paredit keys that defer if not in lisp code\n    subpar_backward_delete:        (subpart \"backward_delete\")\n    subpar_forward_delete:         (subpart \"forward_delete\")\n    subpar_forward_delete:         (subpart \"forward_delete\")\n\n    subpar_open_bracket:           (subpart \"open_expression\" \"()\")\n    subpar_open_square_bracket:    (subpart \"open_expression\" \"[]\")\n    subpar_open_braces:            (subpart \"open_expression\" \"{}\")\n\n    subpar_close_bracket:          (subpart \"close_expression\" \")\")\n    subpar_close_square_bracket:   (subpart \"close_expression\" \"]\")\n    subpar_close_braces:           (subpart \"close_expression\" \"}\")\n\n    subpar_double_quote:           (subpart \"double_quote\")\n\n    subpar_forward:                (subpart \"forward\")\n    subpar_backward:               (subpart \"backward\")\n    subpar_backward_up:            (subpart \"backward_up\")\n    subpar_forward_down:           (subpart \"forward_down\")\n    subpar_backward_down:          (subpart \"backward_down\")\n    subpar_forward_up:             (subpart \"forward_up\")\n\n    subpar_backward_barf:          (subpart \"backward_barf\")\n    subpar_backward_barf:          (subpart \"backward_barf\")\n    subpar_backward_barf:          (subpart \"backward_barf\")\n\n    subpar_forward_barf:           (subpart \"forward_barf\")\n    subpar_forward_barf:           (subpart \"forward_barf\")\n\n    subpar_backward_slurp:         (subpart \"backward_slurp\")\n    subpar_backward_slurp:         (subpart \"backward_slurp\")\n    subpar_backward_slurp:         (subpart \"backward_slurp\")\n\n    subpar_forward_slurp:          (subpart \"forward_slurp\")\n    subpar_forward_slurp:          (subpart \"forward_slurp\")\n\n    subpar_splice_delete_backward: (subpart \"splice_delete_backward\")\n    subpar_splice_delete_forward:  (subpart \"splice_delete_forward\")\n    subpar_splice:                 (subpart \"splice\")\n    subpar_indent_selection:       (subpart \"indent_selection\")\n\n    lispz_run_selection:           (subpart \"run_selection\")\n  })\n  ))\n\n  ## elm script has a bug - restore for a later version.\n  ## tern is for javascript features - overrides console.log\n  (var build-base (lambda [target-repo]\n    (return (github.build target-repo \"codemirror\" [[\n      {repo: \"codemirror/CodeMirror\" files: [[\n        {base: \"lib\" include: '/codemirror\\.(js|css)$/'}\n        {base: \"addon/mode\" include: '/^simple.js$/'}\n        {base: \"keymap\"}\n        {base: \"addon\" exclude: '/test.js$|node.js$|standalone.js$|\\/tern\\//'}\n        {base: \"mode/htmlmixed\" include: '/css$|js$/'}\n        {base: \"mode/javascript\" include: '/css$|js$/'}\n        {base: \"mode/css\" include: '/css$|js$/'}\n      ]]}\n      {repo: \"achengs/subpar\" files: [[\n        {base: \"resources/public/js\" include: '/subpar.core.js/'}\n      ]]}\n    ]]))\n  ))\n  (var build-themes (lambda [target-repo]\n    (return (github.build target-repo \"codemirror-themes\" [[\n      {repo: \"codemirror/CodeMirror\" files: [[\n        {base: \"theme\"}\n      ]]}\n    ]]))\n  ))\n  (var build-mode (lambda [target-repo]\n    (return (github.build target-repo \"codemirror-modes\" [[\n      {repo: \"codemirror/CodeMirror\" files: [[\n        {base: \"mode\" exclude: '/htmlmixed|javascript|css|elm.js$|test.js$/'}\n      ]]}\n    ]]))\n  ))\n  (var build (lambda [target-repo]\n    (return (promise.all build-base build-themes build-mode))\n  ))\n\n  (lispz.css \"ext/codemirror.css\")\n  (when (net.script \"ext/codemirror.js\") []\n    (cond window.CodeMirror (do ## in case we haven't built it yet\n      (net.script \"ext/codemirror-modes.js\") ## don't care when\n      (dict.for-each extra-commands (lambda [key value]\n        (dict.update! CodeMirror.commands key value)\n      ))\n      (init-lispz-mode)\n    ))\n    (export {options open close set-mode build})\n  )\n  (delay 100 (lispz.css \"ext/codemirror-themes.css\"))\n)\n"

lispz_modules['core']="(macro debug [*msg] (console.log arguments *msg))\n\n### Supporting function definition ###\n(macro lambda [params *body] (#join '' '(function(' params '){' *body '})'))\n(macro =>     [*body]        (#join '' '(function(){' *body '})'))\n(macro *arguments [from] ([[]].slice.call arguments from))\n(macro global [name value]\n  (#join '' 'lispz.globals.' name '=' value)\n  (macro name [&params] (#join '' 'lispz.globals.' name '(' &params ')')))\n(macro closure [params *body] (#join '' '(function(' params '){' *body '})(' params ')'))\n(macro return  [value] (#join '' 'return ' value '\\n'))\n(macro return? [value] (cond value (return value)))\n(macro return-if [test value] (cond test (return value)))\n(macro new [cls params] (#join '' '(new ' cls '(' params '))'))\n\n### Pure functional programming wants immutability - but we live in an impure world ###\n(macro set! [name value] (#join '' name '=' value ';'))\n(macro var  (*list) (#join '' 'var ' (#pairs *list '=' ',') ';'))\n(macro dict.update! [dict key value] (#join '' dict '[' key ']' '=' value ';'))\n\n### Retrieval - can be used for objects and arrays ###\n(macro get [dict *key] (#join '' dict '[' (#join '][' *key) ']'))\n\n### Operators ###\n(macro not [value] (#join '' '!(' value ')'))\n(macro in [test against] (#join '' '(' test ' in ' against ')'))\n(macro instance-of [type obj] (#join '' '(' obj ' instanceof ' type ')'))\n\n### conditional processing ###\n(macro empty? [list] (not list.length))\n(macro defined? [field] (!== (typeof field) \"undefined\"))\n(macro cond [*list] (#join '' 'switch(false){case !' (#pairs *list  ':' ';break;case !') '}'))\n(macro else [] 'true')\n(macro contains [str substr] (isnt -1 (str .indexOf substr)))\n## Javascript does not (yet) have tail recursion - it is scheduled for 2016\n(macro while [test body] (#join '' 'while(' test '){' body '}'))\n\n(global default? (lambda [value default-value]\n  (cond value (return value)) (return default-value)\n))\n\n### List and dictionary manipulation ###\n(macro length [list] (#join '' list '.length'))\n(macro first [list] (get list 0))\n(macro rest [list] (list .slice 1))\n(macro last [list] (get (list .slice -1) 0))\n(global slice (lambda [list from to]  (return ([[]].slice.call list from to))))\n### module import ###\n(macro using [modules *on_ready] (lispz.load (#join '' '\"' modules '\"')\n  (=> (#requires modules) *on_ready)))\n\n### Modules must export to continue processing ###\n(macro export [exports] (#join '' '__module_ready__(' exports ')'))\n\n(macro delay [ms *body] (setTimeout (=> *body) ms))\n(macro yield [*body] (delay 0 *body))\n(macro do [*body] *body)\n###\n# Use contain to contain state changes. Any var inside a contain can be changed\n# no matter how many times the contain is called concurrently. It is also allows\n# the passing in of variables that are effectively copied and cannot be changed\n# from outside.\n###\n(macro contain [contain#args *contain#body] ((lambda contain#args *contain#body) contain#args))\n###\n# Return a random integer between 0 and the range given\n###\n(global random (lambda [range] (return (Math.floor (* (Math.random) range)))))\n\n### Promises ###\n(global promise {})\n(macro promise [params *body] (lambda params\n  (var #callbacks [[]])\n  (var #pledge (new Promise (lambda [ok fail] (set! #callbacks  {ok fail}))))\n  (var resolve-promise (lambda [] (#callbacks.ok.apply null (*arguments 0))))\n  (var reject-promise (lambda [err] (#callbacks.fail err)))\n  ## (#join '' 'try{' *body '}catch(err){' (reject-promise err) '}')\n  *body\n  (return #pledge)\n))\n(macro promise.callback [params *body] (promise params\n  (var callback (lambda [err result]\n    (return-if err (reject-promise err))\n    (resolve-promise result)\n  ))\n  *body\n))\n(global promise.resolved (promise [pact] (resolve-promise pact)))\n\n(macro when  [pledge params *body] (pledge .then  (lambda params *body)))\n(macro catch [pledge errors *body] (pledge .catch (lambda errors *body)))\n\n(using [list]\n  (global promise.all (=> (return (Promise.all (list.flatten (*arguments 0))))))\n)\n(export {})\n"

lispz_modules['dev']="(using [github riot list]\n  (var manifest (=>\n    (var text [[\"CACHE MANIFEST\"]])\n    (lispz.manifest.forEach (lambda [uri] (text.push uri)))\n    (text.push \"NETWORK:\" \"*\")\n    (return (text.join \"\\n\"))\n  ))\n  ### Package Lispz for distribution ###\n  (var package (lambda [lispz-repo]\n    (var read-file (github.read.bind null lispz-repo))\n\n    (var group (lambda [files]\n      (var modules [[]] riots [[]])\n      (files.forEach (lambda [entry]\n        (return? (not (is \"file\" entry.type)))\n        (var parts (entry.name.split \".\"))\n        (cond\n          (is (last parts) \"lispz\")               (modules.push (first parts))\n          (is ((slice parts -2).join \".\") \"riot.html\") (riots.push entry.name)\n        )\n      ))\n      (return (promise.resolved {modules riots}))\n    ))\n    (var build-modules (promise [names]\n      (var load-module (lambda [name]\n        (return (when (read-file (+ name \".lispz\")) [text]\n          (var contents (text.replace '/[\\\\\"]/g' \"\\\\$&\"))\n          (var contents (contents.replace '/\\n/g' \"\\\\n\"))\n          (return [[\"\\nlispz_modules['\" name \"']=\\\"\" contents \"\\\"\\n\"]])\n        ))\n      ))\n      (return (promise.all (names.map load-module)))\n    ))\n    (var build-riots (promise [names]\n      (var source [[]])\n      (var load-riot (lambda [name]\n        (return (when (read-file name) [text]\n          (return [[\"\\n\\n/*\" name \"*/\\n\\nlispz.tags['\" name \"']=function(){\"\n            (riot.compile text true) \"}\\n\"]])\n        ))\n      ))\n      (return (promise.all (names.map load-riot)))\n    ))\n\n    (var update-mode (github.update lispz-repo))\n    (var lispz-js    (when update-mode [] (return (read-file \"lispz.js\"))))\n    (var listing     (when update-mode []  (return (github.list-dir lispz-repo \"\"))))\n    (var groups      (when listing [files] (return (group files))))\n    (var modules     (when groups [files]  (return  (build-modules files.modules))))\n    (var riots       (when groups [files]  (return  (build-riots files.riots))))\n\n    (var all-loaded  (promise.all modules lispz-js riots))\n\n    (return (when all-loaded [sources]\n      (var  code  (list.flatten [[\"window.lispz_modules={}\\n\" sources]]))\n      (return (github.write lispz-repo \"ext/lispz.js\"\n        (code.join \"\") \"lispz release code\")\n      )\n    ))\n  ))\n\n  ### Distribution ###\n  (var distribute (lambda [target-repo]\n  ))\n\n  (export {manifest package distribute})\n)\n"

lispz_modules['dexie']="(using  [net github]\n\n  (var build (lambda [target-repo]\n    (return (github.build target-repo \"dexie\" [[\n      {repo: \"dfahlander/Dexie.js\" files: [[\n        {base: \"dist/latest\" include: '/Dexie.js$/'}\n      ]]}\n    ]]))\n  ))\n\n  (lispz.script \"ext/dexie.js\" (=> (export { build })))\n)\n"

lispz_modules['dict']="(var insert (lambda [target dictionaries]\n  (dictionaries.forEach (lambda [dictionary]\n    ((Object.keys dictionary).forEach (lambda [key]\n      (dict.update! target key (get dictionary key))\n    ))\n  ))\n  (return target)\n))\n###\n# There is often need to merge multiple dictionaries together to create a new\n# combined one.\n###\n(var merge (lambda [dictionaries]\n  (return (insert {} (*arguments 0)))\n))\n(var insert! (lambda [target dictionaries]\n  (return (insert target (*arguments 0)))\n))\n\n(var from-list (lambda [list key]\n  (var dictionary {})\n  (cond list\n    (list.forEach (lambda [item] (dict.update! dictionary (get item key) item)))\n  )\n  (return dictionary)\n))\n\n(var for-each (lambda [dict action=>]\n  (Object.keys dict)(.forEach (lambda [k] (action=> k (get dict k))))\n))\n\n(var map (lambda [dict action=>]\n  (Object.keys dict)(.map (lambda [k] (return (action=> k (get dict k)))))\n))\n\n(export {merge from-list insert! for-each map})\n"

lispz_modules['diff_match_patch']="(using [net github]\n  (var build (lambda [target-repo built=>]\n    (return (github.build target-repo \"diff_match_patch\" [[\n      {repo: \"tanaka-de-silva/google-diff-match-patch-js\" files: [[\n        {base: \"\" include: '/^diff_match_patch_uncompressed.js$/'}\n      ]]}\n    ]]))\n  ))\n  (lispz.script \"ext/diff_match_patch.js\" (=> (export { build })))\n)\n"

lispz_modules['dom']="(using [dict]\n  (var append! (lambda [parent element]\n    (document.querySelector parent) (.appendChild element)\n  ))\n\n  (var element (lambda [tag-name attributes]\n    (var elem (document.createElement tag-name))\n    (dict.for-each attributes (lambda [k v] (elem.setAttribute k v)))\n    (return elem)\n  ))\n\n  (var event-throttle (lambda [element event action]\n    (var add null)\n    (var listener (lambda [event]\n      (element.removeEventListener event listener)\n      (delay 66 add)\n      (action event)\n    ))\n    (var add (=> (element.addEventListener event listener)))\n  ))\n\n  (export {append! element event-throttle})\n)\n"

lispz_modules['firebase']="(using  [net]\n  ( var databases (JSON.parse (or (localStorage.getItem \"firebases\") \"{}\")))\n\n  (var register (lambda [key uri]\n    (dict.update! databases key uri)\n    (localStorage.setItem \"firebases\" (JSON.stringify databases))\n  ))\n\n  (var encode (lambda [before]\n    (var uri (before.replace '/\\./g' \":\"))\n    (var uri (uri.replace    '/#/g'  \"_hash_\"))\n    (var uri (uri.replace    '/\\$/g' \"_dollar_\"))\n    (return uri)\n  ))\n\n  (var attach (lambda [collection db]\n    (var uri (get databases (or db \"default\")))\n    (return-if (not uri) null)\n    (return (new Firebase (+ uri \"/\" (encode collection))))\n  ))\n\n  (when (net.script \"https://cdn.firebase.com/js/client/2.2.9/firebase.js\") []\n    (export {register attach databases})\n  )\n)\n"

lispz_modules['firepad']="(using  [net github]\n  (var build (promise [target-repo]\n    (github.grunt target-repo \"firebase/firepad\" [grunt data]\n      (grunt.build {\n        target: \"firepad.js\"\n        pre:   data.concat.firepadjs.options.banner\n        post:  data.concat.firepadjs.options.footer\n        files: data.concat.firepadjs.src\n      } (=>\n        (grunt.copy data.copy.toBuild.files built=>)\n      ))\n    )\n  ))\n\n  (lispz.css \"ext/firepad.css\")\n  (when (net.script \"ext/firepad.js\") [] (export {build}))\n)\n"

lispz_modules['github']="(using  [net dict]\n  (var version null)\n  (var cdn-uri (lambda [project version filepath]\n    (return (+ \"https://cdn.rawgit.com/\" project \"/\" version \"/\" filepath))\n  ))\n  (var repo (lambda [username password project]\n    (var github (new Github {username password auth: \"basic\"}))\n    (var repo (github.getRepo.apply null (project.split \"/\")))\n    (set! repo.lispz {github username password project branch: \"master\"})\n    (return repo)\n  ))\n  ## Set the branch to use for repo - defaults to master\n  (var branch (promise [repo branch-name]\n    (set! repo.lispz.branch branch-name)\n    (repo.branch branch-name (lambda [err result] (resolve-promise)))\n  ))\n  ## list files in a specific path on the repo\n  (var list-dir (promise.callback [repo path]\n    (repo.contents repo.lispz.branch path callback)\n  ))\n  (var list-all (promise [repo path single-level]\n    (var result [[]])\n    (var list-path (lambda [path]\n      (return (when (list-dir repo path) [paths]\n        (var children [[]])\n        (paths.forEach (lambda [entry]\n          (cond\n            (is \"dir\"  entry.type)\n              (cond (not single-level) (children.push (list-path entry.path)))\n            (is \"file\" entry.type)\n              (result.push entry.path)\n          )\n        ))\n        (return (promise.all children))\n      ))\n    ))\n    (when (list-path path) [] (resolve-promise result))\n  ))\n  (var read (promise.callback [repo path]\n    (repo.read repo.lispz.branch path callback)\n  ))\n  (var update (lambda [repo]\n    (return-if (is repo.lispz.branch repo.lispz.username) (promise.resolved))\n    (var branch-name (default? repo.lispz.username \"master\"))\n    (return (branch repo branch-name))\n  ))\n  (var write (promise.callback [repo path contents comment]\n    (return-if (not contents.length) (promise.resolved))\n    (var encoded (unescape (encodeURIComponent contents)))\n    (repo.write repo.lispz.branch path encoded comment callback)\n  ))\n  ## preprocess a file to generate css or js dependent on extension\n  (var preprocessors {\n    lispz: (lambda [name code]\n      (return {ext: \"js\" code: (window.lispz.compile name code)})\n    )\n  })\n  (var preprocess (lambda [path code]\n    (var ext (last (path.split \".\")))\n    (var preprocessor (get preprocessors ext))\n    (return-if (not preprocessor) {ext code})\n    (return (preprocessor path code))\n  ))\n  ## Build and save a dependency list\n  ## We will need to filter the dependencies\n  (var filter (lambda [before include exclude]\n    (var after before)\n    (cond include (var after\n      (after.filter (lambda [file] (return (include.test file))))\n    ))\n    (cond exclude (var after\n      (after.filter (lambda [file] (return (not (exclude.test file)))))\n    ))\n    (return after)\n  ))\n  ## and see which to save and which to copy\n  (var process-file (lambda [store path code]\n    (var entry (preprocess path code))\n    (var saver (get store entry.ext))\n    (cond saver (do\n      (saver.push (+ \"\\n\\n/*\" path \"*/\\n\\n\"))\n      (saver.push entry.code)\n    ) meta.copy-to (do\n      (var filename (last (path.split \"/\")))\n      (set! (get store.copies (+ meta.copy-to \"/\" filename)) code)\n    ))\n  ))\n  ## Load the contents of the files we need from a single repo\n  (var process-repo (lambda [source-repo files]\n    (return (promise.all (files.map (promise [meta]\n      (var base (default? meta.base \"\"))\n      (when (actors.list-all source-repo base meta.single-level) [file-list]\n        (var files (filter file-list meta.include meta.exclude))\n        (promise.all (files.map (promise [path]\n          (when (actors.read source-repo path) [code]\n            (when (process-file path code) [] (resolve-promise))\n          )\n        )))\n        (resolve-promise)\n      )\n    ))))\n  ))\n  ## Given a list of repos, go through them all for files in need\n  (var process-repos (lambda [target-repo sources]\n    (return (promise.all (sources.map (promise [source]\n      (var source-repo (actors.repo target-repo source.repo))\n      (store.from.push source.repo)\n      (when (process-repo source-repo source.files) [] (resolve-promise))\n    ))))\n  ))\n  ## Retrieve file contents based of filtering meta-data\n  (var retriever (promise [target-repo sources actors]\n    (var store {js: [[]] css: [[]]  copies: {} from: [[\"Gathered from: \"]]})\n    (when (process-repos target-repo sources) [] (resolve-promise))\n  ))\n  ## Given a file type, save the concatenated source contents\n  (var save (promise [target-repo store name ext comment]\n    (var contents ((get store ext).join \"\"))\n    (return (write target-repo (+ \"ext/\" name \".\" ext) contents comment))\n  ))\n  ## copy files identified as needed as-is\n  (var copy (lambda [target-repo store comment]\n    (return (dict.map store.copies (lambda [path contents]\n      (return (write target-repo path contents comment))\n    )))\n  ))\n  ## Now we have gathered needed resources, build and save the output file\n  (var builder (promise [actors target-repo name sources]\n    (when (retriever target-repo sources actors) [store]\n      (var comment (store.from.join \" \"))\n      (var saved (when (update target-repo) []\n        (return (promise.all\n          (save target-repo store name \"js\" comment)\n          (save target-repo store name \"js\" comment)\n          (copy target-repo store           comment)\n        ))\n      ))\n      (when saved [] (resolve-promise))\n    )\n  ))\n  (var github-actors {\n    list-all read\n    repo: (lambda [target-repo name]\n      (return (repo target-repo.lispz.username\n        target-repo.lispz.password name\n      ))\n    )\n  })\n  (var build (builder.bind null github-actors))\n  ## Use gruntfile to decide which files to include and it what order\n  (var grunt-build (promise [meta]\n    (var js [[(default? meta.pre \"\")]])\n    (var read-all (promise.all (meta.files.map (promise []\n      (when (github-actors.read source-repo path) [data]\n        (js.push data) (resolve-promise)\n      )\n    ))))\n    (when read-all []\n      (js.push (default? meta.post \"\"))\n      (var contents (js.join \"\\n\"))\n      (when (write target-repo (+ \"ext/\" meta.target) contents comment) []\n        (resolve-promise)\n      )\n    )\n  ))\n  (var grunt-copy (promise [files]\n    (var copy-all (promise.all (files.map (promise [item]\n      (var path (default? item.src item))\n      (when (github-actors.read source-repo path) [contents]\n        (var path (+ \"ext/\" (last (path.split \"/\"))))\n        (when (write target-repo path contents comment) [] (resolve-promise))\n      )\n    ))))\n  ))\n  (var grunt (promise [target-repo source-project]\n    (var source-repo (github-actors.repo target-repo source-project))\n    (var comment (+ \"from \" source-project))\n    (var sources [[\n      {repo: source-project files: [[\n        {include: '/^Gruntfile.js$/' single-level: true}\n      ]]}\n    ]])\n    (when (retriever target-repo sources actors) [store]\n      (var grunt-config ((Function\n        (+ \"var module={};\" (last store.js) \"return module.exports\"))))\n      (grunt-config {\n        loadNpmTasks: (=>) registerTask: (=>)\n        initConfig: (lambda [config-data]\n          (var grunt-processor {\n            build: grunt-build\n            copy:  grunt-copy\n          })\n          (when (update target-repo) []\n            (resolve-promise grunt-processor config-data)\n          )\n        )\n      })\n    )\n  ))\n  (var build-github (lambda [target-repo]\n    (var sources [[\n      {repo: \"michael/github\" files: [[\n        {include: '/github.js$/'}\n      ]]}\n    ]])\n    (return (build target-repo \"github\" sources))\n  ))\n  (when (net.script \"ext/github.js\") []\n    (export {\n      branch list-all list-dir cdn-uri build builder repo read write update\n      build-github retriever grunt preprocessors\n      move: (promise.callback [repo from to]\n        (repo.move repo.lispz.branch from to callback)\n      )\n      delete: (promise.callback [repo path]\n        (repo.remove repo.lispz.branch path script callback)\n      )\n    })\n  )\n)\n"

lispz_modules['jquery']="(using [net cdnjs]\n  (var build (lambda [target-repo]\n    (return (cdnjs.build target-repo \"jquery\" [[\n      {repo: \"jquery\" files: [[\n        {exclude: '/\\.map$|\\.min.js$/'}\n      ]]}\n    ]]))\n  ))\n  (when (net.script \"ext/jquery.js\") [] (export {build}))\n)\n"

lispz_modules['list']="(var flatten (lambda [list]\n  (return (list.reduce (lambda [a b]\n    (var bflat b)\n    (cond (instance-of Array b) (var bflat (flatten b)))\n    (return (a.concat bflat))\n  ) [[]]))\n))\n(export {flatten})\n"

lispz_modules['message']="(var store {}  expecting {})\n\n(var exchange (lambda [address]\n  (var envelope (get store address))\n  (return? envelope)\n  (return (dict.update! store address [[]]))\n))\n\n(var add (lambda [address envelope]\n  (var envelopes (exchange address))\n  (envelopes.push envelope)\n  (cond (and (is envelopes.length 1) (get expecting address))\n        (do ((get expecting address)) (delete (get expecting address))))\n))\n\n## remove a recipient from all attached addresses\n(var remove (lambda [recipient]\n  (dict.update! exchange address\n    ((exchange address).filter (lambda [possibility]\n      (return (isnt recipient possibility))\n    ))\n  )\n))\n\n(var send (lambda [address packet reply=>]\n  (var reply (default? reply=> (=>)))\n  ## take a copy so that it does not change during processing\n  (((exchange address).slice).forEach (lambda [recipient]\n    (yield (reply (recipient.listener=> packet)))\n    (cond recipient.once (remove recipient))\n  ))\n))\n\n(var expect (lambda [address listener=>]\n  (add address {once: true listener=>})\n))\n\n## Only add expect if no other listeners - otherwise respond immediately\n(var wait-for (lambda [address listener=>]\n  (return-if (length (exchange address)) (listener=>))\n  (dict.update! expecting address listener=>)\n))\n\n(var listen (lambda [address listener=>]\n  (add address {listener=>})\n))\n\n(var dispatch (lambda [address actions]\n  (listen address (lambda [packet]\n    (var action (get actions packet.action))\n    (return-if (not action) false)\n    (action packet)\n  ))\n))\n\n(var log (lambda [text]\n  (var parts (text.split '/\\s*:\\s*/'))\n  (cond (is 1 parts.length) (parts.unshift \"message\"))\n  (send \"logging\" {level: (get parts 0) text: (get parts 1)})\n))\n\n(listen \"logging\" (lambda [packet]\n  (console.log packet.level \"-\" packet.text)\n))\n\n(export {exchange send expect listen dispatch wait-for})\n"

lispz_modules['net']="(using [list dom]\n  (var script (promise.callback [uri] (lispz.script uri callback)))\n\n  (var css (lambda [uri]\n    (var el (dom.element \"link\" {\n      type: \"text/css\" rel: \"stylesheet\" href: uri\n    }))\n    (dom.append! \"head\" el)\n  ))\n\n  (var http-get (promise.callback [uri]\n    (lispz.http_request uri \"GET\" callback)\n  ))\n\n  (var json-request (promise [uri]\n    (when (http-get uri) [response] (resolve-promise (JSON.parse response)))\n  ))\n\n  (export {\n    script css http-get json-request\n  })\n)\n"

lispz_modules['riot']="(using  [net github dict]\n  (var compile (lambda [html to-js] (return (riot.compile html to-js))))\n\n  (var tags {})\n\n  (var load (promise [name uri]\n    (var mount (=>\n      (dict.update! tags name true)\n      (dict.update! tags uri true)\n      (riot.mount name)\n      (resolve-promise)\n    ))\n    (cond\n      (get tags name)       (resolve-promise)\n      (get lispz.tags name) (do ((get lispz.tags name)) (mount))\n      (else)                (when (net.http-get uri) [response]\n                              (compile response) (mount))\n    )\n  ))\n\n  (var build (lambda [target-repo]\n    (return (github.build target-repo \"riot\" [[\n      {repo: \"riot/riot\" files: [[\n        {include: '/^riot\\+compiler.js$/'}\n      ]]}\n    ]]))\n  ))\n\n  (var mount (lambda [tags] (riot.mount tags)))\n\n  (when (net.script \"ext/riot.js\") []\n    (return-if (not window.riot) (export {build}))\n    (set! riot.parsers.js.lispz\n      (lambda [source] (return ((lispz.compile \"riot-tags\" source).join \"\\n\")))\n    )\n    (var riot-elements (slice (document.getElementsByClassName \"riot\")))\n    (var load-all (promise.all (riot-elements.map (lambda [element]\n      (var name (element.tagName.toLowerCase))\n      (var uri (or (element.getAttribute \"uri\")\n                   (+ (name.toLowerCase) \".riot.html\")))\n      (return (load name uri))\n    ))))\n    (when load-all [] (export {build compile load mount}))\n  )\n)\n"
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
      callback(err)
    }
    req.onload = function() {
      manifest.push(req.responseURL)
      if (req.status === 200) callback(null, req.responseText)
      else                    req.onerror(req.statusText)
    }
    req.send()
  },
  module_init = function(uri, on_readies) {
    var js = compile(uri, lispz_modules[uri]).join('\n') +
      "//# sourceURL=" + uri + ".lispz\n"
    init_func = new Function('__module_ready__', js)
    init_func(function(exports) {
      cache[uri.split('/').pop()] = cache[uri] = exports
      delete pending[uri]
      on_readies.forEach(function(call_module) {call_module(exports)})
    })
  },
  load_one = function(uri, on_ready) {
    if (cache[uri]) return on_ready()
    if (pending[uri]) return pending[uri].push(on_ready)
    if (lispz_modules[uri]) return module_init(uri, [on_ready])
    pending[uri] = [on_ready]; var js = ""
    http_request(uri + ".lispz", 'GET', function(err, response_text) {
      try {
        if (err) throw err
        var name = uri.split('/').pop()
        lispz_modules[uri] = response_text
        module_init(uri, pending[uri])
      } catch (e) {
        delete pending[uri]
        console.log(e)
        throw uri+": "+e
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
  },
  //##################    where to get scripts    #############################//
  lispz_url = document.querySelector('script[src*="lispz.js"]').getAttribute('src'),
  lispz_base_path = /^(.*?)(?:ext\/)?lispz.js/.exec(lispz_url)[1],
  css = function(uri) {
    el = document.createElement("link")
    el.setAttribute("type", "text/css")
    el.setAttribute("rel", "stylesheet")
    el.setAttribute("href",  lispz_base_path+uri)
    document.head.appendChild(el)
  },
  script = function(uri, when_loaded) {
    el = document.createElement("script")
    document.head.appendChild(el)
    el.addEventListener("load",  function(evt) { setTimeout(when_loaded, 20) })
    el.addEventListener("error", function(evt) { console.log(evt); when_loaded(evt) })
    el.setAttribute("src", lispz_base_path+uri)
  }
  window.onload = function() {
    var q = lispz_url.split('#')
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
           clone: clone, manifest: manifest, script: script, css: css,
           synonyms: synonyms, globals: globals, tags: {} }
}()


/*bootstrap.riot.html*/

lispz.tags['bootstrap.riot.html']=function(){riot.tag('panel', ' <div class="panel { context }" name=outer> <div class=panel-heading if="{ opts.heading }" name=heading ><bars-menu align=right name="{ opts.menu }" owner="{ opts.owner }"></bars-menu> <h3 class=panel-title>{ opts.heading }</h3></div> <div class="panel-body" name=body><yield></yield></div> <div class=panel-footer if="{ opts.footer }" name=footer >{ opts.footer }</div> </div>', 'panel .panel { position: relative; } panel .panel-title { cursor: default; } panel .panel-body { position: absolute; top: 40px; bottom: 10px; left: 0; right: 0; }', function(opts) {var tag=this;//#riot-tags:2

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

lispz.load("message"//#core:49
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

lispz.load("message"//#core:49
,(function(){var message=lispz.cache["message"];
message.listen(opts.name,(function(items){tag.children={'base':{'children':items}};//#riot-tags:5

tag.update()
tag.update()//#riot-tags:6
}))//#riot-tags:7
}))//#riot-tags:8

});

riot.tag('tree-component', '<ul class="dropdown-menu"> <li each="{ item, i in items }" class="{ dropdown-header: item.header && item.title, divider: item.divider, disabled: item.disabled }" ><a onclick="{ parent.goto }" href="#"> <span if="{ item.children }" class="glyphicon glyphicon-triangle-right" aria-hidden="true"></span>{ item.title }</a> <tree-component if="{ item.children }" name="{ item.title }"> </li> </ul>', 'tree-component ul { display: inherit !important; position: inherit !important; } tree-component:not([name=base]) > ul { display: none !important; } tree-component:not([name=base]).open > ul { margin-left: 9px; margin-right: 9px; display: inherit !important; } tree-component span.glyphicon { margin-left: -18px; }', function(opts) {var tag=this;//#riot-tags:2

lispz.load("message,dict"//#core:49
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

lispz.load("message,dom"//#core:49
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

lispz.load("message"//#core:49
,(function(){var message=lispz.cache["message"];
message.listen("page-content-wrapper-padding",(function(px){tag.page_content_wrapper.style.paddingLeft=(px+"px");//#riot-tags:5
}))//#riot-tags:6
}))//#riot-tags:7

});

riot.tag('bootstrap', '<div id=page-wrapper><yield></yield></div>', '.pointer { border: 5px solid transparent; display: inline-block; width: 0; height: 0; vertical-align: middle; } .pointer.float-right { float: right; margin-top: 5px; } .pointer.up { border-bottom: 5px solid; } .pointer.right { border-left: 5px solid; } .pointer.down { border-top: 5px solid; } .pointer.left { border-right: 5px solid; }', function(opts) {var tag=this;//#riot-tags:2

lispz.load("dom,net,jquery,riot,message,bootstrap"//#core:49
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
}


/*codemirror.riot.html*/

lispz.tags['codemirror.riot.html']=function(){riot.tag('codemirror', '<div name=wrapper> </div>', function(opts) {var tag=this;//#riot-tags:2

lispz.load("codemirror"//#core:49
,(function(){var codemirror=lispz.cache["codemirror"];
tag.cm=CodeMirror(tag.wrapper,opts);//#riot-tags:4
}))//#riot-tags:5

});
}


/*firepad.riot.html*/

lispz.tags['firepad.riot.html']=function(){riot.tag('firepad', ' <panel height="{ opts.height }" heading="{ heading }" menu="{ menu }" owner="{ _id }"> <div name=wrapper class=wrapper></div> </panel>', 'firepad .wrapper { position: absolute; top: 0; bottom: 0; left: 0; right: 0; height: initial; } firepad .CodeMirror { position: absolute; top: 0; bottom: 0; left: 5px; right: 0; height: initial; } a.powered-by-firepad { display: none; } div.firepad-toolbar { margin-top: -25px; }', function(opts) {var tag=this;//#riot-tags:2

tag.menu="CodeMirror-menu";//#riot-tags:3

tag.heading="Edit";//#riot-tags:4

lispz.load("firebase,codemirror,firepad,message,dict"//#core:49
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
}


/*lispz-repl.riot.html*/

lispz.tags['lispz-repl.riot.html']=function(){riot.tag('lispz-repl', '<div id=lispz_repl_div class="{ hidden:hidden }"> <input type=text name=usings autocomplete=on size=20 placeholder="(package-list (* to reload))"> <input type=text name=code autocomplete=on size=50 placeholder="(Lispz code - enter to execute)"> </div>', 'lispz-repl {position: absolute; bottom: 0;} lispz-repl .hidden {display: none}', function(opts) {var tag=this;//#riot-tags:2

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
}
