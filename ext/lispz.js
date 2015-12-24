window.lispz_modules={}

lispz_modules['annotations']="### spec: Annotations\n  In this context, annotations are comments in source files that can be processed\n  by an external system for processing outside normal compilation and running.\n\n  An annotation is a line containing **##<span>#</span> type: ** followed by\n  lines of text ending in ##<span>#</span>. Annotation processors use a\n  type to define which annotations they retrieve. They then receive a list of\n  objects with _title_ and _body_ elements.\n\n  Source code can be any language that supports multi-line comments:\n\n      &lt;!-- ##<span>#</span> spec: Annotations in HTML or XML\n            ...\n           ##<span>#</span> --&gt;\n      /* ##<span>#</span> spec: Annotations in a C, C++, Java, etc\n          ...\n         ##<span>#</span> */\n###\n### spec: annotations >> Processing Source Code\n  The retrieve function processes source files one at a time. It returns an\n  array of objects containing title and body members.\n\n      (describe \"(annotations.retrieve \\\"spec\\\" source-code)\" (=>\n        (it \"retrieves a list {title: \\\"..\\\" body: \\\"..\\\"}\" (=>\n          (using [annotations]\n            (var source window.lispz_modules.annotations)\n            (var list (annotations.retrieve \"spec\" source)\n            (expect list.length).toBeGreaterThan(0)\n            (var annotation (first list))\n            (expect annotation.title).toBe(\"Annotations\")\n            (expect annotation.body.length).toBeGreaterThan(100)\n          )\n        ))\n      ))\n###\n  (var retrieve (lambda [type source]\n    (var re (new RegExp (+ \"###\\\\s*\" type \":\\\\s*(.*)\\\\n((?:.|\\\\n)*?)###\") \"g\"))\n    (var annotations [[]])\n    (var scan (=>\n      (var res (re.exec source))\n      (return? (not res))\n      (annotations.push {title: (get res 1)  body: (get res 2)})\n      (scan)\n    ))(scan)\n    (return annotations)\n  ))\n  (export {retrieve})\n"

lispz_modules['bootstrap']="### spec: bootstrap - Twitter Bootstrap\n  Bootstrap is a popular CSS framework open sourced by Twitter. It includes skins\n  so all bootstrap driven sites do not have to look alike. It provides support\n  for differing screen sizes and is relatively mobile friendly.\n###\n(using [net github]\n  (var build (lambda [target-repo]\n    (return (github.build target-repo \"bootstrap\" [[\n      {repo: \"twbs/bootstrap\" files: [[\n        {base: \"dist\" exclude: '/\\.map$|\\.min\\.|npm.js$/'}\n        {base: \"dist/fonts\" copy-to: \"fonts\"}\n      ]]}\n    ]]))\n  ))\n  (lispz.css \"ext/bootstrap.css\")\n  (when (net.script \"ext/bootstrap.js\") [] (export {build}))\n)\n\n### spec: Bootstrap >> Bootstrap/RIOT/Lispz Combo\n\n  There is a difference of scope between bootstrap and riot.\n  [Bootstrap](http://getbootstrap.com/) is designed to be used page-wide.\n  Riot is a web component system where each component should be as independent as possible.\n  ###\n  ### spec: bootstrap >> Page Level Bootstrap\n\n  Any single page application that is going to use bootstrap to simplify the UI wraps the contents inside the body with a bootstrap tag. Use an inner page-content tag to allow for fluid layouts - those that change as the window changes size.\n\n      <!-- using bootstrap code-editor --&gt;\n      <body>\n        <bootstrap class=riot>\n          <page-content fluid=true>\n            ...\n          </page-content>\n        </bootstrap>\n      </body>\n\n  ###\n  ### spec: bootstrap >> Bootstrap Themes\n\n  Bootstrap sites do not have to look alike. [Bootswatch](https://bootswatch.com/)\n  provides 16+ free themes, including ones that fit in with Metro, Polymer and Ubuntu:\n\n  > Default, Cerulean, Cosmo, Cyborg, Darkly, Flatly, Journal, Lumen, Paper, Readable,\n  > Sandstone, Simplex, Slate, Spacelab, Superhero, United, Yeti\n\n  To select a theme, send a message to _change-bootstrap-theme_ with the name of the theme\n  to change to. If you don't provide a theme name, a random one is chosen.\n\n  ###\n  ### spec: bootstrap >> Component Specific Bootstrap\n\n  Riot components can include a _style_ section.\n  If you preface all entries with the name of the component then you have\n  name-spaced your css.\n\n      <code-editor>\n        <panel height={ opts.height } heading={ heading } menu={ menu } owner={ _id }>\n          <div name=wrapper class=wrapper></div>\n        </panel>\n        <style>\n          code-editor .wrapper {\n            ...\n          }\n      </code-editor>\n###\n"

lispz_modules['cdnjs']="### Load packages from CDN and other web sources - listing them when possible ###\n(using [net github]\n  (var cdnjs-actors {\n    list-all: (promise [repo path]\n      (var base \"http://api.cdnjs.com/libraries?fields=assets&search=\")\n      (when (net.json-request (+ base repo.name)) [json]\n        ## select the correct repo for the name\n        (var filtered (json.results.filter (lambda [it]\n          (return (=== it.name repo.name))\n        )))\n        ((get filtered 0).assets.some (lambda [it]\n          (return-if (contains it.version \"alpha\") false)\n          (repo.update! {base: (+\n            \"https://cdnjs.cloudflare.com/ajax/libs/\"\n            repo.name \"/\" it.version \"/\"\n          )})\n          (resolve-promise it.files)\n          (return true) ## found the one we want\n        ))\n      )\n    )\n    read: (promise [repo path]\n      (var uri (+ repo.base path))\n      (when (net.http-get uri) [response] (resolve-promise response))\n    )\n    repo: (lambda [target-repo name] (return (stateful {})))\n  })\n\n  (export {\n    build: (github.builder.bind null cdnjs-actors)\n  })\n)\n"

