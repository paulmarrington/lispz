# THe Basics

## Syntax

One of the really cool things about a lisp language is that there is very little syntax. On the flip-side one of the disadvantages of minimal syntax is the need to work-around the resulting limitations - and by definition a work-around is syntax. The core for lispz is 4 sorts of lists

    (action a b c ...) ## functional list
    [a b c]            ## raw list (typically parameters for a function definition)
    [[a b c]]          ## an array list
    { a: 1 b c }       ## an associative array or dictionary
    ## comment         ## comment to the end of the line
    ### comment ###    ## comment block

Named references are created using 'ref'. The reference exists only inside the module or function in which they are first defined. This includes inner functions, but if the inner function defines a 'ref' of the same name it will be distinct and hide the outer reference.

    (ref my-number 23)

A named reference can include any character with the exception of brackets and quotes (and three hashes together :).

### Nothing but Fillers
Atoms in _lispz.empty_words_ are ignored. This means that you can put commas in the code for visual separation and they won't effect the compile. By default, _to_, _on_, _in_ and _of_ are also empty words.

    (list.contains 12 in my-list)

If you want to use empty words or add new ones, update _lispz.empty_words_.

### Functional Lists
In Lispz the round brackets are reserved for function-like calls - being traditional functions and lisp macros. The atom immediately after the open brace is the name of the function or macro.

    (console.log "Hello world")   ## calling a JavaScript function
    (debug "Hello world")         ## a macro that writes the current stack

The first 'atom' can also be an anonymous function.

    ((lambda (console.log "Hello world")))
    ## is the same as
    (ref hw (lambda (console.log "Hello world")))
    (hw)

Internally functional lists are either expanded into more Lispz statements by a macro or are converted to a JavaScript function. The list becomes the function arguments.

    (console.log "Hello" "world")  ## JS==> console.log("Hello", "world")

Macros are amazing things. Addition does not expand to a function but to in-line code:

    (+ 1 2 3) ## JS==> 1 + 2 + 3

### Raw List

At the risk of repeating myself (and at the risk of repeating myself), Lispz is a lightweight compiler to JavaScript. A raw list is an sequence of atoms. When compiled to Javascript the sequence will be comma separated. It is most commonly used for parameters in a function definition:

    (ref expect (lambda [address listener=>]
      (add address {once: true listener=>})
    ))

The defined function takes 2 parameters, being a string address and a function reference. The => at the end of listener is not syntax, just convenience text to show that this is a callback function.

### Array List

For a traditional list or array, use [[]]. This will translate into a normal JavaScript array with standard functional support such as forEach and map.

    (ref a-list [[1 2 6 9]])
    (ref double (a-list.map [item] (* item 2))) ## JS==> [2, 4, 12, 18]

Use the get command to retrieve entries by index or name

    (ref second (get double 2)) ## JS==> second = double[2]

All the JavaScript list processing functions (every, filter, forEach, ...) are available. See the [List Processing](list-processing.md) section for more details.

To see if an array contains an element, use 'contains':

    (cond (list.contains 12 in my-list) "has dozen" (else) "no dozens here")

### Associative Array List (Dictionary/Map)

Because Lispz is a functional language it is not uncommon for functions to return a dictionary of values. If a key is supplied without a following colon then it is placed into the dictionary with a value of the same name.

    (ref exported-method-1 (lambda ...))
    (ref key "whatever I want"}
    (export {exported-method-1 key error: false date: (new Date)})

access with a key is identical to arrays except that it is a key rather than an index. If the key is known at compile-time, using dot syntax is clearer

    exporting.error ## is the same as;
    (get exporting "error")

## Keeping State

State is the elephant in the room - particularly in the functional programming paradigm.
When you have state that can be changed from outside, then any function that reads from it
no longer has referential integrity. This means that identical calls may not return identical
results.

But we need state. Without it the system is fully enclosed without input or output.
A referentially integrous :) function can be replaced by it's return value,
so why ever run it?

The aim is to be like any machine with the internals always working the same.
Think of a clock. The input is someone setting the time.
After that the external gearing, etc. is meant to work consistently so that the
time advances at the correct pace. The current time is state. You can build and
test the entire device without the state. It is on the very outside. Once the
mechanism is working as expected, add a clock face and hands. Changing the hands
is input and displaying the time output. The latter can be considered a
side-effect.

The state container for lispz relies on polite access, not enforced rules. By custom an
function that changes ends in an exclamation mark. Use this to highlight review.
The default builder return an empty JavaScript dictionary.

Lispz does not support the updating of data internals unless they are marked stateful. This should be avoided except where dealing with legacy structures such as the DOM.

    (ref stateful-data (stateful { this-is-a-seed: true }))
    (stateful-data.update! { more: 1  less: 2 })
    (console.log stateful-data.this-is-a-seed)

Update! merges the existing and new entries. Use replace! to replace the entries completely or delete! to remove all contents.

    (stateful-data.replace! { more: 1 less: 2 })
    (stateful-data.delete! { more: 1 })

