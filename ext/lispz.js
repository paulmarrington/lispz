window.lispz_modules={}


lispz_modules[',(using [net github]
  (var build (lambda [target-repo]
    (return (github.build target-repo "bootstrap" [[
      {repo: "twbs/bootstrap" files: [[
        {base: "dist" exclude: '/\.map$|\.min\.|npm.js$/'}
        {base: "dist/fonts" copy-to: "fonts"}
      ]]}
    ]]))
  ))
  (lispz.css "ext/bootstrap.css")
  (when (net.script "ext/bootstrap.js") [] (export {build}))
)
,']=",(using [net github]
  (var build (lambda [target-repo]
    (return (github.build target-repo "bootstrap" [[
      {repo: "twbs/bootstrap" files: [[
        {base: "dist" exclude: '/\.map$|\.min\.|npm.js$/'}
        {base: "dist/fonts" copy-to: "fonts"}
      ]]}
    ]]))
  ))
  (lispz.css "ext/bootstrap.css")
  (when (net.script "ext/bootstrap.js") [] (export {build}))
)
,",

lispz_modules[',### Load packages from CDN and other web sources - listing them when possible ###
(using [net github]
  (var cdnjs-actors {
    list-all: (promise [repo path]
      (var base "http://api.cdnjs.com/libraries?fields=assets&search=")
      (when (net.json-request (+ base repo.name)) [json]
        ## select the correct repo for the name
        (var filtered (json.results.filter (lambda [it]
          (return (=== it.name repo.name))
        )))
        ((get filtered 0).assets.some (lambda [it]
          (return-if (contains it.version "alpha") false)
          (set! repo.base (+
            "https://cdnjs.cloudflare.com/ajax/libs/"
            repo.name "/" it.version "/"
          ))
          (resolve-promise it.files)
          (return true) ## found the one we want
        ))
      )
    )
    read: (promise [repo path]
      (var uri (+ repo.base path))
      (when (net.http-get uri [response] (resolve-promise response)))
    )
    repo: (lambda [target-repo name] (return {name lispz: {}}))
  })

  (export {
    build: (github.builder.bind null cdnjs-actors)
  })
)
,']=",### Load packages from CDN and other web sources - listing them when possible ###
(using [net github]
  (var cdnjs-actors {
    list-all: (promise [repo path]
      (var base "http://api.cdnjs.com/libraries?fields=assets&search=")
      (when (net.json-request (+ base repo.name)) [json]
        ## select the correct repo for the name
        (var filtered (json.results.filter (lambda [it]
          (return (=== it.name repo.name))
        )))
        ((get filtered 0).assets.some (lambda [it]
          (return-if (contains it.version "alpha") false)
          (set! repo.base (+
            "https://cdnjs.cloudflare.com/ajax/libs/"
            repo.name "/" it.version "/"
          ))
          (resolve-promise it.files)
          (return true) ## found the one we want
        ))
      )
    )
    read: (promise [repo path]
      (var uri (+ repo.base path))
      (when (net.http-get uri [response] (resolve-promise response)))
    )
    repo: (lambda [target-repo name] (return {name lispz: {}}))
  })

  (export {
    build: (github.builder.bind null cdnjs-actors)
  })
)
,",

lispz_modules[',(using  [net diff_match_patch message dict github]
  (var options (localStorage.getItem "CodeMirror-options"))
  (cond options (var options (JSON.parse options))
        (else)  (var options {
    lineNumbers:        true
    foldGutter:         true
##  gutters:            ["CodeMirror-lint-markers"
##                       "CodeMirror-foldgutter"]
    lint:               true
    matchBrackets:      true
    autoCloseBrackets:  true
    matchTags:          true
    showTrailingSpace:  true
    inputStyle:         "textarea" ## change to "contenteditable" after vim cursor bug fix
    autofocus:          true
    dragDrop:           false
    smartIndent:        true
    indentUnit:         2
    indentWithTabs:     false
    cursorScrollMargin: 5
    scrollbarStyle:     "overlay"
    extraKeys:          {
      'Cmd-Left':         "goLineStartSmart"
      'Ctrl-Q':           "fold_at_cursor"
      'Ctrl-Space':       "autocomplete"
      'Ctrl-/':           "toggleComment"
      'Ctrl-<':           "goColumnLeft"
      'Ctrl->':           "goColumnRight"
      'Ctrl-Shift-F':     "clearSearch"
      'Ctrl-=':           "toMatchingTag"
      'Alt-S':            "view_source"
      'Ctrl-`':           "insertSoftTab"
      'Ctrl-,':           "delLineLeft"
      'Ctrl-.':           "killLine"
      'Shift-Ctrl-,':     "delWrappedLineLeft"
      'Shift-Ctrl-.':     "delWrappedLineRight"
      'Ctrl-9':           "delWordBefore"
      'Ctrl-0':           "delWordAfter"
      'Ctrl-6':           "transposeChars"
      'Ctrl-Left':        "goWordLeft"
      'Ctrl-Right':       "goWordRight"
      'Ctrl-Home':        "goLineLeft"
      'Ctrl-Shift-Home':  "goLineLeftSmart"
      'Ctrl-End':         "goLineRight"
      ## paredit keys that defer if not in lisp code
      'Backspace':        "subpar_backward_delete"
      'Delete':           "subpar_forward_delete"
      'Ctrl-D':           "subpar_forward_delete"

      'Shift-9':          "subpar_open_bracket"
      '[':                "subpar_open_square_bracket"
      'Shift-[':          "subpar_open_braces"

      'Shift-0':          "subpar_close_bracket"
      ']':                "subpar_close_square_bracket"
      'Shift-]':          "subpar_close_braces"

      'Shift-\'':          "subpar_double_quote"

      'Ctrl-Alt-F':       "subpar_forward"
      'Ctrl-Alt-B':       "subpar_backward"
      'Ctrl-Alt-U':       "subpar_backward_up"
      'Ctrl-Alt-D':       "subpar_forward_down"
      'Ctrl-Alt-P':       "subpar_backward_down"
      'Ctrl-Alt-N':       "subpar_forward_up"

      'Shift-Ctrl-[':     "subpar_backward_barf"
      'Ctrl-Alt-Right':   "subpar_backward_barf"
      'Ctrl-]':           "subpar_backward_barf"

      'Shift-Ctrl-]':     "subpar_forward_barf"
      'Ctrl-Left':        "subpar_forward_barf"

      'Shift-Ctrl-9':     "subpar_backward_slurp"
      'Ctrl-Alt-Left':    "subpar_backward_slurp"
      'Ctrl-[':           "subpar_backward_slurp"

      'Shift-Ctrl-0':     "subpar_forward_slurp"
      'Ctrl-Right':       "subpar_forward_slurp"

      'Alt-Up':           "subpar_splice_delete_backward"
      'Alt-Down':         "subpar_splice_delete_forward"
      'Alt-S':            "subpar_splice"
      'Ctrl-Alt-/':       "subpar_indent_selection"

      'Alt-Enter':        "lispz_run_selection"
     }
  }))
  ## write changed options back to persistent storage
  (var update-options (=>
    (localStorage.setItem "CodeMirror-options" (JSON.stringify options))
  ))
  ## Context menu for code editor
  (var topic "CodeMirror-command")
  (var menu [[
    ### {title: "File" children: [[
      {topic meta: "save" title: "Save"}
    ]]} ###
    {title: "Edit" children: [[
      {topic meta: "autocomplete" title: "Auto-Complete" }
      {topic meta: "redo" title: "Redo"}
      {topic meta: "undo" title: "Undo"}
      {topic meta: "redoSelection" title: "Redo Selection"}
      {topic meta: "undoSelection" title: "Undo Selection"}
      {divider: true}
      {topic meta: "toggleOverwrite" title: "Insert/Overwrite"}
      {topic meta: "toggleComment" title: "Comment/Uncomment" }
      {topic meta: "insertSoftTab" title: "Insert Soft Tab" }
      {topic meta: "defaultTab" title: "Tab or Indent"}
      {title: "Delete" children: [[
        {topic meta: "deleteLine" title: "Line"}
        {topic meta: "killLine" title: "Line Right" }
        {topic meta: "delLineLeft" title: "Line Left" }
        {divider: true}
        {topic meta: "delWrappedLineLeft" title: "Wrapped Line Left" }
        {topic meta: "delWrappedLineRight" title: "Wrapped Line Right" }
        {divider: true}
        {topic meta: "delWordBefore" title: "Word Left" }
        {topic meta: "delWordAfter" title: "Word Right" }
        {divider: true}
        {topic meta: "delGroupBefore" title: "Group Before"}
        {topic meta: "delGroupAfter" title: "Group After"}
        {divider: true}
        {topic meta: "delCharBefore" title: "Character Left"}
        {topic meta: "delCharAfter" title: "Character Right"}
      ]]}
      {topic meta: "indentAuto" title: "Auto Indent"}
      {topic meta: "indentLess" title: "Indent Left"}
      {topic meta: "indentMore" title: "Indent Right"}
      {topic meta: "newlineAndIndent" title: "New line and indent"}
      {divider: true}
      {topic meta: "transposeChars" title: "Transpose Characters" }
      {divider: true}
      {topic meta: "selectAll" title: "Select All"}
      {topic meta: "singleSelection" title: "Single Selection"}
    ]]}
    {title: "Go" children: [[
      {topic meta: "goDocStart" title: "Document Start"}
      {topic meta: "goDocEnd" title: "Document End"}
      {divider: true}
      {topic meta: "goCharLeft" title: "Char Left"}
      {topic meta: "goCharRight" title: "Char Right"}
      {divider: true}
      {topic meta: "goColumnLeft" title: "Column Left" }
      {topic meta: "goColumnRight" title: "Column Right" }
      {divider: true}
      {topic meta: "goGroupLeft" title: "Group Left"}
      {topic meta: "goGroupRight" title: "Group Right"}
      {divider: true}
      {topic meta: "goWordLeft" title: "Word Left" }
      {topic meta: "goWordRight" title: "Word Right" }
      {divider: true}
      {topic meta: "goLineStart" title: "Line Start"}
      {topic meta: "goLineStartSmart" title: "Smart Line Start" }
      {topic meta: "goLineEnd" title: "Line End"}
      {divider: true}
      {topic meta: "goLineLeft" title: "Line Left" }
      {topic meta: "goLineLeftSmart" title: "Smart Line Left" }
      {topic meta: "goLineRight" title: "Line Right" }
      {divider: true}
      {topic meta: "goLineUp" title: "Line Up"}
      {topic meta: "goLineDown" title: "Line Down"}
      {divider: true}
      {topic meta: "goPageUp" title: "Page Up"}
      {topic meta: "goPageDown" title: "Page Down"}
    ]]}
    {title: "Search" children: [[
      {topic meta: "find" title: "Find..."}
      {topic meta: "findNext" title: "Find Next"}
      {topic meta: "findPrev" title: "Find Previous"}
      {topic meta: "clearSearch" title: "Clear Search" }
      {divider: true}
      {topic meta: "replace" title: "Replace"}
      {topic meta: "replaceAll" title: "Replace All"}
      ## {divider: true} appears to only work for XML
      ## {topic meta: "toMatchingTag" title: "Matching Tag" }
    ]]}
    {title: "View" children: [[
      {topic meta: "view_keyboard_shortcuts" title: "Keyboard Shortcuts" }
      {topic meta: "fold_at_cursor" title: "Fold at Cursor" }
      {title: "Theme" children: [[
        {title: "Dark" children: [[
          {topic meta: "set_option,theme,3024-night" title: "3024"}
          {topic meta: "set_option,theme,ambiance" title: "Ambience"}
          {topic meta: "set_option,theme,ambiance-mobile" title: "Ambience (mobile)"}
          {topic meta: "set_option,theme,base16-dark" title: "Base 16"}
          {topic meta: "set_option,theme,blackboard" title: "Blackboard"}
          {topic meta: "set_option,theme,cobalt" title: "Cobalt"}
          {topic meta: "set_option,theme,colorforth" title: "Colour Forth"}
          {topic meta: "set_option,theme,erlang-dark" title: "Erlang Dark"}
          {topic meta: "set_option,theme,lesser-dark" title: "Lesser Dark"}
          {topic meta: "set_option,theme,mbo" title: "MBO"}
          {topic meta: "set_option,theme,midnight" title: "Midnight"}
          {topic meta: "set_option,theme,monokai" title: "Monokai"}
          {topic meta: "set_option,theme,night" title: "Night"}
          {topic meta: "set_option,theme,paraiso-dark" title: "Paraiso"}
          {topic meta: "set_option,theme,pastel-on-dark" title: "Pastel"}
          {topic meta: "set_option,theme,rubyblue" title: "Ruby Blue"}
          {topic meta: "set_option,theme,the-matrix" title: "The Matrix"}
          {topic meta: "set_option,theme,tomorrow-night-bright" title: "Tomorrow Night"}
          {topic meta: "set_option,theme,tomorrow-night-eighties" title: "Tomorrow Night Eighties"}
          {topic meta: "set_option,theme,twilight" title: "Twilight"}
          {topic meta: "set_option,theme,vibrant-ink" title: "Vibrant Ink"}
          {topic meta: "set_option,theme,xq-dark" title: "XQ Dark"}
          {topic meta: "set_option,theme,zenburn" title: "Zenburn"}
        ]]}
        {title: "Light" children: [[
          {topic meta: "set_option,theme,3024-day" title: "3024"}
          {topic meta: "set_option,theme,base16-light" title: "Base 16"}
          {topic meta: "set_option,theme,default" title: "Default"}
          {topic meta: "set_option,theme,eclipse" title: "Eclipse"}
          {topic meta: "set_option,theme,elegant" title: "Elegant"}
          {topic meta: "set_option,theme,mdn-line" title: "MDN"}
          {topic meta: "set_option,theme,neat" title: "Neat"}
          {topic meta: "set_option,theme,neo>Neo"}
          {topic meta: "set_option,theme,paraiso-light" title: "Paraiso"}
          {topic meta: "set_option,theme,solarized" title: "Solarized"}
          {topic meta: "set_option,theme,xq-light" title: "XQ Light"}
        ]]}
      ]]}
    ]]}
    {title: "Settings" children: [[
      {title: "Keyboard" children: [[
        {topic meta: "set_mode,default" title: "Code Mirror"}
        {topic meta: "set_mode,emacs" title: "Emacs"}
        {topic meta: "set_mode,sublime" title: "Sublime"}
        {topic meta: "set_mode,vim" title: "Vi"}
      ]]}
      {divider: true}
      {topic meta: "toggle_option,smartIndent" title: "Auto-indent"}
      {title: "Indent" children: [[
        {topic meta: "set_option,indentUnit,2" title: "2"}
        {topic meta: "set_option,indentUnit,4" title: "4"}
      ]]}
      {topic meta: "toggle_option,autoCloseBrackets" title: "Close Brackets"}
      {topic meta: "toggle_option,matchBrackets" title: "Match Brackets"}
      {topic meta: "toggle_option,matchTags" title: "Match Tags"}
      {divider: true}
      {title: "Scroll Margin" children: [[
        {topic meta: "set_option,cursorScrollMargin,0" title: "0"}
        {topic meta: "set_option,cursorScrollMargin,2" title: "2"}
        {topic meta: "set_option,cursorScrollMargin,4" title: "4"}
      ]]}
      {topic meta: "toggle_option,continueComments" title: "Comment Continuation"}
      {topic meta: "toggle_option,showTrailingSpace" title: "Show Trailing Spaces"}
      {topic meta: "toggle_option,dragDrop" title: "Toggle Drag and Drop"}
      {topic meta: "toggle_option,lineNumbers" title: "Toggle Line Numbers"}
      {topic meta: "toggle_option,lineWrapping" title: "Toggle Line Wrap"}
    ]]}
  ]])
  (var listener (lambda [cm data]
    (var args (data.item.meta.split ","))
    (var command (args.shift))
    (args.unshift cm)
    ((get CodeMirror.commands command).apply CodeMirror args)
  ))
  (var open (lambda [owner wrapper]
    (var cm (CodeMirror wrapper options))
    (set! cm.listener (lambda [data] (listener cm data)))
    (message.send "CodeMirror-menu" menu)
    (message.listen (+ owner "-" "CodeMirror-command") cm.listener)
    (return cm)
  ))
  (var close (lambda [cm]
    (message.remove cm.listener)
  ))
  (var spaces "                ")
  (var extra-commands {
    view_keyboard_shortcuts: (lambda [cm]
      (var keys [[]])
      (var one-map (lambda [map]
        ((Object.keys map).forEach (lambda [key]
          (cond
            (is key "fallthrough") (do
                (var more (get map key))
                (cond (is (typeof more) "string") (var more [[more]]))
                (more.forEach (lambda [map]
                  (one-map (get CodeMirror.keyMap map))))
              )
            (else) (keys.push (+ key ": " (get map key)))
          )
        ))
      ))
      (one-map cm.options.extraKeys)
      (var core (get CodeMirror.keyMap cm.options.keyMap))
      (cond (not core.fallthrough)
        (set! core.fallthrough CodeMirror.keyMap.default.fallthrough))
      (one-map core)
      (window.open
        (+ "data:text/html," (encodeURIComponent (keys.join "<br>")))
        "Keys" "width=300,height=600")
    )
    fold_at_cursor: (lambda [cm]
      (cm.foldCode (cm.getCursor))
    )
    toggle_option: (lambda [cm name]
      (CodeMirror.commands.set_option cm name (not (cm.getOption name)))
    )
    set_option: (lambda [cm name value]
      (cm.setOption name value)
      (dict.update! options name value)
      (update-options)
    )
    set_mode: (lambda [cm mode]
      (CodeMirror.commands.set_option cm "keyMap" mode)
    )
    auto_complete: (lambda [cm]
      (var not-only (lambda []
        (var result (CodeMirror.hint.anyword.apply null arguments))
        (return-if (isnt result.list.length 1) result)
        (var size (- result.to.ch result.from.ch))
        (return-if (isnt (do (get list 0).length) size) result)
        (set! result.list [[]])
        (return result)
      ))
    )
  })
  ## Editing modes dependent on file type
  (var mode-extensions {
    apl: "apl" as3: "apl" asf: "apl"
    c: "clike" cpp: "clike" h: "clike" cs: "clike"
    chh: "clike" hh: "clike" h__: "clike" hpp: "clike"
    hxx: "clike" cc: "clike" cxx: "clike" c__: "clike"
    "c++": "clike" stl: "clike" sma: "clike"
    java: "clike" scala: "clike" clj: "clojure"
    cpy: "cobol" cbl: "cobol"cob: "cobol"
    coffee: "coffeescript" coffeescript: "coffeescript"
    "gwt.coffee": "coffeescript"
    vlx: "commonlisp" fas: "commonlisp" lsp: "commonlisp"
    el: "commonlisp" css: "css" less: "css"
    dl: "d" d: "d" diff: "diff" dtd: "dtd" dylan: "dylan"
    ecl: "ecl" e: "eiffel" erl: "erlang" hrl: "erlang"
    f: "fortran" for: "fortran" FOR: "fortran"
    f95: "fortran" f90: "fortran" f03: "fortran"
    gas: "gas" gfm: "gfm" feature: "gherkin" go: "go"
    groovy: "groovy" "html.haml": "haml" hx: "haxe"
    lhs: "haskell" gs: "haskell" hs: "haskell"
    asp: "htmlembedded" jsp: "htmlembedded"
    ejs: "htmlembedded" http: "http"
    html: "htmlmixed" htm: "htmlmixed" ".py.jade": "jade"
    js: "javascript" json: "javascript" jinja2: "jinja2"
    jl: "julia" ls: "livescript" lua: "lua"
    markdown: "markdown" mdown: "markdown" mkdn: "markdown"
    md: "markdown" mkd: "markdown" mdwn: "markdown"
    mdtxt: "markdown" mdtext: "markdown"
    mdx: "mirc" dcx: "mirc"
    ml: "mllike" fs: "mllike" fsi: "mllike"
    mli: "mllike" fsx: "mllike" fsscript: "mllike"
    nginx: "nginx" nt: "ntriples" mex: "octave"
    pas: "pascal" pegjs: "pegjs" ps: "perl"
    php: "php" "lib.php": "php"
    pig: "pig" ini: "properties" properties: "properties"
    pp: "puppet" py: "python" q: "q" r: "r"
    rpm: "rpm" "src.rpm": "rpm" rst: "rst" rb: "ruby"
    rs: "rust" sass: "sass" scm: "scheme" ss: "scheme"
    sh: "shell" sieve: "sieve"
    sm: "smalltalk" st: "smalltalk" tpl: "smartymixed"
    solr: "solr" sparql: "sparql" sql: "sql"
    stex: "stex" tex: "stex" tcl: "tcl" tw: "tiddlywiki"
    tiki: "tiki" toml: "toml" ttl: "turtle" vb: "vb"
    bas: "vbscript" vbs: "vbscript" vtl: "velocity"
    v: "verilog" xml: "xml"
    xquery: "xquery" xq: "xquery" xqy: "xquery"
    yaml: "yaml" yml: "yaml" z80: "z80" asm: "z80"
  })
  (var saved-mode-extensions localStorage.CodeMirror-mode-extensions)
  (cond saved-mode-extensions (var mode-extensions
    (dict.merge mode-extensions saved-mode-extensions)
  ))

  (var set-mode (lambda [cm name]
    (var try-mode (lambda [exts]
      (var ext (exts.join "."))
      (return? (get mode-extensions ext))
      (return-if (get CodeMirror.modes ext) ext)
      (return false)
    ))
    (var mode ((=>
      (var parts (name.split "."))
      (cond (> parts.length 2) (return? (try-mode (parts.slice -2))))
      (return? (try-mode (parts.slice -1)))
      (return  "text")
    )))
    (cm.setOption "mode" mode)
    (CodeMirror.autoLoadMode cm mode)
  ))

  ## CodeMirror lispz mode
  (var init-lispz-mode (=>
  (CodeMirror.defineSimpleMode "lispz" {
    start: [[
      {regex: '/""/'                                 token: "string"}
      {regex: '/"/'                   next: "string" token: "string"}
      {regex: '/\'(?:[^\\]|\\.)*?\'/'                token: "variable-2"}
      {regex: '/###/'                next: "comment" token: "comment" }
      {regex: '/(\()([!\s\(\[\{\)\}\]]*?!)/'
                                indent: true  token: [[null "error"]]}
      {regex: '/(\()([^\s\(\[\{\)\}\]]+)/'
                                indent: true  token: [[null "keyword"]]}
      {regex: '/true|false|null|undefined|debugger/' token: "atom"}
      {regex: '/0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i'
                                                     token: "number"}
      {regex: '/## .*/'                              token: "comment"}
      {regex: '/[\{\(\[]/'        indent: true}
      {regex: '/[\}\)\]]/'      dedent: true}
      {regex: '/[^\s\(\{\[\)\]\}]+/'                 token: "variable"}
      {regex: '/\s+/' next: "start"}
    ]]
    comment: [[
      {regex: '/###/' token: "comment" next: "start"}
      {regex: '/.*/' token: "comment"}
    ]]
    string: [[
      {regex: '/[^\\]"/' token: "string" next: "start"}
      {regex: '/./' token: "string"}
    ]]
    meta: { lineComment: "## " dontIndentStates: [["comment" "string"]] }
  })
  (CodeMirror.defineMIME "text/lispz" "lispz")
  ## Update htmlmixed to understand lispz scripts
  (cond (is (typeof (get CodeMirror.mimeModes "text/html")) "string")
        (dict.update! CodeMirror.mimeModes "text/html" {name: "htmlmixed"}))
  (var mode (get CodeMirror.mimeModes "text/html"))
  (cond (not mode.scriptTypes) (set! mode.scriptTypes [[]]))
  (mode.scriptTypes.push {matches: '/^text\/lispz$/' mode: "lispz"})
  (set! CodeMirror.mimeModes.htmlmixed mode)

  ## paredit keys that defer if not in lisp code
  (var lisp-modes {lispz: true clojure: true commonlisp: true scheme: true})
  (set! subpar.core.run_selection (lambda [cm]
    (cond (cm.somethingSelected) (var source (cm.doc.getSelection))
          (else)                 (var source (cm.doc.getValue))
    )
    (console.log (lispz.run "lispz-repl" source))
  ))
  (var subpart (lambda [cmd opt]
    (return (lambda [cm]
      (var mode (cm.getModeAt (cm.getCursor)))
      (cond (get lisp-modes mode.name)  ((get subpar.core cmd) cm opt)
            (else)                      (return CodeMirror.Pass)
      )
    ))
  ))
  (dict.insert! CodeMirror.commands {
    ## paredit keys that defer if not in lisp code
    subpar_backward_delete:        (subpart "backward_delete")
    subpar_forward_delete:         (subpart "forward_delete")
    subpar_forward_delete:         (subpart "forward_delete")

    subpar_open_bracket:           (subpart "open_expression" "()")
    subpar_open_square_bracket:    (subpart "open_expression" "[]")
    subpar_open_braces:            (subpart "open_expression" "{}")

    subpar_close_bracket:          (subpart "close_expression" ")")
    subpar_close_square_bracket:   (subpart "close_expression" "]")
    subpar_close_braces:           (subpart "close_expression" "}")

    subpar_double_quote:           (subpart "double_quote")

    subpar_forward:                (subpart "forward")
    subpar_backward:               (subpart "backward")
    subpar_backward_up:            (subpart "backward_up")
    subpar_forward_down:           (subpart "forward_down")
    subpar_backward_down:          (subpart "backward_down")
    subpar_forward_up:             (subpart "forward_up")

    subpar_backward_barf:          (subpart "backward_barf")
    subpar_backward_barf:          (subpart "backward_barf")
    subpar_backward_barf:          (subpart "backward_barf")

    subpar_forward_barf:           (subpart "forward_barf")
    subpar_forward_barf:           (subpart "forward_barf")

    subpar_backward_slurp:         (subpart "backward_slurp")
    subpar_backward_slurp:         (subpart "backward_slurp")
    subpar_backward_slurp:         (subpart "backward_slurp")

    subpar_forward_slurp:          (subpart "forward_slurp")
    subpar_forward_slurp:          (subpart "forward_slurp")

    subpar_splice_delete_backward: (subpart "splice_delete_backward")
    subpar_splice_delete_forward:  (subpart "splice_delete_forward")
    subpar_splice:                 (subpart "splice")
    subpar_indent_selection:       (subpart "indent_selection")

    lispz_run_selection:           (subpart "run_selection")
  })
  ))

  ## elm script has a bug - restore for a later version.
  ## tern is for javascript features - overrides console.log
  (var build-base (lambda [target-repo]
    (return (github.build target-repo "codemirror" [[
      {repo: "codemirror/CodeMirror" files: [[
        {base: "lib" include: '/codemirror\.(js|css)$/'}
        {base: "addon/mode" include: '/^simple.js$/'}
        {base: "keymap"}
        {base: "addon" exclude: '/test.js$|node.js$|standalone.js$|\/tern\//'}
        {base: "mode/htmlmixed" include: '/css$|js$/'}
        {base: "mode/javascript" include: '/css$|js$/'}
        {base: "mode/css" include: '/css$|js$/'}
      ]]}
      {repo: "achengs/subpar" files: [[
        {base: "resources/public/js" include: '/subpar.core.js/'}
      ]]}
    ]]))
  ))
  (var build-themes (lambda [target-repo]
    (return (github.build target-repo "codemirror-themes" [[
      {repo: "codemirror/CodeMirror" files: [[
        {base: "theme"}
      ]]}
    ]]))
  ))
  (var build-mode (lambda [target-repo]
    (return (github.build target-repo "codemirror-modes" [[
      {repo: "codemirror/CodeMirror" files: [[
        {base: "mode" exclude: '/htmlmixed|javascript|css|elm.js$|test.js$/'}
      ]]}
    ]]))
  ))
  (var build (lambda [target-repo]
    (return (promise.all build-base build-themes build-mode))
  ))

  (lispz.css "ext/codemirror.css")
  (when (net.script "ext/codemirror.js") []
    (cond window.CodeMirror (do ## in case we haven't built it yet
      (net.script "ext/codemirror-modes.js") ## don't care when
      (dict.for-each extra-commands (lambda [key value]
        (dict.update! CodeMirror.commands key value)
      ))
      (init-lispz-mode)
    ))
    (export {options open close set-mode build})
  )
  (delay 100 (lispz.css "ext/codemirror-themes.css"))
)
,']=",(using  [net diff_match_patch message dict github]
  (var options (localStorage.getItem "CodeMirror-options"))
  (cond options (var options (JSON.parse options))
        (else)  (var options {
    lineNumbers:        true
    foldGutter:         true
##  gutters:            ["CodeMirror-lint-markers"
##                       "CodeMirror-foldgutter"]
    lint:               true
    matchBrackets:      true
    autoCloseBrackets:  true
    matchTags:          true
    showTrailingSpace:  true
    inputStyle:         "textarea" ## change to "contenteditable" after vim cursor bug fix
    autofocus:          true
    dragDrop:           false
    smartIndent:        true
    indentUnit:         2
    indentWithTabs:     false
    cursorScrollMargin: 5
    scrollbarStyle:     "overlay"
    extraKeys:          {
      'Cmd-Left':         "goLineStartSmart"
      'Ctrl-Q':           "fold_at_cursor"
      'Ctrl-Space':       "autocomplete"
      'Ctrl-/':           "toggleComment"
      'Ctrl-<':           "goColumnLeft"
      'Ctrl->':           "goColumnRight"
      'Ctrl-Shift-F':     "clearSearch"
      'Ctrl-=':           "toMatchingTag"
      'Alt-S':            "view_source"
      'Ctrl-`':           "insertSoftTab"
      'Ctrl-,':           "delLineLeft"
      'Ctrl-.':           "killLine"
      'Shift-Ctrl-,':     "delWrappedLineLeft"
      'Shift-Ctrl-.':     "delWrappedLineRight"
      'Ctrl-9':           "delWordBefore"
      'Ctrl-0':           "delWordAfter"
      'Ctrl-6':           "transposeChars"
      'Ctrl-Left':        "goWordLeft"
      'Ctrl-Right':       "goWordRight"
      'Ctrl-Home':        "goLineLeft"
      'Ctrl-Shift-Home':  "goLineLeftSmart"
      'Ctrl-End':         "goLineRight"
      ## paredit keys that defer if not in lisp code
      'Backspace':        "subpar_backward_delete"
      'Delete':           "subpar_forward_delete"
      'Ctrl-D':           "subpar_forward_delete"

      'Shift-9':          "subpar_open_bracket"
      '[':                "subpar_open_square_bracket"
      'Shift-[':          "subpar_open_braces"

      'Shift-0':          "subpar_close_bracket"
      ']':                "subpar_close_square_bracket"
      'Shift-]':          "subpar_close_braces"

      'Shift-\'':          "subpar_double_quote"

      'Ctrl-Alt-F':       "subpar_forward"
      'Ctrl-Alt-B':       "subpar_backward"
      'Ctrl-Alt-U':       "subpar_backward_up"
      'Ctrl-Alt-D':       "subpar_forward_down"
      'Ctrl-Alt-P':       "subpar_backward_down"
      'Ctrl-Alt-N':       "subpar_forward_up"

      'Shift-Ctrl-[':     "subpar_backward_barf"
      'Ctrl-Alt-Right':   "subpar_backward_barf"
      'Ctrl-]':           "subpar_backward_barf"

      'Shift-Ctrl-]':     "subpar_forward_barf"
      'Ctrl-Left':        "subpar_forward_barf"

      'Shift-Ctrl-9':     "subpar_backward_slurp"
      'Ctrl-Alt-Left':    "subpar_backward_slurp"
      'Ctrl-[':           "subpar_backward_slurp"

      'Shift-Ctrl-0':     "subpar_forward_slurp"
      'Ctrl-Right':       "subpar_forward_slurp"

      'Alt-Up':           "subpar_splice_delete_backward"
      'Alt-Down':         "subpar_splice_delete_forward"
      'Alt-S':            "subpar_splice"
      'Ctrl-Alt-/':       "subpar_indent_selection"

      'Alt-Enter':        "lispz_run_selection"
     }
  }))
  ## write changed options back to persistent storage
  (var update-options (=>
    (localStorage.setItem "CodeMirror-options" (JSON.stringify options))
  ))
  ## Context menu for code editor
  (var topic "CodeMirror-command")
  (var menu [[
    ### {title: "File" children: [[
      {topic meta: "save" title: "Save"}
    ]]} ###
    {title: "Edit" children: [[
      {topic meta: "autocomplete" title: "Auto-Complete" }
      {topic meta: "redo" title: "Redo"}
      {topic meta: "undo" title: "Undo"}
      {topic meta: "redoSelection" title: "Redo Selection"}
      {topic meta: "undoSelection" title: "Undo Selection"}
      {divider: true}
      {topic meta: "toggleOverwrite" title: "Insert/Overwrite"}
      {topic meta: "toggleComment" title: "Comment/Uncomment" }
      {topic meta: "insertSoftTab" title: "Insert Soft Tab" }
      {topic meta: "defaultTab" title: "Tab or Indent"}
      {title: "Delete" children: [[
        {topic meta: "deleteLine" title: "Line"}
        {topic meta: "killLine" title: "Line Right" }
        {topic meta: "delLineLeft" title: "Line Left" }
        {divider: true}
        {topic meta: "delWrappedLineLeft" title: "Wrapped Line Left" }
        {topic meta: "delWrappedLineRight" title: "Wrapped Line Right" }
        {divider: true}
        {topic meta: "delWordBefore" title: "Word Left" }
        {topic meta: "delWordAfter" title: "Word Right" }
        {divider: true}
        {topic meta: "delGroupBefore" title: "Group Before"}
        {topic meta: "delGroupAfter" title: "Group After"}
        {divider: true}
        {topic meta: "delCharBefore" title: "Character Left"}
        {topic meta: "delCharAfter" title: "Character Right"}
      ]]}
      {topic meta: "indentAuto" title: "Auto Indent"}
      {topic meta: "indentLess" title: "Indent Left"}
      {topic meta: "indentMore" title: "Indent Right"}
      {topic meta: "newlineAndIndent" title: "New line and indent"}
      {divider: true}
      {topic meta: "transposeChars" title: "Transpose Characters" }
      {divider: true}
      {topic meta: "selectAll" title: "Select All"}
      {topic meta: "singleSelection" title: "Single Selection"}
    ]]}
    {title: "Go" children: [[
      {topic meta: "goDocStart" title: "Document Start"}
      {topic meta: "goDocEnd" title: "Document End"}
      {divider: true}
      {topic meta: "goCharLeft" title: "Char Left"}
      {topic meta: "goCharRight" title: "Char Right"}
      {divider: true}
      {topic meta: "goColumnLeft" title: "Column Left" }
      {topic meta: "goColumnRight" title: "Column Right" }
      {divider: true}
      {topic meta: "goGroupLeft" title: "Group Left"}
      {topic meta: "goGroupRight" title: "Group Right"}
      {divider: true}
      {topic meta: "goWordLeft" title: "Word Left" }
      {topic meta: "goWordRight" title: "Word Right" }
      {divider: true}
      {topic meta: "goLineStart" title: "Line Start"}
      {topic meta: "goLineStartSmart" title: "Smart Line Start" }
      {topic meta: "goLineEnd" title: "Line End"}
      {divider: true}
      {topic meta: "goLineLeft" title: "Line Left" }
      {topic meta: "goLineLeftSmart" title: "Smart Line Left" }
      {topic meta: "goLineRight" title: "Line Right" }
      {divider: true}
      {topic meta: "goLineUp" title: "Line Up"}
      {topic meta: "goLineDown" title: "Line Down"}
      {divider: true}
      {topic meta: "goPageUp" title: "Page Up"}
      {topic meta: "goPageDown" title: "Page Down"}
    ]]}
    {title: "Search" children: [[
      {topic meta: "find" title: "Find..."}
      {topic meta: "findNext" title: "Find Next"}
      {topic meta: "findPrev" title: "Find Previous"}
      {topic meta: "clearSearch" title: "Clear Search" }
      {divider: true}
      {topic meta: "replace" title: "Replace"}
      {topic meta: "replaceAll" title: "Replace All"}
      ## {divider: true} appears to only work for XML
      ## {topic meta: "toMatchingTag" title: "Matching Tag" }
    ]]}
    {title: "View" children: [[
      {topic meta: "view_keyboard_shortcuts" title: "Keyboard Shortcuts" }
      {topic meta: "fold_at_cursor" title: "Fold at Cursor" }
      {title: "Theme" children: [[
        {title: "Dark" children: [[
          {topic meta: "set_option,theme,3024-night" title: "3024"}
          {topic meta: "set_option,theme,ambiance" title: "Ambience"}
          {topic meta: "set_option,theme,ambiance-mobile" title: "Ambience (mobile)"}
          {topic meta: "set_option,theme,base16-dark" title: "Base 16"}
          {topic meta: "set_option,theme,blackboard" title: "Blackboard"}
          {topic meta: "set_option,theme,cobalt" title: "Cobalt"}
          {topic meta: "set_option,theme,colorforth" title: "Colour Forth"}
          {topic meta: "set_option,theme,erlang-dark" title: "Erlang Dark"}
          {topic meta: "set_option,theme,lesser-dark" title: "Lesser Dark"}
          {topic meta: "set_option,theme,mbo" title: "MBO"}
          {topic meta: "set_option,theme,midnight" title: "Midnight"}
          {topic meta: "set_option,theme,monokai" title: "Monokai"}
          {topic meta: "set_option,theme,night" title: "Night"}
          {topic meta: "set_option,theme,paraiso-dark" title: "Paraiso"}
          {topic meta: "set_option,theme,pastel-on-dark" title: "Pastel"}
          {topic meta: "set_option,theme,rubyblue" title: "Ruby Blue"}
          {topic meta: "set_option,theme,the-matrix" title: "The Matrix"}
          {topic meta: "set_option,theme,tomorrow-night-bright" title: "Tomorrow Night"}
          {topic meta: "set_option,theme,tomorrow-night-eighties" title: "Tomorrow Night Eighties"}
          {topic meta: "set_option,theme,twilight" title: "Twilight"}
          {topic meta: "set_option,theme,vibrant-ink" title: "Vibrant Ink"}
          {topic meta: "set_option,theme,xq-dark" title: "XQ Dark"}
          {topic meta: "set_option,theme,zenburn" title: "Zenburn"}
        ]]}
        {title: "Light" children: [[
          {topic meta: "set_option,theme,3024-day" title: "3024"}
          {topic meta: "set_option,theme,base16-light" title: "Base 16"}
          {topic meta: "set_option,theme,default" title: "Default"}
          {topic meta: "set_option,theme,eclipse" title: "Eclipse"}
          {topic meta: "set_option,theme,elegant" title: "Elegant"}
          {topic meta: "set_option,theme,mdn-line" title: "MDN"}
          {topic meta: "set_option,theme,neat" title: "Neat"}
          {topic meta: "set_option,theme,neo>Neo"}
          {topic meta: "set_option,theme,paraiso-light" title: "Paraiso"}
          {topic meta: "set_option,theme,solarized" title: "Solarized"}
          {topic meta: "set_option,theme,xq-light" title: "XQ Light"}
        ]]}
      ]]}
    ]]}
    {title: "Settings" children: [[
      {title: "Keyboard" children: [[
        {topic meta: "set_mode,default" title: "Code Mirror"}
        {topic meta: "set_mode,emacs" title: "Emacs"}
        {topic meta: "set_mode,sublime" title: "Sublime"}
        {topic meta: "set_mode,vim" title: "Vi"}
      ]]}
      {divider: true}
      {topic meta: "toggle_option,smartIndent" title: "Auto-indent"}
      {title: "Indent" children: [[
        {topic meta: "set_option,indentUnit,2" title: "2"}
        {topic meta: "set_option,indentUnit,4" title: "4"}
      ]]}
      {topic meta: "toggle_option,autoCloseBrackets" title: "Close Brackets"}
      {topic meta: "toggle_option,matchBrackets" title: "Match Brackets"}
      {topic meta: "toggle_option,matchTags" title: "Match Tags"}
      {divider: true}
      {title: "Scroll Margin" children: [[
        {topic meta: "set_option,cursorScrollMargin,0" title: "0"}
        {topic meta: "set_option,cursorScrollMargin,2" title: "2"}
        {topic meta: "set_option,cursorScrollMargin,4" title: "4"}
      ]]}
      {topic meta: "toggle_option,continueComments" title: "Comment Continuation"}
      {topic meta: "toggle_option,showTrailingSpace" title: "Show Trailing Spaces"}
      {topic meta: "toggle_option,dragDrop" title: "Toggle Drag and Drop"}
      {topic meta: "toggle_option,lineNumbers" title: "Toggle Line Numbers"}
      {topic meta: "toggle_option,lineWrapping" title: "Toggle Line Wrap"}
    ]]}
  ]])
  (var listener (lambda [cm data]
    (var args (data.item.meta.split ","))
    (var command (args.shift))
    (args.unshift cm)
    ((get CodeMirror.commands command).apply CodeMirror args)
  ))
  (var open (lambda [owner wrapper]
    (var cm (CodeMirror wrapper options))
    (set! cm.listener (lambda [data] (listener cm data)))
    (message.send "CodeMirror-menu" menu)
    (message.listen (+ owner "-" "CodeMirror-command") cm.listener)
    (return cm)
  ))
  (var close (lambda [cm]
    (message.remove cm.listener)
  ))
  (var spaces "                ")
  (var extra-commands {
    view_keyboard_shortcuts: (lambda [cm]
      (var keys [[]])
      (var one-map (lambda [map]
        ((Object.keys map).forEach (lambda [key]
          (cond
            (is key "fallthrough") (do
                (var more (get map key))
                (cond (is (typeof more) "string") (var more [[more]]))
                (more.forEach (lambda [map]
                  (one-map (get CodeMirror.keyMap map))))
              )
            (else) (keys.push (+ key ": " (get map key)))
          )
        ))
      ))
      (one-map cm.options.extraKeys)
      (var core (get CodeMirror.keyMap cm.options.keyMap))
      (cond (not core.fallthrough)
        (set! core.fallthrough CodeMirror.keyMap.default.fallthrough))
      (one-map core)
      (window.open
        (+ "data:text/html," (encodeURIComponent (keys.join "<br>")))
        "Keys" "width=300,height=600")
    )
    fold_at_cursor: (lambda [cm]
      (cm.foldCode (cm.getCursor))
    )
    toggle_option: (lambda [cm name]
      (CodeMirror.commands.set_option cm name (not (cm.getOption name)))
    )
    set_option: (lambda [cm name value]
      (cm.setOption name value)
      (dict.update! options name value)
      (update-options)
    )
    set_mode: (lambda [cm mode]
      (CodeMirror.commands.set_option cm "keyMap" mode)
    )
    auto_complete: (lambda [cm]
      (var not-only (lambda []
        (var result (CodeMirror.hint.anyword.apply null arguments))
        (return-if (isnt result.list.length 1) result)
        (var size (- result.to.ch result.from.ch))
        (return-if (isnt (do (get list 0).length) size) result)
        (set! result.list [[]])
        (return result)
      ))
    )
  })
  ## Editing modes dependent on file type
  (var mode-extensions {
    apl: "apl" as3: "apl" asf: "apl"
    c: "clike" cpp: "clike" h: "clike" cs: "clike"
    chh: "clike" hh: "clike" h__: "clike" hpp: "clike"
    hxx: "clike" cc: "clike" cxx: "clike" c__: "clike"
    "c++": "clike" stl: "clike" sma: "clike"
    java: "clike" scala: "clike" clj: "clojure"
    cpy: "cobol" cbl: "cobol"cob: "cobol"
    coffee: "coffeescript" coffeescript: "coffeescript"
    "gwt.coffee": "coffeescript"
    vlx: "commonlisp" fas: "commonlisp" lsp: "commonlisp"
    el: "commonlisp" css: "css" less: "css"
    dl: "d" d: "d" diff: "diff" dtd: "dtd" dylan: "dylan"
    ecl: "ecl" e: "eiffel" erl: "erlang" hrl: "erlang"
    f: "fortran" for: "fortran" FOR: "fortran"
    f95: "fortran" f90: "fortran" f03: "fortran"
    gas: "gas" gfm: "gfm" feature: "gherkin" go: "go"
    groovy: "groovy" "html.haml": "haml" hx: "haxe"
    lhs: "haskell" gs: "haskell" hs: "haskell"
    asp: "htmlembedded" jsp: "htmlembedded"
    ejs: "htmlembedded" http: "http"
    html: "htmlmixed" htm: "htmlmixed" ".py.jade": "jade"
    js: "javascript" json: "javascript" jinja2: "jinja2"
    jl: "julia" ls: "livescript" lua: "lua"
    markdown: "markdown" mdown: "markdown" mkdn: "markdown"
    md: "markdown" mkd: "markdown" mdwn: "markdown"
    mdtxt: "markdown" mdtext: "markdown"
    mdx: "mirc" dcx: "mirc"
    ml: "mllike" fs: "mllike" fsi: "mllike"
    mli: "mllike" fsx: "mllike" fsscript: "mllike"
    nginx: "nginx" nt: "ntriples" mex: "octave"
    pas: "pascal" pegjs: "pegjs" ps: "perl"
    php: "php" "lib.php": "php"
    pig: "pig" ini: "properties" properties: "properties"
    pp: "puppet" py: "python" q: "q" r: "r"
    rpm: "rpm" "src.rpm": "rpm" rst: "rst" rb: "ruby"
    rs: "rust" sass: "sass" scm: "scheme" ss: "scheme"
    sh: "shell" sieve: "sieve"
    sm: "smalltalk" st: "smalltalk" tpl: "smartymixed"
    solr: "solr" sparql: "sparql" sql: "sql"
    stex: "stex" tex: "stex" tcl: "tcl" tw: "tiddlywiki"
    tiki: "tiki" toml: "toml" ttl: "turtle" vb: "vb"
    bas: "vbscript" vbs: "vbscript" vtl: "velocity"
    v: "verilog" xml: "xml"
    xquery: "xquery" xq: "xquery" xqy: "xquery"
    yaml: "yaml" yml: "yaml" z80: "z80" asm: "z80"
  })
  (var saved-mode-extensions localStorage.CodeMirror-mode-extensions)
  (cond saved-mode-extensions (var mode-extensions
    (dict.merge mode-extensions saved-mode-extensions)
  ))

  (var set-mode (lambda [cm name]
    (var try-mode (lambda [exts]
      (var ext (exts.join "."))
      (return? (get mode-extensions ext))
      (return-if (get CodeMirror.modes ext) ext)
      (return false)
    ))
    (var mode ((=>
      (var parts (name.split "."))
      (cond (> parts.length 2) (return? (try-mode (parts.slice -2))))
      (return? (try-mode (parts.slice -1)))
      (return  "text")
    )))
    (cm.setOption "mode" mode)
    (CodeMirror.autoLoadMode cm mode)
  ))

  ## CodeMirror lispz mode
  (var init-lispz-mode (=>
  (CodeMirror.defineSimpleMode "lispz" {
    start: [[
      {regex: '/""/'                                 token: "string"}
      {regex: '/"/'                   next: "string" token: "string"}
      {regex: '/\'(?:[^\\]|\\.)*?\'/'                token: "variable-2"}
      {regex: '/###/'                next: "comment" token: "comment" }
      {regex: '/(\()([!\s\(\[\{\)\}\]]*?!)/'
                                indent: true  token: [[null "error"]]}
      {regex: '/(\()([^\s\(\[\{\)\}\]]+)/'
                                indent: true  token: [[null "keyword"]]}
      {regex: '/true|false|null|undefined|debugger/' token: "atom"}
      {regex: '/0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i'
                                                     token: "number"}
      {regex: '/## .*/'                              token: "comment"}
      {regex: '/[\{\(\[]/'        indent: true}
      {regex: '/[\}\)\]]/'      dedent: true}
      {regex: '/[^\s\(\{\[\)\]\}]+/'                 token: "variable"}
      {regex: '/\s+/' next: "start"}
    ]]
    comment: [[
      {regex: '/###/' token: "comment" next: "start"}
      {regex: '/.*/' token: "comment"}
    ]]
    string: [[
      {regex: '/[^\\]"/' token: "string" next: "start"}
      {regex: '/./' token: "string"}
    ]]
    meta: { lineComment: "## " dontIndentStates: [["comment" "string"]] }
  })
  (CodeMirror.defineMIME "text/lispz" "lispz")
  ## Update htmlmixed to understand lispz scripts
  (cond (is (typeof (get CodeMirror.mimeModes "text/html")) "string")
        (dict.update! CodeMirror.mimeModes "text/html" {name: "htmlmixed"}))
  (var mode (get CodeMirror.mimeModes "text/html"))
  (cond (not mode.scriptTypes) (set! mode.scriptTypes [[]]))
  (mode.scriptTypes.push {matches: '/^text\/lispz$/' mode: "lispz"})
  (set! CodeMirror.mimeModes.htmlmixed mode)

  ## paredit keys that defer if not in lisp code
  (var lisp-modes {lispz: true clojure: true commonlisp: true scheme: true})
  (set! subpar.core.run_selection (lambda [cm]
    (cond (cm.somethingSelected) (var source (cm.doc.getSelection))
          (else)                 (var source (cm.doc.getValue))
    )
    (console.log (lispz.run "lispz-repl" source))
  ))
  (var subpart (lambda [cmd opt]
    (return (lambda [cm]
      (var mode (cm.getModeAt (cm.getCursor)))
      (cond (get lisp-modes mode.name)  ((get subpar.core cmd) cm opt)
            (else)                      (return CodeMirror.Pass)
      )
    ))
  ))
  (dict.insert! CodeMirror.commands {
    ## paredit keys that defer if not in lisp code
    subpar_backward_delete:        (subpart "backward_delete")
    subpar_forward_delete:         (subpart "forward_delete")
    subpar_forward_delete:         (subpart "forward_delete")

    subpar_open_bracket:           (subpart "open_expression" "()")
    subpar_open_square_bracket:    (subpart "open_expression" "[]")
    subpar_open_braces:            (subpart "open_expression" "{}")

    subpar_close_bracket:          (subpart "close_expression" ")")
    subpar_close_square_bracket:   (subpart "close_expression" "]")
    subpar_close_braces:           (subpart "close_expression" "}")

    subpar_double_quote:           (subpart "double_quote")

    subpar_forward:                (subpart "forward")
    subpar_backward:               (subpart "backward")
    subpar_backward_up:            (subpart "backward_up")
    subpar_forward_down:           (subpart "forward_down")
    subpar_backward_down:          (subpart "backward_down")
    subpar_forward_up:             (subpart "forward_up")

    subpar_backward_barf:          (subpart "backward_barf")
    subpar_backward_barf:          (subpart "backward_barf")
    subpar_backward_barf:          (subpart "backward_barf")

    subpar_forward_barf:           (subpart "forward_barf")
    subpar_forward_barf:           (subpart "forward_barf")

    subpar_backward_slurp:         (subpart "backward_slurp")
    subpar_backward_slurp:         (subpart "backward_slurp")
    subpar_backward_slurp:         (subpart "backward_slurp")

    subpar_forward_slurp:          (subpart "forward_slurp")
    subpar_forward_slurp:          (subpart "forward_slurp")

    subpar_splice_delete_backward: (subpart "splice_delete_backward")
    subpar_splice_delete_forward:  (subpart "splice_delete_forward")
    subpar_splice:                 (subpart "splice")
    subpar_indent_selection:       (subpart "indent_selection")

    lispz_run_selection:           (subpart "run_selection")
  })
  ))

  ## elm script has a bug - restore for a later version.
  ## tern is for javascript features - overrides console.log
  (var build-base (lambda [target-repo]
    (return (github.build target-repo "codemirror" [[
      {repo: "codemirror/CodeMirror" files: [[
        {base: "lib" include: '/codemirror\.(js|css)$/'}
        {base: "addon/mode" include: '/^simple.js$/'}
        {base: "keymap"}
        {base: "addon" exclude: '/test.js$|node.js$|standalone.js$|\/tern\//'}
        {base: "mode/htmlmixed" include: '/css$|js$/'}
        {base: "mode/javascript" include: '/css$|js$/'}
        {base: "mode/css" include: '/css$|js$/'}
      ]]}
      {repo: "achengs/subpar" files: [[
        {base: "resources/public/js" include: '/subpar.core.js/'}
      ]]}
    ]]))
  ))
  (var build-themes (lambda [target-repo]
    (return (github.build target-repo "codemirror-themes" [[
      {repo: "codemirror/CodeMirror" files: [[
        {base: "theme"}
      ]]}
    ]]))
  ))
  (var build-mode (lambda [target-repo]
    (return (github.build target-repo "codemirror-modes" [[
      {repo: "codemirror/CodeMirror" files: [[
        {base: "mode" exclude: '/htmlmixed|javascript|css|elm.js$|test.js$/'}
      ]]}
    ]]))
  ))
  (var build (lambda [target-repo]
    (return (promise.all build-base build-themes build-mode))
  ))

  (lispz.css "ext/codemirror.css")
  (when (net.script "ext/codemirror.js") []
    (cond window.CodeMirror (do ## in case we haven't built it yet
      (net.script "ext/codemirror-modes.js") ## don't care when
      (dict.for-each extra-commands (lambda [key value]
        (dict.update! CodeMirror.commands key value)
      ))
      (init-lispz-mode)
    ))
    (export {options open close set-mode build})
  )
  (delay 100 (lispz.css "ext/codemirror-themes.css"))
)
,",