lispz_modules['codemirror']="(using  [net diff_match_patch message dict github]\n  (var options-string (localStorage.getItem \"CodeMirror-options\"))\n  (cond options (var options (JSON.parse options-string))\n        (else)  (var options {\n    lineNumbers:        true\n    foldGutter:         true\n##  gutters:            [\"CodeMirror-lint-markers\"\n##                       \"CodeMirror-foldgutter\"]\n    lint:               true\n    matchBrackets:      true\n    autoCloseBrackets:  true\n    matchTags:          true\n    showTrailingSpace:  true\n    inputStyle:         \"textarea\" ## change to \"contenteditable\" after vim cursor bug fix\n    autofocus:          true\n    dragDrop:           false\n    smartIndent:        true\n    indentUnit:         2\n    indentWithTabs:     false\n    cursorScrollMargin: 5\n    scrollbarStyle:     \"overlay\"\n    extraKeys:          {\n      'Cmd-Left':         \"goLineStartSmart\"\n      'Ctrl-Q':           \"fold_at_cursor\"\n      'Ctrl-Space':       \"autocomplete\"\n      'Ctrl-/':           \"toggleComment\"\n      'Ctrl-<':           \"goColumnLeft\"\n      'Ctrl->':           \"goColumnRight\"\n      'Ctrl-Shift-F':     \"clearSearch\"\n      'Ctrl-=':           \"toMatchingTag\"\n      'Alt-S':            \"view_source\"\n      'Ctrl-`':           \"insertSoftTab\"\n      'Ctrl-,':           \"delLineLeft\"\n      'Ctrl-.':           \"killLine\"\n      'Shift-Ctrl-,':     \"delWrappedLineLeft\"\n      'Shift-Ctrl-.':     \"delWrappedLineRight\"\n      'Ctrl-9':           \"delWordBefore\"\n      'Ctrl-0':           \"delWordAfter\"\n      'Ctrl-6':           \"transposeChars\"\n      'Ctrl-Left':        \"goWordLeft\"\n      'Ctrl-Right':       \"goWordRight\"\n      'Ctrl-Home':        \"goLineLeft\"\n      'Ctrl-Shift-Home':  \"goLineLeftSmart\"\n      'Ctrl-End':         \"goLineRight\"\n      ## paredit keys that defer if not in lisp code\n      'Backspace':        \"subpar_backward_delete\"\n      'Delete':           \"subpar_forward_delete\"\n      'Ctrl-D':           \"subpar_forward_delete\"\n\n      'Shift-9':          \"subpar_open_bracket\"\n      '[':                \"subpar_open_square_bracket\"\n      'Shift-[':          \"subpar_open_braces\"\n\n      'Shift-0':          \"subpar_close_bracket\"\n      ']':                \"subpar_close_square_bracket\"\n      'Shift-]':          \"subpar_close_braces\"\n\n      'Shift-\\'':          \"subpar_double_quote\"\n\n      'Ctrl-Alt-F':       \"subpar_forward\"\n      'Ctrl-Alt-B':       \"subpar_backward\"\n      'Ctrl-Alt-U':       \"subpar_backward_up\"\n      'Ctrl-Alt-D':       \"subpar_forward_down\"\n      'Ctrl-Alt-P':       \"subpar_backward_down\"\n      'Ctrl-Alt-N':       \"subpar_forward_up\"\n\n      'Shift-Ctrl-[':     \"subpar_backward_barf\"\n      'Ctrl-Alt-Right':   \"subpar_backward_barf\"\n      'Ctrl-]':           \"subpar_backward_barf\"\n\n      'Shift-Ctrl-]':     \"subpar_forward_barf\"\n      'Ctrl-Left':        \"subpar_forward_barf\"\n\n      'Shift-Ctrl-9':     \"subpar_backward_slurp\"\n      'Ctrl-Alt-Left':    \"subpar_backward_slurp\"\n      'Ctrl-[':           \"subpar_backward_slurp\"\n\n      'Shift-Ctrl-0':     \"subpar_forward_slurp\"\n      'Ctrl-Right':       \"subpar_forward_slurp\"\n\n      'Alt-Up':           \"subpar_splice_delete_backward\"\n      'Alt-Down':         \"subpar_splice_delete_forward\"\n      'Alt-S':            \"subpar_splice\"\n      'Ctrl-Alt-/':       \"subpar_indent_selection\"\n\n      'Alt-Enter':        \"lispz_run_selection\"\n     }\n  }))\n  (var options (stateful.morph! options))\n  ## write changed options back to persistent storage\n  (var update-options (=>\n    (localStorage.setItem \"CodeMirror-options\" (JSON.stringify options))\n  ))\n  ## Context menu for code editor\n  (var topic \"CodeMirror-command\")\n  (var menu [[\n    ### {title: \"File\" children: [[\n      {topic meta: \"save\" title: \"Save\"}\n    ]]} ###\n    {title: \"Edit\" children: [[\n      {topic meta: \"autocomplete\" title: \"Auto-Complete\" }\n      {topic meta: \"redo\" title: \"Redo\"}\n      {topic meta: \"undo\" title: \"Undo\"}\n      {topic meta: \"redoSelection\" title: \"Redo Selection\"}\n      {topic meta: \"undoSelection\" title: \"Undo Selection\"}\n      {divider: true}\n      {topic meta: \"toggleOverwrite\" title: \"Insert/Overwrite\"}\n      {topic meta: \"toggleComment\" title: \"Comment/Uncomment\" }\n      {topic meta: \"insertSoftTab\" title: \"Insert Soft Tab\" }\n      {topic meta: \"defaultTab\" title: \"Tab or Indent\"}\n      {title: \"Delete\" children: [[\n        {topic meta: \"deleteLine\" title: \"Line\"}\n        {topic meta: \"killLine\" title: \"Line Right\" }\n        {topic meta: \"delLineLeft\" title: \"Line Left\" }\n        {divider: true}\n        {topic meta: \"delWrappedLineLeft\" title: \"Wrapped Line Left\" }\n        {topic meta: \"delWrappedLineRight\" title: \"Wrapped Line Right\" }\n        {divider: true}\n        {topic meta: \"delWordBefore\" title: \"Word Left\" }\n        {topic meta: \"delWordAfter\" title: \"Word Right\" }\n        {divider: true}\n        {topic meta: \"delGroupBefore\" title: \"Group Before\"}\n        {topic meta: \"delGroupAfter\" title: \"Group After\"}\n        {divider: true}\n        {topic meta: \"delCharBefore\" title: \"Character Left\"}\n        {topic meta: \"delCharAfter\" title: \"Character Right\"}\n      ]]}\n      {topic meta: \"indentAuto\" title: \"Auto Indent\"}\n      {topic meta: \"indentLess\" title: \"Indent Left\"}\n      {topic meta: \"indentMore\" title: \"Indent Right\"}\n      {topic meta: \"newlineAndIndent\" title: \"New line and indent\"}\n      {divider: true}\n      {topic meta: \"transposeChars\" title: \"Transpose Characters\" }\n      {divider: true}\n      {topic meta: \"selectAll\" title: \"Select All\"}\n      {topic meta: \"singleSelection\" title: \"Single Selection\"}\n    ]]}\n    {title: \"Go\" children: [[\n      {topic meta: \"goDocStart\" title: \"Document Start\"}\n      {topic meta: \"goDocEnd\" title: \"Document End\"}\n      {divider: true}\n      {topic meta: \"goCharLeft\" title: \"Char Left\"}\n      {topic meta: \"goCharRight\" title: \"Char Right\"}\n      {divider: true}\n      {topic meta: \"goColumnLeft\" title: \"Column Left\" }\n      {topic meta: \"goColumnRight\" title: \"Column Right\" }\n      {divider: true}\n      {topic meta: \"goGroupLeft\" title: \"Group Left\"}\n      {topic meta: \"goGroupRight\" title: \"Group Right\"}\n      {divider: true}\n      {topic meta: \"goWordLeft\" title: \"Word Left\" }\n      {topic meta: \"goWordRight\" title: \"Word Right\" }\n      {divider: true}\n      {topic meta: \"goLineStart\" title: \"Line Start\"}\n      {topic meta: \"goLineStartSmart\" title: \"Smart Line Start\" }\n      {topic meta: \"goLineEnd\" title: \"Line End\"}\n      {divider: true}\n      {topic meta: \"goLineLeft\" title: \"Line Left\" }\n      {topic meta: \"goLineLeftSmart\" title: \"Smart Line Left\" }\n      {topic meta: \"goLineRight\" title: \"Line Right\" }\n      {divider: true}\n      {topic meta: \"goLineUp\" title: \"Line Up\"}\n      {topic meta: \"goLineDown\" title: \"Line Down\"}\n      {divider: true}\n      {topic meta: \"goPageUp\" title: \"Page Up\"}\n      {topic meta: \"goPageDown\" title: \"Page Down\"}\n    ]]}\n    {title: \"Search\" children: [[\n      {topic meta: \"find\" title: \"Find...\"}\n      {topic meta: \"findNext\" title: \"Find Next\"}\n      {topic meta: \"findPrev\" title: \"Find Previous\"}\n      {topic meta: \"clearSearch\" title: \"Clear Search\" }\n      {divider: true}\n      {topic meta: \"replace\" title: \"Replace\"}\n      {topic meta: \"replaceAll\" title: \"Replace All\"}\n      ## {divider: true} appears to only work for XML\n      ## {topic meta: \"toMatchingTag\" title: \"Matching Tag\" }\n    ]]}\n    {title: \"View\" children: [[\n      {topic meta: \"view_keyboard_shortcuts\" title: \"Keyboard Shortcuts\" }\n      {topic meta: \"fold_at_cursor\" title: \"Fold at Cursor\" }\n      {title: \"Theme\" children: [[\n        {title: \"Dark\" children: [[\n          {topic meta: \"set_option,theme,3024-night\" title: \"3024\"}\n          {topic meta: \"set_option,theme,ambiance\" title: \"Ambience\"}\n          {topic meta: \"set_option,theme,ambiance-mobile\" title: \"Ambience (mobile)\"}\n          {topic meta: \"set_option,theme,base16-dark\" title: \"Base 16\"}\n          {topic meta: \"set_option,theme,blackboard\" title: \"Blackboard\"}\n          {topic meta: \"set_option,theme,cobalt\" title: \"Cobalt\"}\n          {topic meta: \"set_option,theme,colorforth\" title: \"Colour Forth\"}\n          {topic meta: \"set_option,theme,erlang-dark\" title: \"Erlang Dark\"}\n          {topic meta: \"set_option,theme,lesser-dark\" title: \"Lesser Dark\"}\n          {topic meta: \"set_option,theme,mbo\" title: \"MBO\"}\n          {topic meta: \"set_option,theme,midnight\" title: \"Midnight\"}\n          {topic meta: \"set_option,theme,monokai\" title: \"Monokai\"}\n          {topic meta: \"set_option,theme,night\" title: \"Night\"}\n          {topic meta: \"set_option,theme,paraiso-dark\" title: \"Paraiso\"}\n          {topic meta: \"set_option,theme,pastel-on-dark\" title: \"Pastel\"}\n          {topic meta: \"set_option,theme,rubyblue\" title: \"Ruby Blue\"}\n          {topic meta: \"set_option,theme,the-matrix\" title: \"The Matrix\"}\n          {topic meta: \"set_option,theme,tomorrow-night-bright\" title: \"Tomorrow Night\"}\n          {topic meta: \"set_option,theme,tomorrow-night-eighties\" title: \"Tomorrow Night Eighties\"}\n          {topic meta: \"set_option,theme,twilight\" title: \"Twilight\"}\n          {topic meta: \"set_option,theme,vibrant-ink\" title: \"Vibrant Ink\"}\n          {topic meta: \"set_option,theme,xq-dark\" title: \"XQ Dark\"}\n          {topic meta: \"set_option,theme,zenburn\" title: \"Zenburn\"}\n        ]]}\n        {title: \"Light\" children: [[\n          {topic meta: \"set_option,theme,3024-day\" title: \"3024\"}\n          {topic meta: \"set_option,theme,base16-light\" title: \"Base 16\"}\n          {topic meta: \"set_option,theme,default\" title: \"Default\"}\n          {topic meta: \"set_option,theme,eclipse\" title: \"Eclipse\"}\n          {topic meta: \"set_option,theme,elegant\" title: \"Elegant\"}\n          {topic meta: \"set_option,theme,mdn-line\" title: \"MDN\"}\n          {topic meta: \"set_option,theme,neat\" title: \"Neat\"}\n          {topic meta: \"set_option,theme,neo>Neo\"}\n          {topic meta: \"set_option,theme,paraiso-light\" title: \"Paraiso\"}\n          {topic meta: \"set_option,theme,solarized\" title: \"Solarized\"}\n          {topic meta: \"set_option,theme,xq-light\" title: \"XQ Light\"}\n        ]]}\n      ]]}\n    ]]}\n    {title: \"Settings\" children: [[\n      {title: \"Keyboard\" children: [[\n        {topic meta: \"set_mode,default\" title: \"Code Mirror\"}\n        {topic meta: \"set_mode,emacs\" title: \"Emacs\"}\n        {topic meta: \"set_mode,sublime\" title: \"Sublime\"}\n        {topic meta: \"set_mode,vim\" title: \"Vi\"}\n      ]]}\n      {divider: true}\n      {topic meta: \"toggle_option,smartIndent\" title: \"Auto-indent\"}\n      {title: \"Indent\" children: [[\n        {topic meta: \"set_option,indentUnit,2\" title: \"2\"}\n        {topic meta: \"set_option,indentUnit,4\" title: \"4\"}\n      ]]}\n      {topic meta: \"toggle_option,autoCloseBrackets\" title: \"Close Brackets\"}\n      {topic meta: \"toggle_option,matchBrackets\" title: \"Match Brackets\"}\n      {topic meta: \"toggle_option,matchTags\" title: \"Match Tags\"}\n      {divider: true}\n      {title: \"Scroll Margin\" children: [[\n        {topic meta: \"set_option,cursorScrollMargin,0\" title: \"0\"}\n        {topic meta: \"set_option,cursorScrollMargin,2\" title: \"2\"}\n        {topic meta: \"set_option,cursorScrollMargin,4\" title: \"4\"}\n      ]]}\n      {topic meta: \"toggle_option,continueComments\" title: \"Comment Continuation\"}\n      {topic meta: \"toggle_option,showTrailingSpace\" title: \"Show Trailing Spaces\"}\n      {topic meta: \"toggle_option,dragDrop\" title: \"Toggle Drag and Drop\"}\n      {topic meta: \"toggle_option,lineNumbers\" title: \"Toggle Line Numbers\"}\n      {topic meta: \"toggle_option,lineWrapping\" title: \"Toggle Line Wrap\"}\n    ]]}\n  ]])\n  (var listener (lambda [cm data]\n    (var args (data.item.meta.split \",\"))\n    (var command (args.shift))\n    (args.unshift cm)\n    ((get CodeMirror.commands command).apply CodeMirror args)\n  ))\n  (var open (lambda [owner wrapper]\n    (var cm (stateful.morph! (CodeMirror wrapper options)))\n    (cm.update! {listener: (lambda [data] (listener cm data))})\n    (message.send \"CodeMirror-menu\" menu)\n    (message.listen (+ owner \"-\" \"CodeMirror-command\") cm.listener)\n    (return cm)\n  ))\n  (var close (lambda [cm]\n    (message.remove cm.listener)\n  ))\n  (var spaces \"                \")\n  (var extra-commands {\n    view_keyboard_shortcuts: (lambda [cm]\n      (var keys [[]])\n      (var one-map (lambda [map]\n        ((Object.keys map).forEach (lambda [key]\n          (cond\n            (is key \"fallthrough\") (do\n                (var more (get map key))\n                (cond (is (typeof more) \"string\") (var more [[more]]))\n                (more.forEach (lambda [map]\n                  (one-map (get CodeMirror.keyMap map))))\n              )\n            (else) (keys.push (+ key \": \" (get map key)))\n          )\n        ))\n      ))\n      (one-map cm.options.extraKeys)\n      (var core (stateful.morph! (get CodeMirror.keyMap cm.options.keyMap)))\n      (cond (not core.fallthrough)\n        (core.update! {fallthrough: CodeMirror.keyMap.default.fallthrough}))\n      (one-map core)\n      (window.open\n        (+ \"data:text/html,\" (encodeURIComponent (keys.join \"<br>\")))\n        \"Keys\" \"width=300,height=600\")\n    )\n    fold_at_cursor: (lambda [cm]\n      (cm.foldCode (cm.getCursor))\n    )\n    toggle_option: (lambda [cm name]\n      (CodeMirror.commands.set_option cm name (not (cm.getOption name)))\n    )\n    set_option: (lambda [cm name value]\n      (cm.setOption name value)\n      (options.update! name value)\n      (update-options)\n    )\n    set_mode: (lambda [cm mode]\n      (CodeMirror.commands.set_option cm \"keyMap\" mode)\n    )\n    auto_complete: (lambda [cm]\n      (var not-only (lambda []\n        (var result (CodeMirror.hint.anyword.apply null arguments))\n        (return-if (isnt result.list.length 1) result)\n        (var size (- result.to.ch result.from.ch))\n        (return-if (isnt (do (get list 0).length) size) result)\n        (return ((stateful.morph! result) {list: [[]]}))\n      ))\n    )\n  })\n  ## Editing modes dependent on file type\n  (var mode-extensions {\n    apl: \"apl\" as3: \"apl\" asf: \"apl\"\n    c: \"clike\" cpp: \"clike\" h: \"clike\" cs: \"clike\"\n    chh: \"clike\" hh: \"clike\" h__: \"clike\" hpp: \"clike\"\n    hxx: \"clike\" cc: \"clike\" cxx: \"clike\" c__: \"clike\"\n    \"c++\": \"clike\" stl: \"clike\" sma: \"clike\"\n    java: \"clike\" scala: \"clike\" clj: \"clojure\"\n    cpy: \"cobol\" cbl: \"cobol\"cob: \"cobol\"\n    coffee: \"coffeescript\" coffeescript: \"coffeescript\"\n    \"gwt.coffee\": \"coffeescript\"\n    vlx: \"commonlisp\" fas: \"commonlisp\" lsp: \"commonlisp\"\n    el: \"commonlisp\" css: \"css\" less: \"css\"\n    dl: \"d\" d: \"d\" diff: \"diff\" dtd: \"dtd\" dylan: \"dylan\"\n    ecl: \"ecl\" e: \"eiffel\" erl: \"erlang\" hrl: \"erlang\"\n    f: \"fortran\" for: \"fortran\" FOR: \"fortran\"\n    f95: \"fortran\" f90: \"fortran\" f03: \"fortran\"\n    gas: \"gas\" gfm: \"gfm\" feature: \"gherkin\" go: \"go\"\n    groovy: \"groovy\" \"html.haml\": \"haml\" hx: \"haxe\"\n    lhs: \"haskell\" gs: \"haskell\" hs: \"haskell\"\n    asp: \"htmlembedded\" jsp: \"htmlembedded\"\n    ejs: \"htmlembedded\" http: \"http\"\n    html: \"htmlmixed\" htm: \"htmlmixed\" \".py.jade\": \"jade\"\n    js: \"javascript\" json: \"javascript\" jinja2: \"jinja2\"\n    jl: \"julia\" ls: \"livescript\" lua: \"lua\"\n    markdown: \"markdown\" mdown: \"markdown\" mkdn: \"markdown\"\n    md: \"markdown\" mkd: \"markdown\" mdwn: \"markdown\"\n    mdtxt: \"markdown\" mdtext: \"markdown\"\n    mdx: \"mirc\" dcx: \"mirc\"\n    ml: \"mllike\" fs: \"mllike\" fsi: \"mllike\"\n    mli: \"mllike\" fsx: \"mllike\" fsscript: \"mllike\"\n    nginx: \"nginx\" nt: \"ntriples\" mex: \"octave\"\n    pas: \"pascal\" pegjs: \"pegjs\" ps: \"perl\"\n    php: \"php\" \"lib.php\": \"php\"\n    pig: \"pig\" ini: \"properties\" properties: \"properties\"\n    pp: \"puppet\" py: \"python\" q: \"q\" r: \"r\"\n    rpm: \"rpm\" \"src.rpm\": \"rpm\" rst: \"rst\" rb: \"ruby\"\n    rs: \"rust\" sass: \"sass\" scm: \"scheme\" ss: \"scheme\"\n    sh: \"shell\" sieve: \"sieve\"\n    sm: \"smalltalk\" st: \"smalltalk\" tpl: \"smartymixed\"\n    solr: \"solr\" sparql: \"sparql\" sql: \"sql\"\n    stex: \"stex\" tex: \"stex\" tcl: \"tcl\" tw: \"tiddlywiki\"\n    tiki: \"tiki\" toml: \"toml\" ttl: \"turtle\" vb: \"vb\"\n    bas: \"vbscript\" vbs: \"vbscript\" vtl: \"velocity\"\n    v: \"verilog\" xml: \"xml\"\n    xquery: \"xquery\" xq: \"xquery\" xqy: \"xquery\"\n    yaml: \"yaml\" yml: \"yaml\" z80: \"z80\" asm: \"z80\"\n  })\n  (var saved-mode-extensions localStorage.CodeMirror-mode-extensions)\n  (cond saved-mode-extensions (var mode-extensions\n    (dict.merge mode-extensions saved-mode-extensions)\n  ))\n\n  (var set-mode (lambda [cm name]\n    (var try-mode (lambda [exts]\n      (var ext (exts.join \".\"))\n      (return? (get mode-extensions ext))\n      (return-if (get CodeMirror.modes ext) ext)\n      (return false)\n    ))\n    (var mode ((=>\n      (var parts (name.split \".\"))\n      (cond (> parts.length 2) (return? (try-mode (parts.slice -2))))\n      (return? (try-mode (parts.slice -1)))\n      (return  \"text\")\n    )))\n    (cm.setOption \"mode\" mode)\n    (CodeMirror.autoLoadMode cm mode)\n  ))\n\n  ## CodeMirror lispz mode\n  (var init-lispz-mode (=>\n  (CodeMirror.defineSimpleMode \"lispz\" {\n    start: [[\n      {regex: '/\"\"/'                                 token: \"string\"}\n      {regex: '/\"/'                   next: \"string\" token: \"string\"}\n      {regex: '/\\'(?:[^\\\\]|\\\\.)*?\\'/'                token: \"variable-2\"}\n      {regex: '/###/'                next: \"comment\" token: \"comment\" }\n      {regex: '/(\\()([!\\s\\(\\[\\{\\)\\}\\]]*?!)/'\n                                indent: true  token: [[null \"error\"]]}\n      {regex: '/(\\()([^\\s\\(\\[\\{\\)\\}\\]]+)/'\n                                indent: true  token: [[null \"keyword\"]]}\n      {regex: '/true|false|null|undefined|debugger/' token: \"atom\"}\n      {regex: '/0x[a-f\\d]+|[-+]?(?:\\.\\d+|\\d+\\.?\\d*)(?:e[-+]?\\d+)?/i'\n                                                     token: \"number\"}\n      {regex: '/## .*/'                              token: \"comment\"}\n      {regex: '/[\\{\\(\\[]/'        indent: true}\n      {regex: '/[\\}\\)\\]]/'      dedent: true}\n      {regex: '/[^\\s\\(\\{\\[\\)\\]\\}]+/'                 token: \"variable\"}\n      {regex: '/\\s+/' next: \"start\"}\n    ]]\n    comment: [[\n      {regex: '/###/' token: \"comment\" next: \"start\"}\n      {regex: '/.*/' token: \"comment\"}\n    ]]\n    string: [[\n      {regex: '/[^\\\\]\"/' token: \"string\" next: \"start\"}\n      {regex: '/./' token: \"string\"}\n    ]]\n    meta: { lineComment: \"## \" dontIndentStates: [[\"comment\" \"string\"]] }\n  })\n  (CodeMirror.defineMIME \"text/lispz\" \"lispz\")\n  ## Update htmlmixed to understand lispz scripts\n  (var mimeModes (stateful.morph! CodeMirror.mimeModes))\n  (cond (is (typeof (get mimeModes \"text/html\")) \"string\")\n        (mimeModes.update! \"text/html\" {name: \"htmlmixed\"}))\n  (var mode (stateful.morph! (get mimeModes \"text/html\")))\n  (cond (not mode.scriptTypes) (mode.update! {scriptTypes: [[]]}))\n  (mode.scriptTypes.push {matches: '/^text\\/lispz$/' mode: \"lispz\"})\n  (mimeModes.update! {htmlmixed: mode})\n\n  ## paredit keys that defer if not in lisp code\n  (var lisp-modes {lispz: true clojure: true commonlisp: true scheme: true})\n  (stateful.morph! subpar.core)\n  (subpar.core.update! {run_selection: (lambda [cm]\n    (cond (cm.somethingSelected) (var source (cm.doc.getSelection))\n          (else)                 (var source (cm.doc.getValue))\n    )\n    (console.log (lispz.run \"lispz-repl\" source))\n  )})\n  (var subpart (lambda [cmd opt]\n    (return (lambda [cm]\n      (var mode (cm.getModeAt (cm.getCursor)))\n      (cond (get lisp-modes mode.name)  ((get subpar.core cmd) cm opt)\n            (else)                      (return CodeMirror.Pass)\n      )\n    ))\n  ))\n  (CodeMirror.commands.update! {\n    ## paredit keys that defer if not in lisp code\n    subpar_backward_delete:        (subpart \"backward_delete\")\n    subpar_forward_delete:         (subpart \"forward_delete\")\n    subpar_forward_delete:         (subpart \"forward_delete\")\n\n    subpar_open_bracket:           (subpart \"open_expression\" \"()\")\n    subpar_open_square_bracket:    (subpart \"open_expression\" \"[]\")\n    subpar_open_braces:            (subpart \"open_expression\" \"{}\")\n\n    subpar_close_bracket:          (subpart \"close_expression\" \")\")\n    subpar_close_square_bracket:   (subpart \"close_expression\" \"]\")\n    subpar_close_braces:           (subpart \"close_expression\" \"}\")\n\n    subpar_double_quote:           (subpart \"double_quote\")\n\n    subpar_forward:                (subpart \"forward\")\n    subpar_backward:               (subpart \"backward\")\n    subpar_backward_up:            (subpart \"backward_up\")\n    subpar_forward_down:           (subpart \"forward_down\")\n    subpar_backward_down:          (subpart \"backward_down\")\n    subpar_forward_up:             (subpart \"forward_up\")\n\n    subpar_backward_barf:          (subpart \"backward_barf\")\n    subpar_backward_barf:          (subpart \"backward_barf\")\n    subpar_backward_barf:          (subpart \"backward_barf\")\n\n    subpar_forward_barf:           (subpart \"forward_barf\")\n    subpar_forward_barf:           (subpart \"forward_barf\")\n\n    subpar_backward_slurp:         (subpart \"backward_slurp\")\n    subpar_backward_slurp:         (subpart \"backward_slurp\")\n    subpar_backward_slurp:         (subpart \"backward_slurp\")\n\n    subpar_forward_slurp:          (subpart \"forward_slurp\")\n    subpar_forward_slurp:          (subpart \"forward_slurp\")\n\n    subpar_splice_delete_backward: (subpart \"splice_delete_backward\")\n    subpar_splice_delete_forward:  (subpart \"splice_delete_forward\")\n    subpar_splice:                 (subpart \"splice\")\n    subpar_indent_selection:       (subpart \"indent_selection\")\n\n    lispz_run_selection:           (subpart \"run_selection\")\n  })\n  ))\n\n  ## elm script has a bug - restore for a later version.\n  ## tern is for javascript features - overrides console.log\n  (var build-base (lambda [target-repo]\n    (return (github.build target-repo \"codemirror\" [[\n      {repo: \"codemirror/CodeMirror\" files: [[\n        {base: \"lib\" include: '/codemirror\\.(js|css)$/'}\n        {base: \"addon/mode\" include: '/^simple.js$/'}\n        {base: \"keymap\"}\n        {base: \"addon\" exclude: '/test.js$|node.js$|standalone.js$|\\/tern\\//'}\n        {base: \"mode/htmlmixed\" include: '/css$|js$/'}\n        {base: \"mode/javascript\" include: '/css$|js$/'}\n        {base: \"mode/css\" include: '/css$|js$/'}\n      ]]}\n      {repo: \"achengs/subpar\" files: [[\n        {base: \"resources/public/js\" include: '/subpar.core.js/'}\n      ]]}\n    ]]))\n  ))\n  (var build-themes (lambda [target-repo]\n    (return (github.build target-repo \"codemirror-themes\" [[\n      {repo: \"codemirror/CodeMirror\" files: [[\n        {base: \"theme\"}\n      ]]}\n    ]]))\n  ))\n  (var build-mode (lambda [target-repo]\n    (return (github.build target-repo \"codemirror-modes\" [[\n      {repo: \"codemirror/CodeMirror\" files: [[\n        {base: \"mode\" exclude: '/htmlmixed|javascript|css|elm.js$|test.js$/'}\n      ]]}\n    ]]))\n  ))\n  (var build (lambda [target-repo]\n    (return (promise.all build-base build-themes build-mode))\n  ))\n\n  (lispz.css \"ext/codemirror.css\")\n  (when (net.script \"ext/codemirror.js\") []\n    (when (net.script \"ext/codemirror-modes.js\") []\n      (cond window.CodeMirror (do ## in case we haven't built it yet\n        (stateful.morph! CodeMirror.commands)\n        (CodeMirror.commands.update! extra-commands)\n        (init-lispz-mode)\n      ))\n      (export {options open close set-mode build})\n    )\n  )\n  (delay 100 (lispz.css \"ext/codemirror-themes.css\"))\n)\n"

