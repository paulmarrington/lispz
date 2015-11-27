# Introduction

[Riot](http://riotjs.com) is a tiny UI library then provides the best of Web components (polymer) and react in a package 15% of the size.

Riot, like web components, each file (of type .riot.html) is a html fragment that also includes style and script elements. Like web components it is based on creating custom tags. This provides clean and readable HTML. Custom tags makes the HTML more readable.

The *panel* tags is a Riot wrapper around bootstrap panels.

Riot, like React it works with a virtual DOM and only updates changes to the real DOM. Like React it compiles to JavaScript. It can be supported on older browsers.

Scripting can be any language of choice that runs on the browser. JavaScript, Lispz, Es6 (with babel) and CoffeeScript are available out-of-the-box.

# Structure of a RIOT/Lispz Program

    <code-editor>
      <panel height={ opts.height } heading={ heading } menu={ menu } owner={ _id }>
        <div name=wrapper class=wrapper></div>
      </panel>
      <style>...</style>
      <script type=text/lispz>...</script>
    </code-editor>

# Using other languages
