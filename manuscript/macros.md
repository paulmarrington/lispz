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

A macro is defined by giving it a name, list of parameters and a body. In other words it looks and behaves like a function. In it's simplest form the parameters are substituted into the body at reference time. It is like a function expanded in-line - or a C text substitution macro.

Immediate actions are required to modify the JavaScript output during the compile stage (ast to JavaScript).

    (macro lambda [params _*body_] (#join '' '(function(' params '){' _*body_ '})'))

Immediate actions are:

* __#ast__: given a function and an ast, use the function to preprocess. Note that the function must know about the ast structure - being a list of lists.
* **immediate**: takes lispz code text, compiles it then runs it at compile time. It can be used to inject code into the compile stream where the injected code is also lispz.
* **#join**: is used to join text components to output JavaScript directly.
* **#pairs**: works on pairs of values in a list. It is used to create cond statements and the like.

Unlike functions, macros need to interpret parameters in different ways that cannot be inferred

## ?parameters

A parameter list is optional when defining a function. If one is not provided, the function body can use _@_ as a single parameter. In another language (Lispz):

    (lambda [my-data] (console.log my-data))
    ## is the same as...
    (lambda (console.log @))
    ## is the same as...
    (=> (console.log @))

One of the most common uses for macros it to make higher level operations look like function definitions. If the new type of function does not know how many parameters to expect, the last will be \*wwwwww. If you want the new definition to have an optional
parameter list, use ?pppppp as the first parameter. The same logic used by (lambda) decides whether the first item is a parameter list or not. Only a parameter list would be a raw list at the start of the generated code.

    (macro recursion [?params \*body]
      (#recursion (stateful) (lambda ?params \*body))
    )


## \*parameters

Parameters that start with star must be the last in the list and encapsulate all the remaining parameters in the expansion. This is why lambda (as defined above) works:

    (lambda [a b] (+ a b))

Note that the parameters are a raw list. This translates to a comma separated set of symbols to populate the Javascript function parameters.

The _*body_ is an internally created as a raw list that when compiled to JavaScript becomes a list of statements.

## &parameters

Replace \* with & for the rare cases where you want the rest of the parameters
to fill a JavaScript array rather than a raw list.

    (macro global [name value]
      (#join '' 'lispz.globals.' name '=' value)
      (macro name [&params] (#join '' '(_res_=lispz.globals.' name '(' &params '))'))
    )

## #parameters

With a _normal_ function you can see how many parameters by looking at _arguments.length_. Not so with a macro. For macros add a #parameter before the \*parameter and use it as the count of parameters in the latter list.

    (macro actor [id #body-length \*body]
      ## creates symbol 'id' as well as builds/retrieves the actor
      (ref id (#actor (symbol-to-string id) #body-length
        (lambda [packet context] \*body)))
    )

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
