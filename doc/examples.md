# Lispz Examples

This page is best used in conjunction with the [Lispz Scratch-pad](https://cdn.rawgit.com/paulmarrington/lispz/master/index.html). Just copy code that you are interested in to the Scratch-pad window and press <alt><enter> to compile and execute it. You will be able to see the output and the JavaScript generated.

    ## Expanding to binary operator
    (console.log (+ 1 2 3 5) "is 11")

    ## Creating a function
    (ref hcw (lambda [type] (return (+ "Hello " type " world"))))
    (console.log (hcw "cruel"))

    ## Playing with arrays
    (ref a-list [[1 2 6 9]])
    (ref double (a-list.map (lambda [item] (return (* item 2)))))
    (console.log double " is 2, 4, 12, 18")
    (ref second (get double 1))
    (console.log second "is 4")
    (using [list]
      (cond (list.contains 12 double) (console.log "double contains 12"))
    )

    ## Dictionary basics
    (ref one 1  two 2}
    (ref data { one two error: false date: (new Date) })
    (console.log (JSON.stringify data) "is {one: 1, two: 2, error: false, date: ....}")

    ## Create a dictionary to hold state
    (ref data (stateful {one: 1}))
    (data.update! {error: "it broke"})
    (console.log (JSON.stringify data) "is {one: 1, error: \"it broke\"}")

    ## Converting an existing dictionary to stateful (don't do it too often)
    (ref data {two: 2})
    (stateful.morph! data)
    (data.update! "error" "and again")
    (console.log (JSON.stringify data) "is {two: 2, error: \"and again\"}")

    ## Mash dictionaries
    (using [dict]
      (ref d1 {one: 1}  d2 {two: 2}  d3 {three: 3})
      (ref big-dict (dict.merge d1 d2 d3))
      (console.log (JSON.stringify big-dict) "is {one: 1, two: 2, three: 3}")
      (dict.for-each big-dict (lambda [key value] (console.log key "=" value)))
    )

    debugger ## debugging breakpoint

    ## synonyms
    (ref a true b false  c 33)
    (console.log (and a b c) "is false")
    (console.log (or a b c) "is true")
    (console.log (or b c) "is 33")
    (console.log (is c 12) "is false")
    (console.log (isnt c 12) "is true")

    ## Conditionals
    (ref test (lambda [v]
      (cond (is v "One")  (return 1)
            (not v)       (return 0)
            (else)        (do (console.log "what?") (return -1))
      )
    ))
    (console.log (test 22) "is -1")
    (console.log (test false) "is 0")
    (console.log (test "One") "is 1")

    ## Variable function arguments
    (ref show (lambda [type rest] (console.log type "=" (*arguments 1))))
    (show "First" "Second" 3) ## prints First=Second, 3

    ## Scope of references
    (ref cash 1000)
    (ref cash (+ cash 100)) ## hides the earlier reference
    (ref add (lambda [added]
      (ref cash (+ cash added)) ## hides earlier reference - inside closure only
      (return cash)
    ))
    (ref cash+200 (add 200))
    (console.log cash+200 cash "is 1300 1100")

    ## Miscellaneous functions
    (delay 3000 (console.log "waited 3 seconds"))
    (yield (console.log "allow other waiting processes to go first"))
    (console.log (random 101) "is a random number between 0 and 101")

    ## Macros
    (macro wait [secs *body] (setTimeout (lambda [] *body) (* secs 1000)))
    (wait 1 (console.log "delayed 1 second"))
