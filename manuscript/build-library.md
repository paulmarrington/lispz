## Building a library

There are many script libraries available for many subjects from many sources with many interfaces. Most packages that have been designed for the web have only a small number of dependencies that can be easily managed manually. The world is changing. A project I am working on using Angular2 and JSPM uploads over 1,000 files to the browser every time it starts.

Lispz takes a middle ground - or you can use JSPM if you wish or need to and don't mind the pain. JSPM uses JSON for definitions, while Lispz uses ... you guessed it (I hope) ... Lispz.

If you wish to use a library not previously wrapped the you will need to write a script. At it's shortest it is 3 lines, similar to markdown.lispz:

    (using [net]
      (net.loader "showdown" window.showdown {})
    )

For this to work you would need to have a copy of showdown.js in /ext or your project. The loader will attempt to load /ext/showdown.js then export the provided functions. In this case none.

Most library wrappers also provide a method called build that will gather the library files from CDNJS, Github and other sources, concatenate when possible and place them in /ext.

doco build

doco helpers
