# Introduction

[Riot](http://riotjs.com) is a tiny UI library then provides the best of Web components ([polymer](https://www.polymer-project.org/1.0/)) and [React](https://facebook.github.io/react/) in a package 15% of the size.

In , like web components, each file (of type .riot.html) is a html fragment that also includes style and script elements. Like web components it is based on creating custom tags. This provides clean and readable HTML.

The *panel* tags is a Riot wrapper around bootstrap panels.

Riot, like _React_ works with a virtual DOM and only updates changes to the real DOM. Like React it compiles to JavaScript. It can be supported on older browsers.

A small tight API that provides all needed web component functionality for reactive views, events and routing.

# Structure of a RIOT/Lispz Program

Riot components have the extension *.riot.html*. They are loaded from the HTML file or from another component. In the HTML, give a custom tag the class or *riot* and it will load a component file of the same name - including any other tags in the file. The html below will load *bootstrap.riot.html* and *code-editor.riot.html*, while *page-content* does not need a riot class as it is defined withing *bootstrap*.

    <bootstrap class=riot>
      <page-content fluid=true>
        <div class=col-sm-6>
          <code-editor class=riot name=literate height=48% />
        </div>
        <div class=col-sm-6>
          <code-editor class=riot name=code height=48% />
        </div>
      </page-content>
    </bootstrap>

For riot component files that rely on other files for sub-components, Start the file with a comment, the word *using* and a space separated list of component paths. In the example below, *panel* is a tag defined in the bootstrap component file.

    <code-editor>
      <panel height={ opts.height } heading={ heading } menu={ menu } owner={ \_riot_id }>
        <div name=wrapper class=wrapper></div>
      </panel>
      <style>code-editor .wrapper {...}</style>

      <script type=text/lispz>(riot-tag
        ...
        (tag.update! {menu: markdown-menu heading: opts.heading})
        ...
      )</script>
    </code-editor>

The _riot-tag_ macro instantiates a stateful _tag_ reference used to manipulate the tag contents. It also provides a context for error reporting.

Riot uses plain JavaScript inside {} as a templating solution. The *opts* dictionary matches the attributes when the custom tag is referenced. Any inner tag with a *name* or *id* attribute can be referenced by the same name. Each component has a unique *_riot_id*.

Styles are global (unlike *true* web components). This is easily overcome using explicit name-spacing as above.

# Using other languages

Scripting can be any language of choice that runs on the browser. JavaScript, Lispz, Es6 (with babel) and CoffeeScript are available out-of-the-box. For the latter two you will need to load the compiler by *(using babel coffeescript)* in the startup code. Other languages can be added as long as they compile code on the browser.

    (stateful.morph! riot.parsers.js)
    (riot.parsers.js.update! { lispz:
      (lambda [source] (return ((lispz.compile source "riot-tags").join "\n")))
    })
