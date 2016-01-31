window.lispz_modules={}

lispz_modules['annotations']="### spec: Annotations\n  In this context, annotations are comments in source files that can be processed\n  by an external system for processing outside normal compilation and running.\n\n  An annotation is a line containing **##<span>#</span> type: ** followed by\n  lines of text ending in ##<span>#</span>. Annotation processors use a\n  type to define which annotations they retrieve. They then receive a list of\n  objects with _title_ and _body_ elements.\n\n  Source code can be any language that supports multi-line comments:\n\n      &lt;!-- ##<span>#</span> spec: Annotations in HTML or XML\n            ...\n           ##<span>#</span> --&gt;\n      /* ##<span>#</span> spec: Annotations in a C, C++, Java, etc\n          ...\n         ##<span>#</span> */\n###\n### spec: annotations >> Processing Source Code\n  The retrieve function processes source files one at a time. It returns an\n  array of objects containing title and body members.\n\n      (describe \"(annotations.retrieve \\\"spec\\\" source-code)\" (lambda []\n        (it \"retrieves a list {title: \\\"..\\\" body: \\\"..\\\"}\" (lambda []\n          (using [annotations]\n            (ref source window.lispz_modules.annotations)\n            (ref list (annotations.retrieve \"spec\" source)\n            (expect list.length).toBeGreaterThan(0)\n            (ref annotation (first list))\n            (expect annotation.title).toBe(\"Annotations\")\n            (expect annotation.body.length).toBeGreaterThan(100)\n          )\n        ))\n      ))\n###\n  (ref retrieve (lambda [type source]\n    (ref re (new RegExp (+ \"###\\\\s*\" type \":\\\\s*(.*)\\\\n((?:.|\\\\n)*?)###\") \"g\"))\n    (ref annotations [[]])\n    (ref scan (lambda []\n      (ref res (re.exec source))\n      (return? (not res))\n      (annotations.push {title: (get res 1)  body: (get res 2)})\n      (scan)\n    ))(scan)\n    (return annotations)\n  ))\n  (export {retrieve})\n"

lispz_modules['babel']="(using [net cdnjs]\n  (ref build (lambda [target-repo]\n    (return (cdnjs.build target-repo \"babel\" [[\n      {repo: \"babel-standalone\" files: [[\n        {include: '/\\.min.js$/'}\n      ]]}\n    ]]))\n  ))\n  (ref loaded (net.script \"ext/jquery.js\" (lambda [] (return window.Babel))))\n  (when  loaded [] (export {build}))\n  (catch loaded [] (export {build}))\n)\n"

lispz_modules['bootstrap']="### spec: bootstrap - Twitter Bootstrap\n  Bootstrap is a popular CSS framework open sourced by Twitter. It includes skins\n  so all bootstrap driven sites do not have to look alike. It provides support\n  for differing screen sizes and is relatively mobile friendly.\n###\n(using [net github cdnjs message]\n  (ref bootswatch-themes [[\"cerulean\" \"cosmo\" \"cyborg\" \"darkly\" \"flatly\"\n    \"journal\" \"lumen\" \"paper\" \"readable\" \"sandstone\" \"simplex\" \"slate\"\n    \"spacelab\" \"superhero\" \"united\" \"yeti\" \"default\"]])\n\n  (ref build (lambda [target-repo]\n    (return (promise.all\n      (github.build target-repo \"bootstrap\" [[\n        {repo: \"twbs/bootstrap\" files: [[\n          {base: \"dist\" exclude: '/\\.map$|\\.min\\.|npm.js$/'}\n          {base: \"dist/fonts\" copy-to: \"fonts\"}\n        ]]}\n      ]])\n      (bootswatch-themes.map (lambda [theme]\n        (return (cdnjs.build target-repo (+ \"bootstrap-\" theme) [[\n          {repo: \"bootswatch\" files: [[{include: (+ theme \"/bootstrap.css\")}]]}\n        ]]))\n      ))\n    ))\n  ))\n\n  (lispz.css \"ext/bootstrap.css\")\n  (ref themes bootswatch-themes)\n\n  ###\n  # https://bootswatch.com\n  # Loads a bootswatch theme to make the page look different.\n  # If no theme is provided, a random one is selected.\n  ###\n  (message.listen \"bootstrap/change-theme\" (lambda [theme]\n    (cond (not (defined? theme))\n      (ref theme (get bootswatch-themes (random themes.length)))\n    )\n    (net.css (+ \"ext/bootstrap-\" theme \".css\"))\n  ))\n\n  (ref loaded (net.script \"ext/bootstrap.js\" (lambda [] (return (($).modal)))))\n  (when  loaded [] (export {build themes}))\n  (catch loaded [] (export {build}))\n)\n\n### spec: Bootstrap >> Bootstrap/RIOT/Lispz Combo\n\n  There is a difference of scope between bootstrap and riot.\n  [Bootstrap](http://getbootstrap.com/) is designed to be used page-wide.\n  Riot is a web component system where each component should be as independent as possible.\n  ###\n  ### spec: bootstrap >> Page Level Bootstrap\n\n  Any single page application that is going to use bootstrap to simplify the UI wraps the contents inside the body with a bootstrap tag. Use an inner page-content tag to allow for fluid layouts - those that change as the window changes size.\n\n      <!-- using bootstrap code-editor --&gt;\n      <body>\n        <bootstrap class=riot>\n          <page-content fluid=true>\n            ...\n          </page-content>\n        </bootstrap>\n      </body>\n\n  ###\n  ### spec: bootstrap >> Bootstrap Themes\n\n  Bootstrap sites do not have to look alike. [Bootswatch](https://bootswatch.com/)\n  provides 16+ free themes, including ones that fit in with Metro, Polymer and Ubuntu:\n\n  > Default, Cerulean, Cosmo, Cyborg, Darkly, Flatly, Journal, Lumen, Paper, Readable,\n  > Sandstone, Simplex, Slate, Spacelab, Superhero, United, Yeti\n\n  To select a theme, send a message to _change-bootstrap-theme_ with the name of the theme\n  to change to. If you don't provide a theme name, a random one is chosen.\n\n  ###\n  ### spec: bootstrap >> Component Specific Bootstrap\n\n  Riot components can include a _style_ section.\n  If you preface all entries with the name of the component then you have\n  name-spaced your css.\n\n      <code-editor>\n        <panel height={ opts.height } heading={ heading } menu={ menu } owner={ _id }>\n          <div name=wrapper class=wrapper></div>\n        </panel>\n        <style>\n          code-editor .wrapper {\n            ...\n          }\n      </code-editor>\n###\n"

lispz_modules['cdnjs']="### Load packages from CDN and other web sources - listing them when possible ###\n(using [net github list]\n  (ref cdnjs-actors {\n    list-all: (promise [repo path]\n      (ref base \"http://api.cdnjs.com/libraries?fields=assets&search=\")\n      (when (net.json-request (+ base repo.name)) [json]\n        ## select the correct repo for the name\n        (ref filtered (json.results.filter (lambda [it]\n          (return (=== it.name repo.name))\n        )))\n        (return-if (not filtered.length) false)\n        ((get filtered 0).assets.some (lambda [it]\n          (return-if (list.contains \"alpha\" it.version) false)\n          (repo.update! {base: (+\n            \"https://cdnjs.cloudflare.com/ajax/libs/\"\n            repo.name \"/\" it.version \"/\"\n          )})\n          (resolve-promise it.files)\n          (return true) ## found the one we want\n        ))\n      )\n    )\n    read: (promise [repo path]\n      (ref uri (+ repo.base path))\n      (when (net.http-get uri) [response] (resolve-promise response))\n    )\n    repo: (lambda [target-repo name] (return (stateful {})))\n  })\n\n  (export {\n    build: (github.builder.bind null cdnjs-actors)\n  })\n)\n"

