# What is a Macro?

The term "macro" includes text substitution (e.g. ASM and C) and syntactic macros. Lisp has had the latter in 1963 or soon after. By working on the abstract syntax tree (AST), a macro has the full faculties and syntax of the language. This effectively extends the language. Another way of looking at it is that lisp macros run lisp code during the compile to modify the resulting program. Yes, I know this is still not clear. Read https://en.wikipedia.org/wiki/Macro_%28computer_science%29 for a more informative perspective.

Perhaps the best road to understanding is by example.

    (macro => [\*body] (lambda [@] \*body))

creates a simplified lambda definition with one parameter called @.

    (ref add-1 (=> (+ @ 1)))

The above example would also work with a text substitution macro system, but this one doesn't:

    (macro closure [params _*body_]
      (#join '' '(function(' params '){' _*body_ '})(' params ')')
    )

This generates the JavaScript output directly as #join is an immediate function called during the ast to JavaScript phase.

# Defining a Macro

A macro is defined by giving it a name, list of parameters and a body. In it's simplest form the parameters are substituted into the body at reference time. It is like a function expanded in-line.

Immediate actions are required to modify the JavaScript output during the compile stage (ast to JavaScript).

    (macro lambda [params _*body_] (#join '' '(function(' params '){' _*body_ '})'))

Immediate actions are:

* __#ast__: give a function and an ast, use the function to preprocess. Note that the function must know about the ast structure - being a list of lists.
* **immediate**: takes lispz code text, compiles it then runs it at compile time. It can be used to inject code into the compile stream where the injected code is also lispz.
* **#join**: is used to join text components to output JavaScript directly.
* **#pairs**: works on pairs of values in a list. It is used to create cond statements and the like.

Parameters that start with star must be the last in the list and encapsulate all the remaining parameters in the expansion. This is why lambda works:

    (lambda [a b] (var c (+ a b)) (return c))

# #join
Many macros translate Lispz directly to JavaScript by mixing pure JavaScript with macro parameters that can convert themselves to JavaScript. _#join_ is an immediate function - being one that runs during the compile phase. The first parameter is the text to be used between the segments. In this context it is usually empty. The first parameter along with the JavaScript are wrapped in single quotes so that they are left as-is in the JavaScript output.

    ## how to break functional integrity without really trying...
    (macro #set! [name value] (#join '' name '=' value ';'))

# #pairs
Pairs is more rarely used. It takes a list and creates output based on pairs in that list. Hmmm, that is not very clear. Best use an example then.

    (macro ref (_*list_) (#join '' 'var ' (#pairs _*list_ '=' ',') ';'))
    (ref a 12  b "hi") ##js=> var a=12,b="hi";

Pairs takes a list, the code within each pair and the string between pairs. In this example, = is between the two items in the pair and , is between pairs. If you need it clearer than that, try meditating on the two sample lines above - or don't use #pairs.

# immediate

Macros allow you to change lispz by adding new build-in commands. By their nature, macros allow the use of lispz at compile time to generate the resulting lispz code. Most macros are to generate JavaScipt

Double-check substitution macros.

    (macro empty? [list] (not list.length))
    # is functionally the same as
    (global empty? [list] (return (not list.length)))

The built-ins #join and #pairs are example of immediate functions - ones that operate during the compile phase. Lispz would not be complete if you could not also create immediate functions.

    (immediate 'alert("Hi")')

Works but has no point. I added immediate for language completeness. I have not yet found a use for it.

    (global #join2 (lambda [sep parts]
      (immediate (_*arguments_ 1) '.map(lispz.ast_to_js).join(lispz.ast_to_js(sep)')
    ))
