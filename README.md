# Lispz
<https://github.com/paulmarrington/lispz>

[QuickStart](https://cdn.rawgit.com/paulmarrington/lispz/master/index.html) - Edit, run and read the documentation on-line

[Documentation](doc/index.md) - Read more, learn more

> You can read all of this on GitHub - or you can select the quick-start link above and read while playing with live code and results. Type Lispz in the scratch-pad and press <Alt><Enter> to execute it. You will be able to view the JavaScript created and any output from (console.log). For a quick quick-start, open the [examples](doc/examples.md) page and copy and paste them into the scratch-pad to run and discover.

**Executive Summary**: Lispz supports functional programming for developing single-page-applications for the browser. It does this with modules, RIOT web components, Bootstrap visuals, message passing and numerous other features to make SPA development easier.

**Lispz encourages a functional programming style** and data immutability in lisp-like syntax for running in the browser. It compiles to JavaScript, so can easily make use of all the JavaScript libraries and packages.

Lisp (without the z) is a functional language with a long pedigree. Only FORTRAN is an older living language. Traditionally it did not address data immutability, although Clojure (a relatively recent arrival) does.

Lispz as part of the Lisp family encourages functional programming. With Lisp, functions are the main form of flow control. Lisp has very few syntax rules when compared to other languages. Not only does this make it easier to learn, but it also encourages problem decomposition into smaller functions.

**Lispz supports data immutability** at the program level. This means it allows the creation and update of local data within a function but makes it harder and more obvious to change data passed in or from a more global scope. This works well due to the single threading and co-operative multi-tasking nature of the JavaScript VM.

**If the Lisp syntax scares you**, just remember that change encourages learning. In practice due to the much simpler syntax, it provides a lot less scaffolding than JavaScript, while still making it abundantly clear when a function needs to be decomposed.

**Lispz inherits real macros** from Lisp. With macros that use the underlying language you can create new domain specific languages to meet any need.

**Lispz uses the power of closures** from JavaScript to capture variables that can change to the function currently running.

**Lispz includes a simple module system** to provide name-spacing and separation of concerns.

**Lispz is for single-page applications** - including

* the generation of cache manifests for performant and **off-line** applications.
* Riot for **web components**
* Bootstrap for **visual**

A sample using riot with bootstrap:

    <panel heading="Panel heading" footer="Panel footer"
      context=warning menu=test-menu owner="Test Panel 2">
      This is a panel with simple heading and footer
    </panel>

    <script src=/lispz/lispz.js#riot,bootstrap></script>
    <script id=test_code type="text/lispz">
      (using [message]
        (message.send "test-menu" [[
          { title: "Item 1" topic:     "Test menu item 1" }
          { title: "Item 2" children:  [[{ title: "Item 2a" }]] }
        ]] (=>))
        (message.listen (+ tag.\_riot_id "Test menu item 1") (lambda [data]
          (console.log data)
        ))
      )
    </script>

This example displays a bootstrap pane with header, footer and a menu. The menu can be changed dynamically by sending it a message. If item 1 is selected it sends a message that causes the data to be printed on the console.
