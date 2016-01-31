# Module Structure

All Lispz source files are modules. They are loaded on first request by client code. Subsequent requests returns a cached reference to the exports. In a release they are encapslated into the project file.

# Module Usage

Every module must include an export statement including a dictionary of symbols to be exported

    (var one (=> ...)
    (var two 22)
    (export {one two})

If a module requires other asynchronous operations it can defer the export statement until they are ready.

    (lispz.script "ext/jquery.js" (=> (export { ... })))

To access external modules, wrap your code in 'using'. Data and functions exported from a module are linked to the import name.

    (using [dict net list]
      (var combined (dict.merge d1 d2 d3))
    )

...and that is all there is to it.
