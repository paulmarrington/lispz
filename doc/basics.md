# Syntax
One of the really cool things about a lisp language is that there is very little syntax. On the flip-side one of the disadantages of minimal syntax is the need for work-arounds - and by definition a work-around is syntax. The core for lispz is 4 sorts of lists

    (action a b c ...) ## functional list
    [a b c]            ## raw list (typically parameters for a function definition)
    [[a b c]]          ## an array list
    {a: 1 b c}         ## an associative array or dictionary
    
Named references are created using 'var'. They exist only inside the module or function in which they are first defined. This includes inner functions, but if the inner function defines a 'var' of the same name it will be distinct and hide the outer reference.

    (var ref 23)
    
## Functional List
In Lispz the braces are reserved for function-like calls - being traditional functions and lisp macros. The atom immediately after the open brace is the name of the function or macro.

    (console.log "Hello world")   ## calling a javascript function to write to the console
    (debug "Hello world")         ## a macro that writes the current function call stack then a message
    
The first 'atom' can also be an anonymous function.

    ((lambda [] (console.log "Hello world")))
    ## is the same as
    (var hw (lambda [] (console.log "Hello world")))
    (hw)
    
Internally functional lists are either expanded into more lispz statements by a macro or are converted to a Javascript function. The list becomes the function arguments.

    (console.log "Hello" "world")  ## JS==> console.log("Hello", "world")
    
Macros are amazing things. Addition does not expand to a function but to in-line code:

    (+ 1 2 3) ## JS==> 1 + 2 + 3

## Raw List

At the risk of repeating myself (and at the risk of repeating myself), Lispz is a lightweight compiler to JavaScript. A raw list is an sequence of atoms. When compiled to Javascript the sequence will be comma separated. It is most commonly used for parameters in a function definition:

    (var expect (lambda [address listener=>]
      (add address {once: true listener=>})
    ))
    
The defined function, expect takes 2 parameters, being a string address and a function reference. The => at the end of this function reference is not syntax, just convenience text to show that this is a callback function.

## Array List

For a traditional list or array, use [[]]. This will translate into a normal JavaScript array with standard functional support suchs as forEach and map.

    (var list [[1 2 6 9]])
    (var double (list.map [item] (return (* item 2)))) ## JS==> [2, 4, 12, 18]
    
Use the get command to retrieve entries

    (var second (get double 2))
    
All the JavaScript list processing functions (every, filter, forEach, ...) are available. See the [List Processing](list-processing.md) section for more details.

To see if an array contains an element, use 'in':

    (return-if (12 in list) "has dozen")

## Associative Array List