lispz_modules['core']="### spec: basics >> Syntax\n    One of the really cool things about a lisp language is that there is very little syntax.\n    On the flip-side one of the disadantages of minimal syntax is the need for work-arounds -\n    and by definition a work-around is syntax. The core for lispz is 4 sorts of lists\n\n        (action a b c ...) ## functional list\n        [a b c]            ## raw list (typically parameters for a function definition)\n        [[a b c]]          ## an array list\n        {a: 1 b c}         ## an associative array or dictionary\n\n    Named references are created using 'var'. They exist only inside the module or function\n    in which they are first defined. This includes inner functions, but if the inner function\n    defines a 'var' of the same name it will be distinct and hide the outer reference.\n\n        (var ref 23)\n###\n### spec: basics >> Operators\n    A pure lisp system does not have any operators. Everything is a function or a macro.\n    Because Lispz compiles to JavaScript, all unary and many binary operators are exposed.\n\n        (delete dict.key)  ## JS==> delete dict.key\n        debugger           ## JS==> debugger\n        (+ 2 3 4)          ## JS==> (2 + 3 + 4)\n\n    While unary operators are transparent to Lispz and convert directly, binary operators\n    are expanced with macros. Some operators have convenience names.\n\n        (and a b c)        ## JS==> a && b && c\n        (or a b c)         ## JS==> a || b || c\n        (is a 12)          ## JS==> a === 12\n        (isnt a 12)        ## JS==> a !== 12\n\n    Thanks to JavaScript 'and' and 'or' short-circuit - meaning that they will stop when\n    they find truth for and or false for or.\n\n        (return (or value \"default value string\"))\n###\n### spec: developer >> debug\n  `(debug)` is a development helper macro. It will print a stack trace\n  and the contents of any parameters on the console. If you left-align it\n  then it will be easy to find later to delete.\n###\n### spec: debug\n  (describe \"(debug [p1, p2, ...]) ## macro to display stack and messages\" (=>\n    (it \"displays a stack trace and the parameters provided\" (=>\n      (spy-method console trace)\n      (debug \"multiple\" \"parameters\")\n      ((expect console.trace).toHaveBeenCalled)\n    ))\n  ))\n###\n(macro debug [*msg] (console.trace (#join ',' *msg)))\n### spec: basic >> do\n###\n(macro do [*body] *body)\n\n### spec: basic >> References\n  @TODO\n###\n(macro var [*list] (#join '' 'var ' (#pairs *list '=' ',') ';'))\n\n### spec: basic >> References >> Global References\n  @TODO\n###\n(macro global [name value]\n  (#join '' 'lispz.globals.' name '=' value)\n  (macro name [&params] (#join '' 'lispz.globals.' name '(' &params ')')))\n\n### spec: basic >> Functions\n\n    As I am sure I mentioned before the default lisp/lispz element is the list surrounded by brackets.\n    In most cases in lisp and all cases in list the first element of the list is a reference to a function.\n    In JavaScript perspective this makes a lispz list a JavaScript function where the first element\n    is the reference and the rest a list of parameters.\n\n    This allows us to call JavaScript functions at any time we can get to them.\n\n        (console.log \"This is the\" count \"log message\")\n\n    Anonymous functions are created with the lambda key-word (which is actually a macro - confused yet?).\n    The parameters are referenced in another list form - that between square brackets.\n    For later use, assign it to or in a variable. A function will return undefined\n    unless a specific return statement is used.\n\n        (var +1 (lambda [number] (return (+ number 1))))\n        ...\n        a = 12\n        (console.log a (+1 a))  ## 12 13\n###\n### spec: function\n  (describe \"(lambda [p1 p2 *rest]) ## function definition\" (=>\n    (it \"defines an anonymous function that can be called\" (=>\n      (var f1 (lambda [a b] (return (* a b))))\n      (var result (f1 2 3))\n      ((expect result).toBe 6)\n    ))\n  ))\n###\n(macro lambda [params *body] (#join '' '(function(' params '){' *body '})'))\n\n### spec: basic >> Retrieval - can be used for objects and arrays\n  @TODO\n###\n(macro get [dict *key] (#join '' dict '[' (#join '][' *key) ']'))\n\n### spec: conditional processing ###\n(macro empty? [list] (not list.length))\n(macro defined? [field] (!== (typeof field) \"undefined\"))\n\n### spec: basics -- Conditionals\n    Lispz boasts only one traditional conditional operator plus a number of\n    macros for conditional assignment and function return. The operator,\n    cond takes pairs of lists where the first is the condition and the\n    second the action. Evaluation stops after the first true condition.\n    There is an else macro that evaluates to true to catch situations not\n    covered specifically. The default? function takes a value and returns\n    it if it exists and is not empty, otherwise it returns the default value.\n\n        (cond (is v \"One\")  (return 1)\n              (not v)       (return 0)\n              (else)        (return -1)\n        )\n\n    Because conditionals work with list pairs, it is necessary to wrap the actions\n    if there are more than one. Lispz provides 'do' for that.\n\n        (cond ok? (do (finish-up) (return true)))\n\n    The standard conditional tests (< > <= >=, etc) are augmented by aliases (is isnt not).\n###\n(macro cond [*list]\n  (#join '' 'switch(false){case !' (#pairs *list  ':' ';break;case !') '}')\n)\n(macro else [] 'true')\n\n### spec: basic >> functions >> Variable Parameter Lists\n    Like JavaScript, lispz function definitions specify a fixed number of arguments.\n    To gain access to the full list of arguments, use *arguments, with a starting index.\n\n        (lambda [type rest] (console.log type \"=\" (*arguments 1)))\n###\n(macro *arguments [from] ([[]].slice.call arguments from))\n\n### spec: basics >> functions >> Return if ...\n    While return-if has aconditional pair. If the first is true the second is returned.\n\n        (return-if (not calculated-value) default-value)\n###\n(macro return-if [test value] (cond test (return value)))\n\n### spec: basic >> state -- Stateful Containers\n  State is the elephant in the room - particularly in the functional programming paradigm.\n  When you have state that can be changed from outside, then any function that reads from it\n  no longer has referential integrity. This means that identical calls may not return identical\n  results.\n\n  But we need state. Without it the system is fully enclosed without input or output.\n  A referentially integrous :) function can be replaced by it's return value,\n  so why ever run it?\n\n  The aim is to be like any machine with the internals always working the same.\n  Think of a clock. The input is someone setting the time.\n  After that the external gearing, etc is meant to work consistently so that the\n  time advances at the correct pace. The current time is state. You can build and\n  test the entire device without the state. It is on the very outside. Once the\n  mechanism is working as expected, add a clock face and hands. Changing the hands\n  is input and displaying the time output. The latter can be considered a\n  side-effect.\n\n  The state container for lispz relies on polite access, not enforced rules. By custom an\n  function that changes ends in an exclamation mark. Use this to highlight review.\n  The default builder return an empty JavaScript dictionary.\n\n      (describe \"Create a new stateful object -- (var context (stateful seed))\" (=>\n        (var options (stateful {name: \"undefined\" address: \"nowhere\"}))\n        (it \"is able to read members directly -- context.member\" (=>\n          ((expect options.name).toBeEqual \"undefined\")\n        ))\n        (it \"is able to read members by key -- context[key]\" (=>\n          ((expect options[\"name\"]).toBeEqual \"undefined\")\n        ))\n        (it (+ \"is able to update a dictionary with changes -- \"\n          \"(context.update! {a: dictionary})\") (=>\n            (options.update! {name: \"Barney Rubble\" address: \"Next Door\"})\n            ((expect options.name).toBeEqual \"Barney Rubble\")\n            ((expect options.address).toBeEqual \"Next Door\")\n        )\n          )\n      ))\n\n  Javascript lives in the world of objects as well as functions. Sometimes to work in this world\n  objects need to be labelled as stateful. Use this approach as sparingly as possible. Always\n  consider other alternatives first.\n\n      (describe \"Creating a stateful reference -- (var context (stateful.morph! this))\" (=>\n        (var that {a: 1 b: 2})\n        (var context (stateful.morph! that))\n        (it \"looks the same as the original object\" (=>\n          ((expect context.a).toBeEqual that.a)\n        ))\n        (it \"reflects changes to the original object\" (=>\n          (context.update! {a: 99})\n          ((expect that.a).toBeEqual 99)\n        ))\n      ))\n\n  Be polite and use this container responsibly. Adding protection adds overhead.\n  If you want to cheat, then on your head be it.\n###\n\n(macro #set! [to-change! value] (#join '' to-change! '=' value ';'))\n(var #morph! (lambda [obj]\n  (return-if obj.update! obj) ## in case we have done it before\n  (Object.defineProperties obj {\n    update!: {value: (lambda [update]\n      (var context this)\n      (cond (is arguments.length 1)\n        ((Object.keys update).forEach (lambda [key]\n          (#set! (get context key) (get update key))\n        ))\n      (else) (do\n        (var list (*arguments 0))\n        (list.forEach (lambda [value idx] (cond (% idx 2) (do\n          (var key (get list (- idx 1)))\n          (#set! (get context key) value)\n        ))))\n      ))\n    )}\n  })\n  (return obj)\n))\n(global stateful (lambda [seed]\n  (var obj (#morph! (new Object)))\n  (cond seed (obj.update! seed))\n  (return obj)\n))\n(global stateful.morph! #morph!)\n\n### spec: basic >> functions >> Functions without Parameters\n    While I normally avoid short-cuts that don't clarify the code, I made an exception for functions\n    without parameters. I kept forgetting the enpty square brackets.\n\n        (var random-number (=> (Math.random))\n###\n(macro =>     [*body]        (#join '' '(function(){' *body '})'))\n\n(macro closure [params *body] (#join '' '(function(' params '){' *body '})(' params ')'))\n(macro return  [value] (#join '' 'return ' value '\\n'))\n\n### spec: basics >> functions >> Return if not false\n    As a functional language, most decisions are made by small single-focus functions.\n    As such, conditional returns are a useful shortcut. To this end, return? returns\n    a value if it not false, null or an empty container.\n\n        (return? calculated-value)\n\n    > The return? macro assigns the supplied value to a temporary reference\n    > before using the reference. This stops the value from being evaluated\n    > twice if it is not a simple reference.\n###\n(macro return? [value] (do (var v value) (cond v (return v))))\n\n(macro new [cls *params] (#join '' '(new ' cls '(' (#join ',' *params) '))'))\n\n### spec: functions >> chaining -- Chaining functions\n  In a functional style we often call multiple functions to incrementally move\n  from problem to solution. Each step takes the results from the step before and\n  transforms it. It is allways a good idea to have short functions that do one\n  thing - for testing, maintenance and readability. Speaking of readability,\n  chain makes the sequence of events clear.\n\n      (parse-titles (lambda [sections] (return (sections.map ...)))\n      (sort-titles  (lambda [sections] (return (sections.map ...)))\n      (merge-titles (lambda [sections] (return (sections.map ...)))\n\n      ((chain parse-titles sort-titles merge-titles) sections)\n###\n### spec: chain\n  (describe \"chain: run each function with the results from the one before\" (=>\n    (it \"(chain f1 f2 ...)\" (=>\n      (var f1 (lambda [a] (return 2)))\n      (var f2 (lambda [a] (return (+ a 3))))\n      (var f3 (lambda [a] (return (* a 10))))\n      ((expect (chain f1 f2 f3)).toBe 50)\n    ))\n  ))\n###\n(global chain (=> (var functions (*arguments 0))\n  (var link (lambda [arg func] (return (func arg))))\n  (return (functions.reduce link null))\n))\n\n### spec: basics >> Operators ###\n(macro not [value] (#join '' '!(' value ')'))\n(macro in [test against] (#join '' '(' test ' in ' against ')'))\n(macro instance-of [type obj] (#join '' '(' obj ' instanceof ' type ')'))\n\n(macro contains [str substr] (isnt -1 (str .indexOf substr)))\n\n### spec: basics >> Iteration\n\nIn the functional way of programming, loop style iteration is (almost) never needed.\nBecause of the 'almost' and to provide for those week on functional will,\nlispz provides one loop operator. It takes a test and a body.\n\n    (while (not (result)) (look-again))\n\nIn this case both are functions. Lispz furthers the functional cause by making\nassignment difficult and ugly.\n\nOf course the need for iteration remains no matter what programming discipline you follow.\nIn the functional world it is filled by ... you guessed it ... functions.\nFor arrays, JavaScript provides an excellent set documented in [List Processing](list-processing.md).\n###\n## Javascript does not (yet) have tail recursion - it is scheduled for 2016\n(macro while [test body] (#join '' 'while(' test '){' body '}'))\n\n### spec: List and dictionary manipulation ###\n(macro length [list] (#join '' list '.length'))\n(macro first [list] (get list 0))\n(macro rest [list] (list .slice 1))\n(macro last [list] (get (list .slice -1) 0))\n(global slice (lambda [list from to]  (return ([[]].slice.call list from to))))\n\n### spec: Modules >> Module Structure\n\nAll Lispz source files are modules. They are loaded on first request by client code. Subsequent requests returns a cached reference to the exports.\n###\n### spec: Modules >> Module Usage\n\nEvery module must include an export statement including a dictionary of symbols to be exported\n\n    (var one (=> ...)\n    (var two 22)\n    (export {one two})\n\nIf a module requires other asynchronous operations it can defer the export statement until they are ready.\n\n    (lispz.script \"ext/jquery.js\" (=> (export { ... })))\n\nTo access external modules, wrap your code in 'using'. Data and functions exported from a module are linked to the import name.\n\n    (using [dict net list]\n      (var combined (dict.merge d1 d2 d3))\n    )\n\n...and that is all there is to it.\n###\n(macro using [modules *on_ready] (lispz.load (#join '' '\"' modules '\"')\n  (=> (#requires modules) *on_ready)\n))\n### Modules must export to continue processing ###\n(macro export [exports] (#join '' '__module_ready__(' exports ')'))\n\n(macro delay [ms *body] (setTimeout (=> *body) ms))\n(macro yield [*body] (delay 0 *body))\n(global wait-for (lambda [test]\n  (var waiter (=>\n    (return? (test))\n    (delay 10 waiter)\n  )) (waiter)\n))\n###\n# Use contain to contain state changes. Any var inside a contain can be changed\n# no matter how many times the contain is called concurrently. It is also allows\n# the passing in of variables that are effectively copied and cannot be changed\n# from outside.\n###\n(macro contain [contain#args *contain#body]\n  ((lambda contain#args *contain#body) contain#args)\n)\n###\n# Return a random integer between 0 and the range given\n###\n(global random (lambda [range] (return (Math.floor (* (Math.random) range)))))\n\n### spec: async -- Asynchronous Support\nThere are three kinds of people in the world - those that can count and those who can't. And there are two ways to treat asynchronous events at the language/platform level. Either stop the process while waiting for something...\n\n    (while (read) (print)) ## this won't work in a JavaScript engine\n\n...or provide actions to do when an event happens...\n\n    (read (=> (print))) ## Call an anonymous function when event fires.\n\nFor some reason the first approach is called synchronous. In practice it means you can't do anything until the event you are waiting for occurs. Systems that work this way compensate by making it easy to create multiple threads - allowing code to appear to work in parallel. The developer does not have much control on when the processor switches from one thread to another. This means that data can appear to change like magic between two instructions on one thread because another thread has been active. Not only does this make referential integrity impossible, but it makes for the need for locks and semaphores and other mind-bending and program-slowing mechanisms.\n\nBy contrast the second approach is called asynchronous. It takes the mind-bending from an apparently optional later process and makes it important from the start. This is because we humans have been trained to think in a synchronous manner when solving problems or writing programs.\n\nOne more tale before getting back to lispz. Microsoft Windows prior to '95 used what they called \"cooperative multi-processing\". This meant that the operating system never took the CPU away from a program without the program first giving permission. Hmmm, very similar to a JavaScript machine based on asynchronous methods, isn't it. The complaint then is that badly behaved applications could freeze the UI by not releasing the CPU often enough. Since JavaScript runs on the UI thread it can also freeze the UI in the same way. A well behaved program, on the other hand, is more efficient and far easier to write.\n###\n### spec: async >> Callbacks\nCallbacks provide the simplest mechanism for asynchronous responses. Any function that want to initiate something that will complete at an undetermined later time can take a reference to a function to call at that time (or thereabouts)\n\n    (delay 2000 (=> (console.log \"delay over\")))\n\nMany callbacks producers follow the node-js approach of providing error and response parameters.\n\n    (read my-url (lambda [err response]\n      (cond err (throw \"read failed\"))\n      (return response.text)\n    )\n\n## Benefits\n1. Very simple with minimal overheads\n2. Can be called many times\n3. Cause and effect are sequential in code\n\n## Disadvantages\n1. Empiric in nature\n2. Highly coupled\n3. Leads to hard-to-read code in more complex event sequences.\n4. Exceptions are lost if not processed within the callback\n5. Actions triggered before the callback is set are lost\n###\n### spec: async >> Promises\nES2015 has introduced native promises into the language. As of November 2015 it is available on all mainstream browsers. Even if not, there are shims that work in an identical(ish) manner.\n\nFunctions that want to return information in an asynchronous manner return a promise object. This object can be passed around and whoever needs the data it will or does contain can ask for it with a callback function.\n\nA function that creates a promise uses the 'promise' keyword instead of 'lambda'. Whe the promise is fulfilled it will call (resolve-promise data). If it fails it calls (reject-promise err).\n\n    (var read (promise [addr param1 param2]\n      (http-get (+ addr \"?&\" param1 \"&\" param2) (lambda [err response]\n        (return-if err (reject-promise err))\n        (resolve-promise response)\n      ))\n    ))\n\nBecause it is common to turn a callback into a promise, lispz provides a helper macro. The following provides identical functionality. One of the benefits of a language with real macros :)\n\n    (var read (promise.callback [addr param1 param2]\n      (http-get (+ addr \"?&\" param1 \"&\" param2) callback)\n    ))\n\nNow that we have a promise, we can use it just like a callback if we want:\n\n    (var reading (read \"http://blat.com/blah\" 1 2))\n    (when reading (lambda [result] (return (process result))))\n    (catch reading (lambda [err] (console.log \"ERROR: \"+err)))\n\nEven without further knowledge, promises clean up errors and exceptions. If you do not catch errors, exceptions thrown in the asynchronous function can be caught in the code containing the promise.\n\nThe power of promises starts to become clearer with the understanding that 'when' can return a promise.\n\n    (var processed (when reading (lambda [result] (return (process result)))))\n    (when processed (console.log \"All done\"))\n\nSo far this adds very little at the cost of a relatively large supporting library. if we start thinking functionally instead of sequentially, promises provides a way to clarify our code (a little).\n\n    # change branch we will be working with\n    (var update-mode (github.update lispz-repo))\n    # Once in update mode we can retrieve lispz.js and ask for a list of other file in parallel\n    (var lispz-js    (when update-mode [] (read-file \"lispz.js\")))\n    (var listing     (when update-mode [] (github.list-dir lispz-repo \"\")))\n    # We can only sort files once we have a listing from the server\n    (var groups      (when listing [files] (group files)))\n    # but then we can process the different groups in parallel (retrieving source as needed)\n    (var modules     (when groups [files] (return (build-modules files.modules))))\n    (var riots       (when groups [files] (return (build-riots files.riots))))\n\n    # Now to pull it all together into a single file\n    (var  source     [[\"window.lispz_modules={}\"]])\n    # promise.sequence forces the order.\n    (var all-loaded  (promise.sequence\n      (when modules  [sources] (source.concat sources) (return (promise.resolved))\n      # lisp.js is added after modules and lisp-js are resolved\n      (when lispz-js [code]    (source.push code) (return (promise.resolved))\n      # riot tags are added after lisp.js and lisp-js is added and riots promise is resolved\n      (when riots    [sources] (source.concat sources) (return (promise.resolved))\n    ))\n    # Only write the result when the sequence above is complete\n    (return (when all-loaded [] (write-lispz)))\n    # returns a promise that is complete once the results are written\n\nIn summary we have\n\n1. **(promise [params...] ...)** is a macro that generates a function that returns a promise\n  1. **(resolve-promise results...)** sets results used in **when [results...] ...** macros\n  2. **(reject-promise err)** sets results used in **(catch [err] ...)** macros\n2. **(promise.callback [params...] ...)** is a macro to creates promises from traditional callbacks\n  1. **callback** is a function reference to use where callbacks would normally be defined\n3. **(promise.resolved results)** Will return a promise that will always provide the results supplied to when. Use it to turn a synchronous function into a promise to use in sequences.\n4. **(when a-promise [results...] ...)** is a macro that works like a lambda where the function body is executed with the results supplied once (and if) the promise is resolved. If a **when** statement returns a promise it can be used for chaining.\n5. **(catch a-promise [err] ...) is a macro that works like a lambda where the function body is executed if any of a set of chained promises uses **reject-promise** to indicate an error.\n6. **(promise.all promise-1 promise-2 [[promises]])** will return a promise that is fulfilled when all the promises specified are resolved or rejected. It will flatten arrays of promises.\n7. **(promise.sequence promise-1 promise-2 [[promises]])** will return a promise that is fulfilled when all the promises specified are resolved or rejected. Unlike **all**, each promise is triggered when the preceding promise is resolved.\n\n## Benefits\n1. Separates cause and effect more clearly\n2. Results are available even it the promise is resolved before inspection\n3. You can pass around a promise just like the data it will contain\n4. Handles exceptions in a structured way\n\n## Disadvantages\n2. Still fairly highly coupled\n3. Only allows one action - not for repetitive events\n4. Developer view needs to change from sequential perspective\n5. Being selective about errors and exceptions is painful. Once a promise is resolved it cannot change. Any promises that rely on a rejected promise will themselves be rejected causing a cascade of failures. To be selective you need to wrap a promise catch in an outer promise and resolve the outer one if the error itself can be resolved. Don't forget to resolve the outer promise with the data from the inner one when there are no errors.\n###\n(global promise {})\n(macro promise [params *body] (lambda params\n  (var #callbacks (stateful {ok: (=>) fail: (=>)}))\n  (var #pledge (new Promise (lambda [ok fail] (#callbacks.update! {ok fail}))))\n  (var resolve-promise (lambda [] (#callbacks.ok.apply null (*arguments 0))))\n  (var reject-promise (lambda [err] (#callbacks.fail err)))\n  ## (#join '' 'try{' *body '}catch(err){' (reject-promise err) '}')\n  *body\n  (return #pledge)\n))\n(macro promise.callback [params *body] (promise params\n  (var callback (lambda [err result]\n    (return-if err (reject-promise err))\n    (resolve-promise result)\n  ))\n  *body\n))\n(global promise.resolved (promise [pact] (resolve-promise pact)))\n(global promise? (lambda [pledge]\n  (return-if (and pledge pledge.then) pledge)\n  (return (promise.resolved pledge))\n))\n\n(macro when  [pledge params *body] (pledge .then  (lambda params *body)))\n(macro catch [pledge errors *body] (pledge .catch (lambda errors *body)))\n\n(using [list]\n  (global promise.all (=> (return (Promise.all (list.flatten (*arguments 0))))))\n)\n(global promise.chain (=>\n  (var chain-link (lambda [input functions]\n    (return-if (not functions.length) (promise? input))\n    (var pledge (promise? ((first functions) input)))\n    (when pledge [output] (chain-link output (rest functions)))\n  ))\n  (return chain-link null (*arguments 0))\n))\n(export {})\n"

