# Syntax
One of the really cool things about a lisp language is that there is very little syntax. On the flip-side one of the disadantages of minimal syntax is the need for work-arounds - and by definition a work-around is syntax. The core for lispz is 4 sorts of lists

    (action a b c ...) ## functional list
    [a b c]            ## raw list (typically parameters for a function definition)
    [[a b c]]          ## an array list
    {a: 1 b c}         ## an associative array or dictionary
    
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

    (console.log "Hello" "world")  ## ==> console.log("Hello" "world")
    
Macros are amazing things. Addition does not expand to a function but to in-line code:

    (+ 1 2 3) ## ==> 1 + 2 + 3

## Raw List
## Array List
## Associative Array List

# Operators
# Conditionals
# Functions
# Miscellaneous