lispz_modules['codemirror']="(using  [net diff_match_patch message dict github compilers]\n  (ref options-string (localStorage.getItem \"CodeMirror-options\"))\n  (cond options (ref options (JSON.parse options-string))\n        (else)  (ref options {\n    lineNumbers:        true\n    foldGutter:         true\n##  gutters:            [\"CodeMirror-lint-markers\"\n##                       \"CodeMirror-foldgutter\"]\n    lint:               true\n    matchBrackets:      true\n    autoCloseBrackets:  true\n    matchTags:          true\n    showTrailingSpace:  true\n    inputStyle:         \"textarea\" ## change to \"contenteditable\" after vim cursor bug fix\n    autofocus:          true\n    dragDrop:           false\n    smartIndent:        true\n    indentUnit:         2\n    indentWithTabs:     false\n    cursorScrollMargin: 5\n    scrollbarStyle:     \"overlay\"\n    extraKeys:          {\n      'Cmd-Left':         \"goLineStartSmart\"\n      'Ctrl-Q':           \"fold_at_cursor\"\n      'Ctrl-Space':       \"autocomplete\"\n      'Ctrl-/':           \"toggleComment\"\n      'Ctrl-<':           \"goColumnLeft\"\n      'Ctrl->':           \"goColumnRight\"\n      'Ctrl-Shift-F':     \"clearSearch\"\n      'Ctrl-=':           \"toMatchingTag\"\n      'Alt-S':            \"view_source\"\n      'Ctrl-`':           \"insertSoftTab\"\n      'Ctrl-,':           \"delLineLeft\"\n      'Ctrl-.':           \"killLine\"\n      'Shift-Ctrl-,':     \"delWrappedLineLeft\"\n      'Shift-Ctrl-.':     \"delWrappedLineRight\"\n      'Ctrl-9':           \"delWordBefore\"\n      'Ctrl-0':           \"delWordAfter\"\n      'Ctrl-6':           \"transposeChars\"\n      'Ctrl-Left':        \"goWordLeft\"\n      'Ctrl-Right':       \"goWordRight\"\n      'Ctrl-Home':        \"goLineLeft\"\n      'Ctrl-Shift-Home':  \"goLineLeftSmart\"\n      'Ctrl-End':         \"goLineRight\"\n      ## paredit keys that defer if not in lisp code\n      'Backspace':        \"subpar_backward_delete\"\n      'Delete':           \"subpar_forward_delete\"\n      'Ctrl-D':           \"subpar_forward_delete\"\n\n      'Shift-9':          \"subpar_open_bracket\"\n      '[':                \"subpar_open_square_bracket\"\n      'Shift-[':          \"subpar_open_braces\"\n\n      'Shift-0':          \"subpar_close_bracket\"\n      ']':                \"subpar_close_square_bracket\"\n      'Shift-]':          \"subpar_close_braces\"\n\n      'Shift-\\'':          \"subpar_double_quote\"\n\n      'Ctrl-Alt-F':       \"subpar_forward\"\n      'Ctrl-Alt-B':       \"subpar_backward\"\n      'Ctrl-Alt-U':       \"subpar_backward_up\"\n      'Ctrl-Alt-D':       \"subpar_forward_down\"\n      'Ctrl-Alt-P':       \"subpar_backward_down\"\n      'Ctrl-Alt-N':       \"subpar_forward_up\"\n\n      'Shift-Ctrl-[':     \"subpar_backward_barf\"\n      'Ctrl-Alt-Right':   \"subpar_backward_barf\"\n      'Ctrl-]':           \"subpar_backward_barf\"\n\n      'Shift-Ctrl-]':     \"subpar_forward_barf\"\n      'Ctrl-Left':        \"subpar_forward_barf\"\n\n      'Shift-Ctrl-9':     \"subpar_backward_slurp\"\n      'Ctrl-Alt-Left':    \"subpar_backward_slurp\"\n      'Ctrl-[':           \"subpar_backward_slurp\"\n\n      'Shift-Ctrl-0':     \"subpar_forward_slurp\"\n      'Ctrl-Right':       \"subpar_forward_slurp\"\n\n      'Alt-Up':           \"subpar_splice_delete_backward\"\n      'Alt-Down':         \"subpar_splice_delete_forward\"\n      'Alt-S':            \"subpar_splice\"\n      'Ctrl-Alt-/':       \"subpar_indent_selection\"\n\n      'Alt-Enter':        \"run_selection\"\n     }\n  }))\n  (ref options (stateful.morph! options))\n  ## write changed options back to persistent storage\n  (ref update-options (lambda []\n    (localStorage.setItem \"CodeMirror-options\" (JSON.stringify options))\n  ))\n  ## Context menu for code editor\n  (ref topic \"codemirror/command\")\n  (ref menu [[\n    ### {title: \"File\" children: [[\n      {topic meta: \"save\" title: \"Save\"}\n    ]]} ###\n    {title: \"Edit\" children: [[\n      {topic meta: \"autocomplete\" title: \"Auto-Complete\" }\n      {topic meta: \"redo\" title: \"Redo\"}\n      {topic meta: \"undo\" title: \"Undo\"}\n      {topic meta: \"redoSelection\" title: \"Redo Selection\"}\n      {topic meta: \"undoSelection\" title: \"Undo Selection\"}\n      {divider: true}\n      {topic meta: \"toggleOverwrite\" title: \"Insert/Overwrite\"}\n      {topic meta: \"toggleComment\" title: \"Comment/Uncomment\" }\n      {topic meta: \"insertSoftTab\" title: \"Insert Soft Tab\" }\n      {topic meta: \"defaultTab\" title: \"Tab or Indent\"}\n      {title: \"Delete\" children: [[\n        {topic meta: \"deleteLine\" title: \"Line\"}\n        {topic meta: \"killLine\" title: \"Line Right\" }\n        {topic meta: \"delLineLeft\" title: \"Line Left\" }\n        {divider: true}\n        {topic meta: \"delWrappedLineLeft\" title: \"Wrapped Line Left\" }\n        {topic meta: \"delWrappedLineRight\" title: \"Wrapped Line Right\" }\n        {divider: true}\n        {topic meta: \"delWordBefore\" title: \"Word Left\" }\n        {topic meta: \"delWordAfter\" title: \"Word Right\" }\n        {divider: true}\n        {topic meta: \"delGroupBefore\" title: \"Group Before\"}\n        {topic meta: \"delGroupAfter\" title: \"Group After\"}\n        {divider: true}\n        {topic meta: \"delCharBefore\" title: \"Character Left\"}\n        {topic meta: \"delCharAfter\" title: \"Character Right\"}\n      ]]}\n      {topic meta: \"indentAuto\" title: \"Auto Indent\"}\n      {topic meta: \"indentLess\" title: \"Indent Left\"}\n      {topic meta: \"indentMore\" title: \"Indent Right\"}\n      {topic meta: \"newlineAndIndent\" title: \"New line and indent\"}\n      {divider: true}\n      {topic meta: \"transposeChars\" title: \"Transpose Characters\" }\n      {divider: true}\n      {topic meta: \"selectAll\" title: \"Select All\"}\n      {topic meta: \"singleSelection\" title: \"Single Selection\"}\n    ]]}\n    {title: \"Go\" children: [[\n      {topic meta: \"goDocStart\" title: \"Document Start\"}\n      {topic meta: \"goDocEnd\" title: \"Document End\"}\n      {divider: true}\n      {topic meta: \"goCharLeft\" title: \"Char Left\"}\n      {topic meta: \"goCharRight\" title: \"Char Right\"}\n      {divider: true}\n      {topic meta: \"goColumnLeft\" title: \"Column Left\" }\n      {topic meta: \"goColumnRight\" title: \"Column Right\" }\n      {divider: true}\n      {topic meta: \"goGroupLeft\" title: \"Group Left\"}\n      {topic meta: \"goGroupRight\" title: \"Group Right\"}\n      {divider: true}\n      {topic meta: \"goWordLeft\" title: \"Word Left\" }\n      {topic meta: \"goWordRight\" title: \"Word Right\" }\n      {divider: true}\n      {topic meta: \"goLineStart\" title: \"Line Start\"}\n      {topic meta: \"goLineStartSmart\" title: \"Smart Line Start\" }\n      {topic meta: \"goLineEnd\" title: \"Line End\"}\n      {divider: true}\n      {topic meta: \"goLineLeft\" title: \"Line Left\" }\n      {topic meta: \"goLineLeftSmart\" title: \"Smart Line Left\" }\n      {topic meta: \"goLineRight\" title: \"Line Right\" }\n      {divider: true}\n      {topic meta: \"goLineUp\" title: \"Line Up\"}\n      {topic meta: \"goLineDown\" title: \"Line Down\"}\n      {divider: true}\n      {topic meta: \"goPageUp\" title: \"Page Up\"}\n      {topic meta: \"goPageDown\" title: \"Page Down\"}\n    ]]}\n    {title: \"Search\" children: [[\n      {topic meta: \"find\" title: \"Find...\"}\n      {topic meta: \"findNext\" title: \"Find Next\"}\n      {topic meta: \"findPrev\" title: \"Find Previous\"}\n      {topic meta: \"clearSearch\" title: \"Clear Search\" }\n      {divider: true}\n      {topic meta: \"replace\" title: \"Replace\"}\n      {topic meta: \"replaceAll\" title: \"Replace All\"}\n      ## {divider: true} appears to only work for XML\n      ## {topic meta: \"toMatchingTag\" title: \"Matching Tag\" }\n    ]]}\n    {title: \"View\" children: [[\n      {topic meta: \"view_keyboard_shortcuts\" title: \"Keyboard Shortcuts\" }\n      {topic meta: \"fold_at_cursor\" title: \"Fold at Cursor\" }\n      {title: \"Theme\" children: [[\n        {title: \"Dark\" children: [[\n          {topic meta: \"set_option,theme,3024-night\" title: \"3024\"}\n          {topic meta: \"set_option,theme,ambiance\" title: \"Ambience\"}\n          {topic meta: \"set_option,theme,ambiance-mobile\" title: \"Ambience (mobile)\"}\n          {topic meta: \"set_option,theme,base16-dark\" title: \"Base 16\"}\n          {topic meta: \"set_option,theme,blackboard\" title: \"Blackboard\"}\n          {topic meta: \"set_option,theme,cobalt\" title: \"Cobalt\"}\n          {topic meta: \"set_option,theme,colorforth\" title: \"Colour Forth\"}\n          {topic meta: \"set_option,theme,erlang-dark\" title: \"Erlang Dark\"}\n          {topic meta: \"set_option,theme,lesser-dark\" title: \"Lesser Dark\"}\n          {topic meta: \"set_option,theme,mbo\" title: \"MBO\"}\n          {topic meta: \"set_option,theme,midnight\" title: \"Midnight\"}\n          {topic meta: \"set_option,theme,monokai\" title: \"Monokai\"}\n          {topic meta: \"set_option,theme,night\" title: \"Night\"}\n          {topic meta: \"set_option,theme,paraiso-dark\" title: \"Paraiso\"}\n          {topic meta: \"set_option,theme,pastel-on-dark\" title: \"Pastel\"}\n          {topic meta: \"set_option,theme,rubyblue\" title: \"Ruby Blue\"}\n          {topic meta: \"set_option,theme,the-matrix\" title: \"The Matrix\"}\n          {topic meta: \"set_option,theme,tomorrow-night-bright\" title: \"Tomorrow Night\"}\n          {topic meta: \"set_option,theme,tomorrow-night-eighties\" title: \"Tomorrow Night Eighties\"}\n          {topic meta: \"set_option,theme,twilight\" title: \"Twilight\"}\n          {topic meta: \"set_option,theme,vibrant-ink\" title: \"Vibrant Ink\"}\n          {topic meta: \"set_option,theme,xq-dark\" title: \"XQ Dark\"}\n          {topic meta: \"set_option,theme,zenburn\" title: \"Zenburn\"}\n        ]]}\n        {title: \"Light\" children: [[\n          {topic meta: \"set_option,theme,3024-day\" title: \"3024\"}\n          {topic meta: \"set_option,theme,base16-light\" title: \"Base 16\"}\n          {topic meta: \"set_option,theme,default\" title: \"Default\"}\n          {topic meta: \"set_option,theme,eclipse\" title: \"Eclipse\"}\n          {topic meta: \"set_option,theme,elegant\" title: \"Elegant\"}\n          {topic meta: \"set_option,theme,mdn-line\" title: \"MDN\"}\n          {topic meta: \"set_option,theme,neat\" title: \"Neat\"}\n          {topic meta: \"set_option,theme,neo>Neo\"}\n          {topic meta: \"set_option,theme,paraiso-light\" title: \"Paraiso\"}\n          {topic meta: \"set_option,theme,solarized\" title: \"Solarized\"}\n          {topic meta: \"set_option,theme,xq-light\" title: \"XQ Light\"}\n        ]]}\n      ]]}\n    ]]}\n    {title: \"Settings\" children: [[\n      {title: \"Keyboard\" children: [[\n        {topic meta: \"set_mode,default\" title: \"Code Mirror\"}\n        {topic meta: \"set_mode,emacs\" title: \"Emacs\"}\n        {topic meta: \"set_mode,sublime\" title: \"Sublime\"}\n        {topic meta: \"set_mode,vim\" title: \"Vi\"}\n      ]]}\n      {divider: true}\n      {topic meta: \"toggle_option,smartIndent\" title: \"Auto-indent\"}\n      {title: \"Indent\" children: [[\n        {topic meta: \"set_option,indentUnit,2\" title: \"2\"}\n        {topic meta: \"set_option,indentUnit,4\" title: \"4\"}\n      ]]}\n      {topic meta: \"toggle_option,autoCloseBrackets\" title: \"Close Brackets\"}\n      {topic meta: \"toggle_option,matchBrackets\" title: \"Match Brackets\"}\n      {topic meta: \"toggle_option,matchTags\" title: \"Match Tags\"}\n      {divider: true}\n      {title: \"Scroll Margin\" children: [[\n        {topic meta: \"set_option,cursorScrollMargin,0\" title: \"0\"}\n        {topic meta: \"set_option,cursorScrollMargin,2\" title: \"2\"}\n        {topic meta: \"set_option,cursorScrollMargin,4\" title: \"4\"}\n      ]]}\n      {topic meta: \"toggle_option,continueComments\" title: \"Comment Continuation\"}\n      {topic meta: \"toggle_option,showTrailingSpace\" title: \"Show Trailing Spaces\"}\n      {topic meta: \"toggle_option,dragDrop\" title: \"Toggle Drag and Drop\"}\n      {topic meta: \"toggle_option,lineNumbers\" title: \"Toggle Line Numbers\"}\n      {topic meta: \"toggle_option,lineWrapping\" title: \"Toggle Line Wrap\"}\n    ]]}\n  ]])\n  (ref listener (lambda [cm data]\n    (ref args (data.item.meta.split \",\"))\n    (ref command (args.shift))\n    (args.unshift cm)\n    ((get CodeMirror.commands command).apply CodeMirror args)\n  ))\n  (ref open (lambda [owner wrapper]\n    (ref cm (stateful.morph! (CodeMirror wrapper options)))\n    (cm.update! {listener: (lambda [data] (listener cm data))})\n    (message.send \"CodeMirror-menu\" menu)\n    (message.listen (+ owner \"/\" topic) cm.listener)\n    (return cm)\n  ))\n  (ref close (lambda [cm]\n    (message.remove cm.listener)\n  ))\n  (ref spaces \"                \")\n  (ref extra-commands {\n    view_keyboard_shortcuts: (lambda [cm]\n      (ref keys [[]])\n      (ref one-map (lambda [map]\n        ((Object.keys map).forEach (lambda [key]\n          (cond\n            (is key \"fallthrough\") (do\n                (ref more (get map key))\n                (cond (is (typeof more) \"string\") (ref more [[more]]))\n                (more.forEach (lambda [map]\n                  (one-map (get CodeMirror.keyMap map))))\n              )\n            (else) (keys.push (+ key \": \" (get map key)))\n          )\n        ))\n      ))\n      (one-map cm.options.extraKeys)\n      (ref core (stateful.morph! (get CodeMirror.keyMap cm.options.keyMap)))\n      (cond (not core.fallthrough)\n        (core.update! {fallthrough: CodeMirror.keyMap.default.fallthrough}))\n      (one-map core)\n      (window.open\n        (+ \"data:text/html,\" (encodeURIComponent (keys.join \"<br>\")))\n        \"Keys\" \"width=300,height=600\")\n    )\n    fold_at_cursor: (lambda [cm]\n      (cm.foldCode (cm.getCursor))\n    )\n    toggle_option: (lambda [cm name]\n      (CodeMirror.commands.set_option cm name (not (cm.getOption name)))\n    )\n    set_option: (lambda [cm name value]\n      (cm.setOption name value)\n      (options.update! name value)\n      (update-options)\n    )\n    set_mode: (lambda [cm mode]\n      (CodeMirror.commands.set_option cm \"keyMap\" mode)\n    )\n    auto_complete: (lambda [cm]\n      (ref not-only (lambda []\n        (ref result (CodeMirror.hint.anyword.apply null arguments))\n        (return-if (isnt result.list.length 1) result)\n        (ref size (- result.to.ch result.from.ch))\n        (return-if (isnt (do (get list 0).length) size) result)\n        (return ((stateful.morph! result) {list: [[]]}))\n      ))\n    )\n  })\n  ## Editing modes dependent on file type\n  (ref mode-extensions {\n    apl: \"apl\" as3: \"apl\" asf: \"apl\"\n    c: \"clike\" cpp: \"clike\" h: \"clike\" cs: \"clike\"\n    chh: \"clike\" hh: \"clike\" h__: \"clike\" hpp: \"clike\"\n    hxx: \"clike\" cc: \"clike\" cxx: \"clike\" c__: \"clike\"\n    \"c++\": \"clike\" stl: \"clike\" sma: \"clike\"\n    java: \"clike\" scala: \"clike\" clj: \"clojure\"\n    cpy: \"cobol\" cbl: \"cobol\"cob: \"cobol\"\n    coffee: \"coffeescript\" coffeescript: \"coffeescript\"\n    \"gwt.coffee\": \"coffeescript\"\n    vlx: \"commonlisp\" fas: \"commonlisp\" lsp: \"commonlisp\"\n    el: \"commonlisp\" css: \"css\" less: \"css\"\n    dl: \"d\" d: \"d\" diff: \"diff\" dtd: \"dtd\" dylan: \"dylan\"\n    ecl: \"ecl\" e: \"eiffel\" erl: \"erlang\" hrl: \"erlang\"\n    f: \"fortran\" for: \"fortran\" FOR: \"fortran\"\n    f95: \"fortran\" f90: \"fortran\" f03: \"fortran\"\n    gas: \"gas\" gfm: \"gfm\" feature: \"gherkin\" go: \"go\"\n    groovy: \"groovy\" \"html.haml\": \"haml\" hx: \"haxe\"\n    lhs: \"haskell\" gs: \"haskell\" hs: \"haskell\"\n    asp: \"htmlembedded\" jsp: \"htmlembedded\"\n    ejs: \"htmlembedded\" http: \"http\"\n    html: \"htmlmixed\" htm: \"htmlmixed\" \".py.jade\": \"jade\"\n    js: \"javascript\" json: \"javascript\" jinja2: \"jinja2\"\n    jl: \"julia\" ls: \"livescript\" lua: \"lua\"\n    markdown: \"markdown\" mdown: \"markdown\" mkdn: \"markdown\"\n    md: \"markdown\" mkd: \"markdown\" mdwn: \"markdown\"\n    mdtxt: \"markdown\" mdtext: \"markdown\"\n    mdx: \"mirc\" dcx: \"mirc\"\n    ml: \"mllike\" fs: \"mllike\" fsi: \"mllike\"\n    mli: \"mllike\" fsx: \"mllike\" fsscript: \"mllike\"\n    nginx: \"nginx\" nt: \"ntriples\" mex: \"octave\"\n    pas: \"pascal\" pegjs: \"pegjs\" ps: \"perl\"\n    php: \"php\" \"lib.php\": \"php\"\n    pig: \"pig\" ini: \"properties\" properties: \"properties\"\n    pp: \"puppet\" py: \"python\" q: \"q\" r: \"r\"\n    rpm: \"rpm\" \"src.rpm\": \"rpm\" rst: \"rst\" rb: \"ruby\"\n    rs: \"rust\" sass: \"sass\" scm: \"scheme\" ss: \"scheme\"\n    sh: \"shell\" sieve: \"sieve\"\n    sm: \"smalltalk\" st: \"smalltalk\" tpl: \"smartymixed\"\n    solr: \"solr\" sparql: \"sparql\" sql: \"sql\"\n    stex: \"stex\" tex: \"stex\" tcl: \"tcl\" tw: \"tiddlywiki\"\n    tiki: \"tiki\" toml: \"toml\" ttl: \"turtle\" vb: \"vb\"\n    bas: \"vbscript\" vbs: \"vbscript\" vtl: \"velocity\"\n    v: \"verilog\" xml: \"xml\"\n    xquery: \"xquery\" xq: \"xquery\" xqy: \"xquery\"\n    yaml: \"yaml\" yml: \"yaml\" z80: \"z80\" asm: \"z80\"\n  })\n  (ref saved-mode-extensions localStorage.CodeMirror-mode-extensions)\n  (cond saved-mode-extensions (ref mode-extensions\n    (dict.merge mode-extensions saved-mode-extensions)\n  ))\n\n  (ref set-mode (lambda [cm name]\n    (ref try-mode (lambda [exts]\n      (ref ext (exts.join \".\"))\n      (return? (get mode-extensions ext))\n      (return-if (get CodeMirror.modes ext) ext)\n      (return false)\n    ))\n    (ref mode ((lambda []\n      (ref parts (name.split \".\"))\n      (cond (> parts.length 2) (return? (try-mode (parts.slice -2))))\n      (return? (try-mode (parts.slice -1)))\n      (return  \"text\")\n    )))\n    (cm.setOption \"mode\" mode)\n    (CodeMirror.autoLoadMode cm mode)\n  ))\n\n  ## CodeMirror lispz mode\n  (ref init-lispz-mode (lambda []\n  (CodeMirror.defineSimpleMode \"lispz\" {\n    start: [[\n      {regex: '/\"\"/'                                 token: \"string\"}\n      {regex: '/\"/'                   next: \"string\" token: \"string\"}\n      {regex: '/\\'(?:[^\\\\]|\\\\.)*?\\'/'                token: \"variable-2\"}\n      {regex: '/###/'                next: \"comment\" token: \"comment\" }\n      {regex: '/(\\()([!\\s\\(\\[\\{\\)\\}\\]]*?!)/'\n                                indent: true  token: [[null \"error\"]]}\n      {regex: '/(\\()([^\\s\\(\\[\\{\\)\\}\\]]+)/'\n                                indent: true  token: [[null \"keyword\"]]}\n      {regex: '/true|false|null|undefined|debugger/' token: \"atom\"}\n      {regex: '/0x[a-f\\d]+|[-+]?(?:\\.\\d+|\\d+\\.?\\d*)(?:e[-+]?\\d+)?/i'\n                                                     token: \"number\"}\n      {regex: '/## .*/'                              token: \"comment\"}\n      {regex: '/[\\{\\(\\[]/'        indent: true}\n      {regex: '/[\\}\\)\\]]/'      dedent: true}\n      {regex: '/[^\\s\\(\\{\\[\\)\\]\\}]+/'                 token: \"variable\"}\n      {regex: '/\\s+/' next: \"start\"}\n    ]]\n    comment: [[\n      {regex: '/###/' token: \"comment\" next: \"start\"}\n      {regex: '/.*/' token: \"comment\"}\n    ]]\n    string: [[\n      {regex: '/[^\\\\]\"/' token: \"string\" next: \"start\"}\n      {regex: '/./' token: \"string\"}\n    ]]\n    meta: { lineComment: \"## \" dontIndentStates: [[\"comment\" \"string\"]] }\n  })\n  (CodeMirror.defineMIME \"text/lispz\" \"lispz\")\n  ## Update htmlmixed to understand lispz scripts\n  (ref mimeModes (stateful.morph! CodeMirror.mimeModes))\n  (cond (is (typeof (get mimeModes \"text/html\")) \"string\")\n        (mimeModes.update! \"text/html\" {name: \"htmlmixed\"}))\n  (ref mode (stateful.morph! (get mimeModes \"text/html\")))\n  (cond (not mode.scriptTypes) (mode.update! {scriptTypes: [[]]}))\n  (mode.scriptTypes.push {matches: '/^text\\/lispz$/' mode: \"lispz\"})\n  (mimeModes.update! {htmlmixed: mode})\n\n  (ref run_selection (lambda [cm]\n    (ref mode     (cm.getModeAt (cm.getCursor)))\n    (ref compiler (get compilers mode.name))\n    (cond (not compiler) (return CodeMirror.Pass))\n\n    (cond (cm.somethingSelected) (ref source (cm.doc.getSelection))\n          (else)                 (ref source (cm.doc.getValue))\n    )\n    (ref js (compiler.compile source name))\n    (message.send \"code-editor/run/js\" {\n      name source js: (compilers.to-string js)\n    })\n    (message.send \"code-editor/run/output\" {\n      name source output: (compilers.run js)\n    })\n  ))\n  ### spec: codemirror >> Compiling Code\n    To send the compiler output to anywhere but the console, use a copy of the\n    following code.\n      (message.listen \"code-editor/compile/js\" (lambda [compiled]\n        ## compiled: {name source js}\n      ))\n  ###\n  (message.listen \"code-editor/compile/js\" (lambda [compiled]))\n  ### spec:\n    To process the console output from running compiled code:\n      (message.listen \"code-editor/run/output\" (lambda [run]\n        ## run: {name source output}\n      ))\n  ###\n  (message.listen \"code-editor/run/output\" (lambda [run]\n    ## (console.log run.output)\n  ))\n\n  (ref lisp-modes {lispz: true clojure: true commonlisp: true scheme: true})\n\n  (ref subpart (lambda [cmd opt]\n    (return (lambda [cm]\n      (return CodeMirror.Pass) ## make a configuration option\n      (ref mode (cm.getModeAt (cm.getCursor)))\n      (cond (get lisp-modes mode.name)  ((get subpar.core cmd) cm opt)\n            (else)                      (return CodeMirror.Pass)\n      )\n    ))\n  ))\n  (CodeMirror.commands.update! {\n    ## paredit keys that defer if not in lisp code\n    subpar_backward_delete:        (subpart \"backward_delete\")\n    subpar_forward_delete:         (subpart \"forward_delete\")\n    subpar_forward_delete:         (subpart \"forward_delete\")\n\n    subpar_open_bracket:           (subpart \"open_expression\" \"()\")\n    subpar_open_square_bracket:    (subpart \"open_expression\" \"[]\")\n    subpar_open_braces:            (subpart \"open_expression\" \"{}\")\n\n    subpar_close_bracket:          (subpart \"close_expression\" \")\")\n    subpar_close_square_bracket:   (subpart \"close_expression\" \"]\")\n    subpar_close_braces:           (subpart \"close_expression\" \"}\")\n\n    subpar_double_quote:           (subpart \"double_quote\")\n\n    subpar_forward:                (subpart \"forward\")\n    subpar_backward:               (subpart \"backward\")\n    subpar_backward_up:            (subpart \"backward_up\")\n    subpar_forward_down:           (subpart \"forward_down\")\n    subpar_backward_down:          (subpart \"backward_down\")\n    subpar_forward_up:             (subpart \"forward_up\")\n\n    subpar_backward_barf:          (subpart \"backward_barf\")\n    subpar_backward_barf:          (subpart \"backward_barf\")\n    subpar_backward_barf:          (subpart \"backward_barf\")\n\n    subpar_forward_barf:           (subpart \"forward_barf\")\n    subpar_forward_barf:           (subpart \"forward_barf\")\n\n    subpar_backward_slurp:         (subpart \"backward_slurp\")\n    subpar_backward_slurp:         (subpart \"backward_slurp\")\n    subpar_backward_slurp:         (subpart \"backward_slurp\")\n\n    subpar_forward_slurp:          (subpart \"forward_slurp\")\n    subpar_forward_slurp:          (subpart \"forward_slurp\")\n\n    subpar_splice_delete_backward: (subpart \"splice_delete_backward\")\n    subpar_splice_delete_forward:  (subpart \"splice_delete_forward\")\n    subpar_splice:                 (subpart \"splice\")\n    subpar_indent_selection:       (subpart \"indent_selection\")\n\n    run_selection:                 run_selection\n  })\n  ))\n\n  ## elm script has a bug - restore for a later version.\n  ## tern is for javascript features - overrides console.log\n  (ref build-base (lambda [target-repo]\n    (return (github.build target-repo \"codemirror\" [[\n      {repo: \"codemirror/CodeMirror\" files: [[\n        {base: \"lib\" include: '/codemirror\\.(js|css)$/'}\n        {base: \"addon/mode\" include: '/^simple.js$/'}\n        {base: \"keymap\"}\n        {base: \"addon\" exclude: '/test.js$|node.js$|standalone.js$|\\/tern\\//'}\n        {base: \"mode/htmlmixed\" include: '/css$|js$/'}\n        {base: \"mode/javascript\" include: '/css$|js$/'}\n        {base: \"mode/css\" include: '/css$|js$/'}\n      ]]}\n      {repo: \"achengs/subpar\" files: [[\n        {base: \"resources/public/js\" include: '/subpar.core.js/'}\n      ]]}\n    ]]))\n  ))\n  (ref build-themes (lambda [target-repo]\n    (return (github.build target-repo \"codemirror-themes\" [[\n      {repo: \"codemirror/CodeMirror\" files: [[\n        {base: \"theme\"}\n      ]]}\n    ]]))\n  ))\n  (ref build-mode (lambda [target-repo]\n    (return (github.build target-repo \"codemirror-modes\" [[\n      {repo: \"codemirror/CodeMirror\" files: [[\n        {base: \"mode\" exclude: '/htmlmixed|javascript|css|elm.js$|test.js$/'}\n      ]]}\n    ]]))\n  ))\n  (ref build (lambda [target-repo]\n    (return (promise.all build-base build-themes build-mode))\n  ))\n\n  (lispz.css \"ext/codemirror.css\")\n  (ref loaded (net.script \"ext/codemirror.js\"(lambda [] (return window.CodeMirror))))\n  (when loaded []\n    (ref modes-loaded (net.script \"ext/codemirror-modes.js\" (lambda [] (return CodeMirror.modes.z80))))\n    (when modes-loaded []\n      (stateful.morph! CodeMirror.commands)\n      (CodeMirror.commands.update! extra-commands)\n      (init-lispz-mode)\n      (export {options open close set-mode build})\n    )\n    (catch loaded [] (export {build}))\n  )\n  (delay 100 (lispz.css \"ext/codemirror-themes.css\"))\n)\n"