lispz_modules['dev']="(using [github riot list]\n  (var manifest (=>\n    (var text [[\"CACHE MANIFEST\"]])\n    (lispz.manifest.forEach (lambda [uri] (text.push uri)))\n    (text.push \"NETWORK:\" \"*\")\n    (return (text.join \"\\n\"))\n  ))\n  ### Package Lispz for distribution ###\n  (var package (lambda [lispz-repo]\n    (var read-file (github.read.bind null lispz-repo))\n\n    (var group (lambda [files]\n      (var modules [[]] riots [[]])\n      (files.forEach (lambda [entry]\n        (return? (not (is \"file\" entry.type)))\n        (var parts (entry.name.split \".\"))\n        (cond\n          (is (last parts) \"lispz\")                  (modules.push (first parts))\n          (is ((slice parts -2).join \".\") \"riot.html\") (riots.push (first parts))\n        )\n      ))\n      (return (promise.resolved {modules riots}))\n    ))\n    (var build-modules (promise [names]\n      (var load-module (lambda [name]\n        (var uri (+ name \".lispz\"))\n        (return (when (read-file uri) [text]\n          (var contents (text.replace '/[\\\\\"]/g' \"\\\\$&\"))\n          (var contents (contents.replace '/\\n/g' \"\\\\n\"))\n          (return [[\"\\nlispz_modules['\" name \"']=\\\"\" contents \"\\\"\\n\"]])\n        ))\n      ))\n      (return (promise.all (names.map load-module)))\n    ))\n    (var build-riots (promise [names]\n      (var source [[]])\n      (var load-riot (lambda [name]\n        (return (when (read-file (+ name \".riot.html\")) [text]\n          (var usings ('/<!--\\s*using\\s*.*?\\s*-->/'.exec text))\n          (cond usings (var usings ((first usings).replace \"'\" \"\")))\n          (return [[\"\\n\\n/*\" name \"*/\\n\\nlispz.tags['\" name \"']=function(){\"\n            (riot.compile text true) \"\\nreturn '\" usings  \"'}\\n\"]])\n        ))\n      ))\n      (return (promise.all (names.map load-riot)))\n    ))\n\n    (var update-mode (github.update lispz-repo))\n    (var lispz-js    (when update-mode [] (return (read-file \"lispz.js\"))))\n    (var listing     (when update-mode []  (return (github.list-dir lispz-repo \"\"))))\n    (var groups      (when listing [files] (return (group files))))\n    (var modules     (when groups [files]  (return  (build-modules files.modules))))\n    (var riots       (when groups [files]  (return  (build-riots files.riots))))\n\n    (var all-loaded  (promise.all modules lispz-js riots))\n\n    (return (when all-loaded [sources]\n      (var  code  (list.flatten [[\"window.lispz_modules={}\\n\" sources]]))\n      (return (github.write lispz-repo \"ext/lispz.js\"\n        (code.join \"\") \"lispz release code\")\n      )\n    ))\n  ))\n\n  ### Distribution ###\n  (var distribute (lambda [target-repo]\n  ))\n\n  (export {manifest package distribute})\n)\n"

lispz_modules['dev']="(using [github riot list]\n  (var manifest (=>\n    (var text [[\"CACHE MANIFEST\"]])\n    (lispz.manifest.forEach (lambda [uri] (text.push uri)))\n    (text.push \"NETWORK:\" \"*\")\n    (return (text.join \"\\n\"))\n  ))\n  ### Package Lispz for distribution ###\n  (var package (lambda [lispz-repo]\n    (var read-file (github.read.bind null lispz-repo))\n\n    (var group (lambda [files]\n      (var modules [[]] riots [[]])\n      (files.forEach (lambda [entry]\n        (return? (not (is \"file\" entry.type)))\n        (var parts (entry.name.split \".\"))\n        (cond\n          (is (last parts) \"lispz\")                  (modules.push (first parts))\n          (is ((slice parts -2).join \".\") \"riot.html\") (riots.push (first parts))\n        )\n      ))\n      (return (promise.resolved {modules riots}))\n    ))\n    (var build-modules (promise [names]\n      (var load-module (lambda [name]\n        (var uri (+ name \".lispz\"))\n        (return (when (read-file uri) [text]\n          (var contents (text.replace '/[\\\\\"]/g' \"\\\\$&\"))\n          (var contents (contents.replace '/\\n/g' \"\\\\n\"))\n          (return [[\"\\nlispz_modules['\" name \"']=\\\"\" contents \"\\\"\\n\"]])\n        ))\n      ))\n      (return (promise.all (names.map load-module)))\n    ))\n    (var build-riots (promise [names]\n      (var source [[]])\n      (var load-riot (lambda [name]\n        (return (when (read-file (+ name \".riot.html\")) [text]\n          (var usings ('/<!--\\s*using\\s*.*?\\s*-->/'.exec text))\n          (cond usings (var usings ((first usings).replace \"'\" \"\")))\n          (return [[\"\\n\\n/*\" name \"*/\\n\\nlispz.tags['\" name \"']=function(){\"\n            (riot.compile text true) \"\\nreturn '\" usings  \"'}\\n\"]])\n        ))\n      ))\n      (return (promise.all (names.map load-riot)))\n    ))\n\n    (var update-mode (github.update lispz-repo))\n    (var lispz-js    (when update-mode [] (return (read-file \"lispz.js\"))))\n    (var listing     (when update-mode []  (return (github.list-dir lispz-repo \"\"))))\n    (var groups      (when listing [files] (return (group files))))\n    (var modules     (when groups [files]  (return  (build-modules files.modules))))\n    (var riots       (when groups [files]  (return  (build-riots files.riots))))\n\n    (var all-loaded  (promise.all modules lispz-js riots))\n\n    (return (when all-loaded [sources]\n      (var  code  (list.flatten [[\"window.lispz_modules={}\\n\" sources]]))\n      (return (github.write lispz-repo \"ext/lispz.js\"\n        (code.join \"\") \"lispz release code\")\n      )\n    ))\n  ))\n\n  ### Distribution ###\n  (var distribute (lambda [target-repo]\n  ))\n\n  (export {manifest package distribute})\n)\n"

lispz_modules['dexie']="(using  [net github]\n\n  (var build (lambda [target-repo]\n    (return (github.build target-repo \"dexie\" [[\n      {repo: \"dfahlander/Dexie.js\" files: [[\n        {base: \"dist/latest\" include: '/Dexie.js$/'}\n      ]]}\n    ]]))\n  ))\n\n  (lispz.script \"ext/dexie.js\" (=> (export { build })))\n)\n"

lispz_modules['dict']="### spec: lists >> dict -- The Associative Array List (Dictionary)\n\nAre also called dictionaries or hashmaps. Because lispz is a functional language it is not\nuncommon for functions to return a dictionary of values. To make them clearer, if a key is\nsupplied without a following colon then it is placed into the dictionary with a value of the same name.\n\n    (var exported-method-1 (=> ...))\n    (var key \"whatever I want\"}\n    (export {exported-method-1 key error: false date: (new Date))\n    \nwill create a JavaScript dictionary of the form\n\n    (var exporting {exported_method_1: exported_method_1, key: key, error: false, date: (new Date)})\n    \naccess with a key is identical to arrays except that it is a key rather than an index.\nIf the key is known, using dot syntax is clearer\n\n    exporting.error\n    (get exporting key)\n###\n\n### spec: lists >> dict >> Internals >> Insert\nDictionary merges and inserts take a list of dictionaries in order to push to the target.\nThis means that when they have common keys, the last dictionary that has the key takes\nprecedence.\n\n    ## command-line options overwrite config options of the same name. If neither is\n    ## found, the default option is used.\n    (dict.merge default-options config-file-options cl-options)\n###\n(var insert (lambda [target dictionaries]\n  (dictionaries.forEach (lambda [dictionary]\n    (target.update! dictionary)\n  ))\n  (return target)\n))\n\n### spec: lists >> dict >> Merging Dictionaries\nThere is often need to merge multiple dictionaries together to create a new combined one.\n\n    (var big-dict (dict.merge dict-1 dict-2 dict-3))\n###\n(var merge (lambda [dictionaries]\n  (return (insert {} (*arguments 0)))\n))\n\n### spec: lists >> dict >> Inserting One Dictionary in Another\n**Warning** This is not referentially transparent\n\n    (dict.insert! dict-1 dict-2 dict-3)      ## changes dict-1\n###\n(var insert! (lambda [target dictionaries]\n  (return (insert target (*arguments 0)))\n))\n\n### spec: lists >> dict >> Create a Dictionary from a List\n    (var list [[{key: 1 value: 2} {key: 3 value: 4}]]\n    (dict.from-list list \"key\")    # {1: {key: 1 value: 2} 3: {key: 3 value: 4})\n###\n(var from-list (lambda [list key]\n  (var dictionary (state))\n  (cond list (list.forEach (lambda [item] (dictionary.update! item))))\n  (return dictionary)\n))\n\n### spec: lists >> dict >> For Each Entry...\n    (dict.for-each dict-1 (lambda [key value] ...))\n###\n(var for-each (lambda [dict action=>]\n  (Object.keys dict)(.forEach (lambda [k] (action=> k (get dict k))))\n))\n\n### spec: lists >> dict >> Morphing One Dictionary into Another\n###\n(var map (lambda [dict action=>]\n  (return ((Object.keys dict).map (lambda [k] (return (action=> k (get dict k))))))\n))\n\n(export {merge from-list insert! for-each map})\n"

lispz_modules['diff_match_patch']="(using [net github]\n  (var build (lambda [target-repo built=>]\n    (return (github.build target-repo \"diff_match_patch\" [[\n      {repo: \"tanaka-de-silva/google-diff-match-patch-js\" files: [[\n        {base: \"\" include: '/^diff_match_patch_uncompressed.js$/'}\n      ]]}\n    ]]))\n  ))\n  (lispz.script \"ext/diff_match_patch.js\" (=> (export { build })))\n)\n"

lispz_modules['dom']="(using [dict]\n  (var append! (lambda [parent element]\n    (document.querySelector parent) (.appendChild element)\n  ))\n\n  (var style! (lambda [el styles]\n    (dict.for-each styles(lambda [name value]\n      (#set! (get el.style name) value))\n    ))\n  )\n\n  (var element (lambda [tag-name attributes]\n    (var elem (document.createElement tag-name))\n    (dict.for-each attributes (lambda [k v] (elem.setAttribute k v)))\n    (return elem)\n  ))\n\n  (var event-throttle (lambda [element event action]\n    (var add null)\n    (var listener (lambda [event]\n      (element.removeEventListener event listener)\n      (delay 66 add)\n      (action event)\n    ))\n    (var add (=> (element.addEventListener event listener)))\n  ))\n\n  (export {append! element event-throttle style!})\n)\n"

lispz_modules['firebase']="(using  [net]\n  ( var databases (stateful.morph! (JSON.parse (or (localStorage.getItem \"firebases\") \"{}\"))))\n\n  (var register (lambda [key uri]\n    (databases.update! key uri)\n    (localStorage.setItem \"firebases\" (JSON.stringify databases))\n  ))\n\n  (var encode (lambda [before]\n    (var uri (before.replace '/\\./g' \":\"))\n    (var uri (uri.replace    '/#/g'  \"_hash_\"))\n    (var uri (uri.replace    '/\\$/g' \"_dollar_\"))\n    (return uri)\n  ))\n\n  (var attach (lambda [collection db]\n    (var uri (get databases (or db \"default\")))\n    (return-if (not uri) null)\n    (return (new Firebase (+ uri \"/\" (encode collection))))\n  ))\n\n  (when (net.script \"https://cdn.firebase.com/js/client/2.2.9/firebase.js\") []\n    (export {register attach databases})\n  )\n)\n"

lispz_modules['firepad']="(using  [net github]\n  (var build (promise [target-repo]\n    (github.grunt target-repo \"firebase/firepad\" [grunt data]\n      (grunt.build {\n        target: \"firepad.js\"\n        pre:   data.concat.firepadjs.options.banner\n        post:  data.concat.firepadjs.options.footer\n        files: data.concat.firepadjs.src\n      } (=>\n        (grunt.copy data.copy.toBuild.files built=>)\n      ))\n    )\n  ))\n\n  (lispz.css \"ext/firepad.css\")\n  (when (net.script \"ext/firepad.js\") [] (export {build}))\n)\n"

