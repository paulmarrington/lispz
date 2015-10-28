# What is a Macro?

The term "macro" includes text substitution (e.g. ASM and C) and syntactic macros. Lisp has had the latter proposed 1963 or soon after. By working on the abstract syntax tree (AST), a macro has the full faculties and syntax of the language to effectively extend the language. Another way of looking at it is that lisp macros run lisp code during the compile to modify the resulting program. Yes, I know this is still not clear. Read https://en.wikipedia.org/wiki/Macro_%28computer_science%29 for a more informative perspective.

Perhaps the best road to undertanding is by example.

    (macro return? [value] (cond value (return value)))
    
creates a new language element that only returns if the value is a truthy, as in

    (var result ....)
    (return? result)
    ## try something else
    
This example would also work with a text substitution macro system, but this one doesn't:

    (macro closure [params *body] (#join '' '(function(' params '){' *body '})(' params ')'))
    
This generates the JavaScript output directly as #join is an immediate function called during the
ast to JavaScript phase.

# Defining a Macro

A macro is defined by giving it a name, list of parameters and a body. In it's simplest form the parameters are substituted into the body at reference time. It is like a function expanded in-line.

    (macro return-if [test value] (cond test (return value)))
    
Immediate actions are required to modify the JavaScript output during the compile stage (ast to JavaScript).

    (macro lambda [params *body] (#join '' '(function(' params '){' *body '})'))
    
Parameters that start with star must be the last in the list and encapsulate all the remaining parameters in the expansion. This is why lambda works:

    (lambda [a b] (var c (+ a b)) (return c))

# #join
# #pairs
# #binop
# immediate