lispz_modules['compilers']="  ### spec: Compilers\n    The compiler entry for each language is a function that is called with the\n    name of the source code followed by the source itself.\n\n        (using [compilers]\n          (ref js (compilers.lispz.compile \"(console.log \\\"Hi\\\")\" \"name\"))\n          (console.log (compilers.to-string js))\n          (console.log (compilers.run js))\n        )\n  ###\n  (export {\n    to-string: (lambda [js] (return (js.join \"\\n\")))\n    run:       (lambda [js] (return (js.map  eval)))\n\n    lispz: { compile: lispz.compile }\n  })\n"

lispz_modules['core']="### spec: basics >> Syntax\n    One of the really cool things about a lisp language is that there is very little syntax.\n    On the flip-side one of the disadantages of minimal syntax is the need for work-arounds -\n    and by definition a work-around is syntax. The core for lispz is 4 sorts of lists\n\n        (action a b c ...) ## functional list\n        [a b c]            ## raw list (typically parameters for a function definition)\n        [[a b c]]          ## an array list\n        {a: 1 b c}         ## an associative array or dictionary\n\n    Named references are created using 'var'. They exist only inside the module or function\n    in which they are first defined. This includes inner functions, but if the inner function\n    defines a 'var' of the same name it will be distinct and hide the outer reference.\n\n        (ref ref 23)\n###\n### spec: basics >> Operators\n    A pure lisp system does not have any operators. Everything is a function or a macro.\n    Because Lispz compiles to JavaScript, all unary and many binary operators are exposed.\n\n        debugger           ## JS==> debugger\n        (+ 2 3 4)          ## JS==> (2 + 3 + 4)\n\n    While unary operators are transparent to Lispz and convert directly, binary operators\n    are expanced with macros. Some operators have convenience names.\n\n        (and a b c)        ## JS==> a && b && c\n        (or a b c)         ## JS==> a || b || c\n        (is a 12)          ## JS==> a === 12\n        (isnt a 12)        ## JS==> a !== 12\n\n    Thanks to JavaScript 'and' and 'or' short-circuit - meaning that they will stop when\n    they find truth for and or false for or.\n\n        (return (or value \"default value string\"))\n###\n### spec: developer >> debug\n  `(debug)` is a development helper macro. It will print a stack trace\n  and the contents of any parameters on the console. If you left-align it\n  then it will be easy to find later to delete.\n###\n### spec: debug\n  (describe \"(debug [p1, p2, ...]) ## macro to display stack and messages\" (lambda []\n    (it \"displays a stack trace and the parameters provided\" (lambda []\n      (spy-method console trace)\n      (debug \"multiple\" \"parameters\")\n      ((expect console.trace).toHaveBeenCalled)\n    ))\n  ))\n###\n(macro debug [*msg] (console.trace (#join ',' *msg)))\n\n### spec: basic >> do\n###\n(macro do [*body] *body)\n\n### spec: basic >> References\n  @TODO\n###\n(macro ref [*list] (#join '' 'var ' (#pairs *list '=' ',') ';'))\n\n### spec: basic >> References >> Global References\n  @TODO\n###\n(macro global [name value]\n  (#join '' 'lispz.globals.' name '=' value)\n  (macro name [&params] (#join '' 'lispz.globals.' name '(' &params ')')))\n\n### spec: basic >> Functions\n\n    As I am sure I mentioned before the default lisp/lispz element is the list surrounded by brackets.\n    In most cases in lisp and all cases in list the first element of the list is a reference to a function.\n    In JavaScript perspective this makes a lispz list a JavaScript function where the first element\n    is the reference and the rest a list of parameters.\n\n    This allows us to call JavaScript functions at any time we can get to them.\n\n        (console.log \"This is the\" count \"log message\")\n\n    Anonymous functions are created with the function key-word\n    (which is actually a macro - confused yet?). The parameters are referenced\n    in another list form - that between square brackets. For later use, assign\n    it to or in a variable. A function will return undefined\n    unless a specific return statement is used.\n\n        (ref +1 (lambda [number] (return (+ number 1))))\n        ...\n        a = 12\n        (console.log a (+1 a))  ## 12 13\n###\n### spec: function\n  (describe \"(lambda [p1 p2 ...] ...) ## function definition\" (lambda []\n    (it \"defines an anonymous function that can be called\" (lambda []\n      (ref f1 (lambda [a b] (return (* a b))))\n      (ref result (f1 2 3))\n      ((expect result).toBe 6)\n    ))\n    (it \"has optional parameters\" (lambda []\n      (ref f2 (lambda (return 333)))\n      (ref result (f2))\n      ((expect result).toBe 333)\n    ))\n  ))\n  (describe \"(lambda [p1 p2 ...] ...) ## alternate function definition\" (lambda []\n    (it \"defines an anonymous function that can be called\" (lambda []\n      (ref f1 (lambda [a b] (return (* a b))))\n      (ref result (f1 2 3))\n      ((expect result).toBe 6)\n    ))\n    (it \"has optional parameters\" (lambda []\n      (ref f2 (lambda [] (return 222)))\n      (ref result (f2))\n      ((expect result).toBe 222)\n    ))\n  ))\n###\n\n### spec: basic >> Retrieval - can be used for objects and arrays\n  @TODO\n###\n(macro get [dict *key] (#join '' dict '[' (#join '][' *key) ']'))\n\n### spec: conditional processing ###\n(macro empty? [list] (not list.length))\n(macro defined? [field] (!== (typeof field) \"undefined\"))\n\n### spec: basics -- Conditionals\n    Lispz boasts only one traditional conditional operator plus a number of\n    macros for conditional assignment and function return. The operator,\n    cond takes pairs of lists where the first is the condition and the\n    second the action. Evaluation stops after the first true condition.\n    There is an else macro that evaluates to true to catch situations not\n    covered specifically. The default? function takes a value and returns\n    it if it exists and is not empty, otherwise it returns the default value.\n\n        (cond (is v \"One\")  (return 1)\n              (not v)       (return 0)\n              (else)        (return -1)\n        )\n\n    Because conditionals work with list pairs, it is necessary to wrap the actions\n    if there are more than one. Lispz provides 'do' for that.\n\n        (cond ok? (do (finish-up) (return true)))\n\n    The standard conditional tests (< > <= >=, etc) are augmented by aliases (is isnt not).\n###\n(macro cond [*list]\n  (#join '' 'switch(false){case !' (#pairs *list  ':' ';break;case !') '}')\n)\n(macro else [] 'true')\n\n### spec: basic >> functions >> Variable Parameter Lists\n    Like JavaScript, lispz function definitions specify a fixed number of arguments.\n    To gain access to the full list of arguments, use *arguments, with a starting index.\n\n        (lambda [type rest] (console.log type \"=\" (*arguments 1)))\n###\n(macro *arguments [from] (lispz.slice.call arguments from))\n\n### spec: basics >> functions >> Return if ...\n    While return-if has aconditional pair. If the first is true the second is returned.\n\n        (return-if (not calculated-value) default-value)\n###\n(macro return-if [test value] (cond test (return value)))\n\n### spec: basic >> state -- Stateful Containers\n  State is the elephant in the room - particularly in the functional programming paradigm.\n  When you have state that can be changed from outside, then any function that reads from it\n  no longer has referential integrity. This means that identical calls may not return identical\n  results.\n\n  But we need state. Without it the system is fully enclosed without input or output.\n  A referentially integrous :) function can be replaced by it's return value,\n  so why ever run it?\n\n  The aim is to be like any machine with the internals always working the same.\n  Think of a clock. The input is someone setting the time.\n  After that the external gearing, etc is meant to work consistently so that the\n  time advances at the correct pace. The current time is state. You can build and\n  test the entire device without the state. It is on the very outside. Once the\n  mechanism is working as expected, add a clock face and hands. Changing the hands\n  is input and displaying the time output. The latter can be considered a\n  side-effect.\n\n  The state container for lispz relies on polite access, not enforced rules. By custom an\n  function that changes ends in an exclamation mark. Use this to highlight review.\n  The default builder return an empty JavaScript dictionary.\n\n      (describe \"Create a new stateful object -- (ref context (stateful seed))\" (lambda []\n        (ref options (stateful {name: \"undefined\" address: \"nowhere\"}))\n        (it \"is able to read members directly -- context.member\" (lambda []\n          ((expect options.name).toBeEqual \"undefined\")\n        ))\n        (it \"is able to read members by key -- context[key]\" (lambda []\n          ((expect options[\"name\"]).toBeEqual \"undefined\")\n        ))\n        (it (+ \"is able to update a dictionary with changes -- \"\n          \"(context.update! {a: dictionary})\") (lambda []\n            (options.update! {name: \"Barney Rubble\" address: \"Next Door\"})\n            ((expect options.name).toBeEqual \"Barney Rubble\")\n            ((expect options.address).toBeEqual \"Next Door\")\n        )\n          )\n      ))\n\n  Javascript lives in the world of objects as well as functions. Sometimes to work in this world\n  objects need to be labelled as stateful. Use this approach as sparingly as possible. Always\n  consider other alternatives first.\n\n      (describe \"Creating a stateful reference -- (ref context (stateful.morph! this))\" (lambda []\n        (ref that {a: 1 b: 2})\n        (ref context (stateful.morph! that))\n        (it \"looks the same as the original object\" (lambda []\n          ((expect context.a).toBeEqual that.a)\n        ))\n        (it \"reflects changes to the original object\" (lambda []\n          (context.update! {a: 99})\n          ((expect that.a).toBeEqual 99)\n        ))\n      ))\n\n  Be polite and use this container responsibly. Adding protection adds overhead.\n  If you want to cheat, then on your head be it.\n###\n\n(macro #set! [to-change! value] (#join '' to-change! '=' value ';'))\n(ref #morph! (lambda [obj]\n  (return-if obj.update! obj) ## in case we have done it before\n  (Object.defineProperties obj {\n    update!: {value: (lambda [update]\n      (ref context this)\n      (cond (is arguments.length 1)\n        ((Object.keys update).forEach (lambda [key]\n          (#set! (get context key) (get update key))\n        ))\n      (else) (do\n        (ref list (*arguments 0))\n        (list.forEach (lambda [value idx] (cond (% idx 2) (do\n          (ref key (get list (- idx 1)))\n          (#set! (get context key) value)\n        ))))\n      ))\n    )}\n  })\n  (return obj)\n))\n(global stateful (lambda [seed]\n  (ref obj (#morph! (new Object)))\n  (cond seed (obj.update! seed))\n  (return obj)\n))\n(global stateful.morph! #morph!)\n\n(macro closure [params *body] (#join '' '(lambda(' params '){' *body '})(' params ')'))\n(macro return  [value] (#join '' 'return ' value '\\n'))\n\n### spec: basics >> functions >> Return if not false\n    As a functional language, most decisions are made by small single-focus functions.\n    As such, conditional returns are a useful shortcut. To this end, return? returns\n    a value if it not false, null or an empty container.\n\n        (return? calculated-value)\n\n    > The return? macro assigns the supplied value to a temporary reference\n    > before using the reference. This stops the value from being evaluated\n    > twice if it is not a simple reference.\n###\n(macro return? [value] (do (ref v value) (cond v (return v))))\n\n(macro new [cls *params] (#join '' '(new ' cls '(' (#join ',' *params) '))'))\n\n### spec: functions >> chaining -- Chaining functions\n  In a functional style we often call multiple functions to incrementally move\n  from problem to solution. Each step takes the results from the step before and\n  transforms it. It is allways a good idea to have short functions that do one\n  thing - for testing, maintenance and readability. Speaking of readability,\n  chain makes the sequence of events clear.\n\n      (parse-titles (lambda [sections] (return (sections.map ...)))\n      (sort-titles  (lambda [sections] (return (sections.map ...)))\n      (merge-titles (lambda [sections] (return (sections.map ...)))\n\n      ((chain parse-titles sort-titles merge-titles) sections)\n###\n### spec: chain\n  (describe \"chain: run each function with the results from the one before\" (llbda []\n    (it \"(chain f1 f2 ...)\" (lambda []\n      (ref f1 (lambda [a] (return 2)))\n      (ref f2 (lambda [a] (return (+ a 3))))\n      (ref f3 (lambda [a] (return (* a 10))))\n      ((expect (chain f1 f2 f3)).toBe 50)\n    ))\n  ))\n###\n(global chain (lambda [] (ref functions (*arguments 0))\n  (ref link (lambda [arg func] (return (func arg))))\n  (return (lambdas.reduce link null))\n))\n\n### spec: basics >> Operators ###\n(macro not [value] (#join '' '!(' value ')'))\n(macro instance-of [type obj] (#join '' '(' obj ' instanceof ' type ')'))\n\n### spec: basics >> Iteration\n\nIn the functional way of programming, loop style iteration is (almost) never needed.\nBecause of the 'almost' and to provide for those week on functional will,\nlispz provides one loop operator. It takes a test and a body.\n\n    (while (not (result)) (look-again))\n\nIn this case both are functions. Lispz furthers the functional cause by making\nassignment difficult and ugly.\n\nOf course the need for iteration remains no matter what programming discipline you follow.\nIn the functional world it is filled by ... you guessed it ... functions.\nFor arrays, JavaScript provides an excellent set documented in [List Processing](list-processing.md).\n###\n## Javascript does not (yet) have tail recursion - it is scheduled for 2016\n(macro while [test *body] (#join '' 'while(' test '){' *body '}'))\n\n### spec: List and dictionary manipulation ###\n(macro length [list] (#join '' list '.length'))\n(macro first [list] (get list 0))\n(macro rest [list] (list .slice 1))\n(macro last [list] (get (list .slice -1) 0))\n(global slice (lambda [list from to]  (return (lispz.slice.call list from to))))\n\n### spec: Modules >> Module Structure\n\nAll Lispz source files are modules. They are loaded on first request by client code. Subsequent requests returns a cached reference to the exports.\n###\n### spec: Modules >> Module Usage\n\nEvery module must include an export statement including a dictionary of symbols to be exported\n\n    (ref one (lambda [] ...)\n    (ref two 22)\n    (export {one two})\n\nIf a module requires other asynchronous operations it can defer the export statement until they are ready.\n\n    (lispz.script \"ext/jquery.js\" (lambda [] (export { ... })))\n\nTo access external modules, wrap your code in 'using'. Data and functions exported from a module are linked to the import name.\n\n    (using [dict net list]\n      (ref combined (dict.merge d1 d2 d3))\n    )\n\n...and that is all there is to it.\n###\n(macro using [modules *on_ready] (lispz.load (#join '' '\"' modules '\"')\n  (lambda [] (#requires modules) *on_ready)\n))\n### Modules must export to continue processing ###\n(macro export [exports] (#join '' '__module_ready__(' exports ')'))\n\n(macro delay [ms *body] (setTimeout (lambda [] *body) ms))\n(macro yield [*body] (delay 0 *body))\n###\n# Use contain to contain state changes. Any var inside a contain can be changed\n# no matter how many times the contain is called concurrently. It is also allows\n# the passing in of variables that are effectively copied and cannot be changed\n# from outside.\n###\n(macro contain [contain#args *contain#body]\n  ((lambda contain#args *contain#body) contain#args)\n)\n###\n# Return a random integer between 0 and the range given\n###\n(global random (lambda [range] (return (Math.floor (* (Math.random) range)))))\n\n### spec: async -- Asynchronous Support\nThere are three kinds of people in the world - those that can count and those who can't. And there are two ways to treat asynchronous events at the language/platform level. Either stop the process while waiting for something...\n\n    (while (read) (print)) ## this won't work in a JavaScript engine\n\n...or provide actions to do when an event happens...\n\n    (read (lambda [] (print))) ## Call an anonymous function when event fires.\n\nFor some reason the first approach is called synchronous. In practice it means you can't do anything until the event you are waiting for occurs. Systems that work this way compensate by making it easy to create multiple threads - allowing code to appear to work in parallel. The developer does not have much control on when the processor switches from one thread to another. This means that data can appear to change like magic between two instructions on one thread because another thread has been active. Not only does this make referential integrity impossible, but it makes for the need for locks and semaphores and other mind-bending and program-slowing mechanisms.\n\nBy contrast the second approach is called asynchronous. It takes the mind-bending from an apparently optional later process and makes it important from the start. This is because we humans have been trained to think in a synchronous manner when solving problems or writing programs.\n\nOne more tale before getting back to lispz. Microsoft Windows prior to '95 used what they called \"cooperative multi-processing\". This meant that the operating system never took the CPU away from a program without the program first giving permission. Hmmm, very similar to a JavaScript machine based on asynchronous methods, isn't it. The complaint then is that badly behaved applications could freeze the UI by not releasing the CPU often enough. Since JavaScript runs on the UI thread it can also freeze the UI in the same way. A well behaved program, on the other hand, is more efficient and far easier to write.\n###\n### spec: async >> Callbacks\nCallbacks provide the simplest mechanism for asynchronous responses. Any function that want to initiate something that will complete at an undetermined later time can take a reference to a function to call at that time (or thereabouts)\n\n    (delay 2000 (lambda [] (console.log \"delay over\")))\n\nMany callbacks producers follow the node-js approach of providing error and response parameters.\n\n    (read my-url (lambda [err response]\n      (cond err (throw \"read failed\"))\n      (return response.text)\n    )\n\n## Benefits\n1. Very simple with minimal overheads\n2. Can be called many times\n3. Cause and effect are sequential in code\n\n## Disadvantages\n1. Empiric in nature\n2. Highly coupled\n3. Leads to hard-to-read code in more complex event sequences.\n4. Exceptions are lost if not processed within the callback\n5. Actions triggered before the callback is set are lost\n###\n### spec: async >> Promises\nES2015 has introduced native promises into the language. As of November 2015 it\nis available on all mainstream browsers. Even if not, there are shims that work\nin an identical(ish) manner.\n\nFunctions that want to return information in an asynchronous manner return a\npromise object. This object can be passed around and whoever needs the data it\nwill or does contain can ask for it with a callback function.\n\nA function that creates a promise uses the 'promise' keyword instead of 'function'.\nWhen the promise is fulfilled it will call (resolve-promise data). If it fails\nit calls (reject-promise err).\n\n    (ref read (promise [addr param1 param2]\n      (http-get (+ addr \"?&\" param1 \"&\" param2) (lambda [err response]\n        (return-if err (reject-promise err))\n        (resolve-promise response)\n      ))\n    ))\n\nIn _promise_ the function is run immediately. In many situations it is nice to\nhave a promise that only runs when it is first needed. You may, for example,\ncreate a file object that may or may not ever ask a server for the contents.\n\n    (ref file {\n      read: (promise.deferred [addr param1 param2]\n        (http-get (+ addr \"?&\" param1 \"&\" param2) (lambda [err response]\n          (return-if err (reject-promise err))\n          (resolve-promise response)\n        ))\n      )\n    })\n    ...\n    ## This will trigger a server request...\n    (when file.read (lambda [response] (console.log response)))\n\nBecause it is common to turn a callback into a promise, lispz provides a helper\nmacro. The following provides identical functionality. One of the benefits of a\nlanguage with real macros :)\n\n    (ref read (promise.callback [addr param1 param2]\n      (http-get (+ addr \"?&\" param1 \"&\" param2) callback)\n    ))\n\nNow that we have a promise, we can use it just like a callback if we want:\n\n    (ref reading (read \"http://blat.com/blah\" 1 2))\n    (when reading (lambda [result] (return (process result))))\n    (catch reading (lambda [err] (console.log \"ERROR: \"+err)))\n\nEven without further knowledge, promises clean up errors and exceptions. If you do not catch errors, exceptions thrown in the asynchronous function can be caught in the code containing the promise.\n\nThe power of promises starts to become clearer with the understanding that 'when' can return a promise.\n\n    (ref processed (when reading (lambda [result] (return (process result)))))\n    (when processed (console.log \"All done\"))\n\nSo far this adds very little at the cost of a relatively large supporting library. if we start thinking functionally instead of sequentially, promises provides a way to clarify our code (a little).\n\n    # change branch we will be working with\n    (ref update-mode (github.update lispz-repo))\n    # Once in update mode we can retrieve lispz.js and ask for a list of other file in parallel\n    (ref lispz-js    (when update-mode [] (read-file \"lispz.js\")))\n    (ref listing     (when update-mode [] (github.list-dir lispz-repo \"\")))\n    # We can only sort files once we have a listing from the server\n    (ref groups      (when listing [files] (group files)))\n    # but then we can process the different groups in parallel (retrieving source as needed)\n    (ref modules     (when groups [files] (return (build-modules files.modules))))\n    (ref riots       (when groups [files] (return (build-riots files.riots))))\n\n    # Now to pull it all together into a single file\n    (ref  source     [[\"window.lispz_modules={}\"]])\n    # promise.sequence forces the order.\n    (ref all-loaded  (promise.sequence\n      (when modules  [sources] (source.concat sources) (return (promise.resolved))\n      # lisp.js is added after modules and lisp-js are resolved\n      (when lispz-js [code]    (source.push code) (return (promise.resolved))\n      # riot tags are added after lisp.js and lisp-js is added and riots promise is resolved\n      (when riots    [sources] (source.concat sources) (return (promise.resolved))\n    ))\n    # Only write the result when the sequence above is complete\n    (return (when all-loaded [] (write-lispz)))\n    # returns a promise that is complete once the results are written\n\nIn summary we have\n\n1. **(promise [params...] ...)** is a macro that generates a function that returns a promise\n  1. **(resolve-promise results...)** sets results used in **when [results...] ...** macros\n  2. **(reject-promise err)** sets results used in **(catch [err] ...)** macros\n2. **(promise.callback [params...] ...)** is a macro to creates promises from traditional callbacks\n  1. **callback** is a function reference to use where callbacks would normally be defined\n3. **(promise.resolved results)** Will return a promise that will always provide the results supplied to when. Use it to turn a synchronous function into a promise to use in sequences.\n4. **(when a-promise [results...] ...)** is a macro that works like a function where the function body is executed with the results supplied once (and if) the promise is resolved. If a **when** statement returns a promise it can be used for chaining.\n5. **(catch a-promise [err] ...) is a macro that works like a function where the function body is executed if any of a set of chained promises uses **reject-promise** to indicate an error.\n6. **(promise.all promise-1 promise-2 [[promises]])** will return a promise that is fulfilled when all the promises specified are resolved or rejected. It will flatten arrays of promises.\n7. **(promise.sequence promise-1 promise-2 [[promises]])** will return a promise that is fulfilled when all the promises specified are resolved or rejected. Unlike **all**, each promise is triggered when the preceding promise is resolved.\n\n## Benefits\n1. Separates cause and effect more clearly\n2. Results are available even it the promise is resolved before inspection\n3. You can pass around a promise just like the data it will contain\n4. Handles exceptions in a structured way\n\n## Disadvantages\n2. Still fairly highly coupled\n3. Only allows one action - not for repetitive events\n4. Developer view needs to change from sequential perspective\n5. Being selective about errors and exceptions is painful. Once a promise is resolved it cannot change. Any promises that rely on a rejected promise will themselves be rejected causing a cascade of failures. To be selective you need to wrap a promise catch in an outer promise and resolve the outer one if the error itself can be resolved. Don't forget to resolve the outer promise with the data from the inner one when there are no errors.\n###\n(global promise {})\n(macro promise [params *body] (lambda params\n  (ref #callbacks (stateful {ok: (lambda []) fail: (lambda [])}))\n  (ref #pledge (new Promise (lambda [ok fail] (#callbacks.update! {ok fail}))))\n  (ref resolve-promise (lambda [] (#callbacks.ok.apply null (*arguments 0))))\n  (ref reject-promise (lambda [err] (#callbacks.fail err)))\n  ## (#join '' 'try{' *body '}catch(err){' (reject-promise err) '}')\n  *body\n  (return #pledge)\n))\n(macro promise.deferred [params *body] (lambda []\n  (ref args (*arguments 0))\n  (ref #callbacks (stateful {ok: (lambda []) fail: (lambda [])}))\n  (ref #pledge (stateful.morph!\n    (new Promise (lambda [ok fail] (#callbacks.update! {ok fail})))\n  ))\n  (#pledge.update! {deferred: (lambda []\n    (ref resolve-promise (lambda [] (#callbacks.ok.apply null args)))\n    (ref reject-promise (lambda [err] (#callbacks.fail err)))\n    ## (#join '' 'try{' *body '}catch(err){' (reject-promise err) '}')\n    *body\n  )})\n  (return #pledge)\n))\n(macro promise.callback [params *body] (promise params\n  (ref callback (lambda [err result]\n    (return-if err (reject-promise err))\n    (resolve-promise result)\n  ))\n  *body\n))\n(global promise.resolved (promise [pact] (resolve-promise pact)))\n(global promise? (lambda [pledge]\n  (return-if (and pledge pledge.then) pledge)\n  (return (promise.resolved pledge))\n))\n\n(global #resolve-deferred (lambda [pledge]\n  (cond pledge.deferred (do\n    (ref deferred pledge.deferred)\n    (delete pledge.deferred)\n    (deferred)\n  ))\n  (return pledge)\n))\n\n(macro when  [pledge params *body]\n  ((#resolve-deferred pledge).then (lambda params *body))\n)\n(macro catch [pledge errors *body]\n  ((#resolve-deferred pledge).catch (lambda errors *body))\n)\n\n(using [list]\n  (global promise.all (lambda [] (return (Promise.all (list.flatten (*arguments 0))))))\n)\n(global promise.chain (lambda []\n  (ref chain-link (lambda [input functions]\n    (return-if (not functions.length) (promise? input))\n    (ref pledge (promise? ((first functions) input)))\n    (when pledge [output] (chain-link output (rest functions)))\n  ))\n  (return chain-link null (*arguments 0))\n))\n\n(global countdown (lambda [from by]\n  (ref from (stateful from))\n  (return (lambda []\n    (from.update! (- from by))\n    (return (<= from 0))\n  ))\n))\n\n(global wait-for (promise [test max-ms]\n  (ref timed-out (countdown (or max-ms 5000) 10))\n  (ref waiter (lambda []\n    (cond\n      (test)      (return (resolve-promise))\n      (timed-out) (return (reject-promise))\n      (else)      (delay 10 waiter)\n    )\n  )) (waiter)\n))\n\n(export {})\n"

