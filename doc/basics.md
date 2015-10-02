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

    (console.log "Hello" "world")  ## ==> console.log("Hello", "world")
    
Macros are amazing things. Addition does not expand to a function but to in-line code:

    (+ 1 2 3) ## ==> 1 + 2 + 3

## Raw List

At the risk of repeating myself (and at the risk of repeating myself), Lispz is a lightweight compiler to JavaScript. A raw list is an sequence of atoms. When compiled to Javascript the sequence will be comma separated. It is most commonly used for parameters in a function definition:

    (var expect (lambda [address listener=>]
      (add address {once: true listener=>})
    ))
    
The defined function, expect takes 2 parameters, being a string address and a function reference. The => at the end of this function reference is not syntax, just convenience text to show that this is a callback function.

## Array List

For a traditional list or array, use [[]]. This will translate into a normal JavaScript array with standard functional support suchs as forEach and map.

  (var list [[1 2 6 9 my-var "astring"]])

## Associative Array List

# Operators
# Conditionals
# Functions
# Miscellaneous
