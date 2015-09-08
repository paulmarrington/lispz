# Why another *&^% language?
**For Fun:**
It is fun to create something new - even when you are following paths well trodden by others for decades. By making your own decisions and learning from them you get a better understanding of the how and why of other languages.

**Extensibility:**
Few languages macros integrated in the language - where macros are expressed in the language itself. There is no difference between built-ins, libraries and code created by the end-user.

**Simplicity:**
Many languages and frameworks are overloaded with features - generating a huge learning curve.

# Overcoming the fear of change
Lispz has different expression ordering, lots of parentheses and function programming overtones. If you have a fear of change and, like me, had decades of OO and Imperative software development then Lispz looks strange, behaves strangely and requires a diffent way of thinking.

And yet, Lispz is only a thin veneer over JavaScript.

    Javascript: console.log("message:", msg)
    Lispz:      (console.log "message:" msg)
    
If you move the parenthenis pairs around and replace brace with parenthesis then the surface similarities become more obvious.

The first major difference is not what has been added, but what has been taken away. Lisp(z) has a lot less syntax. Only

    (fn params)
    [list]
    {dict}
    
form the core syntax. Everything else is either a function or a macro. We won't talk more about macros yet - in case parenoia sets in.

# The benefits of lisp
Having only parenthesis, bracket or brace to deal with reduces ambiguity. In many cases the functional style can be clearer:

    (or value default1 default2 12)

# Where functional programming comes in