lispz_modules['dev']="(using [github riot list]\n  (ref manifest (lambda []\n    (ref text [[\"CACHE MANIFEST\"]])\n    (lispz.manifest.forEach (lambda [uri] (text.push uri)))\n    (text.push \"NETWORK:\" \"*\")\n    (return (text.join \"\\n\"))\n  ))\n  ### Package Lispz for distribution ###\n  (ref package (lambda [lispz-repo]\n    (ref read-file (github.read.bind null lispz-repo))\n\n    (ref group (lambda [files]\n      (ref modules [[]] riots [[]])\n      (files.forEach (lambda [entry]\n        (return? (not (is \"file\" entry.type)))\n        (ref parts (entry.name.split \".\"))\n        (cond\n          (is (last parts) \"lispz\")                  (modules.push (first parts))\n          (is ((slice parts -2).join \".\") \"riot.html\") (riots.push (first parts))\n        )\n      ))\n      (return (promise.resolved {modules riots}))\n    ))\n    (ref build-modules (promise [names]\n      (ref load-module (lambda [name]\n        (ref uri (+ name \".lispz\"))\n        (return (when (read-file uri) [text]\n          (ref contents (text.replace '/[\\\\\"]/g' \"\\\\$&\"))\n          (ref contents (contents.replace '/\\n/g' \"\\\\n\"))\n          (return [[\"\\nlispz_modules['\" name \"']=\\\"\" contents \"\\\"\\n\"]])\n        ))\n      ))\n      (return (promise.all (names.map load-module)))\n    ))\n    (ref build-riots (promise [names]\n      (ref source [[]])\n      (ref load-riot (lambda [name]\n        (return (when (read-file (+ name \".riot.html\")) [text]\n          (ref usings ('/<!--\\s*using\\s*.*?\\s*-->/'.exec text))\n          (cond usings (ref usings ((first usings).replace \"'\" \"\")))\n          (return [[\"\\n\\n/*\" name \"*/\\n\\nlispz.tags['\" name \"']=function(){\"\n            (riot.compile text true) \"\\nreturn '\" usings  \"'}\\n\"]])\n        ))\n      ))\n      (return (promise.all (names.map load-riot)))\n    ))\n\n    (ref update-mode (github.update lispz-repo))\n    (ref lispz-js    (when update-mode [] (return (read-file \"lispz.js\"))))\n    (ref listing     (when update-mode []  (return (github.list-dir lispz-repo \"\"))))\n    (ref groups      (when listing [files] (return (group files))))\n    (ref modules     (when groups [files]  (return  (build-modules files.modules))))\n    (ref riots       (when groups [files]  (return  (build-riots files.riots))))\n\n    (ref all-loaded  (promise.all modules lispz-js riots))\n\n    (return (when all-loaded [sources]\n      (ref  code  (list.flatten [[\"window.lispz_modules={}\\n\" sources]]))\n      (return (github.write lispz-repo \"ext/lispz.js\"\n        (code.join \"\") \"lispz release code\")\n      )\n    ))\n  ))\n\n  ### Distribution ###\n  (ref distribute (lambda [target-repo]\n    ## @TODO\n  ))\n\n  (export {manifest package distribute})\n)\n"

lispz_modules['dexie']="(using  [net github]\n\n  (ref build (lambda [target-repo]\n    (return (github.build target-repo \"dexie\" [[\n      {repo: \"dfahlander/Dexie.js\" files: [[\n        {base: \"dist/latest\" include: '/Dexie.js$/'}\n      ]]}\n    ]]))\n  ))\n\n  (lispz.script \"ext/dexie.js\" (lambda [] (export { build })))\n)\n"

lispz_modules['dict']="### spec: lists >> dict -- The Associative Array List (Dictionary)\n\nAre also called dictionaries or hashmaps. Because lispz is a functional language it is not\nuncommon for functions to return a dictionary of values. To make them clearer, if a key is\nsupplied without a following colon then it is placed into the dictionary with a value of the same name.\n\n    (ref exported-method-1 (lambda [] ...))\n    (ref key \"whatever I want\"}\n    (export {exported-method-1 key error: false date: (new Date))\n\nwill create a JavaScript dictionary of the form\n\n    (ref exporting {exported_method_1: exported_method_1, key: key, error: false, date: (new Date)})\n\naccess with a key is identical to arrays except that it is a key rather than an index.\nIf the key is known, using dot syntax is clearer\n\n    exporting.error\n    (get exporting key)\n###\n\n### spec: lists >> dict >> Internals >> Insert\nDictionary merges and inserts take a list of dictionaries in order to push to the target.\nThis means that when they have common keys, the last dictionary that has the key takes\nprecedence.\n\n    ## command-line options overwrite config options of the same name. If neither is\n    ## found, the default option is used.\n    (dict.merge default-options config-file-options cl-options)\n###\n(ref insert (lambda [target dictionaries]\n  (ref target (stateful target))\n  (dictionaries.forEach (lambda [dictionary]\n    (target.update! dictionary)\n  ))\n  (return target)\n))\n\n### spec: lists >> dict >> Merging Dictionaries\nThere is often need to merge multiple dictionaries together to create a new combined one.\n\n    (ref big-dict (dict.merge dict-1 dict-2 dict-3))\n###\n(ref merge (lambda [dictionaries]\n  (return (insert {} (*arguments 0)))\n))\n\n### spec: lists >> dict >> Inserting One Dictionary in Another\n**Warning** This is not referentially transparent\n\n    (dict.insert! dict-1 dict-2 dict-3)      ## changes dict-1\n###\n(ref insert! (lambda [target dictionaries]\n  (return (insert target (*arguments 0)))\n))\n\n### spec: lists >> dict >> Create a Dictionary from a List\n    (ref list [[{key: 1 value: 2} {key: 3 value: 4}]]\n    (dict.from-list list \"key\")    # {1: {key: 1 value: 2} 3: {key: 3 value: 4})\n###\n(ref from-list (lambda [list key]\n  (ref dictionary (stateful))\n  (cond list (list.forEach (lambda [item] (dictionary.update! item))))\n  (return dictionary)\n))\n\n### spec: lists >> dict >> For Each Entry...\n    (dict.for-each dict-1 (lambda [key value] ...))\n###\n(ref for-each (lambda [dict action=>]\n  (Object.keys dict)(.forEach (lambda [k] (action=> k (get dict k))))\n))\n\n### spec: lists >> dict >> Morphing dictionary into an Array\n###\n(ref map (lambda [dict action=>]\n  (return ((Object.keys dict).map (lambda [k] (return (action=> k (get dict k))))))\n))\n\n### spec: lists >> dict >> Check a Dictionary for an Entry\n###\n(ref contains (lambda [test against]\n  (return (#join '' '(' test ' in ' against ')'))\n))\n\n(export {merge from-list insert! for-each map contains})\n"

lispz_modules['diff_match_patch']="(using [net github]\n  (ref build (lambda [target-repo built=>]\n    (return (github.build target-repo \"diff_match_patch\" [[\n      {repo: \"tanaka-de-silva/google-diff-match-patch-js\" files: [[\n        {base: \"\" include: '/^diff_match_patch_uncompressed.js$/'}\n      ]]}\n    ]]))\n  ))\n  (lispz.script \"ext/diff_match_patch.js\" (lambda [] (export { build })))\n)\n"

lispz_modules['dom']="(using [dict]\n  (ref append! (lambda [parent element]\n    (document.querySelector parent) (.appendChild element)\n  ))\n\n  ### spec: DOM >> Replace inner html\n  Given an element, replace the contents with the html provided as a string.\n  ###\n (ref inner-html! (lambda [el html] (#set! el.innerHTML html)))\n\n  ### spec: DOM >> Select Elements\n  This is a shortcut for element.querySelectorAll. It copies the\n  results into an Array of elements for further processing.\n  ###\n  (ref select (lambda [el selector]\n    (return (slice (el.querySelectorAll selector)))\n  ))\n\n  (ref style! (lambda [el styles]\n    (dict.for-each styles(lambda [name value]\n      (#set! (get el.style name) value))\n    ))\n  )\n\n  (ref element (lambda [tag-name attributes]\n    (ref elem (document.createElement tag-name))\n    (dict.for-each attributes (lambda [k v] (elem.setAttribute k v)))\n    (return elem)\n  ))\n\n  (ref event-throttle (lambda [element event action]\n    (ref add null)\n    (ref listener (lambda [event]\n      (element.removeEventListener event listener)\n      (delay 66 add)\n      (action event)\n    ))\n    (ref add (lambda [] (element.addEventListener event listener)))\n  ))\n\n  (export {append! element event-throttle style! inner-html! select})\n)\n"

lispz_modules['firebase']="(using  [net]\n  ( var databases (stateful.morph! (JSON.parse (or (localStorage.getItem \"firebases\") \"{}\"))))\n\n  (ref register (lambda [key uri]\n    (databases.update! key uri)\n    (localStorage.setItem \"firebases\" (JSON.stringify databases))\n  ))\n\n  (ref encode (lambda [before]\n    (ref uri (before.replace '/\\./g' \":\"))\n    (ref uri (uri.replace    '/#/g'  \"_hash_\"))\n    (ref uri (uri.replace    '/\\$/g' \"_dollar_\"))\n    (return uri)\n  ))\n\n  (ref attach (lambda [collection db]\n    (ref uri (get databases (or db \"default\")))\n    (return-if (not uri) null)\n    (return (new Firebase (+ uri \"/\" (encode collection))))\n  ))\n\n  (ref loaded (net.script \"https://cdn.firebase.com/js/client/2.2.9/firebase.js\"\n    (lambda [] (return window.Firebase))\n  ))\n  (when  loaded (export {register attach databases}))\n  ## (catch loaded (export {}))\n)\n"

lispz_modules['firepad']="(using  [net github]\n  (ref build (promise [target-repo]\n    (github.grunt target-repo \"firebase/firepad\" [grunt data]\n      (grunt.build {\n        target: \"firepad.js\"\n        pre:   data.concat.firepadjs.options.banner\n        post:  data.concat.firepadjs.options.footer\n        files: data.concat.firepadjs.src\n      } (lambda []\n        (grunt.copy data.copy.toBuild.files built=>)\n      ))\n    )\n  ))\n\n  (lispz.css \"ext/firepad.css\")\n  (ref loaded (net.script \"ext/firepad.js\" (lambda [] (return window.FirePad))))\n  (when loaded [] (export {build}))\n)\n"

