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
