# Messaging

Lispz includes a complete decoupled communications solution based on messaging. The core version is in-browser, but the API is designed to work across systems with RESTful access or WebSockets. The UI components use messaging to communicate between components that are not linked, so cannot make more direct connections.

Here a code editor will wait on messages to open a new 'file'. The message includes a name unique to each editor. The dictionary at the end can include any number of named requests. Each associated function takes a packet whose content format is known by clients and services.

    (using [message]
      (ref open (lambda [packet] ...)
      (message.dispatch (+ "code-editor/" opts.name) { open })

For a single action, use _listen_:

    (message.listen "code/editor/flash" (lambda [req] ...))

The client will send a command to open a new file for display. If the editor is called 'scratch':

    (message.request> "code-editor/scratch/open" {
      key:      "scratchpad.lispz"
      contents: "..."
    })

A request will return a promise that when fulfilled with provide an array of results - one for each listener. You can tell if there are no listeners if the array is empty. Use _send_ instead if you are not expecting a response.

If it is possible that a client will send an important request before the service has had the opportunity to initialise, wrap 'request> or send' in 'ready>':

    (after (message.ready> "code-editor/scratch")
      (message.send "code-editor/scratch/open" {
        key:      "scratchpad.lispz"
        contents: null
      })
    )

To react to messages, use _listen_:

    (message.listen "page-content-wrapper-padding" (lambda [px]
      (stateful.morph! tag.page-content-wrapper.style)
      (tag.page-content-wrapper.style.update! { paddingLeft: (+ px "px") })
    ))

Lispz uses exchanges defined as part of the address. The address can include details that will define different exchanges.

It is possible to remove all listeners by name or regular expression. The latter helps for message streams.

    (message.clear "my-message")
    (message.clear '/my-message\/.\*/')

## Message Builder

When using a message address in more than one place, it is
sometimes better to reference a higher level function that
contains the address. Also, use it for a more declarative
code-base.

    (ref station-1 (message "/arctic/station-1"))
    ...
    (station-1.send { header: "Cold" body: "I'll bet it is"}

Functions with parameters [address packet] are also curried.
This is another way to provide declarative programs.

    (ref send-all (message.send "/arctic/station/all"))
    ...
    (send-all { header: "Urgent" body: "Check in please" })

## Address Processing

Mapping and filtering messages are given source and target addresses. If the target address starts with a / it is used alone, otherwise the source and target addresses are concatenated.

    (combine-address "left" "right")  ## left/right
    (combine-address "left" "/right") ## right

## Message Streams
Lispz Message Streams provide a base implementation of reactive programming. This allows streams to be prepared for consumption in a readable and organised manner. All stream sources and processors return the address of the resulting message stream. This will often be built on the address of earlier streams.

### Spanning Asynchronous methods

Different modules will add methods to seed a message stream by using _update!_:

    (message.from.update! { source: (lambda [address ...] ...) })

### Stream Sources
A source is a generator that creates messages for a stream. You can create your own, but Lispz provides some common ones:

    (dom.message "click" "my-address" document.body)
    (dom.click "my-address" document.body)
    (message.from.promise "my-promise" a-promise)

### Stream Processors
Stream processors will typically modify messages or filter them. Both cases provide both the message packet and a stream specific stateful context object.

    (message.map      "my-address" "mouse" (lambda [packet context]...))
    (message.filter   "my-address/mouse" "top-left" (lambda [packet context]...))
    (message.throttle "my-address/mouse/top-left" 1000)

### Stream Consumers
The _listen_ function acts as a consumer and the end of the line for a stream. A consumer may be part of the stream cascade or uncoupled in another component.

### Stream Cascades

Cascade calls a list of functions using the output of one as the input of the next. Use it to provide a stream processing group, whether they have immediate consumers or not.

    (cascade
      (=> (dom.click "my-message-address" document.body))
      (=> (message.map      @	"mouse" 	(=> {x: @.clientX  y: @.clientY})))
      (=> (message.filter	  @	"top-left"  (=> (< @.x @.y))))
      (=> (message.throttle @ 2000))
      (=> (message.listen   @ (=> (console.log @.x @.y))))
    )

## Actors

Actors are implemented as messages. Wikipedia provides a reasonable explanation [here](https://en.wikipedia.org/wiki/Actor_model). In short an Actor:

* Listens for messages
* Can create new actors
* Can send messages to other actors
* Can save local state that effects what happens on the next message received

The last point above means that actors may not be referentially transparent. I have in fact read an article on Elixir that uses actors to contain state.

Note that in the pure model we can send messages to an actor but cannot expect a response. This is very similar to callbacks. Some actor systems, such as that implemented for Scala can return a value. Because Lispz actors are based on messages, they return a promise that when fulfilled has an array of responses from listeners.

Actors are global and referenced by symbol. The work and look like _ref_ except that they create a reference to a function that may have been defined elsewhere.

    ## Module 1
    (actor log (console.log packet)))
    (log "message") ## will send a string to the actor for processing
    ## Module 2
    (actor log) ## send messages to a actor called _log_ defined elsewhere
    (log "another message")

Actors provide the same list of streaming functions as messages:

    (log.map       lower-case  (=> (@.toLowerCase)))
    (log.filter    odd         (=> (/ @ 2)))
    (log.throttle  1000)

## Tracing Messages

One of the nice things about streams when dealing with asynchronous processes is that you can trace them to see what is happening. Messages with an address matching the regular expression are sent to the console - along with the contents of any packet.

    (message.trace)
    (message.trace '/my-/')
    (message.trace false)