lispz_modules['github']="(using  [net dict list]\n  (ref version null)\n  (ref cdn-uri (lambda [project version filepath]\n    (return (+ \"https://cdn.rawgit.com/\" project \"/\" version \"/\" filepath))\n  ))\n  (ref repo (lambda [username password project]\n    (ref auth (new Github {username password auth: \"basic\"}))\n    (ref github (auth.getRepo.apply null (project.split \"/\")))\n    (return (stateful {github auth username password project branch: \"master\"}))\n  ))\n  ## Set the branch to use for repo - defaults to master\n  (ref branch (promise [repo branch-name]\n    (repo.update! {branch: branch-name})\n    (repo.github.branch branch-name (lambda [err result] (resolve-promise)))\n  ))\n  ## list files in a specific path on the repo\n  (ref list-dir (promise.callback [repo path]\n    (repo.github.contents repo.branch path callback)\n  ))\n  (ref list-all (promise [repo path single-level]\n    (ref result [[]])\n    (ref list-path (lambda [path]\n      (return (when (list-dir repo path) [paths]\n        (ref children [[]])\n        (paths.forEach (lambda [entry]\n          (cond\n            (is \"dir\"  entry.type)\n              (cond (not single-level) (children.push (list-path entry.path)))\n            (is \"file\" entry.type)\n              (result.push entry.path)\n          )\n        ))\n        (return (promise.all children))\n      ))\n    ))\n    (when (list-path path) [] (resolve-promise result))\n  ))\n  (ref read (promise.callback [repo path]\n    (repo.github.read repo.branch path callback)\n  ))\n  (ref update (lambda [repo]\n    (return-if (is repo.branch repo.username) (promise.resolved))\n    (ref branch-name (or repo.username \"master\"))\n    (return (branch repo branch-name))\n  ))\n  (ref write (promise.callback [repo path contents comment]\n    (return-if (not contents.length) (promise.resolved))\n    (ref encoded (unescape (encodeURIComponent contents)))\n    (repo.github.write repo.branch path encoded comment callback)\n  ))\n  ## preprocess a file to generate css or js dependent on extension\n  (ref preprocessors {\n    lispz: (lambda [name code]\n      (return {path ext: \"js\" code: (window.lispz.compile code name)})\n    )\n  })\n  (ref preprocess (lambda [path code]\n    (ref ext (last (path.split \".\")))\n    (ref preprocessor (get preprocessors ext))\n    (return-if (not preprocessor) {path ext code})\n    (return (preprocessor path code))\n  ))\n  ## Build and save a dependency list\n  ## We will need to filter the dependencies\n  (ref filter (lambda [before include exclude]\n    (ref after before)\n    (cond include (ref after\n      (after.filter (lambda [file] (return (include.test file))))\n    ))\n    (cond exclude (ref after\n      (after.filter (lambda [file] (return (not (exclude.test file)))))\n    ))\n    (return after)\n  ))\n  ## and see which to save and which to copy\n  (ref copy (lambda [copy-to path code]\n    ## not working yet for binary files\n    (ref filename (last (path.split \"/\")))\n    (return {path code copy: (+ copy-to \"/\" filename)})\n  ))\n  ## Load the contents of the files we need from a single repo\n  (ref process-repo (lambda [source-repo files actors]\n    (return (promise.all (files.map (promise [meta]\n      (ref base (or meta.base \"\"))\n      (when (actors.list-all source-repo base meta.single-level) [file-list]\n        (ref files (filter file-list meta.include meta.exclude))\n        (resolve-promise (promise.all (files.map (promise [path]\n          (when (actors.read source-repo path) [code]\n            (cond\n              meta.copy-to (resolve-promise (copy meta.copy-to path code))\n              (else)       (resolve-promise (preprocess path code))\n            )\n          )\n        ))))\n      )\n    ))))\n  ))\n  ## Given a list of repos, go through them all for files in need\n  (ref process-repos (lambda [target-repo sources actors]\n    (return (promise.all (sources.map (lambda [source]\n      (ref source-repo (actors.repo target-repo source.repo))\n      (return (process-repo source-repo source.files actors))\n    ))))\n  ))\n  ## Retrieve file contents based of filtering meta-data\n  (ref retriever (promise [target-repo sources actors]\n    (when (process-repos target-repo sources actors) [entry-tree]\n      (ref store {js: [[]] css: [[]]  copies: [[]] from:\n        (sources.map (lambda [source] (return source.repo)))})\n      (store.from.unshift \"Gathered from: \")\n      ((list.flatten entry-tree).forEach (lambda [entry]\n        (cond\n          (get store entry.ext)\n            ((get store entry.ext).push \"\\n\\n/* \" entry.path \" */\\n\" entry.code)\n          store.copy\n            (store.copies.push entry)\n        )\n      ))\n      (resolve-promise store)\n    )\n  ))\n  ## Given a file type, save the concatenated source contents\n  (ref save-store (promise [target-repo store name ext comment]\n    (ref contents ((get store ext).join \"\"))\n    (return (write target-repo (+ \"ext/\" name \".\" ext) contents comment))\n  ))\n  ## copy files identified as needed as-is\n  (ref copy-store (lambda [target-repo store comment]\n    (return (promise.all (store.copies.map (lambda [entry]\n      (return (write target-repo entry.path entry.code comment))\n    ))))\n  ))\n  ## Now we have gathered needed resources, build and save the output file\n  (ref builder (promise [actors target-repo name sources]\n    (when (retriever target-repo sources actors) [store]\n      (ref comment (store.from.join \" \"))\n      (ref saved (when (update target-repo) []\n        (return (promise.all\n          (save-store target-repo store name \"js\"  comment)\n          (save-store target-repo store name \"css\" comment)\n          (copy-store target-repo store            comment)\n        ))\n      ))\n      (when saved [] (resolve-promise))\n    )\n  ))\n  (ref github-actors {\n    list-all read\n    repo: (lambda [target-repo name]\n      (return (repo target-repo.username\n        target-repo.password name\n      ))\n    )\n  })\n  (ref build (builder.bind null github-actors))\n  ## Use gruntfile to decide which files to include and it what order\n  (ref grunt-build (promise [meta]\n    (ref js [[(or meta.pre \"\")]])\n    (ref read-all (promise.all (meta.files.map (promise []\n      (when (github-actors.read source-repo path) [data]\n        (js.push data) (resolve-promise)\n      )\n    ))))\n    (when read-all []\n      (js.push (or meta.post \"\"))\n      (ref contents (js.join \"\\n\"))\n      (when (write target-repo (+ \"ext/\" meta.target) contents comment) []\n        (resolve-promise)\n      )\n    )\n  ))\n  (ref grunt-copy (promise [files]\n    (ref copy-all (promise.all (files.map (promise [item]\n      (ref path (or item.src item))\n      (when (github-actors.read source-repo path) [contents]\n        (ref path (+ \"ext/\" (last (path.split \"/\"))))\n        (when (write target-repo path contents comment) [] (resolve-promise))\n      )\n    ))))\n  ))\n  (ref grunt (promise [target-repo source-project]\n    (ref source-repo (github-actors.repo target-repo source-project))\n    (ref comment (+ \"from \" source-project))\n    (ref sources [[\n      {repo: source-project files: [[\n        {include: '/^Gruntfile.js$/' single-level: true}\n      ]]}\n    ]])\n    (when (retriever target-repo sources actors) [store]\n      (ref grunt-config ((Function\n        (+ \"var module={};\" (last store.js) \"return module.exports\"))))\n      (grunt-config {\n        loadNpmTasks: (lambda []) registerTask: (lambda [])\n        initConfig: (lambda [config-data]\n          (ref grunt-processor {\n            build: grunt-build\n            copy:  grunt-copy\n          })\n          (when (update target-repo) []\n            (resolve-promise grunt-processor config-data)\n          )\n        )\n      })\n    )\n  ))\n  (ref build-github (lambda [target-repo]\n    (ref sources [[\n      {repo: \"michael/github\" files: [[\n        {include: '/github.js$/'}\n      ]]}\n    ]])\n    (return (build target-repo \"github\" sources))\n  ))\n  (ref loaded (net.script \"ext/github.js\" (lambda [] (return window.Github))))\n  ## (catch loaded (export {build}))\n  (when loaded []\n    (export {\n      branch list-all list-dir cdn-uri build builder repo read write update\n      build-github retriever grunt preprocessors\n      move: (promise.callback [repo from to]\n        (repo.github.move repo.branch from to callback)\n      )\n      delete: (promise.callback [repo path]\n        (repo.github.remove repo.branch path script callback)\n      )\n    })\n  )\n)\n"

lispz_modules['index']="### spec: Introduction ###\n### spec: basics -- The Basics ###\n### spec: lists -- List Processing ###\n### spec: Macros ###\n### spec: Modules ###\n### spec: async -- Asynchronous Programming ###\n### spec: riot -- UI Components with RIOT ###\n### spec: bootstrap -- Bootstrap Integration ###\n### spec: codemirror -- CodeMirror Integration ###\n### spec: developer -- Developer Tools ###\n### spec: Deployment ###\n### spec:  ###\n\n### spec: Introduction\n# Why another *&^% language?\n**For Fun:**\nIt is fun to create something new - even when you are following paths well trodden by others for decades.\nBy making your own decisions and learning from them you get a better understanding of the how and why of\nother languages.\n\n**Extensibility:**\nFew languages macros integrated in the language - where macros are expressed in the language itself.\nThere is no difference between built-ins, libraries and code created by the end-user.\n\n**Simplicity:**\nMany languages and frameworks are overloaded with features - generating a huge learning curve.\n\n# Overcoming the fear of change\nLispz has different expression ordering, lots of parentheses and function programming overtones.\nIf you have a fear of change and, like me, had decades of OO and Imperative software development\nthen Lispz looks strange, behaves strangely and requires a diffent way of thinking.\n\nAnd yet, Lispz is only a thin veneer over JavaScript.\n\n    Javascript: console.log(\"message:\", msg)\n    Lispz:      (console.log \"message:\" msg)\n    \nIf you move the parenthenis pairs around and replace brace with parenthesis then the\nsurface similarities become more obvious.\n\nThe first major difference is not what has been added, but what has been taken away.\nLisp(z) has a lot less syntax. Only\n\n    (fn params)\n    [list]\n    {dict}\n    \nform the core syntax. Everything else is either a function or a macro.\nWe won't talk more about macros yet - in case parenoia sets in.\n\n# The benefits of lisp\nHaving only parenthesis, bracket or brace to deal with reduces ambiguity - when used\nwith appropriate white-space. In many cases the functional style can be clearer:\n\n    (or value default1 default2 12)\n    (+ a b 12)\n\nalthough not always\n\n    (/ (* value percent) 100)\n  \nWhile our practiced eye finds this harder to understand than \"a * percent / 100\" it\nis easier to decipher. Take the 'standard' syntax. Are these the same:\n\n    value * percent / 100\n    (value * percent) / 100\n  \nYou win if you said 'no'. In most languages operator precedence is such that the first\nsample will do the divice before the multiply. With real numbers the change in order can\ncause a diffent result. For languages without auto-conversion, the first will return zero\n(assuming percent is less than 100). With auto-conversion and all integers, the first will\ncause two floating point operations while the second only one.\n\nBack to\n\n    (/ (* value percent) 100)\n  \nWith the understanding that everthing appears to be a function, it becomes easier to read\nand there are no ambiguities. The word 'appears' is intentional as Lispz expands binaries in-line,\nsuch that the code run is\n\n    ((value * percent) / 100)\n\n# Where functional programming comes in\nShhh! Don't tell the Haskellers. JavaScript is already a functional language in that it\nprovides functions as first-class operation, closures and bindings. There are other aspects\nthat it does not support - the major ones being immutability and static types. I think of\nJavaScript as a modern assember, making it the responsibility of the higher (:)\nlevel language to fill in the gaps.\n\nLispz is too lightweight to do anything about static types.\n\nImmutability is a moving target. For a functional language, this means if a function is\ncalled with the same parameters it will always return the same result. Another definition\nstates \"no side-effects\". A third suggest it means all data on the stack - meaning function\ncall parameters. In the extreme it means that there are no variables, only constants -\ndata once allocated never changes.\n\nLispz takes a pragmatic approach leaving it up to the developer. It keeps the JavaScript\nconcept of a 'var' - leaving it easy to change within the same function and accessible as\nan immutable variable to inner functions. Because immutability is such a hard task master\nin an imperative world (such as the dom), Lisp does incude a set! operator.\nUnlike assignment, set! is painful enough to remind the developer to limit it's use.\nPutting a bang after any exported function that includes mutability provides a good hint to\nrule-breaking. It is up to the developer to ensure than any function exported from a module\nhonours the immutability and repeatability rules - and to flag the method when this is not possible.\n###\n\n(export {}) ## in case it gets included in another module\n"

lispz_modules['jquery']="(using [net cdnjs]\n  (ref build (lambda [target-repo]\n    (return (cdnjs.build target-repo \"jquery\" [[\n      {repo: \"jquery\" files: [[\n        {exclude: '/\\.map$|\\.min.js$/'}\n      ]]}\n    ]]))\n  ))\n  (ref loaded (net.script \"ext/jquery.js\" (lambda [] (return window.jQuery))))\n  (when  loaded [] (export {build}))\n  (catch loaded [] (export {build}))\n)\n"

lispz_modules['js-beautify']="(using [net github]\n  (ref build (lambda [target-repo built=>]\n    (return (github.build target-repo \"js-beautify\" [[\n      {repo: \"beautify-web/js-beautify\" files: [[\n        {base: \"js/lib\" include: '/^beautify.js$/'}\n      ]]}\n    ]]))\n  ))\n  (ref loaded (net.script \"ext/js-beautify.js\" (lambda []\n    (return window.js_beautify))\n  ))\n  (when loaded [] (export {build}))\n)\n"

lispz_modules['list']="### spec: lists -- Lists and Arrays\n    Lisp was named as a shorter form of 'list processing'. When I first heard of lisp in the early 80's, I did not follow up on it as I did not see the value for my work in a language that gave priority to lists. Who needs specialised list processing when we have loops? This at a time I was using FORTH without thinking that I was treating the stack as a list. Time has moved on (a lot) and with the era of multiple cores starts, functional programming has gained new ground.\n\n    Lispz compiles to JavaScript on the browser, so has very little opportunity at this time to use multiple cores. It will work happily with web workers once they become ubiquitous, but that is more the architecture of the workers than the language to use.\n\n    Enough... on to lists. JavaScript ES5 has already added quite a few referentially transparent list processing functions. In this case it means they will not change the lists provided as input.\n\n        (ref l1 [[1 2 3]]   l2 [[4 5]]   l3 [[6 7]])\n\n        (l1.concat l2 l3)                                               ## [[1 2 3 4 5 6 7]]\n        (l1.indexOf 2 from)                                             ## 1  ## from defaults to 0\n        (li.join \", \")                                                  ## \"1, 2, 3\"\n        (li.lastIndexOf 2 from)                                         ## 1  ## from default to last element\n\n        (l1.every (lambda [item idx lst] (return (< idx 2))))           ## [[1 2]]  ## index, lst are optional\n        (l1.filter (lambda [item idx lst] (return (% idx 2))))          ## [[1 3]]\n        (l1.forEach (lambda [item idx lst] (console.log item)))         ## 1\\n2\\n3\n        (l1.map (lambda [item idx lst] (return (* item 2))))            ## [[2 4 6]]\n        (l1.reduce (lambda [prev item idx lst] (return (+ prev item))) seed)      ## 6 ## seed optional\n        (l1.reduceRight (lambda [prev item idx lst] (return (+ prev item))) seed) ## 6 ## seed optional\n        (l1.slice 1 2)                                                  ## [[2]] ## -ve from end\n        (l1.some (lambda [item idx lst] (is item 4)))                   ## false  ## true if (is item 2)\n\n    The following are not referentially transparent\n\n        (l1.pop)                                                        ## 3  ## (is l1 [[1 2]])\n        (l1.push 88)                                                    ## [[1 2 3 88]]\n        (l1.reverse)                                                    ## (is l1 [[3 2 1]])\n        (l1.shift))                                                     ## 1  ## (is l1 [[2 3]])\n        (l1.sort (lambda [a b] (- b a)))                                ## [[3 2 1]]  ## function optional\n        (l1.splice 1 1 32 33)                                           ## [[1 32 33 3]]  ## idx delcnt adds\n        (l1.unshift 99)                                                 ## [[99 1 2 3]]\n\n    Lispz has less convenient access to specific entries for updates or removals\n\n        (get l1 1)                                                      ## 2\n        (set! (get l1 1) 22)                                            ## (is l1 [[1 22 3]])\n        (update! l1 1 22)                                               ## (is l1 [[1 22 3]])\n\n    And for more functional processing\n\n        (first l1)                                                      ## 1\n        (rest l1)                                                       ## [[2 3]]\n        (last l1)                                                       ## 3\n\n    And others...\n\n        (in l2 2)                                                       ## true\n        (empty? l1)                                                     ## false\n        (slice 1 2)                                                     ## [[2]]  ## works with *arguments\n###\n### spec: lists >> The Functional List\nIn Lispz the braces are reserved for function-like calls - being traditional functions and lisp macros. The atom immediately after the open brace is the name of the function or macro.\n\n    (console.log \"Hello world\")   ## calling a javascript function to write to the console\n    (debug \"Hello world\")         ## a macro that writes the current function call stack then a message\n\nThe first 'atom' can also be an anonymous function.\n\n    ((lambda [] (console.log \"Hello world\")))\n    ## is the same as\n    (ref hw (lambda [] (console.log \"Hello world\")))\n    (hw)\n\nInternally functional lists are either expanded into more lispz statements by a macro or are converted to a Javascript function. The list becomes the function arguments.\n\n    (console.log \"Hello\" \"world\")  ## JS==> console.log(\"Hello\", \"world\")\n\nMacros are amazing things. Addition does not expand to a function but to in-line code:\n\n    (+ 1 2 3) ## JS==> 1 + 2 + 3\n###\n### spec: lists >> The Raw List\n\nAt the risk of repeating myself (and at the risk of repeating myself), Lispz is a lightweight compiler to JavaScript. A raw list is an sequence of atoms. When compiled to Javascript the sequence will be comma separated. It is most commonly used for parameters in a function definition:\n\n    (ref expect (lambda [address listener=>]\n      (add address {once: true listener=>})\n    ))\n\nThe defined function, expect takes 2 parameters, being a string address and a function reference. The => at the end of this function reference is not syntax, just convenience text to show that this is a callback function.\n###\n### spec: lists >> Array as a List\n\nFor a traditional list or array, use [[]]. This will translate into a normal JavaScript array with standard functional support suchs as forEach and map.\n\n    (ref list [[1 2 6 9]])\n    (ref double (list.map [item] (return (* item 2)))) ## JS==> [2, 4, 12, 18]\n\nUse the get command to retrieve entries\n\n    (ref second (get double 2))\n\nAll the JavaScript list processing functions (every, filter, forEach, ...) are available. See the [List Processing](list-processing.md) section for more details.\n\nTo see if an array contains an element, use 'in':\n\n    (return-if (12 in list) \"has dozen\")\n###\n### spec: lists >> flatten - Flattening Lists of Lists\n###\n(ref flatten (lambda [list]\n  (return (list.reduce (lambda [a b]\n    (ref bflat b)\n    (cond (instance-of Array b) (ref bflat (flatten b)))\n    (return (a.concat bflat))\n  ) [[]]))\n))\n### spec: lists >> for-each\n  This is a lelper for the JavaScript [].forEach(). It has the advantage that\n  it behaves correctly if the item is not an array by running once for the entry\n  if it is not a falsy.\n###\n(ref for-each (lambda [list action]\n  (cond (not list)               (return null)\n        (instance-of Array list) (list.forEach action)\n        (else)                   (action list)\n  )\n))\n\n### spec: lists >> contains\n###\n(ref contains (lambda [substr str] (return (isnt -1 (str .indexOf substr)))))\n\n(export {flatten for-each contains})\n"

