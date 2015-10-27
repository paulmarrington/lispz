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

# Defining a Macro
# #join
# #pairs
# Immediate
