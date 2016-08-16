# State

Imagine a stateless conversation...

> Mr Stateless -- How are you today?

> Ms Stateful -- Great thanks

> Mr Stateless -- How are you today?

> Ms Stateful -- I already told you, Great

... and so on. Not very productive, is it? So, when a functional programmer next tells you that state is evil, act like Mr. Stateless and drive them crazy!

What your functional programming friend is really saying is that for many reason state needs to be contained. Uncontrolled state and stateful objects make software --

* hard to test and debug because it is difficult to tell what state it is in at any given time.
* more difficult to reason about as time and order must be accounted for.
* Makes multi-tasking, multi-threading and multi-core work much more difficult.

I would like to expand on the last point. Java uses the _synchronize_ keyword to protect actions on common data from changing it in the middle of an operation. Firstly the developer must be savvy enough to avoid deadlocks. These are where two or more pieces of code are blocked because they are each waiting on synchronized data held by the other. If synchronization is too fine-grained there will be significant delays due to checking and task switching. If too course grained, the application will behave like there was only one CPU and thread since every other thread is waiting on data locked elsewhere. This is a very common bottleneck in large Java applications.

In short synchronizing is hard. By isolating and quarantining known stateful operations, the code is easier to reason about and test.

Functional languages have a diverse set of features to quarantine stateful operations. Haskell has stateful monads, Erlang has message passing and Scala has Actors to make a few.

Lispz is in a different environment. All code and DOM manipulation (display) in the browser is on a single thread. There is still some multi-tasking since code can switch to a different context when waiting for asynchronous events (http requests, timeouts, user interaction, etc). Unlike many server-based systems, a developer can expect data to remain unchanged until the code makes an asynchronous request. After that all bets are off.

Also, browser based software must deal with the intrinsically stateful DOM (document object model) that lies behind the page content we see.

For these reason Lispz

* isolates state changes to specific objects and arrays
* uses a syntax that highlights as dangerous in an editor
* doesn't make stateful actions so difficult as to make the system hard to use.

Lispz does not support variables directly. Everything is accessed by reference. As with all of Lispz, this is by custom, not by policing. This means that with a knowledge of JavaScript you can cheat - just don't do it.

A dictionary can created is a way that it can hold stateful data. It can also be provided with seed data to start it off...

    (ref stateful-data (stateful))
    (ref stateful-data (stateful) { name: "hello" seed: { more: "less" less: "more" }})

Once a reference to a stateful object has been created it is possible to change data from the root of the dictionary tree.

    (stateful-data.merge! { name: "goodbye" })
    ## ==> { name: "goodbye" seed: { more: "less" less: "more" }}

    (stateful-data.merge! { seed: { more: "more" } })
    ## ==> { name: "goodbye" seed: { more: "more" less: "more" }}

The problem with merging is the same as the benefit. It walks the tree and replaces leaf items that have changed. It leaves branches and other root items alone. Replacing a node is a lot more efficient and leads to less surprises...

    (stateful-data.replace! { seed: { forever: "and again" } })
    ## ==> { name: "goodbye" seed: { forever: "and again" }}

You can use _update!_ instead of _replace!_. It is not as clear and only exists for historical (or hysterical) reasons.

Sometimes it is necessary to merge and then _delete!_ to get the result you need:

    (stateful-data.delete! stateful-data.seed.forever)
    ## ==> { name: "goodbye" seed: { }}

In a functional language, everything is an expression. In all cases above the expression resolves to _stateful-data_.

The examples above only work with static keys. If you need to manipulate an item when you only know the key at runtime, use:

    (ref my-key (cond left "left" (else) "right"))
    (stateful-data.merge! my-key my-value)

Data changes can be linked to other actions. This is a case of side-effects on side-effects and puts referential integrity completely out of the picture.

    (stateful.after-updates stateful-data (lambda [updates]
      (console.log "Changes: " updates)
    ))

One of the more common uses for statefulness in a functional program is caching of static slow-to-retrieve data. It can be used for keeping reference data from a database - or pointers to nodes in the DOM. The cache is a curried function to aid in representations.

    (ref stacks (stateful.cache stateful-data (=> (stateful [])))
    ((stacks "first").push! 11)
    ((stacks "first").push! 22)
    (console.log stacks.first) ## ==> [[11 22]]

It's all very well being able to store state, but Lispz runs in the browser using JavaScript libraries. This means there are times we need to change pr-existing objects or DOM elements. For those we must _morph!_ an object into a stateful one.

    (ref data {})
    (stateful.morph! data)

    ## ... is the same as
    (ref data (stateful))

    ## except you can do it to data structures you don't own
    (ref dom-fragment (stateful.morph! (document.createElement 'DIV')))
    (dom-fragment.update! { innerHTML: tag-html })

## Uniqueness in a Random World

JavaScript supplies a pseudo-random number generator that Lispz exposes with _(random range)_. The number returned will be between 0 and one less than the range given.

    (ref next-number (random 10)) ## ==> returns a number between 0 and 9

Many modern systems require a unique identifier, often called a uuid. While it would be difficult to generate a true uuid in JavaScript, we can emulate one to the uniqueess of the _random_ function.

    (ref id (uuid)) ## ==> returns xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx

## Odds and Sods

In functional languages a common way to contain state is with a higher level function. Such are the implementations of _(counter!)_ for numbers and _(unique! "base")_ for strings. They both return a function that when repeatedly called always returns a different value. For fun, and to show how higher level functions can encapsulate state I have provided the implementations...

    (global counter! (lambda
      (ref count (stateful {to: 0}))
      (lambda
        (count.update! "to" (+ count.to 1))
        (return count.to)
      )
    ))

    (global unique! (lambda [base]
      (ref counter (counter!))
      (lambda
        (ref uid (counter))
        (cond
          (is uid 1)  base
          (< uid 10)  (+ base "-0" uid)
          (else)      (+ base "-" uid)
        )
      )
    ))

An inverse of _counter_ is countdown that returns true after a specified number of calls. It accepts a starting value and an increment, and is useful with (delay).

    (global wait-for (promise [test max-ms]
      (ref timed-out (*countdown!* (or max-ms 5000) 10))
      (ref waiter (lambda []
        (cond
          (test)      (resolve-promise)
          (timed-out) (reject-promise)
          (else)      (delay 10 (waiter))
        )
      )) (waiter)
    ))