lispz_modules['macros']="### spec: macros >> What is a Macro?\n\nThe term \"macro\" includes text substitution (e.g. ASM and C) and syntactic macros. Lisp has had the latter proposed 1963 or soon after. By working on the abstract syntax tree (AST), a macro has the full faculties and syntax of the language to effectively extend the language. Another way of looking at it is that lisp macros run lisp code during the compile to modify the resulting program. Yes, I know this is still not clear. Read https://en.wikipedia.org/wiki/Macro_%28computer_science%29 for a more informative perspective.\n\nPerhaps the best road to undertanding is by example.\n\n    (macro return? [value] (cond value (return value)))\n    \ncreates a new language element that only returns if the value is a truthy, as in\n\n    (ref result ....)\n    (return? result)\n    ## try something else\n    \nThis example would also work with a text substitution macro system, but this one doesn't:\n\n    (macro closure [params *body] (#join '' '(lambda(' params '){' *body '})(' params ')'))\n    \nThis generates the JavaScript output directly as #join is an immediate function called during the\nast to JavaScript phase.\n\n### spec: macros >> Defining a Macro\n\nA macro is defined by giving it a name, list of parameters and a body. In it's simplest form the parameters are substituted into the body at reference time. It is like a function expanded in-line.\n\n    (macro return-if [test value] (cond test (return value)))\n    \nImmediate actions are required to modify the JavaScript output during the compile stage (ast to JavaScript).\n\n    (macro function [params *body] (#join '' '(lambda(' params '){' *body '})'))\n    \nParameters that start with star must be the last in the list and encapsulate all the remaining parameters in the expansion. This is why function works:\n\n    (lambda [a b] (ref c (+ a b)) (return c))\n\n### spec: macros >> #join\nMany macros translate lispz directly to JavaScript by mixing pure JavaScript with macro parameters that can convert themselves to JavaScript. It is an immediate function - being one that runs during the compile phase. The first parameter is the text to be used between the segments. In this context it is usually empty. The first parameter along with the JavaScript are wrapped in single quotes so that they are left as-is in the JavaScript output.\n\n    (macro set! [name value] (#join '' name '=' value ';'))\n\n### spec: macros >> #pairs\nPairs is more rarely used. It takes a list and creates output based on pairs in that list. Hmmm, that is not very clear. Best use an example then.\n\n    (macro var (*list) (#join '' 'var ' (#pairs *list '=' ',') ';'))\n    (ref a 12  b \"hi\") ##js=> var a=12,b=\"hi\";\n    \nPairs takes a list, the code within each pair and the string between pairs. In this example, = is between the two items in the pair and , is between pairs. If you need it clearer than that, try meditating on the two sample lines above - or don't use #pairs.\n\n### spec: macros >> immediate\n\nMacros allow you to change lispz by adding new build-in commands. By their nature, macros allow the use of lispz at compile time to generate the resulting lispz code. Most macros are to generate JavaScipt\n\n    (macro return [value] (#join '' 'return ' value '\\n'))\n\nor just substitution\n\n    (macro return? [value] (cond value (return value)))\n    \nDouble-check substitution macros. The one above must be a macro, but may could be easily converted into global functions\n\n    (macro empty? [list] (not list.length))\n    # is functionally the same as\n    (global empty? [list] (return (not list.length)))\n    \nThe built-ins #join and #pairs are example of immediate functions - ones that operate during the compile phase. Lispz would not be complete if you could not also create immediate functions.\n\n    (immediate 'alert(\"Hi\")')\n    \nWorks but has no point. I added immediate for language completeness. I have not yet found a use for it.\n\n    (global #join2 (lambda [sep parts]\n      (immediate (*arguments 1) '.map(lispz.ast_to_js).join(lispz.ast_to_js(sep)')\n    ))\n\n\n(export {})\n"

lispz_modules['markdown']="(using [net cdnjs dict]\n  (ref build (lambda [target-repo]\n    (return (cdnjs.build target-repo \"showdown\" [[\n      {repo: \"showdown\" files: [[\n        {include: '/showdown.js$/'}\n      ]]}\n    ]]))\n  ))\n  (ref default-options {\n    ## (boolean) Omit the trailing newline in a code block.\n    omitExtraWLInCodeBlocks: false\n    ## (boolean) Disable the automatic generation of header ids.\n    noHeaderId: false\n    ## (string/boolean) Add a prefix to the generated header ids.\n    prefixHeaderId: false\n    ## (boolean) Enable support for setting image dimensions.\n    parseImgDimensions: false ## ![foo](foo.jpg =100x80) -- *, px, %, em\n    ## (integer) Set the header starting level.\n    headerLevelStart: 2\n    ## (boolean) Enable GFM autolink style.\n    simplifiedAutoLink: true\n    ## (boolean) Stop interpreting underscores in the middle of words\n    literalMidWordUnderscores: false\n    ## (boolean) Enable support for strikethrough syntax (~~strike~~)\n    strikethrough: true\n    ## (boolean) Enable support for tables syntax.\n    tables: true\n    ## (boolean) Adds an id property to table headers tags.\n    tablesHeaderId: true\n    ## (boolean) Enable support for GFM code block style.\n    ghCodeBlocks: true\n    ## (boolean) Enable support for GFM takslists.\n    tasklists: true\n    ## (boolean) Prevents weird effects in live previews due to incomplete input\n    smoothLivePreview: false\n  })\n\n  (ref compile (lambda [markdown options]\n    (ref options (dict.merge (or options {}) default-options))\n    (ref converter (new showdown.Converter options))\n    (ref html (converter.makeHtml markdown))\n    (return html)\n  ))\n\n  (ref loaded (net.script \"ext/showdown.js\" (lambda [] (return window.showdown))))\n\n  (when  loaded [] (export {build compile}))\n  (catch loaded [] (export {build}))\n)\n"

lispz_modules['message']="### spec: async >> Messaging\n  Lispz includes a complete decoupled communications solution based on messaging.\n  The base version is in-browser, but the API is designed to work across systems\n  with RESTful or WebSockets. The UI components use messaging to communicate\n  between components that are not linked, so cannot make more direct connections.\n\n  Here a code editor will wait on messages to open a new 'file'. The message\n  includes a name unique to each code editor. The dictionary at the end can\n  include any number of named requests. Each associated function takes a packet\n  whose content format is known by clients and services.\n\n      (using [message]\n        (ref open (lambda [packet] ...)\n        (message.dispatch (+ \"code-editor/\" opts.name) { open })\n\n  The client will send a command to open a new file for display. If the editor\n  is called 'scratch':\n\n      (message.send \"code-editor/scratch\"\n        {action: \"open\" key: \"scratchpad.lispz\" contents: null}\n      )\n\n  If it is possible that a client will send an important request before the\n  service has had the opportunity to initialise, wrap 'send' in 'wait-for':\n\n      (message.wait-for \"code-editor/scratch\" (lambda []\n        (message.send \"code-editor/scratch\"\n          {action: \"open\" key: \"scratchpad.lispz\" contents: null}\n        )\n\n  'dispatch' uses an entry called 'action' to decide on which function to call.\n  For raw processing, use 'listen' instead. The following example changes the\n  left padding on a DOM element if asked.\n\n      (message.listen \"page-content-wrapper-padding\" (lambda [px]\n        (set! tag.page-content-wrapper.style.paddingLeft (+ px \"px\"))\n\n  For a one-off message, use 'expect' rather than 'listen':\n\n      (message.expect \"editor-loaded\" (lambda [] ...)\n\n  Lispz uses exchanges defined as part of the address. Plain string addresses as\n  used so far will use a local in-browser exchange. The address can include\n  details that will define different exchanges (when implemented).\n\n  It is possible to remove listeners if you have access to the callback used to\n  create the listener\n\n      (message.remove \"my-message\" my-message-listener=>)\n\n  Messages also includes a common log processor. The following two calls behave\n  in an identical manner.\n\n      (message.log \"message: message-text\")\n      (message.send \"logging\" {level: \"message\"  text: \"message-text\"})\n\n  The default processor sends them to the browser console. Add additional\n  listeners for modal dialogs, error messages, etc.\n###\n(using [list]\n  (ref store (stateful)  expecting (stateful)  links (stateful))\n  \n  (ref exchange (lambda [address]\n    (ref envelopes (get store address))\n    (return? envelopes)\n    (ref envelopes (stateful.morph! []))\n    (store.update! address envelopes)\n    (return envelopes)\n  ))\n  \n  (ref add (lambda [address envelope]\n    (ref envelopes (exchange address))\n    (envelopes.push envelope)\n    (cond (and (is envelopes.length 1)  (get expecting address))\n          (do ((get expecting address)) (delete (get expecting address))))\n  ))\n  \n  (ref ready (promise [address]\n    (return-if (length (exchange address)) (promise.resolved))\n    (expecting.update! address resolve-promise)\n  ))\n  \n  ## remove a recipient from all attached addresses\n  (ref remove (lambda [address recipient]\n    (ref envelopes (exchange address))\n    (store.update! address\n      (envelopes.filter (lambda [possibility]\n        (return (isnt recipient possibility))\n      ))\n    )\n  ))\n  \n  ## clear all listeners for an address\n  (ref clear (lambda [address] (store.update! address null)))\n  \n  (ref link (lambda [primary secondary]\n    (cond (not (get links primary)) (links.update! primary [[]]))\n    ((get links primary).push secondary)\n  ))\n\n  (ref send (lambda [address packet]\n    ## take a copy so that it does not change during processing\n    (ref result null)\n    (ref sender (lambda [recipient]\n      (ref result (recipient.listener=> packet))\n      (cond recipient.once (remove recipient))\n    ))\n    (((exchange address).slice).forEach sender)\n    (list.for-each (get links address) (lambda [link] (send link packet)))\n    (return (promise? result))\n  ))\n  \n  (ref expect (lambda [address listener=>]\n    (add address {once: true listener=>})\n  ))\n  \n  (ref listen (lambda [address listener=>]\n    (add address {listener=>})\n  ))\n  \n  (ref dispatch (lambda [address actions]\n    (listen address (lambda [packet]\n      (ref action (get actions packet.action))\n      (return-if (not action) (promise.resolved false))\n      (return (action packet))\n    ))\n  ))\n  \n  (ref log (lambda [text]\n    (ref parts (text.split '/\\s*:\\s*/'))\n    (cond (is 1 parts.length) (parts.unshift \"message\"))\n    (send \"logging\" {level: (get parts 0) text: (get parts 1)})\n  ))\n  \n  (listen \"logging\" (lambda [packet]\n    (console.log packet.level \"-\" packet.text)\n  ))\n  \n  (export {exchange send expect listen dispatch ready clear link})\n)\n"

lispz_modules['net']="(using [list dom regex]\n  (ref script (promise.callback [uri check max-ms] (lispz.script uri (lambda []\n    (cond (not check) (return (callback)))\n    (ref initialised (wait-for check max-ms))\n    (when  initialised [] (callback))\n    (catch initialised [] (debug (+ uri \"didn't load\")))\n  ))))\n\n  (ref css (lambda [uri]\n    (ref el (dom.element \"link\" {\n      type: \"text/css\" rel: \"stylesheet\" href: uri\n    }))\n    (dom.append! \"head\" el)\n  ))\n\n  (ref http-get (promise.callback [uri]\n    (lispz.http_request uri \"GET\" callback)\n  ))\n\n  (ref json-request (promise [uri]\n    (when (http-get uri) [response] (resolve-promise (JSON.parse response)))\n  ))\n\n  ### spec: Network >> Is URL external\n  ###\n  (ref external? (lambda [url] (return (list.contains \"://\" url))))\n\n  ### spec: Network >> Retrieve the last element in a URL path\n  ###\n  (ref url-path (lambda [href]\n    (return (regex.substring href '/(.*\\/)[^\\/]*$/'))\n  ))\n\n    ### spec: Network >> Retrieve the last element in a URL path\n    ###\n    (ref url-actor (lambda [href]\n      (return (regex.substring href '/.*\\/([^\\/]*)(?:\\?.*)?$/'))\n    ))\n\n  (export {\n    script css http-get json-request external? url-actor url-path\n  })\n)\n"

lispz_modules['paredit']="### codeeditor >> codemirror >> ParEdit\n###\n    (ref extraKeys {\n      ## paredit keys that defer if not in lisp code\n      'Backspace':        \"subpar_backward_delete\"\n      'Delete':           \"subpar_forward_delete\"\n      'Ctrl-D':           \"subpar_forward_delete\"\n\n      'Shift-9':          \"subpar_open_bracket\"\n      '[':                \"subpar_open_square_bracket\"\n      'Shift-[':          \"subpar_open_braces\"\n\n      'Shift-0':          \"subpar_close_bracket\"\n      ']':                \"subpar_close_square_bracket\"\n      'Shift-]':          \"subpar_close_braces\"\n\n      'Shift-\\'':          \"subpar_double_quote\"\n\n      'Ctrl-Alt-F':       \"subpar_forward\"\n      'Ctrl-Alt-B':       \"subpar_backward\"\n      'Ctrl-Alt-U':       \"subpar_backward_up\"\n      'Ctrl-Alt-D':       \"subpar_forward_down\"\n      'Ctrl-Alt-P':       \"subpar_backward_down\"\n      'Ctrl-Alt-N':       \"subpar_forward_up\"\n\n      'Shift-Ctrl-[':     \"subpar_backward_barf\"\n      'Ctrl-Alt-Right':   \"subpar_backward_barf\"\n      'Ctrl-]':           \"subpar_backward_barf\"\n\n      'Shift-Ctrl-]':     \"subpar_forward_barf\"\n      'Ctrl-Left':        \"subpar_forward_barf\"\n\n      'Shift-Ctrl-9':     \"subpar_backward_slurp\"\n      'Ctrl-Alt-Left':    \"subpar_backward_slurp\"\n      'Ctrl-[':           \"subpar_backward_slurp\"\n\n      'Shift-Ctrl-0':     \"subpar_forward_slurp\"\n      'Ctrl-Right':       \"subpar_forward_slurp\"\n\n      'Alt-Up':           \"subpar_splice_delete_backward\"\n      'Alt-Down':         \"subpar_splice_delete_forward\"\n      'Alt-S':            \"subpar_splice\"\n      'Ctrl-Alt-/':       \"subpar_indent_selection\"\n    })\n\n  ## paredit keys that defer if not in lisp code\n  (ref lisp-modes {lispz: true clojure: true commonlisp: true scheme: true})\n  (ref subpart (lambda [cmd opt]\n    (return (lambda [cm]\n      (ref mode (cm.getModeAt (cm.getCursor)))\n      (cond (get lisp-modes mode.name)  ((get subpar.core cmd) cm opt)\n            (else)                      (return CodeMirror.Pass)\n      )\n    ))\n  ))\n  (ref code-mirror-commands (state.morph CodeMirror.commands))\n  (code-mirror-commands.update! {\n    ## paredit keys that defer if not in lisp code\n    subpar_backward_delete:        (subpart \"backward_delete\")\n    subpar_forward_delete:         (subpart \"forward_delete\")\n    subpar_forward_delete:         (subpart \"forward_delete\")\n\n    subpar_open_bracket:           (subpart \"open_expression\" \"()\")\n    subpar_open_square_bracket:    (subpart \"open_expression\" \"[]\")\n    subpar_open_braces:            (subpart \"open_expression\" \"{}\")\n\n    subpar_close_bracket:          (subpart \"close_expression\" \")\")\n    subpar_close_square_bracket:   (subpart \"close_expression\" \"]\")\n    subpar_close_braces:           (subpart \"close_expression\" \"}\")\n\n    subpar_double_quote:           (subpart \"double_quote\")\n\n    subpar_forward:                (subpart \"forward\")\n    subpar_backward:               (subpart \"backward\")\n    subpar_backward_up:            (subpart \"backward_up\")\n    subpar_forward_down:           (subpart \"forward_down\")\n    subpar_backward_down:          (subpart \"backward_down\")\n    subpar_forward_up:             (subpart \"forward_up\")\n\n    subpar_backward_barf:          (subpart \"backward_barf\")\n    subpar_backward_barf:          (subpart \"backward_barf\")\n    subpar_backward_barf:          (subpart \"backward_barf\")\n\n    subpar_forward_barf:           (subpart \"forward_barf\")\n    subpar_forward_barf:           (subpart \"forward_barf\")\n\n    subpar_backward_slurp:         (subpart \"backward_slurp\")\n    subpar_backward_slurp:         (subpart \"backward_slurp\")\n    subpar_backward_slurp:         (subpart \"backward_slurp\")\n\n    subpar_forward_slurp:          (subpart \"forward_slurp\")\n    subpar_forward_slurp:          (subpart \"forward_slurp\")\n\n    subpar_splice_delete_backward: (subpart \"splice_delete_backward\")\n    subpar_splice_delete_forward:  (subpart \"splice_delete_forward\")\n    subpar_splice:                 (subpart \"splice\")\n    subpar_indent_selection:       (subpart \"indent_selection\")\n  })\n"

lispz_modules['projects']="(using [github dexie]\n  ### spec: Projects\n    Empiric can work on one project at a time. A project is a reflection of\n    a Github project - warts and all. A best effort is made to keep the local\n    copy and that on Github in sync.\n  ###\n  (ref db (new Dexie \"Empiric-Projects\"))\n  ((db.version 1).stores {\n    projects: \"&name\"\n    files: \"++,project,path\"\n  })\n  (db.open)\n\n  ### spec: Projects >> Open a Project\n    Once a project has been added to the system on this browser, it can be\n    opened by name. Returned is an object with the cached project meta-data\n    and a reference for accessing the GitHub repository.\n      (describe \"Open a project that does not exist\" (lambda []\n        (ref project (projects.open \"I don't exist\"))\n      ))\n      (describe \"Open an existing project\" (lambda []\n        (ref project (projects.open \"Empiric\"))\n      ))\n  ###\n  (ref open (lambda [name]\n    (return (when (db.projects.get name) [data]\n      (ref repo (github.repo data.username data.password data.project-name))\n      (return {meta-data: data repo})\n    ))\n  ))\n\n  ### spec: Projects >> Add or Update a Project\n    It is possible to change some of the meta-data associated with a project.\n    Most specifically this includes the necessaries to contact the GitHub\n    source of truth for this project.\n  ###\n  (ref add (lambda [name username password project-name]\n    (ref project (db.projects.get name))\n    (ref update! (lambda [data]\n      (ref data (stateful.morph data))\n      (data.update! username password project-name)\n      (return (db.projects.put data))\n    ))\n    (when  project [data] (update! data))\n    (catch project [err] (update! {name}))\n  ))\n\n  ### spec: Projects >> List Known Projects\n    Return a promise that when fulfilled will provide an array of project\n    meta-data. It returns a promise.\n\n        (describe \"List Projects\" (lambda []\n          (it \"will return a list of known projects\" (lambda []\n            (when (projects.list) [list] (lambda []\n              ((expect list.length).toBeGreaterThan 0)\n            ))\n          ))\n        ))\n  ###\n  (ref list (lambda [] (return (db.projects.toArray))))\n\n  (export open)\n)\n"

lispz_modules['regex']="\n### spec: regex >> Extracting a substring\nA common problem is finding part of a string given a pattern.\n\n    (regex.substring href '/(.*)\\/[^\\/]*$/') ## retrieve base part of url\n###\n(ref substring (lambda [str re]\n  (ref match (str.match re))\n  (cond match (return (get match 1)))\n  (return \" \")\n))\n\n(export {substring})\n"

