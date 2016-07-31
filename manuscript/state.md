# State

Imagine a stateless conversation...

> Mr Stateless -- How are you today?

> Ms Stateful -- Great thanks

> Mr Stateless -- How are you today?

> Ms Stateful -- I already told you, Great

... and so on. Not very productive, is it? So, when a functional programmer next tells you that state is evil, act like Mr. Stateless and drive them crazy!

What your functional programming friend is really saying is that for many reason state needs to be contained. Uncontrolled state and stateful objects make software

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

    (stateful-data.update! { name: "goodbye" })
    ## ==> { name: "goodbye" seed: { more: "less" less: "more" }}

    (stateful-data.update! { seed: { more: "more" } })
    ## ==> { name: "goodbye" seed: { more: "more" less: "more" }}

As you can see, _update!_ merges the new data with the old. To replace a node...

    (stateful-data.replace! { seed: { forever: "and again" } })
    ## ==> { name: "goodbye" seed: { forever: "and again" }}

To remove a node, use _delete_:

    (stateful-data.delete! stateful-data.seed.forever)
    ## ==> { name: "goodbye" seed: { }}

In a functional language, everything is an expression. In all cases above the expression resolves to _stateful-data_.

document name/value version of stateful

document stateful after-update
