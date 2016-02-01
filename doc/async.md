# Philosophy
There are three kinds of people in the world - those who can count and those who can't. And there are two ways to treat asynchronous events at the language/platform level. Either stop the process while waiting for something...

    (while (read) (print)) ## this won't work in a JavaScript engine

...or provide actions to do when an event happens...

    (read (lambda (print))) ## Call an anonymous function when event fires.

For some reason the first approach is called synchronous. In practice it means you can't do anything until the event you are waiting for occurs. Systems that work this way compensate by making it easy to create multiple threads - allowing code to appear to work in parallel. The developer does not have much control on when the processor switches from one thread to another. This means that data can appear to change like magic between two instructions on one thread because another thread has been active. Not only does this make referential integrity difficult, but it makes for the need for locks and semaphores and other mind-bending and program-slowing mechanisms. On the bright side, a program can use multiple cores without any instruction from the developer.

By contrast the second approach is called asynchronous. It takes the mind-bending from an apparently optional later process and makes it important from the start. This is because we humans have been trained to think in a synchronous manner when solving problems or writing programs.

One more tale before getting back to lispz. Microsoft Windows prior to '95 used what they called "cooperative multi-processing". This meant that the operating system never took the CPU away from a program without the program first giving permission. Hmmm, very similar to a JavaScript machine based on asynchronous methods, isn't it. The complaint then is that badly behaved applications could freeze the UI by not releasing the CPU often enough. Since JavaScript runs on the UI thread it can also freeze the UI in the same way. A well behaved program, on the other hand, is more efficient and far easier to write and debug.

# Callbacks
Callbacks provide the simplest mechanism for asynchronous responses. Any function that wants to initiate something that will complete at an undetermined later time can take a reference to a function to call at that time (or thereabouts)

    (delay 2000 (lambda (console.log "delay over")))

Many callbacks producers follow the node-js approach of providing error and response parameters.

    (read my-url (lambda [err response]
      (cond err (throw "read failed"))
      (return response.text)
    )

## Benefits
1. Very simple with minimal overheads
2. Can be called many times
3. Cause and effect are sequential in code

## Disadvantages
1. Empiric in nature
2. Highly coupled
3. Leads to hard-to-read code in more complex event sequences.
4. Exceptions are lost if not processed within the callback
5. Actions triggered before the callback is set are lost

# Promises
ES2015 has introduced native promises into the language. As of November 2015 it is available on all mainstream browsers. Even if not, there are shims that work in an identical(ish) manner.

Functions that want to return information in an asynchronous manner return a promise object. This object can be passed around and whoever needs the data it will or does contain can ask for it with a callback function.

A function that creates a promise uses the 'promise' keyword instead of 'lambda'. When the promise is fulfilled it will call (resolve-promise data). If it fails it calls (reject-promise err).

    (ref read (promise [addr param1 param2]
      (http-get (+ addr "?&" param1 "&" param2) (lambda [err response]
        (return-if err (reject-promise err))
        (resolve-promise response)
      ))
    ))

Because it is common to turn a callback into a promise, lispz provides a helper macro. The following provides identical functionality. One of the benefits of a language with real macros :)

    (ref read (promise.callback [addr param1 param2]
      (http-get (+ addr "?&" param1 "&" param2) callback)
    ))

Now that we have a promise, we can use it just like a callback if we want:

    (ref reading (read "http://blat.com/blah" 1 2))
    (when reading (lambda [result] (return (process result))))
    (catch-failure reading (lambda [err] (console.log "ERROR: "+err)))

Even without further knowledge, promises clean up errors and exceptions. If you do not catch errors, exceptions thrown in the asynchronous function can be caught in the code containing the promise.

The power of promises starts to become clearer with the understanding that 'when' can return a promise.

    (ref processed (when reading (lambda [result] (return (process result)))))
    (when processed (console.log "All done"))