JavaScript lives in the world of objects as well as functions. Sometimes to work in this world
objects need to be labelled as stateful. Use this approach as sparingly as possible. Always
consider other alternatives first.

    (stateful.morph! a-dict { error: "it broke" })
    ### is the same as;
    (stateful.morph! a-dict)
    (a-dict.update! { error: "it broke" }) ## is the same as;
    (a-dict.update! "error" "it broke")

Lastly, stateful has a data caching tool.

    (ref list-cache (stateful.cache (stateful) (=> (stateful [[]]))))
    ## now we can get named lists, only initialising the first time
    (ref my-list (list-cache "first-list"))
    (my-list.push! "an entry")

Array access is slightly more convoluted

    (ref stateful-array (stateful ["optional" "seed"]))
    (stateful-array.push! "new entry")
    (ref top (stateful-array.pop!))
    (ref second (get stateful-array 1))
    (stateful-array.update! 2 "third entry")

## Stateless

Lispz provides some more functional referentially transparent functions.

    (ref big-dict (dict.merge dict-1 dict-2 dict-3))

    (ref list [[{key: 1 value: 2} {key: 3 value: 4}]]
    (dict.from-list list "key")    # {1: {key: 1 value: 2} 3: {key: 3 value: 4})

    (dict.for-each dict-1 (lambda [key value] ...))

## Operators

A pure lisp system does not have any operators. Everything is a function or a macro. Because Lispz compiles to JavaScript, all unary and many binary operators are exposed.

    (delete dict.key)  ## JS==> delete dict.key
    debugger           ## JS==> debugger
    (+ 2 3 4)          ## JS==> (2 + 3 + 4)

While unary operators are transparent to Lispz and convert directly, binary operators are expanded with macros. Some operators have convenience names.

    (and a b c)        ## JS==> a && b && c
    (or a b c)         ## JS==> a || b || c
    (is a 12)          ## JS==> a === 12
    (isnt a 12)        ## JS==> a !== 12
    (not a)            ## JS==> !a

Thanks to JavaScript 'and' and 'or' short-circuit - meaning that they will stop when they find truth for and or false for or.

    (lambda [value] (or value "default value string"))

## Conditionals

Where possible I am following a policy of simplicity over diversity. To this end, Lispz boasts only one traditional conditional operator. The operator, _cond_ takes pairs of lists where the first is the condition and the second the action. Evaluation stops after the first true condition. There is an else macro that evaluates to true to catch situations not covered specifically.

    (ref test (lambda [v] (cond
      (is v "One")   1
      (not v)        0
      (else)        -1
    )))

Because conditionals work with list pairs, it is necessary to wrap the actions if there are more than one. Lispz provides _do_ for that.

    (cond ok (do (finish-up) true))

Errors are conditions too. One of the most common we have to work with is attempting to address missing dictionary entries.

    (ref a { b: {c: 1 }})
    a.b.c ## ==> 1
    a.c.d ## with throw an exception

In static typed functional languages this is addressed with [Option Types](https://www.wikiwand.com/en/Option_type) - called Maybe in Haskell. These higher order types record whether a reference has a value or not. Operations on items that don't have a value result in a reference to result that does not have a value. Dynamic typed languages, and specifically JavaScript throw an exception if a reference cannot be accessed - behaving very much like a null pointer exception in Java.

Lispz provides a _guard_ macro that effectively provides results similar to expressions of option types.

    (guard a.b.c) ## ==> 1
    (guard a.c.d) ## ==> undefined

You can guard any expression or group of expressions. If you want to do something at the point a guard would be triggered, use _catch-errors_ instead. Note that in JavaScript _undefined_ is not the same as _null_ - although they both evaluate to _false_ in a conditional.

    (catch-errors a.b.c 22) ## ==> 1
    (catch-errors a.c.d 22) ## ==> 22

While _guard_ can wrap a list of expressions, catch-error can only have one expression and error result. In both cases use _(do)_ if multiple expressions are needed.

    (catch-errors (do a.b.c a.c.d) (do (console.log "OOPS!") 22)) ## ==> 22

## Tests

JavaScript is an OO language. Sometimes, hopefully rarely, it is useful to discern the type of a reference (Array, RegExp, etc)

    (ref bflat (cond (instance-of Array b) (flatten b) (else) b))

Mostly we are happy with _(not)_ to tell us whether a reference has content, but sometimes we want to clearly understand whether the reference exists.

    (cond (defined? my-dictionary.a-field) "Field exists" (else) "not known")

## Functions

As I am sure I mentioned before the default lisp/lispz element is the list surrounded by round brackets. In most cases in lisp and all cases in Lispz the first element of the list is a reference to a function or a macro. In JavaScript perspective this makes a Lispz list a JavaScript function where the first element is the reference and the rest a list of parameters.

This allows us to call JavaScript functions at any time we can get to them.

    (console.log "This is the" count "log message")

Anonymous functions are created with the _lambda_ key-word (which is actually a macro - confused yet?). The parameters are referenced in another list form - that between square brackets. For later use, create a reference (_ref_). A function will return undefined unless a specific return statement is used.

    (ref +1 (lambda [number] (+ number 1)))
    ...
    a = 12
    (console.log a (+1 a))  ## 12 13

In a functional language there are not statements. Everything has a value. Since _return_ is a statement, it is not used. The last expression is always returned.

    (ref one (=> 1))
    (console.log (one)) ## ==> displays _1_

This is one of the few places where I add complexity by providing an alternate syntax. The fat arrow, _=>_, is a synonym for _lambda_. It is convenient for in-line functions without any named parameters.

Speaking of named parameters, the parameter list construct is optional. You don't need to provide it for functions, such as closures, that may not need explicit parameters. In this case you have access to an implicit single parameter using _@_

    (ref my-array [[{ name: "terry" position: "driver" } ...]])
    (ref names (my-array.map **(=> @.name)**))
    (ref positions (my-array.map **(lambda @.position)**))

Like JavaScript, Lispz function definitions specify a fixed number of arguments. To gain access to the full list of arguments, use \*arguments, with an optional starting index.

    (lambda [type rest] (console.log type "=" (\*arguments 1)))

Sometimes it is useful to annotate a function reference with meta-data.

    (ref my-func (lambda [a b] (* a b)))
    (annotate my-func { usage: "multiply two numbers" })

In practice _annotate_ is most used in module definitions.

    (ref my-actor (annotate (lambda 12) {
      double: (lambda 24)
    }))
    (console.log (my-actor) (my-actor.double)) ## displays **12 24**

## Lazy Evaluation

Lispz by default supports eager evaluation. This is a good thing. Lazy evaluation adds overhead. It is rarely needed. And when implicit (as in Haskell) can lead to some spectacular confusion. Sometimes it is very valuable - and for those cases Lispz supplies the _once_ macro.

    (ref start-date (once (new Date)))

Lazy expressions have a special syntax (sort of). They need to be wrapped in braces of their own.

    (ref start (start-date))

I can reference _(start-date)_ anywhere and it will always return the same value - the _Date_ object from the first time it was referenced.

I am sure you have worked out that the _once_ macro returns a function reference. The first time the function is run it evaluates the supplied expression. On subsequent calls it returns the result of the evaluation without re-evaluating.

Lazy evaluation is used for deferred promises. Read the promises chapter for more detail.

## Iteration

In the functional way of programming, loop style iteration is (almost) never needed. Of course the need for iteration remains no matter what programming discipline you follow. In the functional world it is filled by ... you guessed it ... functions. For arrays, JavaScript provides an excellent set documented in [List Processing](list-processing.md).

## Referential Transparency

Referential transparency is the holy grail of functional programming. An expression is referentially transparent if it can be replaced by it's value without changing the behavior of the program.

    (ref +1 (lambda [v] (+ v 1)))

is referentially transparent because (+1 2) will be 3 no matter how often it is called.

As a functional language, Lispz attempts to avoid changing of data. In the JavaScript ecosystem this is not always possible. As a necessary compromise, Lispz allows it but makes examples obvious with the _stateful_ macros. Only use it to change data within closures or for external systems such as the DOM when nothing else will do. In other words it is up to the developer to be totally clear of the reach of any change. Aim for referential transparency for any function exported from a module. Where this is not possible, append the exported function with an exclamation mark. Review your code and make sure it is absolutely necessary.

    (ref cash 1000)
    ...
    (ref cash (+ cash 100)) # hides the earlier reference
    ...
    (ref add (lambda [added]
      (ref cash (+ cash added)) # hides earlier reference - inside closure only
      (return cash)
    ))
    (ref cash+200 (add 200))
    (console.log cash+200 cash)  ## Will print 1300 1100

In the example above, the outer reference to cash cannot be changed inside a closure.

## Miscellaneous

Delay will wait a specified number of milliseconds before executing the body of code. Yield just places the body on the execution stack to be run next in the processing loop. It is a way of waiting for other processes such as UI processing to complete before continuing.

    (delay 10 (console.log "waited"))
    (yield (is-field-visible))

And when you need something that varies (and therefore cannot have referential integrity), use random. Give it a range and it will return a number between zero and the integer before the range.

    (ref percentage (random 101))

Thanks to the magic of macros we can convert symbols to string for display, debugging and referencing. Sounds fairly pointless until you use it in macros.

    (macro debug-show [my-ref] (console.debug (symbol-to-string my-ref) "=" my-ref)

In the extremely unlikely situation that you need a global variable, it can be defined as

    (global the-world-knows (=> ...))

Lispz is not an OO language, but JavaScript is. Sometimes it is necessary to create a new instance from the base library.

    (ref now (new Date))

Display messages to the browser console with

    (debug 1 "two" { a: 1 })

Lispz does not support OO, but it needs to be able to create pre-existing JavaScript objects with the _new_ macro.

    (ref now (new Date))
