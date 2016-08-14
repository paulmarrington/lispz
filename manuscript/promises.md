## Promises
ES2015 has introduced native promises into the language. As of November 2015 it is available on all mainstream browsers. Even if not, there are shims that work in an identical(ish) manner.

Functions that want to return information in an asynchronous manner return a promise object. This object can be passed around and whoever needs the data it will or does contain can ask for it with a callback function.

A function that creates a promise uses the 'promise' keyword instead of 'lambda'. When the promise is fulfilled it will call _(resolve-promise data)_. If it fails it calls _(reject-promise err)_.

    (ref read (promise [addr param1 param2]
      (http-get (+ addr "?&" param1 "&" param2) (lambda [err response]
        (cond err (reject-promise err) (else) (resolve-promise response))
      ))
    ))

### Lazy promises

In _promise_ the function is run immediately. In many situations it is nice to
have a promise that only runs when it is first needed. This is where lazy evaluation using _once_ comes in. The following example is from _github.lispz_ and is used to access a repository.

    (ref fs (lambda [name]
      (ref repo  _(once (repo> name)_))
      (ref entries> _(once (after (tree> (repo))_
        (dict.from-list @.tree "path")
      )))
      (ref read> (lambda [path] (github.read> _(repo)_ path)))
      (ref fs { name entries> read> })
    ))
    ...
    (ref fs (github.fs "paulmarrington/lispz"))

    (after (fs.entries>) (@.forEach (lambda [entry]
      (after (fs.read> entry.path)
        (register entry.path @)
      )
    )))

### Converting a Callback into a Promise

Because it is common to turn a callback into a promise, lispz provides a helper macro. The following provides identical functionality. One of the benefits of a language with real macros :)

    (ref read (promise.callback [addr param1 param2]
      (http-get (+ addr "?&" param1 "&" param2) callback)
    ))

### What to do When a Promise Fills

Now that we have a promise, we can use it just like a callback if we want:

    (ref reading (read "http://blat.com/blah" 1 2))
    (**when** reading (lambda [result] (process result)))
    (**promise-failed** reading (lambda [err] (console.log "ERROR: "+err)))

Even without further knowledge, promises clean up errors and exceptions. If you do not catch errors, exceptions thrown in the asynchronous function can be caught in the code containing the promise.

### Chaining Promises

The power of promises starts to become clearer with the understanding that 'when' can return a promise.

    (ref processed (when [reading] (process reading)))
    (when [processed] (console.log "All done"))

So far this adds very little at the cost of a relatively large supporting library. If we start thinking functionally instead of sequentially, promises provides a way to clarify our code (a little).

    ## change branch we will be working with
    (ref update-mode (github.update lispz-repo))
    ## Once in update mode we can retrieve lispz.js and ask
    ## for a list of other file in parallel
    (ref lispz-js    (when [update-mode] (read-file "lispz.js")))
    (ref listing     (when [update-mode (github.list-dir lispz-repo "")))
    ## We can only sort files once we have a listing from the server
    (ref groups      (when [listing] (group listing)))
    ## but then we can process the different groups in parallel
    ## (retrieving source as needed)
    (ref modules     (when [groups] (build-modules groups.modules)))
    (ref riots       (when [groups] (build-riots   groups.riots)))

    ## Now to pull it all together into a single file
    (ref  source     (stateful ["window.lispz_modules={}"]))
    ## promise.sequence forces the order.
    (ref all-loaded  (promise.sequence
      (when [modules] (source.concat modules) (promise.resolved)
      ## lisp.js is added after modules and lisp-js are resolved
      (when [lispz-js]    (source.push! lispz-js) (promise.resolved)
      ## riot tags are added after lisp.js and lisp-js is added
      ## and riots promise is resolved
      (when [riots] (source.concat riots) (promise.resolved)
    ))
    ## Only write the result when the sequence above is complete
    (when [all-loaded] (write-lispz))
    ## returns a promise that is complete once the results are written

### Summary

1. **(promise [params...] ...)** is a macro that generates a function that returns a promise
  1. **(resolve-promise results...)** sets results used in **when [results...] ...** macros
  2. **(reject-promise err)** sets results used in **(catch-failure [err] ...)** macros
2. **(promise.callback [params...] ...)** is a macro to creates promises from traditional callbacks
  1. **callback** is a function reference to use where callbacks would normally be defined
3. **(promise.resolved results)** Will return a promise that will always provide the results supplied to when. Use it to turn a synchronous function into a promise to use in sequences.
4. **(when [promises] ...)** is a macro that works like a lambda where the function body is executed with the results supplied once (and if) the promise is resolved. If a **when** statement returns a promise it can be used for chaining.
4. **((when...).catch (=>...))** Will evaluate for all rejections.
6. **(promise.all promise-1 promise-2 [[promises]])** will return a promise that is fulfilled when all the promises specified are resolved or rejected. It will flatten arrays of promises.

### Benefits
1. Separates cause and effect more clearly
2. Results are available even it the promise is resolved before inspection
3. You can pass around a promise just like the data it will contain
4. Handles exceptions in a structured way

### Disadvantages
2. Still fairly highly coupled
3. Only allows one action - not for repetitive events
4. Developer view needs to change from sequential perspective
5. Being selective about errors and exceptions is painful. Once a promise is resolved it cannot change. Any promises that rely on a rejected promise will themselves be rejected causing a cascade of failures. To be selective you need to wrap a promise catch in an outer promise and resolve the outer one if the error itself can be resolved. Don't forget to resolve the outer promise with the data from the inner one when there are no errors.
6. Makes it harder to follow the sequence of events.