lispz_modules['github']="(using  [net dict list]\n  (var version null)\n  (var cdn-uri (lambda [project version filepath]\n    (return (+ \"https://cdn.rawgit.com/\" project \"/\" version \"/\" filepath))\n  ))\n  (var repo (lambda [username password project]\n    (var auth (new Github {username password auth: \"basic\"}))\n    (var github (auth.getRepo.apply null (project.split \"/\")))\n    (return (stateful {github auth username password project branch: \"master\"}))\n  ))\n  ## Set the branch to use for repo - defaults to master\n  (var branch (promise [repo branch-name]\n    (repo.update! {branch: branch-name})\n    (repo.github branch branch-name (lambda [err result] (resolve-promise)))\n  ))\n  ## list files in a specific path on the repo\n  (var list-dir (promise.callback [repo path]\n    (repo.github.contents repo.branch path callback)\n  ))\n  (var list-all (promise [repo path single-level]\n    (var result [[]])\n    (var list-path (lambda [path]\n      (return (when (list-dir repo path) [paths]\n        (var children [[]])\n        (paths.forEach (lambda [entry]\n          (cond\n            (is \"dir\"  entry.type)\n              (cond (not single-level) (children.push (list-path entry.path)))\n            (is \"file\" entry.type)\n              (result.push entry.path)\n          )\n        ))\n        (return (promise.all children))\n      ))\n    ))\n    (when (list-path path) [] (resolve-promise result))\n  ))\n  (var read (promise.callback [repo path]\n    (repo.github.read repo.branch path callback)\n  ))\n  (var update (lambda [repo]\n    (return-if (is repo.branch repo.username) (promise.resolved))\n    (var branch-name (or repo.username \"master\"))\n    (return (branch repo branch-name))\n  ))\n  (var write (promise.callback [repo path contents comment]\n    (return-if (not contents.length) (promise.resolved))\n    (var encoded (unescape (encodeURIComponent contents)))\n    (repo.github.write repo.branch path encoded comment callback)\n  ))\n  ## preprocess a file to generate css or js dependent on extension\n  (var preprocessors {\n    lispz: (lambda [name code]\n      (return {path ext: \"js\" code: (window.lispz.compile name code)})\n    )\n  })\n  (var preprocess (lambda [path code]\n    (var ext (last (path.split \".\")))\n    (var preprocessor (get preprocessors ext))\n    (return-if (not preprocessor) {path ext code})\n    (return (preprocessor path code))\n  ))\n  ## Build and save a dependency list\n  ## We will need to filter the dependencies\n  (var filter (lambda [before include exclude]\n    (var after before)\n    (cond include (var after\n      (after.filter (lambda [file] (return (include.test file))))\n    ))\n    (cond exclude (var after\n      (after.filter (lambda [file] (return (not (exclude.test file)))))\n    ))\n    (return after)\n  ))\n  ## and see which to save and which to copy\n  (var copy (lambda [copy-to path code]\n    ## not working yet for binary files\n    (var filename (last (path.split \"/\")))\n    (return {path code copy: (+ copy-to \"/\" filename)})\n  ))\n  ## Load the contents of the files we need from a single repo\n  (var process-repo (lambda [source-repo files actors]\n    (return (promise.all (files.map (promise [meta]\n      (var base (or meta.base \"\"))\n      (when (actors.list-all source-repo base meta.single-level) [file-list]\n        (var files (filter file-list meta.include meta.exclude))\n        (resolve-promise (promise.all (files.map (promise [path]\n          (when (actors.read source-repo path) [code]\n            (cond\n              meta.copy-to (resolve-promise (copy meta.copy-to path code))\n              (else)       (resolve-promise (preprocess path code))\n            )\n          )\n        ))))\n      )\n    ))))\n  ))\n  ## Given a list of repos, go through them all for files in need\n  (var process-repos (lambda [target-repo sources actors]\n    (return (promise.all (sources.map (lambda [source]\n      (var source-repo (actors.repo target-repo source.repo))\n      (return (process-repo source-repo source.files actors))\n    ))))\n  ))\n  ## Retrieve file contents based of filtering meta-data\n  (var retriever (promise [target-repo sources actors]\n    (when (process-repos target-repo sources actors) [entry-tree]\n      (var store {js: [[]] css: [[]]  copies: [[]] from:\n        (sources.map (lambda [source] (return source.repo)))})\n      (store.from.unshift \"Gathered from: \")\n      ((list.flatten entry-tree).forEach (lambda [entry]\n        (cond\n          (get store entry.ext)\n            ((get store entry.ext).push \"\\n\\n/* \" entry.path \" */\\n\" entry.code)\n          store.copy\n            (store.copies.push entry)\n        )\n      ))\n      (resolve-promise store)\n    )\n  ))\n  ## Given a file type, save the concatenated source contents\n  (var save (promise [target-repo store name ext comment]\n    (var contents ((get store ext).join \"\"))\n    (return (write target-repo (+ \"ext/\" name \".\" ext) contents comment))\n  ))\n  ## copy files identified as needed as-is\n  (var copy (lambda [target-repo store comment]\n    (return (promise.all (store.copies.map (lambda [entry]\n      (return (write target-repo entry.path entry.code comment))\n    ))))\n  ))\n  ## Now we have gathered needed resources, build and save the output file\n  (var builder (promise [actors target-repo name sources]\n    (when (retriever target-repo sources actors) [store]\n      (var comment (store.from.join \" \"))\n      (var saved (when (update target-repo) []\n        (return (promise.all\n          (save target-repo store name \"js\"  comment)\n          (save target-repo store name \"css\" comment)\n          (copy target-repo store            comment)\n        ))\n      ))\n      (when saved [] (resolve-promise))\n    )\n  ))\n  (var github-actors {\n    list-all read\n    repo: (lambda [target-repo name]\n      (return (repo target-repo.username\n        target-repo.password name\n      ))\n    )\n  })\n  (var build (builder.bind null github-actors))\n  ## Use gruntfile to decide which files to include and it what order\n  (var grunt-build (promise [meta]\n    (var js [[(or meta.pre \"\")]])\n    (var read-all (promise.all (meta.files.map (promise []\n      (when (github-actors.read source-repo path) [data]\n        (js.push data) (resolve-promise)\n      )\n    ))))\n    (when read-all []\n      (js.push (or meta.post \"\"))\n      (var contents (js.join \"\\n\"))\n      (when (write target-repo (+ \"ext/\" meta.target) contents comment) []\n        (resolve-promise)\n      )\n    )\n  ))\n  (var grunt-copy (promise [files]\n    (var copy-all (promise.all (files.map (promise [item]\n      (var path (or item.src item))\n      (when (github-actors.read source-repo path) [contents]\n        (var path (+ \"ext/\" (last (path.split \"/\"))))\n        (when (write target-repo path contents comment) [] (resolve-promise))\n      )\n    ))))\n  ))\n  (var grunt (promise [target-repo source-project]\n    (var source-repo (github-actors.repo target-repo source-project))\n    (var comment (+ \"from \" source-project))\n    (var sources [[\n      {repo: source-project files: [[\n        {include: '/^Gruntfile.js$/' single-level: true}\n      ]]}\n    ]])\n    (when (retriever target-repo sources actors) [store]\n      (var grunt-config ((Function\n        (+ \"var module={};\" (last store.js) \"return module.exports\"))))\n      (grunt-config {\n        loadNpmTasks: (=>) registerTask: (=>)\n        initConfig: (lambda [config-data]\n          (var grunt-processor {\n            build: grunt-build\n            copy:  grunt-copy\n          })\n          (when (update target-repo) []\n            (resolve-promise grunt-processor config-data)\n          )\n        )\n      })\n    )\n  ))\n  (var build-github (lambda [target-repo]\n    (var sources [[\n      {repo: \"michael/github\" files: [[\n        {include: '/github.js$/'}\n      ]]}\n    ]])\n    (return (build target-repo \"github\" sources))\n  ))\n  (when (net.script \"ext/github.js\") []\n    (export {\n      branch list-all list-dir cdn-uri build builder repo read write update\n      build-github retriever grunt preprocessors\n      move: (promise.callback [repo from to]\n        (repo.github.move repo.branch from to callback)\n      )\n      delete: (promise.callback [repo path]\n        (repo.github.remove repo.branch path script callback)\n      )\n    })\n  )\n)\n"

lispz_modules['index']="### spec: Introduction ###\n### spec: basics -- The Basics ###\n### spec: lists -- List Processing ###\n### spec: Macros ###\n### spec: Modules ###\n### spec: async -- Asynchronous Programming ###\n### spec: riot -- UI Components with RIOT ###\n### spec: bootstrap -- Bootstrap Integration ###\n### spec: codemirror -- CodeMirror Integration ###\n### spec: developer -- Developer Tools ###\n### spec: Deployment ###\n### spec:  ###\n\n### spec: Introduction\n# Why another *&^% language?\n**For Fun:**\nIt is fun to create something new - even when you are following paths well trodden by others for decades.\nBy making your own decisions and learning from them you get a better understanding of the how and why of\nother languages.\n\n**Extensibility:**\nFew languages macros integrated in the language - where macros are expressed in the language itself.\nThere is no difference between built-ins, libraries and code created by the end-user.\n\n**Simplicity:**\nMany languages and frameworks are overloaded with features - generating a huge learning curve.\n\n# Overcoming the fear of change\nLispz has different expression ordering, lots of parentheses and function programming overtones.\nIf you have a fear of change and, like me, had decades of OO and Imperative software development\nthen Lispz looks strange, behaves strangely and requires a diffent way of thinking.\n\nAnd yet, Lispz is only a thin veneer over JavaScript.\n\n    Javascript: console.log(\"message:\", msg)\n    Lispz:      (console.log \"message:\" msg)\n    \nIf you move the parenthenis pairs around and replace brace with parenthesis then the\nsurface similarities become more obvious.\n\nThe first major difference is not what has been added, but what has been taken away.\nLisp(z) has a lot less syntax. Only\n\n    (fn params)\n    [list]\n    {dict}\n    \nform the core syntax. Everything else is either a function or a macro.\nWe won't talk more about macros yet - in case parenoia sets in.\n\n# The benefits of lisp\nHaving only parenthesis, bracket or brace to deal with reduces ambiguity - when used\nwith appropriate white-space. In many cases the functional style can be clearer:\n\n    (or value default1 default2 12)\n    (+ a b 12)\n\nalthough not always\n\n    (/ (* value percent) 100)\n  \nWhile our practiced eye finds this harder to understand than \"a * percent / 100\" it\nis easier to decipher. Take the 'standard' syntax. Are these the same:\n\n    value * percent / 100\n    (value * percent) / 100\n  \nYou win if you said 'no'. In most languages operator precedence is such that the first\nsample will do the divice before the multiply. With real numbers the change in order can\ncause a diffent result. For languages without auto-conversion, the first will return zero\n(assuming percent is less than 100). With auto-conversion and all integers, the first will\ncause two floating point operations while the second only one.\n\nBack to\n\n    (/ (* value percent) 100)\n  \nWith the understanding that everthing appears to be a function, it becomes easier to read\nand there are no ambiguities. The word 'appears' is intentional as Lispz expands binaries in-line,\nsuch that the code run is\n\n    ((value * percent) / 100)\n\n# Where functional programming comes in\nShhh! Don't tell the Haskellers. JavaScript is already a functional language in that it\nprovides functions as first-class operation, closures and bindings. There are other aspects\nthat it does not support - the major ones being immutability and static types. I think of\nJavaScript as a modern assember, making it the responsibility of the higher (:)\nlevel language to fill in the gaps.\n\nLispz is too lightweight to do anything about static types.\n\nImmutability is a moving target. For a functional language, this means if a function is\ncalled with the same parameters it will always return the same result. Another definition\nstates \"no side-effects\". A third suggest it means all data on the stack - meaning function\ncall parameters. In the extreme it means that there are no variables, only constants -\ndata once allocated never changes.\n\nLispz takes a pragmatic approach leaving it up to the developer. It keeps the JavaScript\nconcept of a 'var' - leaving it easy to change within the same function and accessible as\nan immutable variable to inner functions. Because immutability is such a hard task master\nin an imperative world (such as the dom), Lisp does incude a set! operator.\nUnlike assignment, set! is painful enough to remind the developer to limit it's use.\nPutting a bang after any exported function that includes mutability provides a good hint to\nrule-breaking. It is up to the developer to ensure than any function exported from a module\nhonours the immutability and repeatability rules - and to flag the method when this is not possible.\n###\n\n(export {}) ## in case it gets included in another module\n"

lispz_modules['jasmine']="(using  [net cdnjs dom]\n\n  (macro spy          [func]\n    (return ((createSpy (#join '' '\"' func '\"') func).and.callThrough))\n  )\n  (macro spy-method   [cls method] (spyOn cls (#join '' '\"' method '\"')))\n  (macro spy-off      [method]     (method .reset))\n\n  (macro create-spy   [title]      (createSpy title))\n  (macro create-spy-obj [title methods] (createSpyObj title methods))\n  (macro call-through [spied]      (spied .and.callThrough))\n  (macro return-value [spied val]  (spied .and.returnValue val))\n  (macro call-fake    [spied fake] (spied .and.callFake fake))\n  (macro throw-error  [spied err]  (spied .and.throwError err))\n  (macro return-values [spied, *vals] (spied .and.returnValues *vals))\n  (macro expect-to-have-been-called [spied] (('expect' spied).toHaveBeenCalled))\n  (macro expect-to-have-been-called-with [spied *params]\n    (('expect' spied).toHaveBeenCalled *params)\n  )\n  (macro calls?        [method]     (method .calls.any))\n  (macro call-count    [method]     (method .calls.count))\n  (macro args-for      [method idx] (method .calls.argsFor idx))\n  (macro all-args      [method]     (method .calls.allArgs))\n  (macro call-contexts [method]     (method.calls.all))\n  (macro call-first-context [method] (method.calls.first))\n  (macro call-last-context  [method] (method.calls.mostRecent))\n\n  (macro install-clock []           (jasmine.clock.install))\n  (macro uninstall-clock []         (jasmine.clock.uninstall))\n  (macro advance-clock [ms]         (jasmine.clock.tick ms))\n  (macro mock-date     [date]       (jasmine.clock.mockData date))\n\n  (document.body.addEventListener \"click\" (lambda [ev]\n    (debug ev)\n    (ev.preventDefault)\n  ))\n\n  (var build (lambda [target-repo]\n    (return (cdnjs.build target-repo \"jasmine\" [[\n      {repo: \"jasmine\" files: [[\n        {include: '/jasmine\\.(css|js)$/'}\n        {include: '/jasmine-html.js$/'}\n        {include: '/boot.js$/'}\n      ]]}\n    ]]))\n  ))\n  (lispz.css \"ext/jasmine.css\")\n  (catch (when (net.script \"ext/jasmine.js\") []\n    (export { build })\n  ) []\n    (export { build })\n  )\n)\n"

lispz_modules['jasmine']="(using  [net cdnjs dom]\n\n  (macro spy          [func]\n    (return ((createSpy (#join '' '\"' func '\"') func).and.callThrough))\n  )\n  (macro spy-method   [cls method] (spyOn cls (#join '' '\"' method '\"')))\n  (macro spy-off      [method]     (method .reset))\n\n  (macro create-spy   [title]      (createSpy title))\n  (macro create-spy-obj [title methods] (createSpyObj title methods))\n  (macro call-through [spied]      (spied .and.callThrough))\n  (macro return-value [spied val]  (spied .and.returnValue val))\n  (macro call-fake    [spied fake] (spied .and.callFake fake))\n  (macro throw-error  [spied err]  (spied .and.throwError err))\n  (macro return-values [spied, *vals] (spied .and.returnValues *vals))\n  (macro expect-to-have-been-called [spied] (('expect' spied).toHaveBeenCalled))\n  (macro expect-to-have-been-called-with [spied *params]\n    (('expect' spied).toHaveBeenCalled *params)\n  )\n  (macro calls?        [method]     (method .calls.any))\n  (macro call-count    [method]     (method .calls.count))\n  (macro args-for      [method idx] (method .calls.argsFor idx))\n  (macro all-args      [method]     (method .calls.allArgs))\n  (macro call-contexts [method]     (method.calls.all))\n  (macro call-first-context [method] (method.calls.first))\n  (macro call-last-context  [method] (method.calls.mostRecent))\n\n  (macro install-clock []           (jasmine.clock.install))\n  (macro uninstall-clock []         (jasmine.clock.uninstall))\n  (macro advance-clock [ms]         (jasmine.clock.tick ms))\n  (macro mock-date     [date]       (jasmine.clock.mockData date))\n\n  (document.body.addEventListener \"click\" (lambda [ev]\n    (debug ev)\n    (ev.preventDefault)\n  ))\n\n  (var build (lambda [target-repo]\n    (return (cdnjs.build target-repo \"jasmine\" [[\n      {repo: \"jasmine\" files: [[\n        {include: '/jasmine\\.(css|js)$/'}\n        {include: '/jasmine-html.js$/'}\n        {include: '/boot.js$/'}\n      ]]}\n    ]]))\n  ))\n  (lispz.css \"ext/jasmine.css\")\n  (catch (when (net.script \"ext/jasmine.js\") []\n    (export { build })\n  ) []\n    (export { build })\n  )\n)\n"

lispz_modules['jquery']="(using [net cdnjs]\n  (var build (lambda [target-repo]\n    (return (cdnjs.build target-repo \"jquery\" [[\n      {repo: \"jquery\" files: [[\n        {exclude: '/\\.map$|\\.min.js$/'}\n      ]]}\n    ]]))\n  ))\n  (when (net.script \"ext/jquery.js\") [] (export {build}))\n)\n"

lispz_modules['list']="### spec: lists -- Lists and Arrays\n    Lisp was named as a shorter form of 'list processing'. When I first heard of lisp in the early 80's, I did not follow up on it as I did not see the value for my work in a language that gave priority to lists. Who needs specialised list processing when we have loops? This at a time I was using FORTH without thinking that I was treating the stack as a list. Time has moved on (a lot) and with the era of multiple cores starts, functional programming has gained new ground.\n    \n    Lispz compiles to JavaScript on the browser, so has very little opportunity at this time to use multiple cores. It will work happily with web workers once they become ubiquitous, but that is more the architecture of the workers than the language to use.\n    \n    Enough... on to lists. JavaScript ES5 has already added quite a few referentially transparent list processing functions. In this case it means they will not change the lists provided as input.\n    \n        (var l1 [[1 2 3]]   l2 [[4 5]]   l3 [[6 7]])\n        \n        (l1.concat l2 l3)                                               ## [[1 2 3 4 5 6 7]]\n        (l1.indexOf 2 from)                                             ## 1  ## from defaults to 0\n        (li.join \", \")                                                  ## \"1, 2, 3\"\n        (li.lastIndexOf 2 from)                                         ## 1  ## from default to last element\n        \n        (l1.every (lambda [item idx lst] (return (< idx 2))))           ## [[1 2]]  ## index, lst are optional\n        (l1.filter (lambda [item idx lst] (return (% idx 2))))          ## [[1 3]]\n        (l1.forEach (lambda [item idx lst] (console.log item)))         ## 1\\n2\\n3\n        (l1.map (lambda [item idx lst] (return (* item 2))))            ## [[2 4 6]]\n        (l1.reduce (lambda [prev item idx lst] (return (+ prev item))) seed)      ## 6 ## seed optional\n        (l1.reduceRight (lambda [prev item idx lst] (return (+ prev item))) seed) ## 6 ## seed optional\n        (l1.slice 1 2)                                                  ## [[2]] ## -ve from end\n        (l1.some (lambda [item idx lst] (is item 4)))                   ## false  ## true if (is item 2)\n        \n    The following are not referentially transparent\n    \n        (l1.pop)                                                        ## 3  ## (is l1 [[1 2]])\n        (l1.push 88)                                                    ## [[1 2 3 88]]\n        (l1.reverse)                                                    ## (is l1 [[3 2 1]])\n        (l1.shift))                                                     ## 1  ## (is l1 [[2 3]])\n        (l1.sort (lambda [a b] (- b a)))                                ## [[3 2 1]]  ## function optional\n        (l1.splice 1 1 32 33)                                           ## [[1 32 33 3]]  ## idx delcnt adds\n        (l1.unshift 99)                                                 ## [[99 1 2 3]]\n    \n    Lispz has less convenient access to specific entries for updates or removals\n    \n        (get l1 1)                                                      ## 2\n        (set! (get l1 1) 22)                                            ## (is l1 [[1 22 3]])\n        (update! l1 1 22)                                               ## (is l1 [[1 22 3]])\n        \n    And for more functional processing\n    \n        (first l1)                                                      ## 1\n        (rest l1)                                                       ## [[2 3]]\n        (last l1)                                                       ## 3\n        \n    And others...\n    \n        (in l2 2)                                                       ## true\n        (empty? l1)                                                     ## false\n        (slice 1 2)                                                     ## [[2]]  ## works with *arguments\n        \n    To process a list with an asynchronous method sequentially\n    \n        (using [list]\n        \n          (var for-each=> (lambda [item next=>] ... (next=>)))\n          (var on-completion (=> (console.log \"All Done\")))\n          \n          (list.sequential l1 for-each=> on-completion=>)\n        )\n        \n    There is a matching sequential operation for dictionaries.\n###\n### spec: lists >> The Functional List\nIn Lispz the braces are reserved for function-like calls - being traditional functions and lisp macros. The atom immediately after the open brace is the name of the function or macro.\n\n    (console.log \"Hello world\")   ## calling a javascript function to write to the console\n    (debug \"Hello world\")         ## a macro that writes the current function call stack then a message\n\nThe first 'atom' can also be an anonymous function.\n\n    ((lambda [] (console.log \"Hello world\")))\n    ## is the same as\n    (var hw (lambda [] (console.log \"Hello world\")))\n    (hw)\n\nInternally functional lists are either expanded into more lispz statements by a macro or are converted to a Javascript function. The list becomes the function arguments.\n\n    (console.log \"Hello\" \"world\")  ## JS==> console.log(\"Hello\", \"world\")\n\nMacros are amazing things. Addition does not expand to a function but to in-line code:\n\n    (+ 1 2 3) ## JS==> 1 + 2 + 3\n###\n### spec: lists >> The Raw List\n\nAt the risk of repeating myself (and at the risk of repeating myself), Lispz is a lightweight compiler to JavaScript. A raw list is an sequence of atoms. When compiled to Javascript the sequence will be comma separated. It is most commonly used for parameters in a function definition:\n\n    (var expect (lambda [address listener=>]\n      (add address {once: true listener=>})\n    ))\n\nThe defined function, expect takes 2 parameters, being a string address and a function reference. The => at the end of this function reference is not syntax, just convenience text to show that this is a callback function.\n###\n### spec: lists >> Array as a List\n\nFor a traditional list or array, use [[]]. This will translate into a normal JavaScript array with standard functional support suchs as forEach and map.\n\n    (var list [[1 2 6 9]])\n    (var double (list.map [item] (return (* item 2)))) ## JS==> [2, 4, 12, 18]\n\nUse the get command to retrieve entries\n\n    (var second (get double 2))\n\nAll the JavaScript list processing functions (every, filter, forEach, ...) are available. See the [List Processing](list-processing.md) section for more details.\n\nTo see if an array contains an element, use 'in':\n\n    (return-if (12 in list) \"has dozen\")\n###\n### spec: lists >> flatten - Flattening Lists of Lists\n###\n(var flatten (lambda [list]\n  (return (list.reduce (lambda [a b]\n    (var bflat b)\n    (cond (instance-of Array b) (var bflat (flatten b)))\n    (return (a.concat bflat))\n  ) [[]]))\n))\n(export {flatten})\n"