lispz_modules['riot']="### spec: Riot\n\n[Riot](http://riotjs.com) is a tiny UI library then provides the best of Web components (polymer) and react in a package 15% of the size.\n\nRiot, like web components, each file (of type .riot.html) is a html fragment that also includes style and script elements. Like web components it is based on creating custom tags. This provides clean and readable HTML. Custom tags makes the HTML more readable.\n\nThe *panel* tags is a Riot wrapper around bootstrap panels.\n\nRiot, like React it works with a virtual DOM and only updates changes to the real DOM. Like React it compiles to JavaScript. It can be supported on older browsers.\n\nSmall tight API that provides all needed web component functionality for reactive views, events and routing.\n###\n\n### spec: Riot >> Structure of a RIOT/Lispz Program\n\nRiot components have the extension *.riot.html*. They are loaded from the HTML file or from another component. In the HTML, give a custom tag the class or *riot* and it will load a component file of the same name - including any other tags in the file. The html below will load *bootstrap.riot.html* and *code-editor.riot.html*, while *page-content* does not need a riot class as it is defined withing *bootstrap*.\n\n    <bootstrap class=riot>\n      <page-content fluid=true>\n        <div class=col-sm-6>\n          <code-editor class=riot name=literate height=48% />\n        </div>\n        <div class=col-sm-6>\n          <code-editor class=riot name=code height=48% />\n        </div>\n      </page-content>\n    </bootstrap>\n\nFor riot component files that rely on other files for sub-components, Start the file with a comment, the word *using* and a space separated list of component paths. In the example below, *panel* is a tag defined in the bootstrap component file.\n\n    <!-- using bootstrap -->\n    <code-editor>\n      <panel height={ opts.height } heading={ heading } menu={ menu } owner={ _id }>\n        <div name=wrapper class=wrapper></div>\n      </panel>\n      <style>code-editor .wrapper {...}</style>\n      <script type=text/lispz>(ref tag this) ...</script>\n    </code-editor>\n\nRiot uses plain JavaScript inside {} as a templating solution. The *opts* dictionary matches the attributes when the custom tag is referenced. Any inner tag with a *name* or *id* attribute can be referenced by the same name. Each component has a unique *_id*.\n\nStyles are global (unlike *true* web components). This is easily overcome using explicit name-spacing as above.\n###\n\n### spec: Riot >> Using other languages\n\nScripting can be any language of choice that runs on the browser. JavaScript, Lispz, Es6 (with babel) and CoffeeScript are available out-of-the-box. For the latter two you will need to load the compiler by *(using babel coffeescript)* in the startup code. Other languages can be added as long as they compile code on the browser.\n\n    (set! riot.parsers.js.lispz\n      (lambda [source] (return ((lispz.compile source \"riot-tags\").join \"\\n\")))\n    )\n###\n(using  [jquery net github dict]\n  (ref compile (lambda [html to-js] (return (riot.compile html to-js))))\n\n  (ref processed-tags (stateful {}))\n\n  (ref load (promise [name uri]\n    (ref load-tags-used (lambda [tags]\n      (ref new-tags (tags.filter (lambda [tag]\n        (return-if (get processed-tags tag) false)\n        (processed-tags.update! tag true)\n        (return true)\n      )))\n      (ref loaded (promise.all (new-tags.map (lambda [tag] (return (load tag))))))\n      (when loaded [] (resolve-promise))\n    ))\n    (ref usings (lambda [source]\n      (ref tags ('/<!--\\s*using\\s*(.*?)\\s*-->/'.exec source))\n      (cond\n        tags   (load-tags-used ((last tags).split '/\\s+/'))\n        (else) (resolve-promise)\n      )\n    ))\n    (ref retrieve-and-compile (lambda []\n      (ref url (or uri (+ (name.toLowerCase) \".riot.html\")))\n      (when (net.http-get url) [tag] (usings (compile tag)))\n    ))\n\n    (cond\n      (get lispz.tags name) (usings ((get lispz.tags name)))\n      (else)                (retrieve-and-compile)\n    )\n  ))\n\n  (ref build (lambda [target-repo]\n    (return (github.build target-repo \"riot\" [[\n      {repo: \"riot/riot\" files: [[\n        {include: '/^riot\\+compiler.js$/'}\n      ]]}\n    ]]))\n  ))\n\n  (ref mount (lambda [tags] (riot.mount.apply riot argument)))\n\n  ### spec: riot >> Trigger Display Changes\n    Given a component context called *tag*, it is possible to change context\n    data using the state component.\n\n      <script type=text/lispz>\n        (ref tag (stateful.morph this))\n        ...\n        (ref async-set-title (lambda [title]\n          (tag.update! {title})\n          (tag.update)\n        )\n      </script>\n\n    For the confused, *update!* changes entries in the stateful context,\n    while *update* is a riot function to update the display for bound\n    data changes. Continue to use this approach where the data has logic\n    around the change, but for the common situation where data is changed\n    at the end of the logic, use *riot.update!*.\n\n      (using [riot]\n        ...\n        (ref async-set-titles (lambda [title footer]\n          (riot.update! tag {title footer})\n        )\n      )\n  ###\n  (ref update! (lambda [tag changes]\n    (tag.update! changes)\n    (tag.update) ## repaint\n  ))\n\n  ### spec: riot >> Tag support\n    Riot uses _this_ as context for codes within a tag. Also, when errors are\n    found it throws excepts that are difficult to track. Lispz provides help\n    with a riot-tag macro which invokes _using_,  provides a _tag_ reference\n    and wraps the code in a _try/catch_ to provide improved error reporting.\n\n      @TODO example\n  ###\n  (macro riot-tag [modules *body]\n    'var tag=this;'\n    (using modules\n      (#join '' 'try {' *body '}catch(err){console.error(err,tag)}')\n    )\n  )\n\n  ### spec: async >> Events\n    Events follow [the observer pattern](https://en.wikipedia.org/wiki/Observer_pattern). Lispz provides access to the light-weight version in Riot. If you use Riot for UI components, the custom tags are always observers. You don't need to use riot to make use of events. You can either create an observable or make any object in the system observable.\n\n        (using [riot]\n          (ref observable-1 (riot.observable))\n          (ref element (get-my-element))\n          (riot.observable element)\n        )\n\n    Once that is out of the way, tell the observable what to do if it receives an event either once or every time.\n\n        (observable-1.on \"event-name\" (lambda [params...] what to do...))\n        (element.one \"focus\" (lambda [contents] (element.set contents)))\n\n    One observable can have many listeners for the same or different events. Use 'trigger' to wake an observable.\n\n        (observable-1.trigger \"event-name\" param1 param2)\n\n    Finally there needs to be a way to stop listening.\n\n        (observable-1.off \"event-name\" event-function-reference) ## stops one listener\n        (observable-1.off \"event-name\") ## stops all listeners to an event\n        (observable-1.off \"*\")          ## stops all listeners to all events for observable\n\n    ## Benefits\n    1. Decouples the code to whatever extent is necessary.\n    2. Associates code and data (such as the DOM).\n    3. Allows multiple invocations\n\n    ## Disadvantages\n    1. Too convoluted to use as an easy replacement for callbacks\n    2. One-way communication\n    3. No way of knowing if event was processed as expected.\n  ###\n\n  (ref   loaded (net.script \"ext/riot.js\" (lambda [] (return window.riot))))\n  (catch loaded [] (export {build}))\n  (when  loaded [] (using [compilers]\n    (stateful.morph! riot.parsers.js)\n    (riot.parsers.js.update! {lispz:\n      (lambda [source]\n        (ref js (compilers.lispz.compile source \"riot-tags\"))\n        (return (compilers.to-string js))\n      )\n    })\n    (ref riot-elements (slice (document.getElementsByClassName \"riot\")))\n    (ref load-all (promise.all (riot-elements.map (lambda [element]\n      (ref name (element.tagName.toLowerCase))\n      (return (load name (element.getAttribute \"uri\")))\n    ))))\n    (when load-all []\n      (riot.mount \"*\")\n      (export {build compile load mount update!})\n    )\n  ))\n)\n"