lispz_modules[',(macro debug [*msg] (console.log arguments *msg))

### Supporting function definition ###
(macro lambda [params *body] (#join '' '(function(' params '){' *body '})'))
(macro =>     [*body]        (#join '' '(function(){' *body '})'))
(macro *arguments [from] ([[]].slice.call arguments from))
(macro global [name value]
  (#join '' 'lispz.globals.' name '=' value)
  (macro name [&params] (#join '' 'lispz.globals.' name '(' &params ')')))
(macro closure [params *body] (#join '' '(function(' params '){' *body '})(' params ')'))
(macro return  [value] (#join '' 'return ' value '\n'))
(macro return? [value] (cond value (return value)))
(macro return-if [test value] (cond test (return value)))
(macro new [cls params] (#join '' '(new ' cls '(' params '))'))

### Pure functional programming wants immutability - but we live in an impure world ###
(macro set! [name value] (#join '' name '=' value ';'))
(macro var  (*list) (#join '' 'var ' (#pairs *list '=' ',') ';'))
(macro dict.update! [dict key value] (#join '' dict '[' key ']' '=' value ';'))

### Retrieval - can be used for objects and arrays ###
(macro get [dict *key] (#join '' dict '[' (#join '][' *key) ']'))

### Operators ###
(macro not [value] (#join '' '!(' value ')'))
(macro in [test against] (#join '' '(' test ' in ' against ')'))

### conditional processing ###
(macro empty? [list] (not list.length))
(macro defined? [field] (!== (typeof field) "undefined"))
(macro cond [*list] (#join '' 'switch(false){case !' (#pairs *list  ':' ';break;case !') '}'))
(macro else [] 'true')
(macro contains [str substr] (isnt -1 (str .indexOf substr)))
## Javascript does not (yet) have tail recursion - it is scheduled for 2016
(macro while [test body] (#join '' 'while(' test '){' body '}'))

(global default? (lambda [value default-value]
  (cond value (return value)) (return default-value)
))

### List and dictionary manipulation ###
(macro length [list] (#join '' list '.length'))
(macro first [list] (get list 0))
(macro rest [list] (list .slice 1))
(macro last [list] (get (list .slice -1) 0))
(global slice (lambda [list from to]  (return ([[]].slice.call list from to))))
### module import ###
(macro using [modules *on_ready] (lispz.load (#join '' '"' modules '"')
  (=> (#requires modules) *on_ready)))

### Modules must export to continue processing ###
(macro export [exports] (#join '' '__module_ready__(' exports ')'))

(macro delay [ms *body] (setTimeout (=> *body) ms))
(macro yield [*body] (delay 0 *body))
(macro do [*body] *body)
###
# Use contain to contain state changes. Any var inside a contain can be changed
# no matter how many times the contain is called concurrently. It is also allows
# the passing in of variables that are effectively copied and cannot be changed
# from outside.
###
(macro contain [contain#args *contain#body] ((lambda contain#args *contain#body) contain#args))
###
# Return a random integer between 0 and the range given
###
(global random (lambda [range] (return (Math.floor (* (Math.random) range)))))

### Promises ###
(global promise {})
(macro promise [params *body] (lambda params
  (var #callbacks [[]])
  (var #pledge (new Promise (lambda [ok fail] (set! #callbacks  {ok fail}))))
  (var resolve-promise (lambda [] (#callbacks.ok.apply null (*arguments 0))))
  (var reject-promise (lambda [err] (#callbacks.fail err)))
  *body
  (return #pledge)
))
(macro promise.callback [params *body]
  (promise params
    (var callback (lambda [err result]
      (return-if err (reject-promise err))
      (resolve-promise result)
    ))
    *body
  )
)
(global promise.resolved (promise [pact] (resolve-promise pact)))

(macro when  [pledge params *body] (pledge .then  (lambda params *body)))
(macro catch [pledge errors *body] (pledge .catch (lambda errors *body)))

(using [list]
  (global promise.sequence (promise []
    (var promises (list.flatten (*arguments)))
    (promises.push #pact)
    (promises.forEach (lambda [pledge idx]
      (var next (+ idx 1))
      (return? (is next promises.length))
      (var next-promise (get promises next))
      (when  pledge []      (return next-promise))
      (catch pledge [error] (next-promise.catch error))
    ))
  ))

  (global promise.all (=> (return (Promise.all (list.flatten (*arguments 0))))))
)
(export {})
,']=",(macro debug [*msg] (console.log arguments *msg))

### Supporting function definition ###
(macro lambda [params *body] (#join '' '(function(' params '){' *body '})'))
(macro =>     [*body]        (#join '' '(function(){' *body '})'))
(macro *arguments [from] ([[]].slice.call arguments from))
(macro global [name value]
  (#join '' 'lispz.globals.' name '=' value)
  (macro name [&params] (#join '' 'lispz.globals.' name '(' &params ')')))
(macro closure [params *body] (#join '' '(function(' params '){' *body '})(' params ')'))
(macro return  [value] (#join '' 'return ' value '\n'))
(macro return? [value] (cond value (return value)))
(macro return-if [test value] (cond test (return value)))
(macro new [cls params] (#join '' '(new ' cls '(' params '))'))

### Pure functional programming wants immutability - but we live in an impure world ###
(macro set! [name value] (#join '' name '=' value ';'))
(macro var  (*list) (#join '' 'var ' (#pairs *list '=' ',') ';'))
(macro dict.update! [dict key value] (#join '' dict '[' key ']' '=' value ';'))

### Retrieval - can be used for objects and arrays ###
(macro get [dict *key] (#join '' dict '[' (#join '][' *key) ']'))

### Operators ###
(macro not [value] (#join '' '!(' value ')'))
(macro in [test against] (#join '' '(' test ' in ' against ')'))

### conditional processing ###
(macro empty? [list] (not list.length))
(macro defined? [field] (!== (typeof field) "undefined"))
(macro cond [*list] (#join '' 'switch(false){case !' (#pairs *list  ':' ';break;case !') '}'))
(macro else [] 'true')
(macro contains [str substr] (isnt -1 (str .indexOf substr)))
## Javascript does not (yet) have tail recursion - it is scheduled for 2016
(macro while [test body] (#join '' 'while(' test '){' body '}'))

(global default? (lambda [value default-value]
  (cond value (return value)) (return default-value)
))

### List and dictionary manipulation ###
(macro length [list] (#join '' list '.length'))
(macro first [list] (get list 0))
(macro rest [list] (list .slice 1))
(macro last [list] (get (list .slice -1) 0))
(global slice (lambda [list from to]  (return ([[]].slice.call list from to))))
### module import ###
(macro using [modules *on_ready] (lispz.load (#join '' '"' modules '"')
  (=> (#requires modules) *on_ready)))

### Modules must export to continue processing ###
(macro export [exports] (#join '' '__module_ready__(' exports ')'))

(macro delay [ms *body] (setTimeout (=> *body) ms))
(macro yield [*body] (delay 0 *body))
(macro do [*body] *body)
###
# Use contain to contain state changes. Any var inside a contain can be changed
# no matter how many times the contain is called concurrently. It is also allows
# the passing in of variables that are effectively copied and cannot be changed
# from outside.
###
(macro contain [contain#args *contain#body] ((lambda contain#args *contain#body) contain#args))
###
# Return a random integer between 0 and the range given
###
(global random (lambda [range] (return (Math.floor (* (Math.random) range)))))

### Promises ###
(global promise {})
(macro promise [params *body] (lambda params
  (var #callbacks [[]])
  (var #pledge (new Promise (lambda [ok fail] (set! #callbacks  {ok fail}))))
  (var resolve-promise (lambda [] (#callbacks.ok.apply null (*arguments 0))))
  (var reject-promise (lambda [err] (#callbacks.fail err)))
  *body
  (return #pledge)
))
(macro promise.callback [params *body]
  (promise params
    (var callback (lambda [err result]
      (return-if err (reject-promise err))
      (resolve-promise result)
    ))
    *body
  )
)
(global promise.resolved (promise [pact] (resolve-promise pact)))

(macro when  [pledge params *body] (pledge .then  (lambda params *body)))
(macro catch [pledge errors *body] (pledge .catch (lambda errors *body)))

(using [list]
  (global promise.sequence (promise []
    (var promises (list.flatten (*arguments)))
    (promises.push #pact)
    (promises.forEach (lambda [pledge idx]
      (var next (+ idx 1))
      (return? (is next promises.length))
      (var next-promise (get promises next))
      (when  pledge []      (return next-promise))
      (catch pledge [error] (next-promise.catch error))
    ))
  ))

  (global promise.all (=> (return (Promise.all (list.flatten (*arguments 0))))))
)
(export {})
,",

lispz_modules[',(using [github riot]
  (var manifest (=>
    (var text [["CACHE MANIFEST"]])
    (lispz.manifest.forEach (lambda [uri] (text.push uri)))
    (text.push "NETWORK:" "*")
    (return (text.join "\n"))
  ))
  ### Package Lispz for distribution ###
  (var package (lambda [lispz-repo]
    (var read-file (lambda [path] (return (github.read lispz-repo path))))

    (var group (lambda [files]
      (var modules [[]] riots [[]])
      (files.forEach (lambda [entry]
        (return? (not (is "file" entry.type)))
        (var parts (entry.name.split "."))
        (cond
          (is (last parts) "lispz")               (modules.push (first parts))
          (is ((slice parts -2).join ".") "riot.html") (riots.push entry.name)
        )
      ))
      (return (promise.resolved {modules riots}))
    ))
    (var build-modules (lambda [names]
      (var source [[]])
      (var load-module (lambda [name]
        (return (when (read-file name) [text]
          (var contents (data.replace /[\\"]/gm "\\$&"))
          (var contents (contents.replace /\n/gm "\\n"))
          (source.push "\n\nlispz_modules['" path "']=\"" contents "\"")
        ))
      ))
      (return (promise
        (when (promise.all (names.map load-module)) []
          (return (resolve-promise source))
        )
      ))
    ))
    (var build-riots (lambda [names]
      (var source [[]])
      (var load-riot (lambda [name]
        (return (when (read-file name) [text]
          (source.push "\n\n/*" path "*/\n\nlispz.tags['" name "']=function(){"
            (riot.compile text true) "}\n")
        ))
      ))
      (return (promise []
        (when (promise.all (names.map load-riot)) []
          (return (resolve-promise source))
        )
      ))
    ))
    (var write-lispz (=>
      (var code (source.join ""))
      (return (github.write lispz-repo "ext/lispz.js" code "lispz release code"))
    ))

    (var update-mode (github.update lispz-repo))
    (var lispz-js    (when update-mode [] (read-file "lispz.js")))
    (var listing     (when update-mode [] (github.list-dir lispz-repo "")))
    (var groups      (when listing [files] (group files)))
    (var modules     (when groups [files] (return  (build-modules files.modules))))
    (var riots       (when groups [files] (return  (build-riots files.riots))))

    (var  source     [["window.lispz_modules={}"]])
    (var all-loaded  (promise.sequence
      (when modules  [sources] (source.concat sources))
      (when lispz-js [code]    (source.push code))
      (when riots    [sources] (source.concat sources))
    ))
    (return (when all-loaded [] (write-lispz)))
  ))

  ### Distribution ###
  (var distribute (lambda [target-repo]
  ))

  (export {manifest package distribute})
)
,']=",(using [github riot]
  (var manifest (=>
    (var text [["CACHE MANIFEST"]])
    (lispz.manifest.forEach (lambda [uri] (text.push uri)))
    (text.push "NETWORK:" "*")
    (return (text.join "\n"))
  ))
  ### Package Lispz for distribution ###
  (var package (lambda [lispz-repo]
    (var read-file (lambda [path] (return (github.read lispz-repo path))))

    (var group (lambda [files]
      (var modules [[]] riots [[]])
      (files.forEach (lambda [entry]
        (return? (not (is "file" entry.type)))
        (var parts (entry.name.split "."))
        (cond
          (is (last parts) "lispz")               (modules.push (first parts))
          (is ((slice parts -2).join ".") "riot.html") (riots.push entry.name)
        )
      ))
      (return (promise.resolved {modules riots}))
    ))
    (var build-modules (lambda [names]
      (var source [[]])
      (var load-module (lambda [name]
        (return (when (read-file name) [text]
          (var contents (data.replace /[\\"]/gm "\\$&"))
          (var contents (contents.replace /\n/gm "\\n"))
          (source.push "\n\nlispz_modules['" path "']=\"" contents "\"")
        ))
      ))
      (return (promise
        (when (promise.all (names.map load-module)) []
          (return (resolve-promise source))
        )
      ))
    ))
    (var build-riots (lambda [names]
      (var source [[]])
      (var load-riot (lambda [name]
        (return (when (read-file name) [text]
          (source.push "\n\n/*" path "*/\n\nlispz.tags['" name "']=function(){"
            (riot.compile text true) "}\n")
        ))
      ))
      (return (promise []
        (when (promise.all (names.map load-riot)) []
          (return (resolve-promise source))
        )
      ))
    ))
    (var write-lispz (=>
      (var code (source.join ""))
      (return (github.write lispz-repo "ext/lispz.js" code "lispz release code"))
    ))

    (var update-mode (github.update lispz-repo))
    (var lispz-js    (when update-mode [] (read-file "lispz.js")))
    (var listing     (when update-mode [] (github.list-dir lispz-repo "")))
    (var groups      (when listing [files] (group files)))
    (var modules     (when groups [files] (return  (build-modules files.modules))))
    (var riots       (when groups [files] (return  (build-riots files.riots))))

    (var  source     [["window.lispz_modules={}"]])
    (var all-loaded  (promise.sequence
      (when modules  [sources] (source.concat sources))
      (when lispz-js [code]    (source.push code))
      (when riots    [sources] (source.concat sources))
    ))
    (return (when all-loaded [] (write-lispz)))
  ))

  ### Distribution ###
  (var distribute (lambda [target-repo]
  ))

  (export {manifest package distribute})
)
,",

lispz_modules[',(using  [net github]

  (var build (lambda [target-repo]
    (return (github.build target-repo "dexie" [[
      {repo: "dfahlander/Dexie.js" files: [[
        {base: "dist/latest" include: '/Dexie.js$/'}
      ]]}
    ]]))
  ))

  (lispz.script "ext/dexie.js" (=> (export { build })))
)
,']=",(using  [net github]

  (var build (lambda [target-repo]
    (return (github.build target-repo "dexie" [[
      {repo: "dfahlander/Dexie.js" files: [[
        {base: "dist/latest" include: '/Dexie.js$/'}
      ]]}
    ]]))
  ))

  (lispz.script "ext/dexie.js" (=> (export { build })))
)
,",

lispz_modules[',(var insert (lambda [target dictionaries]
  (dictionaries.forEach (lambda [dictionary]
    ((Object.keys dictionary).forEach (lambda [key]
      (dict.update! target key (get dictionary key))
    ))
  ))
  (return target)
))
###
# There is often need to merge multiple dictionaries together to create a new
# combined one.
###
(var merge (lambda [dictionaries]
  (return (insert {} (*arguments 0)))
))
(var insert! (lambda [target dictionaries]
  (return (insert target (*arguments 0)))
))

(var from-list (lambda [list key]
  (var dictionary {})
  (cond list
    (list.forEach (lambda [item] (dict.update! dictionary (get item key) item)))
  )
  (return dictionary)
))

(var for-each (lambda [dict action=>]
  (Object.keys dict)(.forEach (lambda [k] (action=> k (get dict k))))
))

(var map (lambda [dict action=>]
  (Object.keys dict)(.map (lambda [k] (return (action=> k (get dict k)))))
))

(export {merge from-list insert! for-each map})
,']=",(var insert (lambda [target dictionaries]
  (dictionaries.forEach (lambda [dictionary]
    ((Object.keys dictionary).forEach (lambda [key]
      (dict.update! target key (get dictionary key))
    ))
  ))
  (return target)
))
###
# There is often need to merge multiple dictionaries together to create a new
# combined one.
###
(var merge (lambda [dictionaries]
  (return (insert {} (*arguments 0)))
))
(var insert! (lambda [target dictionaries]
  (return (insert target (*arguments 0)))
))

(var from-list (lambda [list key]
  (var dictionary {})
  (cond list
    (list.forEach (lambda [item] (dict.update! dictionary (get item key) item)))
  )
  (return dictionary)
))

(var for-each (lambda [dict action=>]
  (Object.keys dict)(.forEach (lambda [k] (action=> k (get dict k))))
))

(var map (lambda [dict action=>]
  (Object.keys dict)(.map (lambda [k] (return (action=> k (get dict k)))))
))

(export {merge from-list insert! for-each map})
,",

lispz_modules[',(using [net github]
  (var build (lambda [target-repo built=>]
    (return (github.build target-repo "diff_match_patch" [[
      {repo: "tanaka-de-silva/google-diff-match-patch-js" files: [[
        {base: "" include: '/^diff_match_patch_uncompressed.js$/'}
      ]]}
    ]]))
  ))
  (lispz.script "ext/diff_match_patch.js" (=> (export { build })))
)
,']=",(using [net github]
  (var build (lambda [target-repo built=>]
    (return (github.build target-repo "diff_match_patch" [[
      {repo: "tanaka-de-silva/google-diff-match-patch-js" files: [[
        {base: "" include: '/^diff_match_patch_uncompressed.js$/'}
      ]]}
    ]]))
  ))
  (lispz.script "ext/diff_match_patch.js" (=> (export { build })))
)
,",

lispz_modules[',(using [dict]
  (var append! (lambda [parent element]
    (document.querySelector parent) (.appendChild element)
  ))

  (var element (lambda [tag-name attributes]
    (var elem (document.createElement tag-name))
    (dict.for-each attributes (lambda [k v] (elem.setAttribute k v)))
    (return elem)
  ))

  (var event-throttle (lambda [element event action]
    (var add null)
    (var listener (lambda [event]
      (element.removeEventListener event listener)
      (delay 66 add)
      (action event)
    ))
    (var add (=> (element.addEventListener event listener)))
  ))

  (export {append! element event-throttle})
)
,']=",(using [dict]
  (var append! (lambda [parent element]
    (document.querySelector parent) (.appendChild element)
  ))

  (var element (lambda [tag-name attributes]
    (var elem (document.createElement tag-name))
    (dict.for-each attributes (lambda [k v] (elem.setAttribute k v)))
    (return elem)
  ))

  (var event-throttle (lambda [element event action]
    (var add null)
    (var listener (lambda [event]
      (element.removeEventListener event listener)
      (delay 66 add)
      (action event)
    ))
    (var add (=> (element.addEventListener event listener)))
  ))

  (export {append! element event-throttle})
)
,",

lispz_modules[',(using  [net]
  ( var databases (JSON.parse (or (localStorage.getItem "firebases") "{}")))

  (var register (lambda [key uri]
    (dict.update! databases key uri)
    (localStorage.setItem "firebases" (JSON.stringify databases))
  ))

  (var encode (lambda [before]
    (var uri (before.replace '/\./g' ":"))
    (var uri (uri.replace    '/#/g'  "_hash_"))
    (var uri (uri.replace    '/\$/g' "_dollar_"))
    (return uri)
  ))

  (var attach (lambda [collection db]
    (var uri (get databases (or db "default")))
    (return-if (not uri) null)
    (return (new Firebase (+ uri "/" (encode collection))))
  ))

  (when (net.script "https://cdn.firebase.com/js/client/2.2.9/firebase.js") []
    (export {register attach databases})
  )
)
,']=",(using  [net]
  ( var databases (JSON.parse (or (localStorage.getItem "firebases") "{}")))

  (var register (lambda [key uri]
    (dict.update! databases key uri)
    (localStorage.setItem "firebases" (JSON.stringify databases))
  ))

  (var encode (lambda [before]
    (var uri (before.replace '/\./g' ":"))
    (var uri (uri.replace    '/#/g'  "_hash_"))
    (var uri (uri.replace    '/\$/g' "_dollar_"))
    (return uri)
  ))

  (var attach (lambda [collection db]
    (var uri (get databases (or db "default")))
    (return-if (not uri) null)
    (return (new Firebase (+ uri "/" (encode collection))))
  ))

  (when (net.script "https://cdn.firebase.com/js/client/2.2.9/firebase.js") []
    (export {register attach databases})
  )
)
,",

lispz_modules[',(using  [net github]
  (var build (promise [target-repo]
    (github.grunt target-repo "firebase/firepad" [grunt data]
      (grunt.build {
        target: "firepad.js"
        pre:   data.concat.firepadjs.options.banner
        post:  data.concat.firepadjs.options.footer
        files: data.concat.firepadjs.src
      } (=>
        (grunt.copy data.copy.toBuild.files built=>)
      ))
    )
  ))

  (lispz.css "ext/firepad.css")
  (when (net.script "ext/firepad.js") [] (export {build}))
)
,']=",(using  [net github]
  (var build (promise [target-repo]
    (github.grunt target-repo "firebase/firepad" [grunt data]
      (grunt.build {
        target: "firepad.js"
        pre:   data.concat.firepadjs.options.banner
        post:  data.concat.firepadjs.options.footer
        files: data.concat.firepadjs.src
      } (=>
        (grunt.copy data.copy.toBuild.files built=>)
      ))
    )
  ))

  (lispz.css "ext/firepad.css")
  (when (net.script "ext/firepad.js") [] (export {build}))
)
,",

lispz_modules[',(using  [net dict]
  (var version null)
  (var cdn-uri (lambda [project version filepath]
    (return (+ "https://cdn.rawgit.com/" project "/" version "/" filepath))
  ))
  (var repo (lambda [username password project]
    (var github (new Github {username password auth: "basic"}))
    (var repo (github.getRepo.apply null (project.split "/")))
    (set! repo.lispz {github username password project branch: "master"})
    (return repo)
  ))
  ## Set the branch to use for repo - defaults to master
  (var branch (promise.callback [repo branch-name]
    (set! repo.lispz.branch branch-name)
    (repo.branch branch-name callback)
  ))
  ## list files in a specific path on the repo
  (var list-dir (promise.callback [repo path]
    (repo.contents repo.lispz.branch path callback)
  ))
  (var list-all (promise [repo path single-level]
    (var result [[]])
    (var list-path (lambda [path]
      (return (when (list-dir repo path) [paths]
        (var children [[]])
        (paths.forEach (lambda [entry]
          (cond
            (is "dir"  entry.type)
              (cond (not single-level) (children.push (list-path entry.path)))
            (is "file" entry.type)
              (result.push entry.path)
          )
        ))
        (return (promise.all children))
      ))
    ))
    (when (list-path path) [] (resolve-promise result))
  ))
  (var read (promise.callback [repo path]
    (repo.read repo.lispz.branch path callback)
  ))
  (var update (lambda [repo]
    (return-if (is repo.lispz.branch repo.lispz.username) (promise.resolved))
    (var branch-name (default? repo.lispz.username "master"))
    (return (branch repo branch-name))
  ))
  (var write (promise.callback [repo path contents comment]
    (return-if (not contents.length) (promise.resolved))
    (var encoded (unescape (encodeURIComponent contents)))
    (repo.write repo.lispz.branch path encoded comment callback)
  ))
  ## preprocess a file to generate css or js dependent on extension
  (var preprocessors {
    lispz: (lambda [name code]
      (return {ext: "js" code: (window.lispz.compile name code)})
    )
  })
  (var preprocess (lambda [path code]
    (var ext (last (path.split ".")))
    (var preprocessor (get preprocessors ext))
    (return-if (not preprocessor) {ext code})
    (return (preprocessor path code))
  ))
  ## Build and save a dependency list
  ## We will need to filter the dependencies
  (var filter (lambda [before include exclude]
    (var after before)
    (cond include (var after
      (after.filter (lambda [file] (return (include.test file))))
    ))
    (cond exclude (var after
      (after.filter (lambda [file] (return (not (exclude.test file)))))
    ))
    (return after)
  ))
  ## and see which to save and which to copy
  (var process-file (lambda [store path code]
    (var entry (preprocess path code))
    (var saver (get store entry.ext))
    (cond saver (do
      (saver.push (+ "\n\n/*" path "*/\n\n"))
      (saver.push entry.code)
    ) meta.copy-to (do
      (var filename (last (path.split "/")))
      (set! (get store.copies (+ meta.copy-to "/" filename)) code)
    ))
  ))
  ## Load the contents of the files we need from a single repo
  (var process-repo (lambda [source-repo files]
    (return (promise.all (files.map (promise [meta]
      (var base (default? meta.base ""))
      (when (actors.list-all source-repo base meta.single-level) [file-list]
        (var files (filter file-list meta.include meta.exclude))
        (promise.all (files.map (promise [path]
          (when (actors.read source-repo path) [code]
            (when (process-file path code) [] (resolve-promise))
          )
        )))
        (resolve-promise)
      )
    ))))
  ))
  ## Given a list of repos, go through them all for files in need
  (var process-repos (lambda [target-repo sources]
    (return (promise.all (sources.map (promise [source]
      (var source-repo (actors.repo target-repo source.repo))
      (store.from.push source.repo)
      (when (process-repo source-repo source.files) [] (resolve-promise))
    ))))
  ))
  ## Retrieve file contents based of filtering meta-data
  (var retriever (promise [target-repo sources actors]
    (var store {js: [[]] css: [[]]  copies: {} from: [["Gathered from: "]]})
    (when (process-repos target-repo sources) [] (resolve-promise))
  ))
  ## Given a file type, save the concatenated source contents
  (var save (promise [target-repo store name ext comment]
    (var contents ((get store ext).join ""))
    (return (write target-repo (+ "ext/" name "." ext) contents comment))
  ))
  ## copy files identified as needed as-is
  (var copy (lambda [target-repo store comment]
    (return (dict.map store.copies (lambda [path contents]
      (return (write target-repo path contents comment))
    )))
  ))
  ## Now we have gathered needed resources, build and save the output file
  (var builder (promise [actors target-repo name sources]
    (when (retriever target-repo sources actors) [store]
      (var comment (store.from.join " "))
      (var saved (when (update target-repo) []
        (return (promise.all
          (save target-repo store name "js" comment)
          (save target-repo store name "js" comment)
          (copy target-repo store           comment)
        ))
      ))
      (when saved [] (resolve-promise))
    )
  ))
  (var github-actors {
    list-all read
    repo: (lambda [target-repo name]
      (return (repo target-repo.lispz.username
        target-repo.lispz.password name
      ))
    )
  })
  (var build (builder.bind null github-actors))
  ## Use gruntfile to decide which files to include and it what order
  (var grunt-build (promise [meta]
    (var js [[(default? meta.pre "")]])
    (var read-all (promise.all (meta.files.map (promise []
      (when (github-actors.read source-repo path) [data]
        (js.push data) (resolve-promise)
      )
    ))))
    (when read-all []
      (js.push (default? meta.post ""))
      (var contents (js.join "\n"))
      (when (write target-repo (+ "ext/" meta.target) contents comment) []
        (resolve-promise)
      )
    )
  ))
  (var grunt-copy (promise [files]
    (var copy-all (promise.all (files.map (promise [item]
      (var path (default? item.src item))
      (when (github-actors.read source-repo path) [contents]
        (var path (+ "ext/" (last (path.split "/"))))
        (when (write target-repo path contents comment) [] (resolve-promise))
      )
    ))))
  ))
  (var grunt (promise [target-repo source-project]
    (var source-repo (github-actors.repo target-repo source-project))
    (var comment (+ "from " source-project))
    (var sources [[
      {repo: source-project files: [[
        {include: '/^Gruntfile.js$/' single-level: true}
      ]]}
    ]])
    (when (retriever target-repo sources actors) [store]
      (var grunt-config ((Function
        (+ "var module={};" (last store.js) "return module.exports"))))
      (grunt-config {
        loadNpmTasks: (=>) registerTask: (=>)
        initConfig: (lambda [config-data]
          (var grunt-processor {
            build: grunt-build
            copy:  grunt-copy
          })
          (when (update target-repo) []
            (resolve-promise grunt-processor config-data)
          )
        )
      })
    )
  ))
  (var build-github (lambda [target-repo]
    (var sources [[
      {repo: "michael/github" files: [[
        {include: '/github.js$/'}
      ]]}
    ]])
    (return (build target-repo "github" sources))
  ))
  (when (net.script "ext/github.js") []
    (export {
      branch list-all list-dir cdn-uri build builder repo read write update
      build-github retriever grunt preprocessors
      move: (promise.callback [repo from to]
        (repo.move repo.lispz.branch from to callback)
      )
      delete: (promise.callback [repo path]
        (repo.remove repo.lispz.branch path script callback)
      )
    })
  )
)
,']=",(using  [net dict]
  (var version null)
  (var cdn-uri (lambda [project version filepath]
    (return (+ "https://cdn.rawgit.com/" project "/" version "/" filepath))
  ))
  (var repo (lambda [username password project]
    (var github (new Github {username password auth: "basic"}))
    (var repo (github.getRepo.apply null (project.split "/")))
    (set! repo.lispz {github username password project branch: "master"})
    (return repo)
  ))
  ## Set the branch to use for repo - defaults to master
  (var branch (promise.callback [repo branch-name]
    (set! repo.lispz.branch branch-name)
    (repo.branch branch-name callback)
  ))
  ## list files in a specific path on the repo
  (var list-dir (promise.callback [repo path]
    (repo.contents repo.lispz.branch path callback)
  ))
  (var list-all (promise [repo path single-level]
    (var result [[]])
    (var list-path (lambda [path]
      (return (when (list-dir repo path) [paths]
        (var children [[]])
        (paths.forEach (lambda [entry]
          (cond
            (is "dir"  entry.type)
              (cond (not single-level) (children.push (list-path entry.path)))
            (is "file" entry.type)
              (result.push entry.path)
          )
        ))
        (return (promise.all children))
      ))
    ))
    (when (list-path path) [] (resolve-promise result))
  ))
  (var read (promise.callback [repo path]
    (repo.read repo.lispz.branch path callback)
  ))
  (var update (lambda [repo]
    (return-if (is repo.lispz.branch repo.lispz.username) (promise.resolved))
    (var branch-name (default? repo.lispz.username "master"))
    (return (branch repo branch-name))
  ))
  (var write (promise.callback [repo path contents comment]
    (return-if (not contents.length) (promise.resolved))
    (var encoded (unescape (encodeURIComponent contents)))
    (repo.write repo.lispz.branch path encoded comment callback)
  ))
  ## preprocess a file to generate css or js dependent on extension
  (var preprocessors {
    lispz: (lambda [name code]
      (return {ext: "js" code: (window.lispz.compile name code)})
    )
  })
  (var preprocess (lambda [path code]
    (var ext (last (path.split ".")))
    (var preprocessor (get preprocessors ext))
    (return-if (not preprocessor) {ext code})
    (return (preprocessor path code))
  ))
  ## Build and save a dependency list
  ## We will need to filter the dependencies
  (var filter (lambda [before include exclude]
    (var after before)
    (cond include (var after
      (after.filter (lambda [file] (return (include.test file))))
    ))
    (cond exclude (var after
      (after.filter (lambda [file] (return (not (exclude.test file)))))
    ))
    (return after)
  ))
  ## and see which to save and which to copy
  (var process-file (lambda [store path code]
    (var entry (preprocess path code))
    (var saver (get store entry.ext))
    (cond saver (do
      (saver.push (+ "\n\n/*" path "*/\n\n"))
      (saver.push entry.code)
    ) meta.copy-to (do
      (var filename (last (path.split "/")))
      (set! (get store.copies (+ meta.copy-to "/" filename)) code)
    ))
  ))
  ## Load the contents of the files we need from a single repo
  (var process-repo (lambda [source-repo files]
    (return (promise.all (files.map (promise [meta]
      (var base (default? meta.base ""))
      (when (actors.list-all source-repo base meta.single-level) [file-list]
        (var files (filter file-list meta.include meta.exclude))
        (promise.all (files.map (promise [path]
          (when (actors.read source-repo path) [code]
            (when (process-file path code) [] (resolve-promise))
          )
        )))
        (resolve-promise)
      )
    ))))
  ))
  ## Given a list of repos, go through them all for files in need
  (var process-repos (lambda [target-repo sources]
    (return (promise.all (sources.map (promise [source]
      (var source-repo (actors.repo target-repo source.repo))
      (store.from.push source.repo)
      (when (process-repo source-repo source.files) [] (resolve-promise))
    ))))
  ))
  ## Retrieve file contents based of filtering meta-data
  (var retriever (promise [target-repo sources actors]
    (var store {js: [[]] css: [[]]  copies: {} from: [["Gathered from: "]]})
    (when (process-repos target-repo sources) [] (resolve-promise))
  ))
  ## Given a file type, save the concatenated source contents
  (var save (promise [target-repo store name ext comment]
    (var contents ((get store ext).join ""))
    (return (write target-repo (+ "ext/" name "." ext) contents comment))
  ))
  ## copy files identified as needed as-is
  (var copy (lambda [target-repo store comment]
    (return (dict.map store.copies (lambda [path contents]
      (return (write target-repo path contents comment))
    )))
  ))
  ## Now we have gathered needed resources, build and save the output file
  (var builder (promise [actors target-repo name sources]
    (when (retriever target-repo sources actors) [store]
      (var comment (store.from.join " "))
      (var saved (when (update target-repo) []
        (return (promise.all
          (save target-repo store name "js" comment)
          (save target-repo store name "js" comment)
          (copy target-repo store           comment)
        ))
      ))
      (when saved [] (resolve-promise))
    )
  ))
  (var github-actors {
    list-all read
    repo: (lambda [target-repo name]
      (return (repo target-repo.lispz.username
        target-repo.lispz.password name
      ))
    )
  })
  (var build (builder.bind null github-actors))
  ## Use gruntfile to decide which files to include and it what order
  (var grunt-build (promise [meta]
    (var js [[(default? meta.pre "")]])
    (var read-all (promise.all (meta.files.map (promise []
      (when (github-actors.read source-repo path) [data]
        (js.push data) (resolve-promise)
      )
    ))))
    (when read-all []
      (js.push (default? meta.post ""))
      (var contents (js.join "\n"))
      (when (write target-repo (+ "ext/" meta.target) contents comment) []
        (resolve-promise)
      )
    )
  ))
  (var grunt-copy (promise [files]
    (var copy-all (promise.all (files.map (promise [item]
      (var path (default? item.src item))
      (when (github-actors.read source-repo path) [contents]
        (var path (+ "ext/" (last (path.split "/"))))
        (when (write target-repo path contents comment) [] (resolve-promise))
      )
    ))))
  ))
  (var grunt (promise [target-repo source-project]
    (var source-repo (github-actors.repo target-repo source-project))
    (var comment (+ "from " source-project))
    (var sources [[
      {repo: source-project files: [[
        {include: '/^Gruntfile.js$/' single-level: true}
      ]]}
    ]])
    (when (retriever target-repo sources actors) [store]
      (var grunt-config ((Function
        (+ "var module={};" (last store.js) "return module.exports"))))
      (grunt-config {
        loadNpmTasks: (=>) registerTask: (=>)
        initConfig: (lambda [config-data]
          (var grunt-processor {
            build: grunt-build
            copy:  grunt-copy
          })
          (when (update target-repo) []
            (resolve-promise grunt-processor config-data)
          )
        )
      })
    )
  ))
  (var build-github (lambda [target-repo]
    (var sources [[
      {repo: "michael/github" files: [[
        {include: '/github.js$/'}
      ]]}
    ]])
    (return (build target-repo "github" sources))
  ))
  (when (net.script "ext/github.js") []
    (export {
      branch list-all list-dir cdn-uri build builder repo read write update
      build-github retriever grunt preprocessors
      move: (promise.callback [repo from to]
        (repo.move repo.lispz.branch from to callback)
      )
      delete: (promise.callback [repo path]
        (repo.remove repo.lispz.branch path script callback)
      )
    })
  )
)
,",

lispz_modules[',(using [net cdnjs]
  (var build (lambda [target-repo]
    (return (cdnjs.build target-repo "jquery" [[
      {repo: "jquery" files: [[
        {exclude: '/\.map$|\.min.js$/'}
      ]]}
    ]]))
  ))
  (when (net.script "ext/jquery.js") [] (export {build}))
)
,']=",(using [net cdnjs]
  (var build (lambda [target-repo]
    (return (cdnjs.build target-repo "jquery" [[
      {repo: "jquery" files: [[
        {exclude: '/\.map$|\.min.js$/'}
      ]]}
    ]]))
  ))
  (when (net.script "ext/jquery.js") [] (export {build}))
)
,",

lispz_modules[',(var flatten (lambda [list]
  (return (list.reduce (lambda [a b] (return (a.concat b)))))
))
(export {flatten})
,']=",(var flatten (lambda [list]
  (return (list.reduce (lambda [a b] (return (a.concat b)))))
))
(export {flatten})
,",

lispz_modules[',(var store {}  expecting {})

(var exchange (lambda [address]
  (var envelope (get store address))
  (return? envelope)
  (return (dict.update! store address [[]]))
))

(var add (lambda [address envelope]
  (var envelopes (exchange address))
  (envelopes.push envelope)
  (cond (and (is envelopes.length 1) (get expecting address))
        (do ((get expecting address)) (delete (get expecting address))))
))

## remove a recipient from all attached addresses
(var remove (lambda [recipient]
  (dict.update! exchange address
    ((exchange address).filter (lambda [possibility]
      (return (isnt recipient possibility))
    ))
  )
))

(var send (lambda [address packet reply=>]
  (var reply (default? reply=> (=>)))
  ## take a copy so that it does not change during processing
  (((exchange address).slice).forEach (lambda [recipient]
    (yield (reply (recipient.listener=> packet)))
    (cond recipient.once (remove recipient))
  ))
))

(var expect (lambda [address listener=>]
  (add address {once: true listener=>})
))

## Only add expect if no other listeners - otherwise respond immediately
(var wait-for (lambda [address listener=>]
  (return-if (length (exchange address)) (listener=>))
  (dict.update! expecting address listener=>)
))

(var listen (lambda [address listener=>]
  (add address {listener=>})
))

(var dispatch (lambda [address actions]
  (listen address (lambda [packet]
    (var action (get actions packet.action))
    (return-if (not action) false)
    (action packet)
  ))
))

(var log (lambda [text]
  (var parts (text.split '/\s*:\s*/'))
  (cond (is 1 parts.length) (parts.unshift "message"))
  (send "logging" {level: (get parts 0) text: (get parts 1)})
))

(listen "logging" (lambda [packet]
  (console.log packet.level "-" packet.text)
))

(export {exchange send expect listen dispatch wait-for})
,']=",(var store {}  expecting {})

(var exchange (lambda [address]
  (var envelope (get store address))
  (return? envelope)
  (return (dict.update! store address [[]]))
))

(var add (lambda [address envelope]
  (var envelopes (exchange address))
  (envelopes.push envelope)
  (cond (and (is envelopes.length 1) (get expecting address))
        (do ((get expecting address)) (delete (get expecting address))))
))

## remove a recipient from all attached addresses
(var remove (lambda [recipient]
  (dict.update! exchange address
    ((exchange address).filter (lambda [possibility]
      (return (isnt recipient possibility))
    ))
  )
))

(var send (lambda [address packet reply=>]
  (var reply (default? reply=> (=>)))
  ## take a copy so that it does not change during processing
  (((exchange address).slice).forEach (lambda [recipient]
    (yield (reply (recipient.listener=> packet)))
    (cond recipient.once (remove recipient))
  ))
))

(var expect (lambda [address listener=>]
  (add address {once: true listener=>})
))

## Only add expect if no other listeners - otherwise respond immediately
(var wait-for (lambda [address listener=>]
  (return-if (length (exchange address)) (listener=>))
  (dict.update! expecting address listener=>)
))

(var listen (lambda [address listener=>]
  (add address {listener=>})
))

(var dispatch (lambda [address actions]
  (listen address (lambda [packet]
    (var action (get actions packet.action))
    (return-if (not action) false)
    (action packet)
  ))
))

(var log (lambda [text]
  (var parts (text.split '/\s*:\s*/'))
  (cond (is 1 parts.length) (parts.unshift "message"))
  (send "logging" {level: (get parts 0) text: (get parts 1)})
))

(listen "logging" (lambda [packet]
  (console.log packet.level "-" packet.text)
))

(export {exchange send expect listen dispatch wait-for})
,",

lispz_modules[',(using [list dom]
  (var script (promise.callback [uri] (lispz.script uri callback)))

  (var css (lambda [uri]
    (var el (dom.element "link" {
      type: "text/css" rel: "stylesheet" href: uri
    }))
    (dom.append! "head" el)
  ))

  (var http-get (promise.callback [uri]
    (lispz.http_request uri "GET" callback)
  ))

  (var json-request (promise [uri]
    (when (http-get uri) [response] (resolve-promise (JSON.parse response)))
  ))

  (export {
    script css http-get json-request
  })
)
,']=",(using [list dom]
  (var script (promise.callback [uri] (lispz.script uri callback)))

  (var css (lambda [uri]
    (var el (dom.element "link" {
      type: "text/css" rel: "stylesheet" href: uri
    }))
    (dom.append! "head" el)
  ))

  (var http-get (promise.callback [uri]
    (lispz.http_request uri "GET" callback)
  ))

  (var json-request (promise [uri]
    (when (http-get uri) [response] (resolve-promise (JSON.parse response)))
  ))

  (export {
    script css http-get json-request
  })
)
,",

lispz_modules[',(using  [net github dict]
  (var compile (lambda [html to-js] (return (riot.compile html to-js))))

  (var tags {})

  (var load (promise [name uri]
    (var mount (=>
      (dict.update! tags name true)
      (dict.update! tags uri true)
      (riot.mount name)
      (resolve-promise)
    ))
    (cond
      (get tags name)       (resolve-promise)
      (get lispz.tags name) (do ((get lispz.tags name)) (mount))
      (else)                (when (net.http-get uri) [response]
                              (compile response) (mount))
    )
  ))

  (var build (lambda [target-repo]
    (return (github.build target-repo "riot" [[
      {repo: "riot/riot" files: [[
        {include: '/^riot\+compiler.js$/'}
      ]]}
    ]]))
  ))

  (var mount (lambda [tags] (riot.mount tags)))

  (when (net.script "ext/riot.js") []
    (return-if (not window.riot) (export {build}))
    (set! riot.parsers.js.lispz
      (lambda [source] (return ((lispz.compile "riot-tags" source).join "\n")))
    )
    (var riot-elements (slice (document.getElementsByClassName "riot")))
    (var load-all (promise.all (riot-elements.map (lambda [element]
      (var name (element.tagName.toLowerCase))
      (var uri (or (element.getAttribute "uri")
                   (+ (name.toLowerCase) ".riot.html")))
      (return (load name uri))
    ))))
    (when load-all [] (export {build compile load mount}))
  )
)
,']=",(using  [net github dict]
  (var compile (lambda [html to-js] (return (riot.compile html to-js))))

  (var tags {})

  (var load (promise [name uri]
    (var mount (=>
      (dict.update! tags name true)
      (dict.update! tags uri true)
      (riot.mount name)
      (resolve-promise)
    ))
    (cond
      (get tags name)       (resolve-promise)
      (get lispz.tags name) (do ((get lispz.tags name)) (mount))
      (else)                (when (net.http-get uri) [response]
                              (compile response) (mount))
    )
  ))

  (var build (lambda [target-repo]
    (return (github.build target-repo "riot" [[
      {repo: "riot/riot" files: [[
        {include: '/^riot\+compiler.js$/'}
      ]]}
    ]]))
  ))

  (var mount (lambda [tags] (riot.mount tags)))

  (when (net.script "ext/riot.js") []
    (return-if (not window.riot) (export {build}))
    (set! riot.parsers.js.lispz
      (lambda [source] (return ((lispz.compile "riot-tags" source).join "\n")))
    )
    (var riot-elements (slice (document.getElementsByClassName "riot")))
    (var load-all (promise.all (riot-elements.map (lambda [element]
      (var name (element.tagName.toLowerCase))
      (var uri (or (element.getAttribute "uri")
                   (+ (name.toLowerCase) ".riot.html")))
      (return (load name uri))
    ))))
    (when load-all [] (export {build compile load mount}))
  )
)
,"var lispz = function() {
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


/*,bootstrap.riot.html,*/

lispz.tags[',bootstrap.riot.html,']=function(){,riot.tag('panel', ' <div class="panel { context }" name=outer> <div class=panel-heading if="{ opts.heading }" name=heading ><bars-menu align=right name="{ opts.menu }" owner="{ opts.owner }"></bars-menu> <h3 class=panel-title>{ opts.heading }</h3></div> <div class="panel-body" name=body><yield></yield></div> <div class=panel-footer if="{ opts.footer }" name=footer >{ opts.footer }</div> </div>', 'panel .panel { position: relative; } panel .panel-title { cursor: default; } panel .panel-body { position: absolute; top: 40px; bottom: 10px; left: 0; right: 0; }', function(opts) {var tag=this;//#riot-tags:2

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
,}
,

/*,codemirror.riot.html,*/

lispz.tags[',codemirror.riot.html,']=function(){,riot.tag('codemirror', '<div name=wrapper> </div>', function(opts) {var tag=this;//#riot-tags:2

lispz.load("codemirror"//#core:48
,(function(){var codemirror=lispz.cache["codemirror"];
tag.cm=CodeMirror(tag.wrapper,opts);//#riot-tags:4
}))//#riot-tags:5

});
,}
,

/*,firepad.riot.html,*/

lispz.tags[',firepad.riot.html,']=function(){,riot.tag('firepad', ' <panel height="{ opts.height }" heading="{ heading }" menu="{ menu }" owner="{ _id }"> <div name=wrapper class=wrapper></div> </panel>', 'firepad .wrapper { position: absolute; top: 0; bottom: 0; left: 0; right: 0; height: initial; } firepad .CodeMirror { position: absolute; top: 0; bottom: 0; left: 5px; right: 0; height: initial; } a.powered-by-firepad { display: none; } div.firepad-toolbar { margin-top: -25px; }', function(opts) {var tag=this;//#riot-tags:2

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
,}
,

/*,lispz-repl.riot.html,*/

lispz.tags[',lispz-repl.riot.html,']=function(){,riot.tag('lispz-repl', '<div id=lispz_repl_div class="{ hidden:hidden }"> <input type=text name=usings autocomplete=on size=20 placeholder="(package-list (* to reload))"> <input type=text name=code autocomplete=on size=50 placeholder="(Lispz code - enter to execute)"> </div>', 'lispz-repl {position: absolute; bottom: 0;} lispz-repl .hidden {display: none}', function(opts) {var tag=this;//#riot-tags:2

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
,}
