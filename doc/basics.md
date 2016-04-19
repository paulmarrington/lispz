# Syntax
One of the really cool things about a lisp language is that there is very little syntax. On the flip-side one of the disadvantages of minimal syntax is the need for work-arounds - and by definition a work-around is syntax. The core for lispz is 4 sorts of lists

    (action a b c ...) ## functional list
    [a b c]            ## raw list (typically parameters for a function definition)
    [[a b c]]          ## an array list
    {a: 1 b c}         ## an associative array or dictionary

Named references are created using 'ref'. The reference exists only inside the module or function in which they are first defined. This includes inner functions, but if the inner function defines a 'ref' of the same name it will be distinct and hide the outer reference.

    (ref my-number 23)

A named reference can include almost any character with the exception of brackets and quotes (and three hashes together :).

## Nothing but Fillers
A comma creates an atom. Atoms in _lispz.empty_words_ are ignored. This means that you can put commas in the code for visual separation and they won't effect the compile. By default, _to_, _on_, _in_ and _of_ are also empty words.

    (list.contains 12 in my-list)

If you want to use empty words or add new ones, update _lispz.empty_words_.

## Functional List
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

## Raw List

At the risk of repeating myself (and at the risk of repeating myself), Lispz is a lightweight compiler to JavaScript. A raw list is an sequence of atoms. When compiled to Javascript the sequence will be comma separated. It is most commonly used for parameters in a function definition:

    (ref expect (lambda [address listener=>]
      (add address {once: true listener=>})
    ))

The defined function, expect takes 2 parameters, being a string address and a function reference. The => at the end of listener is not syntax, just convenience text to show that this is a callback function.

## Array List

For a traditional list or array, use [[]]. This will translate into a normal JavaScript array with standard functional support such as forEach and map.

    (ref a-list [[1 2 6 9]])
    (ref double (a-list.map [item] (* item 2))) ## JS==> [2, 4, 12, 18]

Use the get command to retrieve entries

    (ref second (get double 2))

All the JavaScript list processing functions (every, filter, forEach, ...) are available. See the [List Processing](list-processing.md) section for more details.

To see if an array contains an element, use 'contains':

    (cond (list.contains 12 in my-list) (return "has dozen"))

## Associative Array List

Are also called dictionaries or hash-maps. Because Lispz is a functional language it is not uncommon for functions to return a dictionary of values. To make them clearer, if a key is supplied without a following colon then it is placed into the dictionary with a value of the same name.

    (ref exported-method-1 (lambda ...))
    (ref key "whatever I want"}
    (export {exported-method-1 key error: false date: (new Date)})

access with a key is identical to arrays except that it is a key rather than an index. If the key is known at compile-time, using dot syntax is clearer

    exporting.error ## is the same as;
    (get exporting "error")

Lispz does not support the updating of dictionary entries unless they are marked stateful. This should be avoided except where dealing with legacy structures such as the DOM.

    (ref stateful-data {this-is-a-seed: true})
    (stateful-data.update! {more: 1  less: 2})
    (console.log stateful-data.more)

    (stateful.morph! a-dict)
    (a-dict.update! {error: "it broke"}) ## is the same as;
    (a-dict.update! "error" "it broke")

Array access is slightly more convoluted

    (ref stateful-array (stateful ["optional" "seed"]))
    (stateful-array.push! "new entry")
    (ref top (stateful-array.pop!))
    (ref my-array stateful-array)

Lispz provides some more functional referentially transparent functions.

    (ref big-dict (dict.merge dict-1 dict-2 dict-3))

    (ref list [[{key: 1 value: 2} {key: 3 value: 4}]]
    (dict.from-list list "key")    # {1: {key: 1 value: 2} 3: {key: 3 value: 4})

    (dict.for-each dict-1 (lambda [key value] ...))

# Operators

A pure lisp system does not have any operators. Everything is a function or a macro. Because Lispz compiles to JavaScript, all unary and many binary operators are exposed.

    (delete dict.key)  ## JS==> delete dict.key
    debugger           ## JS==> debugger
    (+ 2 3 4)          ## JS==> (2 + 3 + 4)

While unary operators are transparent to Lispz and convert directly, binary operators are expanced with macros. Some operators have convenience names.

    (and a b c)        ## JS==> a && b && c
    (or a b c)         ## JS==> a || b || c
    (is a 12)          ## JS==> a === 12
    (isnt a 12)        ## JS==> a !== 12

Thanks to JavaScript 'and' and 'or' short-circuit - meaning that they will stop when they find truth for and or false for or.

    (return (or value "default value string"))

# Conditionals

Where possible I am following a policy of simplicity over diversity. To this end, Lispz boasts only one traditional conditional operator. The operator, _cond_ takes pairs of lists where the first is the condition and the second the action. Evaluation stops after the first true condition. There is an else macro that evaluates to true to catch situations not covered specifically.

    (cond (is v "One")   1
          (not v)        0
          (else)        -1
    )

Because conditionals work with list pairs, it is necessary to wrap the actions if there are more than one. Lispz provides _do_ for that.

    (cond ok (do (finish-up) true))

# Functions

As I am sure I mentioned before the default lisp/lispz element is the list surrounded by round brackets. In most cases in lisp and all cases in Lispz the first element of the list is a reference to a function. In JavaScript perspective this makes a Lispz list a JavaScript function where the first element is the reference and the rest a list of parameters.

This allows us to call JavaScript functions at any time we can get to them.

    (console.log "This is the" count "log message")

Anonymous functions are created with the lambda key-word (which is actually a macro - confused yet?). The parameters are referenced in another list form - that between square brackets. For later use, create a reference (_ref_). A function will return undefined unless a specific return statement is used.

    (ref +1 (lambda [number] (+ number 1)))
    ...
    a = 12
    (console.log a (+1 a))  ## 12 13

Like JavaScript, Lispz function definitions specify a fixed number of arguments. To gain access to the full list of arguments, use \*arguments, with starting index.

    (lambda [type rest] (console.log type "=" (\*arguments 1)))

# Iteration

In the functional way of programming, loop style iteration is (almost) never needed. Of course the need for iteration remains no matter what programming discipline you follow. In the functional world it is filled by ... you guessed it ... functions. For arrays, JavaScript provides an excellent set documented in [List Processing](list-processing.md).

# Referential Transparency

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

# Miscellaneous

Delay will wait a specified number of milliseconds before executing the body of code. Yield just places the body on the execution stack to be run next in the processing loop. It is a way of waiting for other processes such as UI processing to complete before continuing.

    (delay 10 (console.log "waited"))
    (yield (is-field-visible))

And when you need something that varies (and therefore cannot have referential integrity), use random. Give it a range and it will return a number between zero and the integer before the range.

    (ref percentage (random 101))

In the extremely unlikely situation that you need a global variable, it can be defined as

    (global the-world-knows (=> ...))

Lispz is not an OO language, but JavaScript is. Sometimes it is necessary to create a new instance from the base library.

    (ref now (new Date))