Are also called dictionaries or hashmaps. Because lispz is a functional language it is not uncommon for functions to return a dictionary of values. To make them clearer, if a key is supplied without a following colon then it is placed into the dictionary with a value of the same name.

    (var exported-method-1 (=> ...))
    (var key "whatever I want"}
    (export {exported-method-1 key error: false date: (new Date))
    
will create a JavaScript dictionary of the form

    (var exporting {exported_method_1: exported_method_1, key: key, error: false, date: (new Date)})
    
access with a key is identical to arrays except that it is a key rather than an index. If the key is known, using dot syntax is clearer

    exporting.error
    (get exporting key)
    
If you need to update a dictionary, use set! or dict.update!. Be aware of and keep referential integrity.

    (set! exporting.error "it broke")
    (dict.update! exporting key "new key)
    
Lispz provides some more functional referentially transparent functions.

    (var big-dict (dict.merge dict-1 dict-2 dict-3))
    
Sometimes we want to process each element in a dictionary one after another:

    (using [dict]
      (var for-each (lambda [key value next=>] ... (next=>))
      (var on-completion (=> (console.log "All done")))
      (dict.sequential my-dict for-each=> on-completion=>)
    )

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

Lispz boasts only one traditional conditional operator plus a number of macros for conditional assignment and function return. The operator, cond takes pairs of lists where the first is the condition and the second the action. Evaluation stops after the first true condition. There is an else macro that evaluates to true to catch situations not covered specifically. The default? function takes a value and returns it if it exists and is not empty, otherwise it returns the default value.

    (cond (is v "One")  (return 1)
          (not v)       (return 0)
          (else)        (return -1)
    )
    (var value (default? basic-value "I am empty"))
    
Because conditionals work with list pairs, it is necessary to wrap the actions if there are more than one. Lispz provides 'do' for that.

    (cond ok? (do (finish-up) (return true)))

Apart from all the standard conditional tests (< > <= >=, etc), and the aliases (is isnt not), there are also a few more complex tests:

    (default? array) ## true if the array does not have any elements
    (defined? item) ## true if the item exists and is non-empty

As a functional language, most decisions are made by small single-focus functions. As such, conditional returns are a useful shortcut. To this end, return? returns a value if it not false, null or an empty container, while return-if has a conditional pair. If the first is true the second is returned.

    (return? calculated-value)
    ...
    (return-if (not calculated-value) default-value)

# Functions

As I am sure I mentioned before the default lisp/lispz element is the list surrounded by brackets. In most cases in lisp and all cases in list the first element of the list is a reference to a function. In JavaScript perspective this makes a lispz list a JavaScript function where the first element is the reference and the rest a list of parameters.

This allows us to call JavaScript functions at any time we can get to them.

    (console.log "This is the" count "log message")
    
Anonymous functions are created with the lambda key-word (which is actually a macro - confused yet?). The parameters are referenced in another list form - that between square brackets. For later use, assign it to or in a variable. A function will return undefined unless a specific return statement is used.

    (var +1 (lambda [number] (return (+ number 1))))
    ...
    a = 12
    (console.log a (+1 a))  ## 12 13
    
While I normally avoid short-cuts that don't clarify the code, I made an exception for functions without parameters. I kept forgetting the enpty square brackets.

    (var random-number (=> (Math.random))

Like JavaScript, lispz function definitions specify a fixed number of arguments. To gain access to the full list of arguments, use *arguments, with an optional starting index.

    (lambda [type rest] (console.log type "=" (*arguments 1)))
    
# Iteration

In the functional way of programming, loop style iteration is (almost) never needed. Because of the 'almost' and to provide for those week on functional will, lispz provides one loop operator. It takes a test and a body.

    (while (not (result)) (look-again))

In this case both are functions. Lispz furthers the functional cause by making assignment difficult and ugly.

Of course the need for iteration remains no matter what programming discipline you follow. In the functional world it is filled by ... you guessed it ... functions. For arrays, JavaScript provides an excellent set documented in [List Processing](list-processing.md). Lispz adds one to manage asynchronous operations. There is an equivalent for dictionaries to allow processing on elements sequentially. It requires a dictionary, a function for each entry and a function to call when all is done.

    (var items {a: 1 b: 2 c: 3})
    (dict.sequential items (lambda [key value next=>] ...) (=> (on-complete=> items results)))
    
# Referential Transparency

Referential transparency is the holy grail of functional programming. An expression is referentially transparent if it can be replaced by it's value without changing the behaviour of the program.

    (var +1 (lambda [v] (return (+ v 1))))
    
is referentially transparent because (+1 2) will be 3 no matter how often it is called.
    (var fun (=>
      (var v 2)
      (var incv (=> (return (set! v (v 1)))))
      (return (incv))
    ))
    
The function created, incv, is not referentially transparent since every time it is called changes something. The outer function, fun, is referentially transparent since it will return 3 on call after call. This is an important example. In lispz it is possible to create local functions that break referential transparency. As long as you keep the faith with exports in modules, then you produce the same results as monads and other mechanisms to hold information. In other words, do your best to write in a referentially transparent method, but don't make the code more complex to do so.
    
As a functional language, Lispz attempts to avoid changing of data. In the JavaScript ecosystem this is not always possible. As a compromise, lispz allows it but makes examples obvious. Only use it to change data within closures or for external systems such as the DOM when nothing else will do. In other words it is up to the developer to be totally clear of the reach of any change. Aim for referential transparency for any function exported from a module. Where this is not possible, append the exported function with an exclamation mark. And if you need to, review your code and make sure it is absolutely necessary. At this point in the development, I have only needed to do that once - for dict.update!.

    (var cash 1000)
    ...
    (var cash (+ cash 100))
    ...
    (var add (lambda [added] (set! cash (+ cash added))))
    (add 200)
    
In the example above, set! is used because a var would create a new reference inside the closure.

# Miscellaneous

Delay will wait a specified number of milliseconds before executing the body of code. Yield just places the body on the execution stack to be run next in the processing loop. It is a way of waiting for other processes such as UI processing to complete before continuing.

    (delay 10 (console.log "waited"))
    (yield (is-field-visible))
    
And when you need something that varies (and therefore cannot have referential integrity), use random. Give it a range and it will return a number between zero and the integer before the range.

    (var percentage (random 101))

In the extremely unlikely situation that you need a global variable, it can be defined as

    (global the-world-knows (=> ...))

Lispz is not an OO language, but JavaScript is. Sometimes it is necessary to create a new instance from the base library.

    (var now (new Date))
