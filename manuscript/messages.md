# Messaging
Lispz includes a complete decoupled communications solution based on messaging. The base version is in-browser, but the API is designed to work across systems with RESTful access or WebSockets. The UI components use messaging to communicate between components that are not linked, so cannot make more direct connections.

Here a code editor will wait on messages to open a new 'file'. The message includes a name unique to each code editor. The dictionary at the end can include any number of named requests. Each associated function takes a packet whose content format is known by clients and services.

    (using [message]
      (ref open (lambda [packet] ...)
      (message.dispatch (+ "code-editor/" opts.name) { open })

The client will send a command to open a new file for display. If the editor is called 'scratch':

    (message.send "code-editor/scratch/open" {
      key:      "scratchpad.lispz"
      contents: null
    })

If it is possible that a client will send an important request before the service has had the opportunity to initialise, wrap 'send' in 'wait-for':

    (when (message.ready> "code-editor/scratch")
      (message.send "code-editor/scratch/action" {
        key:      "scratchpad.lispz"
        contents: null
      })
    )

To react to messages, use _listen_:

    (message.listen "page-content-wrapper-padding" (lambda [px]
      (stateful.morph! tag.page-content-wrapper.style)
      (tag.page-content-wrapper.style.update! { paddingLeft: (+ px "px") })
    ))

Lispz uses exchanges defined as part of the address. The address can include details that will define different exchanges (when implemented).

It is possible to remove all listeners by name or regular expression. The latter helps for message streams.

    (message.clear "my-message")

## Message Streams

Lispz Message Streams provide a base implementation of reactive programming. This allows streams to be prepared for consumption in a readable and organised manner. All stream sources and processors return the address of the resulting message stream. This will often be built on the address of earlier streams.

### Stream Sources
A source is a generator that creates messages for a stream. You can create your own, but Lispz provides some common ones:

    (dom.message "click" "my-address" document.body)
    (dom.click "my-address" document.body)
    (message.from.promise "my-promise" a-promise)

### Stream Processors
Stream processors will typically modify messages or filter them. Both cases provide both the message packet and a stream specific stateful context object. In the examples below, @pre is the message from the previous stage in the stream.

    (message.map      @pre "title" (lambda [packet context]))
    (message.filter   @pre "title" (lambda [packet context]))
    (message.throttle @pre 1000)

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

## Tracing Messages

One of the nice things about streams when dealing with asynchronous processes is that you can trace them to see what is happening. Messages with an address matching the regular expression are sent to the console - along with the contents of any packet.

    (message.trace)
    (message.trace '/my-/')
    (message.trace false)
