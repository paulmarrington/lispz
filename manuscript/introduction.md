# Introduction

## History

Lisp is a _old_ language - with the first implementation in 1958. The syntax was only meant to be temporary, and yet it is still in use today in implementations that include Clojure, Racket, Scheme and Common Lisp.

Why? Because the Lisp syntax is a human readable form of the abstract syntax tree (AST). Compilers for (almost) every language convert the source code into an AST as a very early step.

> As an aside, the original computer scientists (John McCarthy and associates) hand-compiled Lisp directly to machine code. By starting with the AST this manual process was a lot easier.

Macros 'happened' in Lispz as early as 1963 (Timothy P. Hart, [MACRO Definitions for LISP](ftp://publications.ai.mit.edu/ai-publications/pdf/AIM-057.pdf), October 1963). This is not just text replacement - it is the ability to change the code using Lisp at compile time by transforming the AST directly. Suddenly we have an extensible language where we can implement new functionality in our programs. This is the core of what we now called _domain specific languages_.

Early Lisp implementations suffered for their advanced features. They had dynamic memory allocation and garbage collection 30+ years before Java. Software support was primitive and hardware both slow and expensive. Picture having a cup of coffee while the garbage collector is working.

Lisp was the darling of the machine intelligence research community. When this research failed to provide results in the anticipated time-frame, Lisp took the brunt of the blame. In truth neither the hardware or the software of the time was up to the challenge. What was a dream then is on our phones today.

If the history of computer science and programming language interests you, I recommend reading [History of Lisp](http://www-formal.stanford.edu/jmc/history/lisp/lisp.html) by John McCarthy - the credited inventor of the language.

Lastly, one of the texts most recommended for functional programming  [Stricture and Interpretation of Computer Programs (SICP)] (https://mitpress.mit.edu/sicp/full-text/book/book.html) by Abelson and Sussman. It was the core of their MIT 6.001 course from the early 80s until the late 90s. Out of interest it was replaced by Python as the needs of engineers changed ([PROGRAMMING BY POKING: WHY MIT STOPPED TEACHING SICP](http://www.posteriorscience.net/?p=206)) quoting Gerry Sussman.

## Enter the Lispz

I developed Lispz so that I could develop single page applications in the browser using a functional dynamic typed language. That and so I could fully appreciate functional programming.

JavaScript is the perfect target language for Lispz. It is fast, reliable and works on any platform inside all modern browsers. Most importantly it supports all the functionality needed by Lispz. Shame about the Java inspired syntax :)

**Lispz supports data immutability** at the program level. This means it allows the creation and update of local data within a function but makes it harder and more obvious to change data passed in or from a more global scope. This works well due to the single threading and co-operative multi-tasking nature of the JavaScript VM.

**If the Lisp syntax scares you**, just remember that change encourages learning. In practice due to the much simpler syntax, it provides a lot less scaffolding than JavaScript, while still making it abundantly clear when a function needs to be decomposed.

**Lispz inherits real macros** from Lisp. With macros that use the underlying language you can create new domain specific languages to meet any need.

**Lispz uses the power of closures** from JavaScript to capture variables that can change to the function currently running.

**Lispz includes a simple module system** to provide name-spacing and separation of concerns.

## Why another *&^% language?

**For Fun:**
It is fun to create something new - even when you are following paths well trodden by others for decades. By making your own decisions and learning from them you get a better understanding of the how and why of other languages.

**Extensibility:**
Few languages macros integrated in the language - where macros are expressed in the language itself. There is no difference between built-ins, libraries and code created by the end-user.

**Simplicity:**
Many languages and frameworks are overloaded with features - generating a huge learning curve.

## Overcoming the fear of change

Lispz has different expression ordering, lots of parentheses and function programming overtones. If you have a fear of change and, like me, had decades of OO and Imperative software development then Lispz looks strange, behaves strangely and requires a different way of thinking.

And yet, Lispz is only a thin veneer over JavaScript.

    Javascript: console.log("message:", msg)
    Lispz:      (console.log "message:" msg)

If you move the parenthenis pairs around and replace brace with parenthesis then the surface similarities become more obvious.

The first major difference is not what has been added, but what has been taken away. Lisp(z) has a lot less syntax. Only

    (fn params)
    [list]
    [[array]]
    {dict}

form the core syntax. Everything else is either a function or a macro. We won't talk more about macros yet - in case paranoia sets in.

## The benefits of Lisp

Having only parenthesis, bracket or brace to deal with reduces ambiguity - when used with appropriate white-space. In many cases the functional style can be clearer:

    (or value default1 default2 12)
    (+ a b 12)

although not always

    (/ (* value percent) 100)

While our practiced eye finds this harder to understand than "a * percent / 100" it is easier to decipher. Take the 'standard' syntax. Are these the same:

    value * percent / 100
    (value * percent) / 100

You win if you said 'no'. In most languages operator precedence is such that the first sample will do the divide before the multiply. With real numbers the change in order can cause a different result. For languages without auto-conversion, the first will return zero (assuming percent is less than 100). With auto-conversion and all integers, the first will cause two floating point operations while the second only one.

Back to

    (/ (* value percent) 100)

With the understanding that everything appears to be a function, it becomes easier to read and there are no ambiguities. The word is 'appears' as Lispz expands binaries in-line, such that the code run as

    ((value * percent) / 100)

## Where functional programming comes in

Shhh! Don't tell the Haskellers. JavaScript is already a functional language in that it provides functions as first-class operators, closures and bindings. There are other aspects that it does not support - the major ones being immutability and static types. I think of JavaScript as a modern assembler, making it the responsibility of the higher (:) level language to fill in the gaps.

Lispz is way more function than JavaScript. Where JavaScript has statements, (almost) everything in Lispz returns a value. It is best to write Lispz as you would write Haskell where a lambda is one equation that does one thing. Use composition for larger tasks. With practice this becomes a powerful way to build up a system one step at a time. Modules and closures allow decomposition in a controlled manner.

Lispz is too lightweight to do anything about static types.

Immutability is a moving target. For a functional language, this means if a function is called with the same parameters it will always return the same result. Another definition states "no side-effects". A third suggest it means all data on the stack - meaning function call parameters. In the extreme it means that there are no variables, only constants - data once allocated never changes.

Lispz takes a pragmatic approach leaving it up to the developer. A reference (created with _ref_) can be shadowed by using the same name - but only in the same function. In an inner function the outer reference name can be accessed, but any shadowing only effects the immediate (inner) function. Because immutability is such a hard task master in an imperative world (such as the dom), Lisp does include a _stateful_ macro. Unlike assignment, _stateful_ is painful enough to remind the developer to limit it's use. Putting a bang after any exported function that includes mutability provides a good hint to rule-breaking. It is up to the developer to ensure than any function exported from a module honors the immutability and repeatability rules - and to flag the method (with a bang) when this is not possible.