lispz_modules['literate']="### spec: literate - Literate Programming\n  **Lispz** supports a form of Donald Knuth's Literate programming. Use the\n  *literate* annotation and document to your heart's content. The line of\n  the annotation is the title.\n\n  The body of the documentation is written in Github style markdown with all\n  the typographic features markdown provides.\n###\n(using [net cdnjs dict list]\n  (var build (lambda [target-repo]\n    (return (cdnjs.build target-repo \"showdown\" [[\n      {repo: \"showdown\" files: [[\n        {include: '/showdown.js$/'}\n      ]]}\n    ]]))\n  ))\n  (var loaded (net.script \"ext/showdown.js\"))\n  (catch loaded [] (export {build}))\n  (when  loaded []\n    ### spec: literate >> to-html\n      The core process is to initialise the markdown to html compiler provide\n      the conversion with ```to-html```. The options default if not provided.\n      The full list is available on\n      [the showdown wiki](https://github.com/showdownjs/showdown#valid-options).\n\n          (using literate\n            ## markdown list is [[{title: \"One\" body: markdown} ...]]\n            (literate.to-html markdown-list)\n            ## or\n            (literate.to-html markdown-list {headerLevelStart: 1})\n          )\n\n      For the lowdown on the markdown syntax provided, have a gander at\n      [The Showdown Wiki](https://github.com/showdownjs/showdown/wiki/Showdown's-Markdown-syntax)\n      or check out the Jasmine tests below.\n    ###\n    (var to-html (lambda [sections options]\n      (var seed (=> (return sections)))\n      (var sections (chain seed parse-titles sort-by-title merge-titles))\n      (var markdown (sections.map (lambda [section]\n        (return (section.markdown.push section.body))\n      )))\n      (return ((converter options).makeHtml ((list.flatten markdown).join \"\")))\n    ))\n    ### spec: literate >> options\n      You can pass in a dictionary of options that will change how markdown\n      is converted to HTML. Most are explicit:\n\n          omitExtraWLInCodeBlocks, noHeaderId, prefixHeaderId, headerLevelStart,\n          simplifiedAutoLink, literalMidWordUnderscores, strikethrough, tables,\n          tablesHeaderId\n\n      while others require a tiny bit of explanation:\n\n          parseImgDimensions - ![foo](foo.jpg =100x80) px, em, % or * for auto\n          ghCodeBlocks - triple-backtick instead of indenting\n          smoothLivePreview - not used by Lispz at this point\n    ###\n    (var converter (lambda [options]\n      (var defaults {\n        omitExtraWLInCodeBlocks:    false\n        noHeaderId:                 false\n        prefixHeaderId:             false\n        parseImgDimensions:         false   ## 100x80, 100x*, 80%x5em\n        headerLevelStart:           2\n        simplifiedAutoLink:         true    ## GFM recognizing urls in text\n        literalMidWordUnderscores:  false\n        strikethrough:              true    ## ~~strikethrough~~\n        tables:                     true    ## |h1|h2... |:--... |te1|te2\n        tablesHeaderId:             true\n        ghCodeBlocks:               true    ## GFM style code-blocks\n        smoothLivePreview:          false\n      })\n      (return (new showdown.Converter (dict.merge defaults (or options {}))))\n    ))\n    ### spec: literate >> title-syntax -- Title Syntax\n      Literate programming requires the documentation to be with the code.\n      In most cases the code clearly defines the how without additional\n      comments. Thw why, however, is still in the province of documentation.\n      Also, documentation when being read later is usually in a different order\n      to the code it is following. For this reason, literate annotations\n      include titles - on the same line as the annotation.\n\n      Sections are reference by a key word, with a double-right-arrow\n      between inner sections.\n\n            ##(#) spec: test -- The title of a test section\n            ##(#) spec: test >> details -- A detailed test title\n            ##(#) spec: test >> details >> more\n\n      To make it easier to repeat titles, they are key-word references.\n      Before they can be used they need to expand to the full title.\n      At some point when that title section is the last on the chain,\n      append a double-minus and the full title name.\n\n          ##(#) spec: test >> details >> more -- More Details\n    ###\n    (var titles (stateful {}))\n\n    (var parse-titles (lambda [sections]\n      (return (sections.map (lambda [section]\n        (var title ((section.title.split '/\\s+>>\\s+/').map (lambda [part]\n          (var split (part.split '/\\s+--\\s+/'))\n          (return-if (is split.length 1) part)\n          (var key (first split)  title (rest split))\n          (titles.update! key title)\n          (return key)\n        )))\n        (return {title sort: (title.join \" \") body: section.body})\n      )))\n    ))\n\n    ### spec: literate >> sort-by-title -- Sort document by title\n      Literate sections in the soure may need to be put together in a\n      different order to make the document. In this way sections will\n      only show once, even if they are referenced in different places\n      when defining sub-sections.\n    ###\n    (var sort-by-title (lambda [sections]\n      ### spec:\n        Note that this changes the contents of the parameter - not perfect\n        but acceptable since the array was created by the preceding function.\n      ###\n      (sections.sort (lambda [a b] (a.sort.localeCompare b.sort)))\n      (return sections)\n    ))\n    ### spec: literate >> merge-titles -- Merge titles into the Markdown\n      In the end a title is a title - being lines starting with one or more\n      hashes where the number indicates the heading level. We must inspect\n      each title and remove the common ancestores before printing the\n      remaining title lines.\n    ###\n    (var merge-titles (lambda [sections]\n      (var context (stateful.morph {parent: [[]]}))\n      (return (sections.map (lambda [section]\n        (var markdown [[]])\n        (section.title.forEach (lambda [key idx]\n          (cond (is (get context.parent idx) key)\n            (return (parent.update! (parent: [[]]}))\n          )\n          (var title (get titles key)  hashes (\"######\".slice 0 (+ idx 1)))\n          (markdown.push hashes \" \" title \"\\n\")\n        ))\n        (return {markdown body: section.body})\n      )))\n    ))\n    (export {build to-html})\n  )\n)\n"

lispz_modules['macros']="### spec: macros >> What is a Macro?\n\nThe term \"macro\" includes text substitution (e.g. ASM and C) and syntactic macros. Lisp has had the latter proposed 1963 or soon after. By working on the abstract syntax tree (AST), a macro has the full faculties and syntax of the language to effectively extend the language. Another way of looking at it is that lisp macros run lisp code during the compile to modify the resulting program. Yes, I know this is still not clear. Read https://en.wikipedia.org/wiki/Macro_%28computer_science%29 for a more informative perspective.\n\nPerhaps the best road to undertanding is by example.\n\n    (macro return? [value] (cond value (return value)))\n    \ncreates a new language element that only returns if the value is a truthy, as in\n\n    (var result ....)\n    (return? result)\n    ## try something else\n    \nThis example would also work with a text substitution macro system, but this one doesn't:\n\n    (macro closure [params *body] (#join '' '(function(' params '){' *body '})(' params ')'))\n    \nThis generates the JavaScript output directly as #join is an immediate function called during the\nast to JavaScript phase.\n\n### spec: macros >> Defining a Macro\n\nA macro is defined by giving it a name, list of parameters and a body. In it's simplest form the parameters are substituted into the body at reference time. It is like a function expanded in-line.\n\n    (macro return-if [test value] (cond test (return value)))\n    \nImmediate actions are required to modify the JavaScript output during the compile stage (ast to JavaScript).\n\n    (macro lambda [params *body] (#join '' '(function(' params '){' *body '})'))\n    \nParameters that start with star must be the last in the list and encapsulate all the remaining parameters in the expansion. This is why lambda works:\n\n    (lambda [a b] (var c (+ a b)) (return c))\n\n### spec: macros >> #join\nMany macros translate lispz directly to JavaScript by mixing pure JavaScript with macro parameters that can convert themselves to JavaScript. It is an immediate function - being one that runs during the compile phase. The first parameter is the text to be used between the segments. In this context it is usually empty. The first parameter along with the JavaScript are wrapped in single quotes so that they are left as-is in the JavaScript output.\n\n    (macro set! [name value] (#join '' name '=' value ';'))\n\n### spec: macros >> #pairs\nPairs is more rarely used. It takes a list and creates output based on pairs in that list. Hmmm, that is not very clear. Best use an example then. \n\n    (macro var (*list) (#join '' 'var ' (#pairs *list '=' ',') ';'))\n    (var a 12  b \"hi\") ##js=> var a=12,b=\"hi\";\n    \nPairs takes a list, the code within each pair and the string between pairs. In this example, = is between the two items in the pair and , is between pairs. If you need it clearer than that, try meditating on the two sample lines above - or don't use #pairs.\n\n### spec: macros >> immediate\n\nMacros allow you to change lispz by adding new build-in commands. By their nature, macros allow the use of lispz at compile time to generate the resulting lispz code. Most macros are to generate JavaScipt\n\n    (macro return [value] (#join '' 'return ' value '\\n'))\n\nor just substitution\n\n    (macro return? [value] (cond value (return value)))\n    \nDouble-check substitution macros. The one above must be a macro, but may could be easily converted into global functions\n\n    (macro empty? [list] (not list.length))\n    # is functionally the same as\n    (global empty? [list] (return (not list.length)))\n    \nThe built-ins #join and #pairs are example of immediate functions - ones that operate during the compile phase. Lispz would not be complete if you could not also create immediate functions.\n\n    (immediate 'alert(\"Hi\")')\n    \nWorks but has no point. I added immediate for language completeness. I have not yet found a use for it.\n\n    (global #join2 (lambda [sep parts]\n      (immediate (*arguments 1) '.map(lispz.ast_to_js).join(lispz.ast_to_js(sep)')\n    ))\n\n\n(export {})\n"

lispz_modules['message']="### spec: async >> Messaging\n  Lispz includes a complete decoupled communications solution based on messaging.\n  The base version is in-browser, but the API is designed to work across systems\n  with RESTful or WebSockets. The UI components use messaging to communicate\n  between components that are not linked, so cannot make more direct connections.\n\n  Here a code editor will wait on messages to open a new 'file'. The message\n  includes a name unique to each code editor. The dictionary at the end can\n  include any number of named requests. Each associated function takes a packet\n  whose content format is known by clients and services.\n\n      (using [message]\n        (var open (lambda [packet] ...)\n        (message.dispatch (+ \"code-editor/\" opts.name) { open })\n\n  The client will send a command to open a new file for display. If the editor\n  is called 'scratch':\n\n      (message.send \"code-editor/scratch\"\n        {action: \"open\" key: \"scratchpad.lispz\" contents: null}\n      )\n\n  If it is possible that a client will send an important request before the\n  service has had the opportunity to initialise, wrap 'send' in 'wait-for':\n\n      (message.wait-for \"code-editor/scratch\" (=>\n        (message.send \"code-editor/scratch\"\n          {action: \"open\" key: \"scratchpad.lispz\" contents: null}\n        )\n\n  'dispatch' uses an entry called 'action' to decide on which function to call.\n  For raw processing, use 'listen' instead. The following example changes the\n  left padding on a DOM element if asked.\n\n      (message.listen \"page-content-wrapper-padding\" (lambda [px]\n        (set! tag.page-content-wrapper.style.paddingLeft (+ px \"px\"))\n\n  For a one-off message, use 'expect' rather than 'listen':\n\n      (message.expect \"editor-loaded\" (=> ...)\n\n  Lispz uses exchanges defined as part of the address. Plain string addresses as\n  used so far will use a local in-browser exchange. The address can include\n  details that will define different exchanges (when implemented).\n\n  It is possible to remove listeners if you have access to the callback used to\n  create the listener\n\n      (message.remove \"my-message\" my-message-listener=>)\n\n  Messages also includes a common log processor. The following two calls behave\n  in an identical manner.\n\n      (message.log \"message: message-text\")\n      (message.send \"logging\" {level: \"message\"  text: \"message-text\"})\n\n  The default processor sends them to the browser console. Add additional\n  listeners for modal dialogs, error messages, etc.\n###\n\n(var store (stateful)  expecting (stateful))\n\n(var exchange (lambda [address]\n  (var envelopes (get store address))\n  (return? envelopes)\n  (var envelopes (stateful.morph! []))\n  (store.update! address envelopes)\n  (return envelopes)\n))\n\n(var add (lambda [address envelope]\n  (var envelopes (exchange address))\n  (envelopes.push envelope)\n  (cond (and (is envelopes.length 1) (get expecting address))\n        (do ((get expecting address)) (delete (get expecting address))))\n))\n\n(var ready (promise [address]\n  (return-if (length (exchange address)) (promise.resolved))\n  (expecting.update! address resolve-promise)\n))\n\n## remove a recipient from all attached addresses\n(var remove (lambda [recipient]\n  (var envelopes (exchange address))\n  (store.update! address\n    (envelopes.filter (lambda [possibility]\n      (return (isnt recipient possibility))\n    ))\n  )\n))\n\n(var send (lambda [address packet]\n  ## take a copy so that it does not change during processing\n  (var result null)\n  (((exchange address).slice).forEach (lambda [recipient]\n    (var result (recipient.listener=> packet))\n    (cond recipient.once (remove recipient))\n  ))\n  (return (promise? result))\n))\n\n(var expect (lambda [address listener=>]\n  (add address {once: true listener=>})\n))\n\n(var listen (lambda [address listener=>]\n  (add address {listener=>})\n))\n\n(var dispatch (lambda [address actions]\n  (listen address (lambda [packet]\n    (var action (get actions packet.action))\n    (return-if (not action) (promise.resolved false))\n    (return (action packet))\n  ))\n))\n\n(var log (lambda [text]\n  (var parts (text.split '/\\s*:\\s*/'))\n  (cond (is 1 parts.length) (parts.unshift \"message\"))\n  (send \"logging\" {level: (get parts 0) text: (get parts 1)})\n))\n\n(listen \"logging\" (lambda [packet]\n  (console.log packet.level \"-\" packet.text)\n))\n\n(export {exchange send expect listen dispatch ready})\n"

lispz_modules['net']="(using [list dom]\n  (var script (promise.callback [uri] (lispz.script uri callback)))\n\n  (var css (lambda [uri]\n    (var el (dom.element \"link\" {\n      type: \"text/css\" rel: \"stylesheet\" href: uri\n    }))\n    (dom.append! \"head\" el)\n  ))\n\n  (var http-get (promise.callback [uri]\n    (lispz.http_request uri \"GET\" callback)\n  ))\n\n  (var json-request (promise [uri]\n    (when (http-get uri) [response] (resolve-promise (JSON.parse response)))\n  ))\n\n  (export {\n    script css http-get json-request\n  })\n)\n"

lispz_modules['paredit']="### codeeditor >> codemirror >> ParEdit\n###\n    (var extraKeys {\n      ## paredit keys that defer if not in lisp code\n      'Backspace':        \"subpar_backward_delete\"\n      'Delete':           \"subpar_forward_delete\"\n      'Ctrl-D':           \"subpar_forward_delete\"\n\n      'Shift-9':          \"subpar_open_bracket\"\n      '[':                \"subpar_open_square_bracket\"\n      'Shift-[':          \"subpar_open_braces\"\n\n      'Shift-0':          \"subpar_close_bracket\"\n      ']':                \"subpar_close_square_bracket\"\n      'Shift-]':          \"subpar_close_braces\"\n\n      'Shift-\\'':          \"subpar_double_quote\"\n\n      'Ctrl-Alt-F':       \"subpar_forward\"\n      'Ctrl-Alt-B':       \"subpar_backward\"\n      'Ctrl-Alt-U':       \"subpar_backward_up\"\n      'Ctrl-Alt-D':       \"subpar_forward_down\"\n      'Ctrl-Alt-P':       \"subpar_backward_down\"\n      'Ctrl-Alt-N':       \"subpar_forward_up\"\n\n      'Shift-Ctrl-[':     \"subpar_backward_barf\"\n      'Ctrl-Alt-Right':   \"subpar_backward_barf\"\n      'Ctrl-]':           \"subpar_backward_barf\"\n\n      'Shift-Ctrl-]':     \"subpar_forward_barf\"\n      'Ctrl-Left':        \"subpar_forward_barf\"\n\n      'Shift-Ctrl-9':     \"subpar_backward_slurp\"\n      'Ctrl-Alt-Left':    \"subpar_backward_slurp\"\n      'Ctrl-[':           \"subpar_backward_slurp\"\n\n      'Shift-Ctrl-0':     \"subpar_forward_slurp\"\n      'Ctrl-Right':       \"subpar_forward_slurp\"\n\n      'Alt-Up':           \"subpar_splice_delete_backward\"\n      'Alt-Down':         \"subpar_splice_delete_forward\"\n      'Alt-S':            \"subpar_splice\"\n      'Ctrl-Alt-/':       \"subpar_indent_selection\"\n    })\n\n  ## paredit keys that defer if not in lisp code\n  (var lisp-modes {lispz: true clojure: true commonlisp: true scheme: true})\n  (var subpart (lambda [cmd opt]\n    (return (lambda [cm]\n      (var mode (cm.getModeAt (cm.getCursor)))\n      (cond (get lisp-modes mode.name)  ((get subpar.core cmd) cm opt)\n            (else)                      (return CodeMirror.Pass)\n      )\n    ))\n  ))\n  (var code-mirror-commands (state.morph CodeMirror.commands))\n  (code-mirror-commands.update! {\n    ## paredit keys that defer if not in lisp code\n    subpar_backward_delete:        (subpart \"backward_delete\")\n    subpar_forward_delete:         (subpart \"forward_delete\")\n    subpar_forward_delete:         (subpart \"forward_delete\")\n\n    subpar_open_bracket:           (subpart \"open_expression\" \"()\")\n    subpar_open_square_bracket:    (subpart \"open_expression\" \"[]\")\n    subpar_open_braces:            (subpart \"open_expression\" \"{}\")\n\n    subpar_close_bracket:          (subpart \"close_expression\" \")\")\n    subpar_close_square_bracket:   (subpart \"close_expression\" \"]\")\n    subpar_close_braces:           (subpart \"close_expression\" \"}\")\n\n    subpar_double_quote:           (subpart \"double_quote\")\n\n    subpar_forward:                (subpart \"forward\")\n    subpar_backward:               (subpart \"backward\")\n    subpar_backward_up:            (subpart \"backward_up\")\n    subpar_forward_down:           (subpart \"forward_down\")\n    subpar_backward_down:          (subpart \"backward_down\")\n    subpar_forward_up:             (subpart \"forward_up\")\n\n    subpar_backward_barf:          (subpart \"backward_barf\")\n    subpar_backward_barf:          (subpart \"backward_barf\")\n    subpar_backward_barf:          (subpart \"backward_barf\")\n\n    subpar_forward_barf:           (subpart \"forward_barf\")\n    subpar_forward_barf:           (subpart \"forward_barf\")\n\n    subpar_backward_slurp:         (subpart \"backward_slurp\")\n    subpar_backward_slurp:         (subpart \"backward_slurp\")\n    subpar_backward_slurp:         (subpart \"backward_slurp\")\n\n    subpar_forward_slurp:          (subpart \"forward_slurp\")\n    subpar_forward_slurp:          (subpart \"forward_slurp\")\n\n    subpar_splice_delete_backward: (subpart \"splice_delete_backward\")\n    subpar_splice_delete_forward:  (subpart \"splice_delete_forward\")\n    subpar_splice:                 (subpart \"splice\")\n    subpar_indent_selection:       (subpart \"indent_selection\")\n  })\n"