lispz_modules['sortable']="## https://github.com/RubaXa/Sortable\n(using [net cdnjs dict]\n\n  (ref sortable-defaults {\n    dataIdAttr: name\n    store: {\n      get: (lambda [sortable]\n        (ref items (localStorage.getItem sortable.options.group))\n        (return ((or items \"\").split \"|\"))\n      )\n      set: (lambda [sortable]\n        (localStorage.setItem sortable.options.group ((sortable.toArray).join \"|\"))\n      )\n    }\n  })\n  ### spec: DOM >> Sortable Components\n  ###\n  (ref create (lambda [container name options]\n    (return (Sortable.create container\n      (dict.merge  sortable-defaults {group: (or name (Math.random))} options)\n    ))\n  ))\n\n  (ref build (lambda [target-repo]\n    (return (cdnjs.build target-repo \"sortable\" [[\n      {repo: \"sortable\" files: [[{include '/Sortable.js/'}]]}\n    ]]))\n  ))\n  (ref loaded (net.script \"ext/sortable.js\" (lambda [] (return window.Sortable))))\n  (when  loaded [] (export {build create}))\n  (catch loaded [] (export {build}))\n)\n"
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
    try {
      if (/^'\/(?:.|\n)*'$/.test(atom)) return atom.slice(1, -1).replace(/\n/g, '\\n')
      if (/^'.*'$/.test(atom)) return atom.slice(1, -1).replace(/\\n/g, '\n')
      if (/^"(?:.|\r*\n)*"$/.test(atom)) return atom.replace(/\r*\n/g, '\\n')
      switch (atom[0]) {
        case '-': return atom // unary minus or negative number
        default:  return atom.replace(/\W/g, function(c) {
          var t = "$hpalcewqgutkri"["!#%&+:;<=>?@\\^~".indexOf(c)];
          return t ? ("_"+t+"_") : (c === "-") ? "_" : c })
      }
    } catch (err) {
      console.log(err)
      compile_error("Expecting an atom, found", atom)
    }
  },
  call_to_js = function(func, params) {
    params = slice.call(arguments, 1)
    if (synonyms[func]) func = synonyms[func]
    if (macros[func]) return macros[func].apply(lispz, params)
    func = ast_to_js(func)
    if (params[0] && params[0][0] === '.') func += params.shift()
    return func + '(' + params.map(ast_to_js).join(',') + ')'
  },
  drop_line_number = function(ast) {
    return (ast instanceof Array && ast[0] === "\n") ? ast.slice(3) : ast
  },
  function_to_js = function(params, body) {
    params = drop_line_number(params)
    if (params instanceof Array && params[0] == "[") {
      body = slice.call(arguments, 1)
    } else {
      body = slice.call(arguments, 0)
      params = ["["]  // empty parameter list for macro
    }
    var header = "function("+params.slice(1).map(jsify).join(",")+")"
    body = "{"+body.map(ast_to_js).join("\n")+"}\n"
    return header + body
  },
  macro_to_js = function(name, pnames, body) {
    pnames = drop_line_number(pnames)
    if (pnames instanceof Array && pnames[0] == "[") {
      body = slice.call(arguments, 2)
    } else {
      body = slice.call(arguments, 1)
      pnames = ["["]  // empty parameter list for macro
    }
    macros[name] = function(pvalues) {
      pvalues = drop_line_number(slice.call(arguments))
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
  compile = function(source, name) {
    try {
      var last_module = module
      module = {name:name || "", line:0}
      var js = parse_to_ast(source).map(ast_to_js)
      module = last_module
      return window.js_beautify ? js.map(js_beautify) : js
    } catch (err) {
      console.log(err)
      return compile_error(err.message || err, "for "+module.name+":"+module.line)
    }
  },
  run = function(name, source) { return compile(source, name).map(eval) }
  //######################### Script Loader ####################################//
  cache = {}, manifest = [], pending_module = {},
  http_request = function(uri, type, callback) {
    var req = new XMLHttpRequest()
    req.open(type, uri, true)
    if (lispz.debug_mode && uri.indexOf(":") == -1)
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
    var js = compile(lispz_modules[uri], uri).join('\n') +
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
        console.error(uri, e)
        //throw uri+": "+e
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
  set_debug_mode = function(debugging) {
    lispz.debug_mode = debugging
    load_one("js-beautify", function(){})
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
    '\n': eol_to_js, 'immediate': immediate_to_js, 'lambda': function_to_js
  }
  // add all standard binary operations (+, -, etc)
  "+,-,*,/,&&,||,==,===,<=,>=,!=,!==,<,>,^,%".split(',').forEach(binop_to_js)

  return { compile: compile, run: run, parsers: parsers, load: load,
           macros: macros, cache: cache, http_request: http_request,
           clone: clone, manifest: manifest, script: script, css: css,
           synonyms: synonyms, globals: globals, tags: {}, slice,
           path_base: lispz_base_path, set_debug_mode: set_debug_mode}
}()


/*bootstrap*/

lispz.tags['bootstrap']=function(){riot.tag('panel', ' <div class="panel { context }" name=outer> <div class=panel-heading if="{ opts.heading }" name=heading ><bars-menu align=right name="{ opts.menu }" owner="{ opts.owner }"></bars-menu> <h3 class=panel-title>{ opts.heading }</h3></div> <div class="panel-body" name=body><yield></yield></div> <div class=panel-footer if="{ opts.footer }" name=footer >{ opts.footer }</div> </div>', 'panel .panel { position: relative; } panel .panel-title { cursor: default; } panel .panel-body { position: absolute; top: 40px; bottom: 2px; left: 0; right: 2px; overflow: auto; } panel > .panel { margin-top: 10px; margin-bottom: 10px; }', function(opts) {var tag = lispz.globals.stateful.morph_$_(this); //#riot-tags:2
tag.update_$_({
       'context': ("panel-" + (opts.context || "default"))
   }) //#riot-tags:3
tag.on("mount", function() {
       lispz.load("dom" //#core:355
           ,
           function() {
               var dom = lispz.cache["dom"];
               switch (false) {
                   case !opts.height:
                       var px = opts.height; //#riot-tags:6

                       switch (false) {
                           case !("%" === opts.height.slice(-1)) //#riot-tags:7
                               :
                               var px = ((window.innerHeight * opts.height.slice(0, -1)) / 100); //#riot-tags:8
                       } //#core:149
                       //#riot-tags:9

                       dom.style_$_(tag.outer, {
                               'height': (px + "px")
                           }) //#riot-tags:10
               } //#core:149
               //#riot-tags:11
           }
           //#core:356
       )
   }) //#riot-tags:12
});

riot.tag('panels', '<yield></yield>', '/* show the move cursor as the user moves the mouse over the panel header.*/ panels .panel-title { cursor: move; }', function(opts) {var tag = lispz.globals.stateful.morph_$_(this); //#riot-tags:2
tag.on("mount", function() {
       lispz.load("sortable" //#core:355
           ,
           function() {
               var sortable = lispz.cache["sortable"];
               sortable.create(tag.root, (opts.name || "sortable"), {
                       'draggable': ".draggable",
                       'handle': ".panel-title",
                       'dataIdAttr': "name"
                   }) //#riot-tags:8
           }
           //#core:356
       )
   }) //#riot-tags:9
});

riot.tag('modal', ' <div class="modal fade" role="dialog" aria-labelledby="{ opts.name }"> <div class="modal-dialog" role="document"> <div class="modal-content"> <div class="modal-header" if="{ opts.title }"> <button type="button" class="close" data-dismiss="modal" aria-label="Close"> <span aria-hidden="true">&times;</span> </button> <h4 class="modal-title" id="{ opts.name }">{ opts.title }</h4> </div> <div class="modal-body"><yield></yield></div> <div class="modal-footer"> <button each="{ buttons }" class="btn btn-{ type }" name="{ name }"> { title } </button> </div> </div> </div> </div>', function(opts) {var tag = lispz.globals.stateful.morph_$_(this); //#riot-tags:2
switch (false) {
   case !opts.buttons:
       tag.update_$_({
               'buttons': []
           }) //#riot-tags:4

       opts.buttons.split(",").forEach(function(title) {
               var primary = ("*" === title[0]),
                   type = "default"; //#riot-tags:6

               switch (false) {
                   case !primary:
                       var type = "primary";
                       title.shift()
               } //#core:149
               //#riot-tags:7

               var name = title; //#riot-tags:8

               tag.buttons.push({
                       'title': title,
                       'type': type,
                       'name': name
                   }) //#riot-tags:9
           }) //#riot-tags:10
} //#core:149
//#riot-tags:11
});

riot.tag('bars-menu', ' <div name=dropdown class="dropdown { right: opts.align === \'right\' }"> <a style="text-decoration: none" data-toggle="dropdown" name=bars class="glyphicon glyphicon-menu-hamburger dropdown-toggle" aria-hidden="true" ></a> <ul class="dropdown-menu { dropdown-menu-right: opts.align === \'right\' }"> <li each="{ items }" class="{ dropdown-header: header && title, divider: divider, disabled: disabled }"><a onclick="{ goto }" href="#"> <span class="pointer right float-right" if="{ children }"></span> { title }&nbsp;&nbsp;&nbsp; </a></li> </ul> </div>', 'bars-menu > div.right { float: right } bars-menu span.caret { margin-left: -11px } bars-menu a.dropdown-toggle { cursor: pointer }', function(opts) {var tag = lispz.globals.stateful.morph_$_(this); //#riot-tags:2
tag.on("mount", function() {
       lispz.load("message,riot" //#core:355
           ,
           function() {
               var message = lispz.cache["message"],
                   riot = lispz.cache["riot"];
               message.listen(opts.name, function(items) {
                       riot.update_$_(tag, {
                               'items': items,
                               'root': (items || [])
                           }) //#riot-tags:5
                   }) //#riot-tags:6

               $(tag.dropdown).on("show.bs.dropdown", function() {
                       message.send((opts.name + "/open")) //#riot-tags:8

                       riot.update_$_(tag, {
                               'items': tag.root
                           }) //#riot-tags:9
                   }) //#riot-tags:10

               tag.update_$_({
                       'goto': function(ev) {
                           switch (false) {
                               case !ev.item.topic:
                                   message.send((opts.owner + "/" + ev.item.topic) //#riot-tags:13
                                       , {
                                           'item': ev.item,
                                           'owner': opts.owner,
                                           'action': "select"
                                       })
                           } //#core:149
                           //#riot-tags:14

                           switch (false) {
                               case !ev.item.children:
                                   tag.update_$_({
                                           'items': ev.item.children
                                       }) //#riot-tags:16

                                   ev.currentTarget.blur() //#riot-tags:17

                                   ev.stopPropagation() //#riot-tags:18
                           } //#core:149
                           //#riot-tags:19
                       }
                   }) //#riot-tags:20
           }
           //#core:356
       )
   }) //#riot-tags:21
});

riot.tag('tree', ' <tree-component name=base></tree-component>', function(opts) {var tag = lispz.globals.stateful.morph_$_(this); //#riot-tags:2
lispz.load("message,riot" //#core:355
       ,
       function() {
           var message = lispz.cache["message"],
               riot = lispz.cache["riot"];
           message.listen(opts.name, function(items) {
                   riot.update_$_(tag, {
                           'children': {
                               'base': {
                                   'children': items
                               }
                           }
                       }) //#riot-tags:5

                   tag.update()
               }) //#riot-tags:7
       }
       //#core:356
   ) //#riot-tags:8
});

riot.tag('tree-component', '<ul class="dropdown-menu"> <li each="{ item, i in items }" class="{ dropdown-header: item.header && item.title, divider: item.divider, disabled: item.disabled }" ><a onclick="{ parent.goto }" href="#"> <span if="{ item.children }" class="glyphicon glyphicon-triangle-right" aria-hidden="true"></span>{ item.title }</a> <tree-component if="{ item.children }" name="{ item.title }"> </li> </ul>', 'tree-component ul { display: inherit !important; position: inherit !important; } tree-component:not([name=base]) > ul { display: none !important; } tree-component:not([name=base]).open > ul { margin-left: 9px; margin-right: 9px; display: inherit !important; } tree-component span.glyphicon { margin-left: -18px; }', function(opts) {var tag = lispz.globals.stateful.morph_$_(this); //#riot-tags:2
lispz.load("message,dict" //#core:355
       ,
       function() {
           var message = lispz.cache["message"],
               dict = lispz.cache["dict"];
           tag.on("update", function(data) {
                   switch (false) {
                       case !(opts.name && tag.parent.children):
                           tag.update_$_({
                                   'items': tag.parent.children[opts.name]["children"]
                               }) //#riot-tags:6

                           switch (false) {
                               case !(tag.items && tag.items.length) //#riot-tags:7
                                   :
                                   tag.update_$_({
                                           'children': dict.from_list(tag.items, "title")
                                       }) //#riot-tags:8
                           } //#core:149
                           //#riot-tags:9
                   } //#core:149
                   //#riot-tags:10
               }) //#riot-tags:11
               //#riot-tags:12

           tag.update_$_({
                   'goto': function(ev) {
                       var item = ev.item.item; //#riot-tags:14

                       var topic = (item.topic || item.title); //#riot-tags:15

                       switch (false) {
                           case !topic:
                               message.send(topic, {
                                   'item': item,
                                   'action': "select"
                               })
                       } //#core:149
                       //#riot-tags:17

                       switch (false) {
                           case !item.children:
                               var tree = ev.currentTarget.nextElementSibling; //#riot-tags:19

                               tree.classList.toggle("open") //#riot-tags:20

                               tree.parentElement.classList.toggle("bg-info") //#riot-tags:21
                       } //#core:149
                       //#riot-tags:22

                       ev.stopPropagation() //#riot-tags:23
                   }
               }) //#riot-tags:24
       }
       //#core:356
   ) //#riot-tags:25
});

riot.tag('sidebar', ' <a aria-hidden="true" name=hamburger class="glyphicon glyphicon-menu-hamburger"></a> <div id=sidebar class="container bg-primary"><yield></yield></div>', 'sidebar > a { text-decoration: none !important; position: absolute !important; z-index: 2000; } #sidebar { z-index: 1000; position: fixed; width: 0; height: 100%; overflow-y: auto; -webkit-transition: all 0.5s ease; -moz-transition: all 0.5s ease; -o-transition: all 0.5s ease; transition: all 0.5s ease; padding-right: 0; overflow: hidden; } #sidebar.toggled { width: auto; padding-right: 15px; }', function(opts) {var tag = lispz.globals.stateful.morph_$_(this),
   hamburger = lispz.globals.stateful.morph_$_(tag.hamburger); //#riot-tags:2
lispz.load("message,dom" //#core:355
       ,
       function() {
           var message = lispz.cache["message"],
               dom = lispz.cache["dom"];
           hamburger.update_c_({
                   'onclick': function() {
                       tag.sidebar.classList.toggle("toggled") //#riot-tags:5

                       setTimeout(function() {
                               message.send("page-content-wrapper-padding", tag.sidebar.offsetWidth) //#riot-tags:7
                           }, 300) //#riot-tags:8
                   }
               }) //#riot-tags:9

           tag.on("mount", setTimeout(function() {
                   message.send("page-content-wrapper-padding", tag.sidebar.offsetWidth) //#riot-tags:11
               }, 300)) //#riot-tags:12
       }
       //#core:356
   ) //#riot-tags:13
});

riot.tag('page-content', '<div id=page_content_wrapper> <div class="{ container-fluid: opts.fluid, container: !opts.fluid }"> <yield></yield> </div> </div>', '#page_content_wrapper { width: 100%; position: absolute; }', function(opts) {var tag = this; //#riot-tags:2
lispz.load("message,dom" //#core:355
       ,
       function() {
           var message = lispz.cache["message"],
               dom = lispz.cache["dom"];
           message.listen("page-content-wrapper-padding", function(px) {
                   dom.style_$_(tag.page_content_wrapper, {
                           'paddingLeft': (px + "px")
                       }) //#riot-tags:5
               }) //#riot-tags:6
       }
       //#core:356
   ) //#riot-tags:7
});

riot.tag('bootstrap', '<div id=page-wrapper><yield></yield></div>', '.pointer { border: 5px solid transparent; display: inline-block; width: 0; height: 0; vertical-align: middle; } .pointer.float-right { float: right; margin-top: 5px; } .pointer.up { border-bottom: 5px solid; } .pointer.right { border-left: 5px solid; } .pointer.down { border-top: 5px solid; } .pointer.left { border-right: 5px solid; }', function(opts) {var tag = lispz.globals.stateful.morph_$_(this); //#riot-tags:2
lispz.load("dom,net,jquery,riot,message,bootstrap" //#core:355
       ,
       function() {
           var dom = lispz.cache["dom"],
               net = lispz.cache["net"],
               jquery = lispz.cache["jquery"],
               riot = lispz.cache["riot"],
               message = lispz.cache["message"],
               bootstrap = lispz.cache["bootstrap"];
           dom.append_$_("head", dom.element("meta", {
                       'name': "viewport",
                       'content': "width=device-width, initial-scale=1"
                   } //#riot-tags:5
               )) //#riot-tags:6
       }
       //#core:356
   ) //#riot-tags:7
});

return ''}


/*code-editor*/

lispz.tags['code-editor']=function(){riot.tag('code-editor', '<panel height="{ opts.height }" heading="{ heading }" menu="{ menu }" owner="{ _id }"> </panel>', 'code-editor .CodeMirror { position: absolute; top: 0; bottom: 0; left: 5px; right: 0; height: initial; }', function(opts) {var tag = lispz.globals.stateful.morph_$_(this); //#riot-tags:2
tag.update_$_({
       'menu': "CodeMirror-menu",
       'heading': (opts.heading || "Edit")
   }) //#riot-tags:3
tag.on("mount", function() {
       lispz.load("codemirror,message,dict" //#core:355
           ,
           function() {
               var codemirror = lispz.cache["codemirror"],
                   message = lispz.cache["message"],
                   dict = lispz.cache["dict"];
               var filename_key = ("code-editor/" + opts.name + "/filename"); //#riot-tags:5

               var cm = codemirror.open(tag._id, tag.tags.panel.body); //#riot-tags:6
               //#riot-tags:7

               var open = function(packet) {
                   codemirror.set_mode(cm, packet.key) //#riot-tags:9

                   switch (false) {
                       case !(packet.key[0] !== "."):
                           tag.update_$_({
                                   'heading': packet.key.split("/").slice(-1)[0]
                               }) //#riot-tags:11

                           tag.update() //#riot-tags:12
                   } //#core:149
                   //#riot-tags:13

                   localStorage.setItem(filename_key, packet.key) //#riot-tags:14

                   cm.setValue(packet.contents) //#riot-tags:15
               }; //#riot-tags:16
               //#riot-tags:17

               var contents_key = ("code-editor/" + opts.name + "/contents"); //#riot-tags:18

               var filename = localStorage.getItem(filename_key); //#riot-tags:19

               switch (false) {
                   case !filename:
                       setTimeout(function() {
                           open({
                                   'key': filename,
                                   'contents': localStorage.getItem(contents_key)
                               }) //#riot-tags:21
                       }, 100)
               } //#core:149
               //#riot-tags:22

               cm.on("change", function() {
                       localStorage.setItem(contents_key, cm.getValue()) //#riot-tags:24
                   }) //#riot-tags:25
                   //#riot-tags:26

               var append = function(packet) {
                   cm.replaceRange(packet.contents, CodeMirror.Pos(cm.lastLine())) //#riot-tags:28
               }; //#riot-tags:29
               //#riot-tags:30

               message.dispatch(("code-editor/" + opts.name), {
                       'open': open,
                       'append': append
                   }) //#riot-tags:31
           }
           //#core:356
       )
   }) //#riot-tags:32
});

return ''}


/*codemirror*/

lispz.tags['codemirror']=function(){riot.tag('codemirror', '<div name=wrapper> </div>', function(opts) {var tag = lispz.globals.stateful.morph_$_(this); //#riot-tags:2
tag.on("mount", function() {
       lispz.load("codemirror" //#core:355
           ,
           function() {
               var codemirror = lispz.cache["codemirror"];
               tag.update_$_({
                       'cm': CodeMirror(tag.wrapper, opts)
                   }) //#riot-tags:4
           }
           //#core:356
       )
   }) //#riot-tags:5
});

return ''}


/*firepad*/

lispz.tags['firepad']=function(){riot.tag('firepad', ' <panel height="{ opts.height }" heading="{ heading }" menu="{ menu }" owner="{ _id }"> <div name=wrapper class=wrapper></div> </panel>', 'firepad .wrapper { position: absolute; top: 0; bottom: 0; left: 0; right: 0; height: initial; } firepad .CodeMirror { position: absolute; top: 0; bottom: 0; left: 5px; right: 0; height: initial; } a.powered-by-firepad { display: none; } div.firepad-toolbar { margin-top: -25px; }', function(opts) {var tag = lispz.globals.stateful.morph_$_(this); //#riot-tags:2
tag.update_$_({
       'menu': "CodeMirror-menu"
   }) //#riot-tags:3
tag.update_$_({
       'heading': "Edit"
   }) //#riot-tags:4
tag.on("mount", function() {
       lispz.load("firebase,codemirror,firepad,message,dict" //#core:355
           ,
           function() {
               var firebase = lispz.cache["firebase"],
                   codemirror = lispz.cache["codemirror"],
                   firepad = lispz.cache["firepad"],
                   message = lispz.cache["message"],
                   dict = lispz.cache["dict"];
               var filename_key = ("codemirror/" + opts.name + "/filename"); //#riot-tags:6

               var cm = codemirror.open(tag._id, tag.tags.panel.wrapper); //#riot-tags:7

               tag.update_$_({
                       'pad': lispz.globals.stateful({
                           'setText': function(contents) {
                                   cm.setValue(contents)
                               }
                               //#riot-tags:9
                               ,
                           'on_ready': function(act) {
                                   act()
                               }
                               //#riot-tags:10
                       })
                   }) //#riot-tags:11
                   //#riot-tags:12

               var open = function(packet) {
                   codemirror.set_mode(cm, packet.key) //#riot-tags:14

                   tag.update_$_({
                           'heading': packet.key.split("/").slice(-1)[0]
                       }) //#riot-tags:15

                   localStorage.setItem(filename_key, packet.key) //#riot-tags:16

                   switch (false) {
                       case !packet.contents:
                           tag.pad.setText(packet.contents)
                   } //#core:149
                   //#riot-tags:17

                   tag.update() //#riot-tags:18
               }; //#riot-tags:19
               //#riot-tags:20

               switch (false) {
                   case !opts.db:
                       var db = firebase.attach(("firepads/" + opts.name), opts.db); //#riot-tags:23

                       tag.update_$_({
                               'pad': stateful.morph(Firepad.fromCodeMirror(db, cm, {
                                       'richTextShortcuts': false,
                                       'richTextToolbar': false
                                   } //#riot-tags:25
                               ))
                           }) //#riot-tags:26

                       tag.pad.update_$_({
                               'on_ready': function(act) {
                                   tag.pad.on("ready", act)
                               }
                           }) //#riot-tags:27
                       ;
                       break;
                   case !true:
                       var contents_key = ("codemirror/" + opts.name + "/contents"); //#riot-tags:29

                       var filename = localStorage.getItem(filename_key); //#riot-tags:30

                       switch (false) {
                           case !filename:
                               setTimeout(function() {
                                   open({
                                           'key': filename,
                                           'contents': localStorage.getItem(contents_key)
                                       }) //#riot-tags:33
                               }, 100)
                       } //#core:149
                       //#riot-tags:34

                       cm.on("change", function() {
                               localStorage.setItem(contents_key, cm.getValue()) //#riot-tags:36
                           }) //#riot-tags:37
                           //#riot-tags:38
               } //#core:149
               //#riot-tags:39
               //#riot-tags:40

               tag.pad.on_ready(function() {
                       message.dispatch(("firepad/" + opts.name), {
                               'open': open
                           }) //#riot-tags:42
                   }) //#riot-tags:43
           }
           //#core:356
       )
   }) //#riot-tags:44
});

return ''}


/*github*/

lispz.tags['github']=function(){riot.tag('github-login', '<modal name=github-login title="GitHub Login" buttons="*Sign In"> <img src=GitHub-Mark-64px.png> <form class=form-horizontal> <input type=text class=form-control name=username placeholder="User Name"> <br> <input type=password class=form-control name=password placeholder=Password> <br> <input type=checkbox name=remember-me data-toggle=tooltip title="Only use on a secure, private account"> Remember me </form> </modal>', function(opts) {var tag = this; //#riot-tags:2
tag.on("mount", function() {
       lispz.load("github,message" //#core:355
           ,
           function() {
               var github = lispz.cache["github"],
                   message = lispz.cache["message"];
           }
           //#core:356
       )
   }) //#riot-tags:4
});

return ''}


/*iframe-panel*/

lispz.tags['iframe-panel']=function(){riot.tag('iframe-panel', '<panel height="{ opts.height }" heading="{ heading }" menu="{ menu }" owner="{ _id }"> <iframe name=iframe class=iframe></iframe> </panel>', 'iframe-panel .panel-body { bottom: 0; left: 1px; right: 1px; padding: 0; padding-bottom: 1px; } iframe-panel .iframe { position: absolute; height: 100%; width: 100%; }', function(opts) {var tag = lispz.globals.stateful.morph_$_(this); //#riot-tags:2
tag.update_$_({
       'menu': opts.menu,
       'heading': opts.heading
   }) //#riot-tags:3
tag.on("mount", function() {
       lispz.load("message" //#core:355
           ,
           function() {
               var message = lispz.cache["message"];
               var iframe = tag.tags.panel.iframe; //#riot-tags:5

               var iframe_doc = (iframe.contentDocument || iframe.contentWindow.document); //#riot-tags:6
               //#riot-tags:7

               switch (false) {
                   case !opts.src:
                       iframe.setAttribute("src", opts.src)
               } //#core:149
               //#riot-tags:8
               //#riot-tags:9

               tag.update_$_({
                       'open': function(packet) {
                               tag.update_$_({
                                       'heading': (packet.heading || tag.heading)
                                   }) //#riot-tags:12

                               switch (false) {
                                   case !packet.menu:
                                       tag.update_$_({
                                           'menu': packet.menu
                                       })
                               } //#core:149
                               //#riot-tags:13

                               iframe_doc.open() //#riot-tags:14

                               iframe_doc.write(("<!DOCTYPE html><html><head><meta charset='utf-8'>" + (packet.head || "") + "</head><body>" + (packet.body || "") + "</body></html>")) //#riot-tags:18

                               iframe_doc.close() //#riot-tags:19

                               tag.update() //#riot-tags:20
                           }
                           //#riot-tags:21
                   }) //#riot-tags:22
           }
           //#core:356
       )
   }) //#riot-tags:23
});

return ''}


/*lispz*/

lispz.tags['lispz']=function(){<!-- using bootstrap code-editor markdown -->
riot.tag('lispz', '<bootstrap class=riot> <page-content fluid=true> <panels name=editor-panels> <code-editor class="riot col-sm-6 draggable" name=code height=48% heading=Lispz></code-editor> <code-editor class="riot col-sm-6 draggable" name=compiled height=48% heading="Generated Javascript"></code-editor> <code-editor class="riot col-sm-6 draggable" name=output height=48% heading="Console"></code-editor> <markdown class="riot col-sm-6 draggable" name=manual href="https://cdn.rawgit.com/paulmarrington/lispz/master/README.md" height=48% heading="Manual"></markdown> </panels> </page-content> </bootstrap>', function(opts) {var tag = this;
lispz.load("message,riot,dict" //#core:355
       ,
       function() {
           var message = lispz.cache["message"],
               riot = lispz.cache["riot"],
               dict = lispz.cache["dict"];
           try {
               lispz.set_debug_mode(true) //#riot-tags:3

               lispz.globals._h_resolve_deferred(message.ready("code-editor/code")).then(function() {
                       message.send("code-editor/code", {
                               'action': "open",
                               'key': ".lispz",
                               'contents': ""
                           }) //#riot-tags:6
                   }) //#core:572
                   //#riot-tags:7

               message.listen("code-editor/run/js", function(compiled) {
                       message.send("code-editor/output", {
                               'action': "open",
                               'key': ".txt",
                               'contents': ""
                           }) //#riot-tags:11

                       message.send("code-editor/compiled", {
                               'action': "open",
                               'key': ".js",
                               'contents': compiled.js
                           }) //#riot-tags:14
                   }) //#riot-tags:15
                   //#riot-tags:16

               lispz.globals.stateful.morph_$_(console) //#riot-tags:17

               console.update_$_({
                       'log': function() {
                           message.send("code-editor/output", {
                                   'action': "append",
                                   'key': ".text",
                                   'contents': (lispz.slice.call(arguments, 0).join(" ") + "\n") //#riot-tags:22
                               }) //#riot-tags:23
                       }
                   }) //#riot-tags:24

               message.listen("code-editor/run/output", function(run) {}) //#riot-tags:25
           } catch (err) {
               console.error(err, tag)
           } //#riot:138
       }
       //#core:356
   ) //#riot:139
   //#riot-tags:26
});

return '<!-- using bootstrap code-editor markdown -->'}


/*markdown*/

lispz.tags['markdown']=function(){riot.tag('markdown', '<panel height="{ opts.height }" heading="{ heading }" menu="{ menu }" owner="{ _id }"> <div name=wrapper class=wrapper></div> </panel>', function(opts) {var tag = lispz.globals.stateful.morph_$_(this); //#riot-tags:2
var markdown_menu = ("panel/markdown/" + opts.name + "/menu"); //#riot-tags:3
var markdown_menu_action = (markdown_menu + "/action"); //#riot-tags:4
tag.update_$_({
       'menu': markdown_menu,
       'heading': opts.heading
   }) //#riot-tags:5
tag.on("mount", function() {
       lispz.load("markdown,dom,net,message,dict" //#core:355
           ,
           function() {
               var markdown = lispz.cache["markdown"],
                   dom = lispz.cache["dom"],
                   net = lispz.cache["net"],
                   message = lispz.cache["message"],
                   dict = lispz.cache["dict"];
               var contents_area = tag.tags.panel.body; //#riot-tags:7
               //#riot-tags:8

               var history = lispz.globals.stateful(); //#riot-tags:10

               message.listen((tag._id + "/" + markdown_menu_action), function(packet) {
                       load(packet.item.href)
                   }) //#riot-tags:13

               var open = function(md, from) {
                   var from = (from || ""); //#riot-tags:15

                   dom.inner_html_$_(contents_area, markdown.compile(md)) //#riot-tags:16

                   dom.select(contents_area, "a").forEach(function(link) {
                           var href = link.getAttribute("href"); //#riot-tags:18

                           switch (false) {
                               case !!(net.external_u_(href)):
                                   link.addEventListener("click", function(evt) {
                                           load((from + href)) //#riot-tags:21

                                           evt.preventDefault() //#riot-tags:22
                                       }) //#riot-tags:23
                           } //#core:149
                           //#riot-tags:24
                       }) //#riot-tags:25
               }; //#riot-tags:26

               var load = function(href) {
                   history.update_$_(href, true) //#riot-tags:29

                   var menu = dict.map(history, function(href) {
                       var title = net.url_actor(href).split(".")[0]; //#riot-tags:31

                       return {
                           'topic': markdown_menu_action,
                           'href': href,
                           'title': title
                       }
                       //#riot-tags:32
                   }); //#riot-tags:33

                   message.send(markdown_menu, menu.reverse()) //#riot-tags:34

                   var loaded = net.http_get(href); //#riot-tags:36

                   lispz.globals._h_resolve_deferred(loaded).then(function(md) {
                           open(md, net.url_path(href))
                       }) //#core:572
                       //#riot-tags:37

                   lispz.globals._h_resolve_deferred(loaded).catch(function(err) {
                           console.trace(err)
                       }) //#core:575
                       //#riot-tags:38
               }; //#riot-tags:39

               switch (false) {
                   case !opts.href:
                       load(opts.href)
               } //#core:149
               //#riot-tags:40
               //#riot-tags:41
               //#riot-tags:67

               message.dispatch(("showdown/" + opts.name), {
                       'open': open,
                       'load': load
                   }) //#riot-tags:68
           }
           //#core:356
       )
   }) //#riot-tags:69
});

return ''}