So far this adds very little at the cost of a relatively large supporting library. If we start thinking functionally instead of sequentially, promises provides a way to clarify our code (a little).

    # change branch we will be working with
    (ref update-mode (github.update lispz-repo))
    # Once in update mode we can retrieve lispz.js and ask for a list of other file in parallel
    (ref lispz-js    (when update-mode [] (read-file "lispz.js")))
    (ref listing     (when update-mode [] (github.list-dir lispz-repo "")))
    # We can only sort files once we have a listing from the server
    (ref groups      (when listing [files] (group files)))
    # but then we can process the different groups in parallel (retrieving source as needed)
    (ref modules     (when groups [files] (return (build-modules files.modules))))
    (ref riots       (when groups [files] (return (build-riots files.riots))))

    # Now to pull it all together into a single file
    (ref  source     (stateful.array! [["window.lispz_modules={}"]]))
    # promise.sequence forces the order.
    (ref all-loaded  (promise.sequence
      (when modules  [sources] (source.concat sources) (return (promise.resolved))
      # lisp.js is added after modules and lisp-js are resolved
      (when lispz-js [code]    (source.push! code) (return (promise.resolved))
      # riot tags are added after lisp.js and lisp-js is added and riots promise is resolved
      (when riots    [sources] (source.array!.concat sources) (return (promise.resolved))
    ))
    # Only write the result when the sequence above is complete
    (return (when all-loaded [] (write-lispz)))
    # returns a promise that is complete once the results are written

In summary we have

1. **(promise [params...] ...)** is a macro that generates a function that returns a promise
  1. **(resolve-promise results...)** sets results used in **when [results...] ...** macros
  2. **(reject-promise err)** sets results used in **(catch-failure [err] ...)** macros
2. **(promise.callback [params...] ...)** is a macro to creates promises from traditional callbacks
  1. **callback** is a function reference to use where callbacks would normally be defined
3. **(promise.resolved results)** Will return a promise that will always provide the results supplied to when. Use it to turn a synchronous function into a promise to use in sequences.
4. **(when a-promise [results...] ...)** is a macro that works like a lambda where the function body is executed with the results supplied once (and if) the promise is resolved. If a **when** statement returns a promise it can be used for chaining.
5. **(catch-failure a-promise [err] ...) is a macro that works like a lambda where the function body is executed if any of a set of chained promises uses **reject-promise** to indicate an error.
6. **(promise.all promise-1 promise-2 [[promises]])** will return a promise that is fulfilled when all the promises specified are resolved or rejected. It will flatten arrays of promises.
7. **(promise.sequence promise-1 promise-2 [[promises]])** will return a promise that is fulfilled when all the promises specified are resolved or rejected. Unlike **all**, each promise is triggered when the preceding promise is resolved.

## Benefits
1. Separates cause and effect more clearly
2. Results are available even it the promise is resolved before inspection
3. You can pass around a promise just like the data it will contain
4. Handles exceptions in a structured way

## Disadvantages
2. Still fairly highly coupled
3. Only allows one action - not for repetitive events
4. Developer view needs to change from sequential perspective
5. Being selective about errors and exceptions is painful. Once a promise is resolved it cannot change. Any promises that rely on a rejected promise will themselves be rejected causing a cascade of failures. To be selective you need to wrap a promise catch in an outer promise and resolve the outer one if the error itself can be resolved. Don't forget to resolve the outer promise with the data from the inner one when there are no errors.
6. Makes it harder to follow the sequence of events.

# Events

Events follow [the observer pattern](https://en.wikipedia.org/wiki/Observer_pattern). Lispz provides access to the light-weight version in Riot. If you use Riot for UI components, the custom tags are always observers. You don't need to use riot to make use of events. You can either create an observable or make any object in the system observable.

    (using [riot]
      (ref observable-1 (riot.observable))
      (ref element (get-my-element))
      (riot.observable element)
    )

Once that is out of the way, tell the observable what to do if it receives an event either once or every time.

    (observable-1.on "event-name" (lambda [params...] what to do...))
    (element.one "focus" (lambda [contents] (element.set contents)))

One observable can have many listeners for the same or different events. Use 'trigger' to wake an observable.

    (observable-1.trigger "event-name" param1 param2)

Finally there needs to be a way to stop listening.

    (observable-1.off "event-name" event-function-reference) ## stops one listener
    (observable-1.off "event-name") ## stops all listeners to an event
    (observable-1.off "\*")          ## stops all listeners to all events for observable

## Benefits
1. Decouples the code to whatever extent is necessary.
2. Associates code and data (such as the DOM).
3. Allows multiple invocations

## Disadvantages
1. Too convoluted to use as an easy replacement for callbacks
2. One-way communication
3. No way of knowing if event was processed as expected.

# Messaging
Lispz includes a complete decoupled communications solution based on messaging. The base version is in-browser, but the API is designed to work across systems with RESTful access or WebSockets. The UI components use messaging to communicate between components that are not linked, so cannot make more direct connections.

Here a code editor will wait on messages to open a new 'file'. The message includes a name unique to each code editor. The dictionary at the end can include any number of named requests. Each associated function takes a packet whose content format is known by clients and services.

    (using [message]
      (ref open (lambda [packet] ...)
      (message.dispatch (+ "code-editor/" opts.name) { open })

The client will send a command to open a new file for display. If the editor is called 'scratch':

    (message.send "code-editor/scratch" {
      action:   "open"
      key:      "scratchpad.lispz"
      contents: null
    })

If it is possible that a client will send an important request before the service has had the opportunity to initialise, wrap 'send' in 'wait-for':

    (message.wait-for "code-editor/scratch" (lambda
      (message.send "code-editor/scratch" {
        action:   "open"
        key:      "scratchpad.lispz"
        contents: null
      })

'dispatch' uses an entry called 'action' to decide on which function to call. For raw processing, use 'listen' instead. The following example changes the left padding on a DOM element if asked.

    (message.listen "page-content-wrapper-padding" (lambda [px]
      (stateful.morph! tag.page-content-wrapper.style)
      (tag.page-content-wrapper.style.update! { paddingLeft: (+ px "px") })
    ))

For a one-off message, use 'expect' rather than 'listen':

    (message.expect "editor-loaded" (lambda ...)

Lispz uses exchanges defined as part of the address. The address can include details that will define different exchanges (when implemented).

It is possible to remove listeners if you have access to the callback used to create the listener

    (message.remove "my-message" my-message-listener=>)

Messages also includes a common log processor. The following two calls behave in an identical manner.

    (message.log "message: message-text")
    (message.send "logging" {level: "message"  text: "message-text"})

The default processor sends them to the browser console. Add additional listeners for modal dialogs, error messages, etc.