lispz_modules['riot']="### spec: Riot\n\n[Riot](http://riotjs.com) is a tiny UI library then provides the best of Web components (polymer) and react in a package 15% of the size.\n\nRiot, like web components, each file (of type .riot.html) is a html fragment that also includes style and script elements. Like web components it is based on creating custom tags. This provides clean and readable HTML. Custom tags makes the HTML more readable.\n\nThe *panel* tags is a Riot wrapper around bootstrap panels.\n\nRiot, like React it works with a virtual DOM and only updates changes to the real DOM. Like React it compiles to JavaScript. It can be supported on older browsers.\n\nSmall tight API that provides all needed web component functionality for reactive views, events and routing.\n###\n\n### spec: Riot >> Structure of a RIOT/Lispz Program\n\nRiot components have the extension *.riot.html*. They are loaded from the HTML file or from another component. In the HTML, give a custom tag the class or *riot* and it will load a component file of the same name - including any other tags in the file. The html below will load *bootstrap.riot.html* and *code-editor.riot.html*, while *page-content* does not need a riot class as it is defined withing *bootstrap*.\n\n    <bootstrap class=riot>\n      <page-content fluid=true>\n        <div class=col-sm-6>\n          <code-editor class=riot name=literate height=48% />\n        </div>\n        <div class=col-sm-6>\n          <code-editor class=riot name=code height=48% />\n        </div>\n      </page-content>\n    </bootstrap>\n\nFor riot component files that rely on other files for sub-components, Start the file with a comment, the word *using* and a space separated list of component paths. In the example below, *panel* is a tag defined in the bootstrap component file.\n\n    <!-- using bootstrap -->\n    <code-editor>\n      <panel height={ opts.height } heading={ heading } menu={ menu } owner={ _id }>\n        <div name=wrapper class=wrapper></div>\n      </panel>\n      <style>code-editor .wrapper {...}</style>\n      <script type=text/lispz>(var tag this) ...</script>\n    </code-editor>\n\nRiot uses plain JavaScript inside {} as a templating solution. The *opts* dictionary matches the attributes when the custom tag is referenced. Any inner tag with a *name* or *id* attribute can be referenced by the same name. Each component has a unique *_id*.\n\nStyles are global (unlike *true* web components). This is easily overcome using explicit name-spacing as above.\n###\n\n### spec: Riot >> Using other languages\n\nScripting can be any language of choice that runs on the browser. JavaScript, Lispz, Es6 (with babel) and CoffeeScript are available out-of-the-box. For the latter two you will need to load the compiler by *(using babel coffeescript)* in the startup code. Other languages can be added as long as they compile code on the browser.\n\n    (set! riot.parsers.js.lispz\n      (lambda [source] (return ((lispz.compile \"riot-tags\" source).join \"\\n\")))\n    )\n###\n(using  [jquery net github dict]\n  (var compile (lambda [html to-js] (return (riot.compile html to-js))))\n\n  (var processed-tags (stateful {}))\n\n  (var load (promise [name uri]\n    (var load-tags-used (lambda [tags]\n      (var new-tags (tags.filter (lambda [tag]\n        (return-if (get processed-tags tag) false)\n        (processed-tags.update! tag true)\n        (return true)\n      )))\n      (var loaded (promise.all (new-tags.map (lambda [tag] (return (load tag))))))\n      (when loaded [] (resolve-promise))\n    ))\n    (var usings (lambda [source]\n      (var tags ('/<!--\\s*using\\s*(.*?)\\s*-->/'.exec source))\n      (cond\n        tags   (load-tags-used ((last tags).split '/\\s+/'))\n        (else) (resolve-promise)\n      )\n    ))\n    (var retrieve-and-compile (=>\n      (var url (or uri (+ (name.toLowerCase) \".riot.html\")))\n      (when (net.http-get url) [tag] (usings (compile tag)))\n    ))\n    (cond\n      (get lispz.tags name) (usings ((get lispz.tags name)))\n      (else)                (retrieve-and-compile)\n    )\n  ))\n\n  (var build (lambda [target-repo]\n    (return (github.build target-repo \"riot\" [[\n      {repo: \"riot/riot\" files: [[\n        {include: '/^riot\\+compiler.js$/'}\n      ]]}\n    ]]))\n  ))\n\n  (var mount (lambda [tags] (riot.mount.apply riot argument)))\n\n  ### spec: riot >> Trigger Display Changes\n    Given a component context called *tag*, it is possible to change context\n    data using the state component.\n\n      <script type=text/lispz>\n        (var tag (stateful.morph this))\n        ...\n        (var async-set-title (lambda [title]\n          (tag.update! {title})\n          (tag.update)\n        )\n      </script>\n\n    For the confused, *update!* changes entries in the stateful context,\n    while *update* is a riot function to update the display for bound\n    data changes. Continue to use this approach where the data has logic\n    around the change, but for the common situation where data is changed\n    at the end of the logic, use *riot.update!*.\n\n      (using [riot]\n        ...\n        (var async-set-titles (lambda [title footer]\n          (riot.update! tag {title footer})\n        )\n      )\n  ###\n  (var update! (lambda [tag changes]\n    (tag.update! changes)\n    (tag.update) ## repaint\n  ))\n\n  ### spec: riot >> Tag support\n    Riot uses _this_ as context for codes within a tag. Also, when errors are\n    found it throws excepts that are difficult to track. Lispz provides help\n    with a riot-tag macro which invokes _using_,  provides a _context_ reference\n    and wraps the code in a _try/catch_ to provide improved error reporting.\n\n      @TODO example\n  ###\n  (macro riot-tag [modules *body]\n    'var context=this;'\n    (using modules\n      (#join '' 'try {' *body '}catch(err){console.log(err,context)}')\n    )\n  )\n\n  ### spec: async >> Events\n    Events follow [the observer pattern](https://en.wikipedia.org/wiki/Observer_pattern). Lispz provides access to the light-weight version in Riot. If you use Riot for UI components, the custom tags are always observers. You don't need to use riot to make use of events. You can either create an observable or make any object in the system observable.\n\n        (using [riot]\n          (var observable-1 (riot.observable))\n          (var element (get-my-element))\n          (riot.observable element)\n        )\n\n    Once that is out of the way, tell the observable what to do if it receives an event either once or every time.\n\n        (observable-1.on \"event-name\" (lambda [params...] what to do...))\n        (element.one \"focus\" (lambda [contents] (element.set contents)))\n\n    One observable can have many listeners for the same or different events. Use 'trigger' to wake an observable.\n\n        (observable-1.trigger \"event-name\" param1 param2)\n\n    Finally there needs to be a way to stop listening.\n\n        (observable-1.off \"event-name\" event-function-reference) ## stops one listener\n        (observable-1.off \"event-name\") ## stops all listeners to an event\n        (observable-1.off \"*\")          ## stops all listeners to all events for observable\n\n    ## Benefits\n    1. Decouples the code to whatever extent is necessary.\n    2. Associates code and data (such as the DOM).\n    3. Allows multiple invocations\n\n    ## Disadvantages\n    1. Too convoluted to use as an easy replacement for callbacks\n    2. One-way communication\n    3. No way of knowing if event was processed as expected.\n  ###\n\n  (when (net.script \"ext/riot.js\") []\n    (return-if (not window.riot) (export {build}))\n    (stateful.morph! riot.parsers.js)\n    (riot.parsers.js.update! {lispz:\n      (lambda [source] (return ((lispz.compile \"riot-tags\" source).join \"\\n\")))\n    })\n    (var riot-elements (slice (document.getElementsByClassName \"riot\")))\n    (var load-all (promise.all (riot-elements.map (lambda [element]\n      (var name (element.tagName.toLowerCase))\n      (return (load name (element.getAttribute \"uri\")))\n    ))))\n    (when load-all [mounts]\n      (riot.mount \"*\")\n      (export {build compile load mount update!})\n    )\n  )\n)\n"
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
    if (!(pairs.length % 2)) throw {message:"Unmatched pairs",pairs:pairs}
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
    console.log(errloc, msg, data || "")
    return ['throw "compile error for ' + errloc.replace(/["\n]/g," ") +
            " -- " + msg.replace(/"/g,"'") + '"\n']
  },
  parse_to_ast = function(source) {
    var env = { ast: [], stack: [] }
    try {
      env.node = env.ast
      tkre.lastIndex = 0
      while ((env.atom = tkre.exec(source.toString())) && (env.atom = env.atom[1])) {
        module.line += (env.atom.match(/\n/g) || []).length
        if (!comment(env.atom) && !parsers.some(function(parser) {
            if (!parser[0].test(env.atom)) return false
            parser[1](env)
            return true
          })) { env.node.push(env.atom); } }
      if (env.stack.length != 0) {
        console.log(env);
        throw "missing close brace"
      }
      return env.ast
    } catch (err) { console.log(env); throw err; }
  },
  ast_to_js = function(ast) {
    try {
      return (ast instanceof Array) ? macros[ast[0]] ?
        macros[ast[0]].apply(this, ast.slice(1)) : list_to_js(ast) : jsify(ast)
    } catch (err) { console.log(ast); throw err; }
  },
  compile = function(name, source) {
    try {
      var last_module = module
      module = {name:name, line:0}
      var js = parse_to_ast(source).map(ast_to_js)
      module = last_module
      return js
    } catch (err) {
      return compile_error(err.message, "for "+module.name+":"+module.line)
    }
  },
  run = function(name, source) { return compile(name, source).map(eval) },
  debug = function(debugging) { lispz.debugging = debugging }
  //######################### Script Loader ####################################//
  cache = {}, manifest = [], pending_module = {},
  http_request = function(uri, type, callback) {
    var req = new XMLHttpRequest()
    req.open(type, uri, true)
    if (lispz.debugging && uri.indexOf(":") == -1)
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
  module_init = function(uri) {
    var js = compile(uri, lispz_modules[uri]).join('\n') +
      "//# sourceURL=" + uri + ".lispz\n"
    init_func = new Function('__module_ready__', js)
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
      try {
        if (err) throw err
        var name = uri.split('/').pop()
        lispz_modules[uri] = response_text
        module_init(uri)
      } catch (e) {
        delete pending_module[uri]
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
  lispz_base_path = /^(.*?)(?:ext\/)?lispz.js/.exec(lispz_url)[1] || "./",
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
              to_run.push(script.textContent)
            }
          })
        var end_run = function() {
          if (to_run.length) {
            to_run.forEach(function(code) { run("script", code) })
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
    '#requires': requires_to_js, 'list': list_to_js,
    '\n': eol_to_js, 'immediate': immediate_to_js
  }
  // add all standard binary operations (+, -, etc)
  "+,-,*,/,&&,||,==,===,<=,>=,!=,!==,<,>,^,%".split(',').forEach(binop_to_js)

  return { compile: compile, run: run, parsers: parsers, load: load,
           macros: macros, cache: cache, http_request: http_request,
           clone: clone, manifest: manifest, script: script, css: css,
           synonyms: synonyms, globals: globals, tags: {},
           path_base: lispz_base_path }
}()


/*bootstrap*/

lispz.tags['bootstrap']=function(){riot.tag('panel', ' <div class="panel { context }" name=outer> <div class=panel-heading if="{ opts.heading }" name=heading ><bars-menu align=right name="{ opts.menu }" owner="{ opts.owner }"></bars-menu> <h3 class=panel-title>{ opts.heading }</h3></div> <div class="panel-body" name=body><yield></yield></div> <div class=panel-footer if="{ opts.footer }" name=footer >{ opts.footer }</div> </div>', 'panel .panel { position: relative; } panel .panel-title { cursor: default; } panel .panel-body { position: absolute; top: 40px; bottom: 2px; left: 0; right: 2px; } panel > .panel { margin-top: 10px; margin-bottom: 10px; }', function(opts) {var tag=lispz.globals.stateful.morph_$_(this);//#riot-tags:2

tag.on("mount",(function(){lispz.load("dom"//#core:349
,(function(){var dom=lispz.cache["dom"];
tag.update_$_({'context':("panel-"+(opts.context||"default"))})//#riot-tags:4

switch(false){case !opts.height:var px=opts.height;//#riot-tags:6

switch(false){case !("%"===opts.height.slice(-1))//#riot-tags:7
:var px=((window.innerHeight*opts.height.slice(0,-1))/100);//#riot-tags:8
}//#core:132
//#riot-tags:9

dom.style_$_(tag.outer,{'height':(px+"px")})//#riot-tags:10
}//#core:132
//#riot-tags:11
})//#core:350
)}))//#riot-tags:12

});

riot.tag('modal', ' <div class="modal fade" role="dialog" aria-labelledby="{ opts.name }"> <div class="modal-dialog" role="document"> <div class="modal-content"> <div class="modal-header" if="{ opts.title }"> <button type="button" class="close" data-dismiss="modal" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> <h4 class="modal-title" id="{ opts.name }">{ opts.title }</h4> </div> <div class="modal-body"><yield></yield></div> <div class="modal-footer"> <button each="{ buttons }" class="btn btn-{ type }" name="{ name }"> { title } </button> </div> </div> </div> </div>', function(opts) {var tag=lispz.globals.stateful.morph_$_(this);//#riot-tags:2

switch(false){case !opts.buttons:tag.update_$_({'buttons':[]})//#riot-tags:4

opts.buttons.split(",").forEach((function(title){var primary=("*"===title[0]),type="default";//#riot-tags:6

switch(false){case !primary:var type="primary";
title.shift()}//#core:132
//#riot-tags:7

var name=title;//#riot-tags:8

tag.buttons.push({'title':title,'type':type,'name':name})//#riot-tags:9
}))//#riot-tags:10
}//#core:132
//#riot-tags:11

});

riot.tag('bars-menu', ' <div name=dropdown class="dropdown { right: opts.align === \'right\' }"> <a style="text-decoration: none" data-toggle="dropdown" name=bars class="glyphicon glyphicon-menu-hamburger dropdown-toggle" aria-hidden="true" ></a> <ul class="dropdown-menu { dropdown-menu-right: opts.align === \'right\' }"> <li each="{ items }" class="{ dropdown-header: header && title, divider: divider, disabled: disabled }"><a onclick="{ goto }" href="#"> <span class="pointer right float-right" if="{ children }"></span> { title }&nbsp;&nbsp;&nbsp; </a></li> </ul> </div>', 'bars-menu > div.right { float: right } bars-menu span.caret { margin-left: -11px } bars-menu a.dropdown-toggle { cursor: pointer }', function(opts) {var tag=lispz.globals.stateful.morph_$_(this);//#riot-tags:2

tag.on("mount",(function(){lispz.load("message,riot"//#core:349
,(function(){var message=lispz.cache["message"],riot=lispz.cache["riot"];
message.listen(opts.name,(function(items){riot.update_$_(tag,{'items':items,'root':(items||[])})//#riot-tags:5
}))//#riot-tags:6

$(tag.dropdown).on("show.bs.dropdown",(function(){message.send((opts.name+"-open"))//#riot-tags:8

riot.update_$_(tag,{'items':tag.root})//#riot-tags:9
}))//#riot-tags:10

tag.update_$_({'goto':(function(ev){switch(false){case !ev.item.topic:message.send((opts.owner+"-"+ev.item.topic)//#riot-tags:13
,{'item':ev.item,'owner':opts.owner,'action':"select"})}//#core:132
//#riot-tags:14

switch(false){case !ev.item.children:tag.update_$_({'items':ev.item.children})//#riot-tags:16

ev.currentTarget.blur()//#riot-tags:17

ev.stopPropagation()//#riot-tags:18
}//#core:132
//#riot-tags:19
})})//#riot-tags:20
})//#core:350
)}))//#riot-tags:21

});

riot.tag('tree', ' <tree-component name=base></tree-component>', function(opts) {var tag=lispz.globals.stateful.morph_$_(this);//#riot-tags:2

lispz.load("message,riot"//#core:349
,(function(){var message=lispz.cache["message"],riot=lispz.cache["riot"];
message.listen(opts.name,(function(items){riot.update_$_(tag,{'children':{'base':{'children':items}}})//#riot-tags:5

tag.update()}))//#riot-tags:7
})//#core:350
)//#riot-tags:8

});

riot.tag('tree-component', '<ul class="dropdown-menu"> <li each="{ item, i in items }" class="{ dropdown-header: item.header && item.title, divider: item.divider, disabled: item.disabled }" ><a onclick="{ parent.goto }" href="#"> <span if="{ item.children }" class="glyphicon glyphicon-triangle-right" aria-hidden="true"></span>{ item.title }</a> <tree-component if="{ item.children }" name="{ item.title }"> </li> </ul>', 'tree-component ul { display: inherit !important; position: inherit !important; } tree-component:not([name=base]) > ul { display: none !important; } tree-component:not([name=base]).open > ul { margin-left: 9px; margin-right: 9px; display: inherit !important; } tree-component span.glyphicon { margin-left: -18px; }', function(opts) {var tag=lispz.globals.stateful.morph_$_(this);//#riot-tags:2

lispz.load("message,dict"//#core:349
,(function(){var message=lispz.cache["message"],dict=lispz.cache["dict"];
tag.on("update",(function(data){switch(false){case !(opts.name&&tag.parent.children):tag.update_$_({'items':tag.parent.children[opts.name]["children"]})//#riot-tags:6

switch(false){case !(tag.items&&tag.items.length)//#riot-tags:7
:tag.update_$_({'children':dict.from_list(tag.items,"title")})//#riot-tags:8
}//#core:132
//#riot-tags:9
}//#core:132
//#riot-tags:10
}))//#riot-tags:11
//#riot-tags:12

tag.update_$_({'goto':(function(ev){var item=ev.item.item;//#riot-tags:14

var topic=(item.topic||item.title);//#riot-tags:15

switch(false){case !topic:message.send(topic,{'item':item,'action':"select"})}//#core:132
//#riot-tags:17

switch(false){case !item.children:var tree=ev.currentTarget.nextElementSibling;//#riot-tags:19

tree.classList.toggle("open")//#riot-tags:20

tree.parentElement.classList.toggle("bg-info")//#riot-tags:21
}//#core:132
//#riot-tags:22

ev.stopPropagation()//#riot-tags:23
})})//#riot-tags:24
})//#core:350
)//#riot-tags:25

});

riot.tag('sidebar', ' <a aria-hidden="true" name=hamburger class="glyphicon glyphicon-menu-hamburger"></a> <div id=sidebar class="container bg-primary"><yield></yield></div>', 'sidebar > a { text-decoration: none !important; position: absolute !important; z-index: 2000; } #sidebar { z-index: 1000; position: fixed; width: 0; height: 100%; overflow-y: auto; -webkit-transition: all 0.5s ease; -moz-transition: all 0.5s ease; -o-transition: all 0.5s ease; transition: all 0.5s ease; padding-right: 0; overflow: hidden; } #sidebar.toggled { width: auto; padding-right: 15px; }', function(opts) {var tag=lispz.globals.stateful.morph_$_(this),hamburger=lispz.globals.stateful.morph_$_(tag.hamburger);//#riot-tags:2

lispz.load("message,dom"//#core:349
,(function(){var message=lispz.cache["message"],dom=lispz.cache["dom"];
hamburger.update_c_({'onclick':(function(){tag.sidebar.classList.toggle("toggled")//#riot-tags:5

setTimeout((function(){message.send("page-content-wrapper-padding",tag.sidebar.offsetWidth)//#riot-tags:7
}),300)//#riot-tags:8
})})//#riot-tags:9

tag.on("mount",setTimeout((function(){message.send("page-content-wrapper-padding",tag.sidebar.offsetWidth)//#riot-tags:11
}),300))//#riot-tags:12
})//#core:350
)//#riot-tags:13

});

riot.tag('page-content', '<div id=page_content_wrapper> <div class="{ container-fluid: opts.fluid, container: !opts.fluid }"> <yield></yield> </div> </div>', '#page_content_wrapper { width: 100%; position: absolute; }', function(opts) {var tag=this;//#riot-tags:2

lispz.load("message,dom"//#core:349
,(function(){var message=lispz.cache["message"],dom=lispz.cache["dom"];
message.listen("page-content-wrapper-padding",(function(px){dom.style_$_(tag.page_content_wrapper,{'paddingLeft':(px+"px")})//#riot-tags:5
}))//#riot-tags:6
})//#core:350
)//#riot-tags:7

});

riot.tag('bootstrap', '<div id=page-wrapper><yield></yield></div>', '.pointer { border: 5px solid transparent; display: inline-block; width: 0; height: 0; vertical-align: middle; } .pointer.float-right { float: right; margin-top: 5px; } .pointer.up { border-bottom: 5px solid; } .pointer.right { border-left: 5px solid; } .pointer.down { border-top: 5px solid; } .pointer.left { border-right: 5px solid; }', function(opts) {var tag=lispz.globals.stateful.morph_$_(this);//#riot-tags:2

lispz.load("dom,net,jquery,riot,message,bootstrap"//#core:349
,(function(){var dom=lispz.cache["dom"],net=lispz.cache["net"],jquery=lispz.cache["jquery"],riot=lispz.cache["riot"],message=lispz.cache["message"],bootstrap=lispz.cache["bootstrap"];
var bootswatch_themes=["cerulean","cosmo","cyborg","darkly","flatly","journal","lumen","paper","readable","sandstone","simplex","slate","spacelab","superhero","united","yeti"];//#riot-tags:6
//#riot-tags:11

message.listen("change-bootstrap-theme",(function(theme){switch(false){case !!((typeof(theme)!=="undefined"))//#riot-tags:13
:var theme=bootswatch_themes[lispz.globals.random(bootswatch_themes.length)];//#riot-tags:14
}//#core:132
//#riot-tags:15

net.css(("https://bootswatch.com/"+theme+"/bootstrap.css"))//#riot-tags:16
}))//#riot-tags:17

dom.append_$_("head",dom.element("meta",{'name':"viewport",'content':"width=device-width, initial-scale=1"}//#riot-tags:19
))//#riot-tags:20
})//#core:350
)//#riot-tags:21

});

return ''}


/*code-editor*/

lispz.tags['code-editor']=function(){riot.tag('code-editor', '<panel height="{ opts.height }" heading="{ heading }" menu="{ menu }" owner="{ _id }"> <div name=wrapper class=wrapper></div> </panel>', 'code-editor .wrapper { position: absolute; top: 0; bottom: 0; left: 0; right: 0; height: initial; } code-editor .CodeMirror { position: absolute; top: 0; bottom: 0; left: 5px; right: 0; height: initial; }', function(opts) {var tag=lispz.globals.stateful.morph_$_(this);//#riot-tags:2

tag.update_$_({'menu':"CodeMirror-menu",'heading':"Edit"})//#riot-tags:3

tag.on("mount",(function(){lispz.load("codemirror,message,dict"//#core:349
,(function(){var codemirror=lispz.cache["codemirror"],message=lispz.cache["message"],dict=lispz.cache["dict"];
var filename_key=("code-editor/"+opts.name+"/filename");//#riot-tags:5

var cm=codemirror.open(tag._id,tag.tags.panel.wrapper);//#riot-tags:6
//#riot-tags:7

var open=(function(packet){codemirror.set_mode(cm,packet.key)//#riot-tags:9

tag.update_$_({'heading':packet.key.split("/").slice(-1)[0]})//#riot-tags:10

localStorage.setItem(filename_key,packet.key)//#riot-tags:11

switch(false){case !packet.contents:cm.setValue(packet.contents)}//#core:132
//#riot-tags:12

tag.update()//#riot-tags:13
});//#riot-tags:14
//#riot-tags:15

var contents_key=("code-editor/"+opts.name+"/contents");//#riot-tags:16

var filename=localStorage.getItem(filename_key);//#riot-tags:17

switch(false){case !filename:setTimeout((function(){open({'key':filename,'contents':localStorage.getItem(contents_key)})//#riot-tags:19
}),100)}//#core:132
//#riot-tags:20

cm.on("change",(function(){localStorage.setItem(contents_key,cm.getValue())//#riot-tags:22
}))//#riot-tags:23
//#riot-tags:24

message.dispatch(("code-editor/"+opts.name),{'open':open})//#riot-tags:25
})//#core:350
)}))//#riot-tags:26

});

return ''}


/*codemirror*/

lispz.tags['codemirror']=function(){riot.tag('codemirror', '<div name=wrapper> </div>', function(opts) {var tag=lispz.globals.stateful.morph_$_(this);//#riot-tags:2

tag.on("mount",(function(){lispz.load("codemirror"//#core:349
,(function(){var codemirror=lispz.cache["codemirror"];
tag.update_$_({'cm':CodeMirror(tag.wrapper,opts)})//#riot-tags:4
})//#core:350
)}))//#riot-tags:5

});

return ''}


/*firepad*/

lispz.tags['firepad']=function(){riot.tag('firepad', ' <panel height="{ opts.height }" heading="{ heading }" menu="{ menu }" owner="{ _id }"> <div name=wrapper class=wrapper></div> </panel>', 'firepad .wrapper { position: absolute; top: 0; bottom: 0; left: 0; right: 0; height: initial; } firepad .CodeMirror { position: absolute; top: 0; bottom: 0; left: 5px; right: 0; height: initial; } a.powered-by-firepad { display: none; } div.firepad-toolbar { margin-top: -25px; }', function(opts) {var tag=lispz.globals.stateful.morph_$_(this);//#riot-tags:2

tag.update_$_({'menu':"CodeMirror-menu"})//#riot-tags:3

tag.update_$_({'heading':"Edit"})//#riot-tags:4

tag.on("mount",(function(){lispz.load("firebase,codemirror,firepad,message,dict"//#core:349
,(function(){var firebase=lispz.cache["firebase"],codemirror=lispz.cache["codemirror"],firepad=lispz.cache["firepad"],message=lispz.cache["message"],dict=lispz.cache["dict"];
var filename_key=("codemirror/"+opts.name+"/filename");//#riot-tags:6

var cm=codemirror.open(tag._id,tag.tags.panel.wrapper);//#riot-tags:7

tag.update_$_({'pad':lispz.globals.stateful({'setText':(function(contents){cm.setValue(contents)})//#riot-tags:9
,'on_ready':(function(act){act()})//#riot-tags:10
})})//#riot-tags:11
//#riot-tags:12

var open=(function(packet){codemirror.set_mode(cm,packet.key)//#riot-tags:14

tag.update_$_({'heading':heading,'undefined':packet.key.split("/").slice(-1)[0]})//#riot-tags:15

localStorage.setItem(filename_key,packet.key)//#riot-tags:16

switch(false){case !packet.contents:tag.pad.setText(packet.contents)}//#core:132
//#riot-tags:17

tag.update()//#riot-tags:18
});//#riot-tags:19
//#riot-tags:20

switch(false){case !opts.db:var db=firebase.attach(("firepads/"+opts.name),opts.db);//#riot-tags:23

tag.update_$_({'pad':stateful.morph(Firepad.fromCodeMirror(db,cm,{'richTextShortcuts':false,'richTextToolbar':false}//#riot-tags:25
))})//#riot-tags:26

tag.pad.update_$_({'on_ready':(function(act){tag.pad.on("ready",act)})})//#riot-tags:27
;break;case !true:var contents_key=("codemirror/"+opts.name+"/contents");//#riot-tags:29

var filename=localStorage.getItem(filename_key);//#riot-tags:30

switch(false){case !filename:setTimeout((function(){open({'key':filename,'contents':localStorage.getItem(contents_key)})//#riot-tags:33
}),100)}//#core:132
//#riot-tags:34

cm.on("change",(function(){localStorage.setItem(contents_key,cm.getValue())//#riot-tags:36
}))//#riot-tags:37
//#riot-tags:38
}//#core:132
//#riot-tags:39
//#riot-tags:40

tag.pad.on_ready((function(){message.dispatch(("firepad/"+opts.name),{'open':open})//#riot-tags:42
}))//#riot-tags:43
})//#core:350
)}))//#riot-tags:44

});

return ''}


/*github*/

lispz.tags['github']=function(){<!-- using bootstrap -->
<github-login>
 <modal name=github-login title="GitHub Login" buttons="*Sign In">
   <img src=GitHub-Mark-64px.png />
   <form class=form-horizontal>
     <input type=text class=form-control name=username placeholder="User Name">
     <br>
     <input type=password class=form-control name=password placeholder=Password>
     <br>
     <input type=checkbox name=remember-me data-toggle=tooltip
       title="Only use on a secure, private account"> Remember me
   </form>
 </modal>
 <style>
 </style>
 <script type=text/lispz>
   (var tag this)
   (tag.on "mount" (=> (using  [github message]
   )))
 </script>
</code-editor>

return '<!-- using bootstrap -->'}


/*iframe-panel*/

lispz.tags['iframe-panel']=function(){riot.tag('iframe-panel', '<panel height="{ opts.height }" heading="{ opts.heading }" menu="{ menu }" owner="{ _id }"> <iframe name=iframe class=iframe></iframe> </panel>', 'iframe-panel .panel-body { bottom: 0; left: 1px; right: 1px; padding: 0; padding-bottom: 1px; } iframe-panel .iframe { position: absolute; height: 100%; width: 100%; }', function(opts) {var tag=lispz.globals.stateful.morph_$_(this);//#riot-tags:2

tag.update_$_({'menu':opts.menu,'heading':opts.heading})//#riot-tags:3

tag.on("mount",(function(){lispz.load("message"//#core:349
,(function(){var message=lispz.cache["message"];
var iframe=tag.tags.panel.iframe;//#riot-tags:5

var iframe_doc=(iframe.contentDocument||iframe.contentWindow.document);//#riot-tags:6
//#riot-tags:7

tag.update_$_({'open':(function(packet){tag.update_$_({'heading':packet.heading})//#riot-tags:9

switch(false){case !packet.menu:tag.update_$_({'menu':packet.menu})}//#core:132
//#riot-tags:10

iframe_doc.open()//#riot-tags:11

iframe_doc.write(("<!DOCTYPE html><html><head><meta charset='utf-8'>"+(packet.head||"")+"</head><body>"+(packet.body||"")+"</body></html>"))//#riot-tags:15

iframe_doc.close()//#riot-tags:16

tag.update()//#riot-tags:17
})})//#riot-tags:18
})//#core:350
)}))//#riot-tags:19

});

return ''}


/*lispz-repl*/

lispz.tags['lispz-repl']=function(){riot.tag('lispz-repl', '<div id=lispz_repl_div class="{ hidden:hidden }"> <input type=text name=usings autocomplete=on size=20 placeholder="(package-list (* to reload))"> <input type=text name=code autocomplete=on size=50 placeholder="(Lispz code - enter to execute)"> </div>', 'lispz-repl {position: absolute; bottom: 0;} lispz-repl .hidden {display: none}', function(opts) {var tag=stateful.morph(this);//#riot-tags:2

tag.update_$_({'hidden':true})//#riot-tags:3

var run=(function(){var source=tag.usings.value.split(" ").map((function(pkg){switch(false){case !(pkg[0]==="*"):var pkg=pkg.slice(1);//#riot-tags:7

delete(lispz.cache[pkg])//#riot-tags:8

delete(lispz.cache[pkg.split("/").slice(-1)[0]])//#riot-tags:9
}//#core:132
//#riot-tags:10

return pkg
//#riot-tags:11
})).join(",");//#riot-tags:12

switch(false){case !source:var source=("(using ["+source+"] "+tag.code.value+")");//#riot-tags:14
;break;case !true:var source=tag.code.value;//#riot-tags:15
}//#core:132
//#riot-tags:16

console.log(lispz.run("lispz-repl",source))//#riot-tags:17

tag.code.select()//#riot-tags:18
});//#riot-tags:19
//#riot-tags:20

var toggle_show_repl=(function(){tag.update_$_({'hidden':!(tag.hidden)})
tag.update()//#riot-tags:22

tag.code.focus()
tag.code.select()//#riot-tags:23
});//#riot-tags:24
//#riot-tags:25

document.body.addEventListener("keydown",(function(ev){switch(false){case !(ev.altKey&&ev.shiftKey&&(ev.keyCode===82)):toggle_show_repl()//#riot-tags:27
}//#core:132
}))//#riot-tags:28

tag.code.addEventListener("keypress",(function(ev){switch(false){case !(ev.keyCode===13):run()}//#core:132
}))//#riot-tags:30

});

return ''}


/*lispz*/

lispz.tags['lispz']=function(){<!-- using bootstrap code-editor specifications -->
riot.tag('lispz', '<bootstrap class=riot> <page-content fluid=true>  <div class=col-sm-6> <code-editor class=riot name=code height=48%></code-editor> </div>  </page-content> </bootstrap>', function(opts) {var context=this;
lispz.load("message,riot,dict"//#core:349
,(function(){var message=lispz.cache["message"],riot=lispz.cache["riot"],dict=lispz.cache["dict"];
try {lispz.globals.stateful.morph_$_(lispz)
lispz.update_$_({'debug':true})//#riot-tags:3

message.ready("code-editor/scratch").then((function(){message.send("code-editor/scratch",{'action':"open",'key':"scratchpad.lispz",'contents':null})//#riot-tags:6
}))//#riot-tags:7

var topic="specifications";//#riot-tags:8

message.listen("specifications-menu-open",(function(){var menu=dict.map(lispz_modules,(function(title,source){return {'topic':topic,'title':title,'source':source}
//#riot-tags:11
}));//#riot-tags:12

message.send("specifications-menu",menu.sort())//#riot-tags:13
}))//#riot-tags:14

message.ready("specifications/specifications").then((function(){message.send("specifications/specifications",{'action':"open",'name':"scratchpad",'scripts':[]})//#riot-tags:17
}))//#riot-tags:18
}catch(err){console.log(err,context)}//#riot:137
})//#core:350
)//#riot:138
//#riot-tags:19

});

return '<!-- using bootstrap code-editor specifications -->'}


/*specifications*/

lispz.tags['specifications']=function(){<!-- using iframe-panel -->
riot.tag('specifications', '<iframe-panel height="{ opts.height }" heading="{ heading }" menu=specifications-menu owner="{ _id }"></iframe-panel>', function(opts) {var tag=lispz.globals.stateful.morph_$_(this);//#riot-tags:2

tag.update_$_({'heading':"Specifications"})//#riot-tags:3

var owner=tag._id;//#riot-tags:4

tag.on("mount",(function(){lispz.load("message,annotations,literate"//#core:349
,(function(){var message=lispz.cache["message"],annotations=lispz.cache["annotations"],literate=lispz.cache["literate"];
var open=(function(packet){var name=packet.name.split(/:\s*/).slice(-1)[0];//#riot-tags:8

tag.update_$_({'heading':(name+" Specifications")})//#riot-tags:9
//#riot-tags:10

var add_documentation=(function(){var docs=annotations.retrieve("literate",packet.source);//#riot-tags:12

return literate.to_html(docs)
//#riot-tags:13
});//#riot-tags:14

var add_specs=(function(){var specs=annotations.retrieve("spec",packet.source);//#riot-tags:16

var specs=specs.map((function(spec){return spec.body
}));//#riot-tags:17

return specs.join("\n\n")
//#riot-tags:18
});//#riot-tags:19
//#riot-tags:20

var head=("<link rel='shortcut icon' type='image/png' href='"+lispz.path_base+"ext/jasmine_favicon.png'>"+"<script src='"+lispz.path_base+"lispz.js#jasmine'></"+"script>"+"<script type='text/lispz'>"+add_specs()+"</"+"script>");//#riot-tags:24

var body="";//#riot-tags:25

tag.tags["iframe-panel"].open({'head':head,'body':body})//#riot-tags:26
});//#riot-tags:27
//#riot-tags:28

message.dispatch(("specifications/"+opts.name),{'open':open})//#riot-tags:29

message.listen((owner+"-"+"specifications"),(function(packet){open({'name':packet.item.title,'source':packet.item.source})//#riot-tags:31
}))//#riot-tags:32
})//#core:350
)}))//#riot-tags:33

});

return '<!-- using iframe-panel -->'}
