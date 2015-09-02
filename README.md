# lispz
**Lispz encourages a functional programming style** and data immutability in lisp-like syntax for running in the browser. It compiles to JavaScript, so can easily make use of all the JavaScript libraries and packages.

Lisp (without the z) is a functional language with a long pedigree. Only FORTRAN is an older living language. Traditionally it did not address data immutability, although Clojure (a relatively recent arrival) does.

Lispz as part of the Lisp family encourages functional programming. With Lisp functions are the main form of flow control. Lisp has very few syntax rules when compared to other languages. Not only does this make it easier to learn, but it also encourages problem decomposition into smaller functions.

**Lispz supports data immutability** at the program level. This means it allows the creation and update of local data within a function but makes it harder and more obvious to change data passed in or from a more global scope. This works well due to the single threading and co-operative multi-tasking nature of the JavaScript VM.

**If the Lisp syntax scares you**, just remember that change encourages learning. In practice due to the much simpler syntax, it provides a lot less scaffolding than JavaScript, while still making it abundantly clear when a function needs to be decomposed.

**Lispz inherits real macros** from Lisp. With macros that use the underlying language you can create new domain specific languages to meet any need.

**Lispz uses the power of closures** from JavaScript to capture variables that can change to the function currently running.

**Lispz includes a simple module system** to provide name-spacing and separation of conserns.

**Lispz is for single-page applications** - including

* the recording and generation of cache manifests for performant and **off-line** applications.
* Riot for **web components**
* Bootstrap for **visual**

A sample using riot with bootstrap:

    <panel heading="Panel heading" footer="Panel footer"
      context=warning menu=test-menu owner="Test Panel 2">
      This is a panel with simple heading and footer
    </panel>
    <lispz-repl class=riot></lispz-repl>
    <script src=/lispz/lispz.js#riot,bootstrap></script>
    <script id=test_code type="text/lispz">
      (using "message"
        (message.send "test-menu" [[
          { header: "Heading 1" }
          { title: "Item 1" topic: "Test menu item 1" }
          { title: "Item 2" menu: [[{ title: "Item 2a" }]] }
          { divider: true }
          { title: "item 2" disabled: true }
        ]] (=>))
        (message.listen "Test menu item 1" (=> [data] (console.log data)))
      )
    </script>

