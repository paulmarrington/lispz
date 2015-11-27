# Introduction

[Riot](http://riotjs.com) is a tiny UI library then provides the best of Web components (polymer) and react in a package 15% of the size.

Riot, like web components, each file (of type .riot.html) is a html fragment that also includes style and script elements. Like web components it is based on creating custom tags. This provides clean and readable HTML. Custom tags makes the HTML more readable.

The *panel* tags is a Riot wrapper around bootstrap panels.

Riot, like React it works with a virtual DOM and only updates changes to the real DOM. Like React it compiles to JavaScript. It can be supported on older browsers.

Scripting can be any language of choice that runs on the browser. JavaScript, Lispz, Es6 (with babel) and CoffeeScript are available out-of-the-box.

Small tight API that provides all needed web component functionality for reactive views, events and routing.

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

F

    <!-- using bootstrap -->
    <code-editor>
      <panel height={ opts.height } heading={ heading } menu={ menu } owner={ _id }>
        <div name=wrapper class=wrapper></div>
      </panel>
      <style>...</style>
      <script type=text/lispz>...</script>
    </code-editor>

# Using other languages
