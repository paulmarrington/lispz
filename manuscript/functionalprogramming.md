# Functional Programming

Functional programming means different things to different people. Lispz supports a lot of the functions used to make your system more declarative. All the support functions mentioned here are loaded at start-up. They can be reviewed at [fp.lispz](https://github.com/paulmarrington/lispz/blob/master/fp.lispz).

## Currying

Functional programmers love currying for some reason. [Haskell Brooks Curry](https://en.wikipedia.org/wiki/Haskell_Curry) was an American mathematician who lived through the first 80 years of the 20th century. So, _currying_ is named after a person and is not a description - except possibly that it spices up your code :). Currying is the epitome of a higher level function. You supply it with a function that has a fixed list of parameters. It returns a function that can be called with less parameters. Until all the parameters are supplied, the curried function returns another function. You will probably get a better explanation here: https://en.wikipedia.org/wiki/Currying. Better still, an example. In Lispz, _curry_ behaves like _lambda_ while providing the additional functionality...

    (ref add-3 (curry [a b c] (+ a b c)))

    (add-3 1 2 3)     ## ==> 6; is the same as
    (((add-3 1) 2) 3) ## is the same as
    ((add-3 1 2) 3)

This doesn't look very useful (probably because it isn't). Here is a simple use of currying where both _first_ and _second_ are functions that return the appropriate entry when given an array.

    (global dot    (curry [index array] (#join '' '(_res_=' array '[' index '])')))
    (global first  (dot 0))
    (global second (dot 1))

  There are also functions for third, fourth and last. It is a way to make your code more declarative, but is nothing more than a convenience. I could have written

    (global first (lambda [array] (get array 1)))

You will soon recognise code from functional programmers who favour currying. Their functions will be defined with the parameters in an unusual order so that the parameters likely to change are at the end. If you are lucky enough to have a function with two parameters you can reverse the order. Pull is curried, so we can use it to create a new function that knows about a stateful cache and can retrieve items by name.

    (global get-from  (flip lispz.globals.dot))

    (ref commands {a: 1 b: 2 c: 3})
    (ref command (get-from commands))
    (command "b")

I do not use currying a lot, preferring explicit definitions, but when it is useful it is very useful. The following example keeps a cache of arrays accessed by name. When a new name is used a new array is created.

    (global stateful.cache (curry [store update key]
      (or (get store key) (do (store.update! key (update)) (get store key)))
    ))
    ## ... much later
    (ref exchange (stateful))
    (ref observers (stateful.cache exchange (=> (stateful []))))
    ## ...
    ((observers "my-key").push! my-value)

## Compose, Cascade and Tee

Composition is easier to understand. A function is returned that will be called in sequence with the return value of the former supplied as the only parameter of the latter. Like _curry_ the order of parameters is 'unusual'.

    ((compose (=> (+ @ 1)) (=> (+ @ 2))) 3) ==> 6

Unlike in some implementations, functions are run left to right. The last parameter is the seed value for the first function in the sequence. This makes _compose_ useful for currying.

In reactive programming the first function in a generator followed by one or more processors. As this is the most common use for _compose_ in lispz, there is a second form called _cascade_ that provides a null seed.

    (cascade
      (=> (dom.click "my-message-address" document.body))
      (=> (message.map      @	"mouse" 	(=> {x: @.clientX  y: @.clientY})))
      (=> (message.filter	  @	"top-left"  (=> (< @.x @.y))))
      (=> (message.throttle @ 2000))
      (=> (message.listen   @ (=> (console.log @.x @.y))))
    )

These functions are analogous to Unix pipes - so it should not come as a surprise that there is a _tee_ function so that the comsposition can follow two or more branches.

    (cascade
      (=> (dom.click tag.tree address))
      (=> (tee @
        (message.filter @ "branches" (=> is-branch @.srcElement))
        ## come here if the items has children...
      ))
      (=> (message.filter @ "leaves" (=> is-leaf @.srcElement)))
      ## come here if the item has no children...
    )

## List Processing - Filters and Maps

Lists have enhanced importance in functional languages. _Lisp_ is short for _List Processing_.

A _functor_ is a data item that can respond to the _map_ function. For arrays and lists the _map_ function will walk over the list applying a function to each element.

    (ref list [[1 2 3]])
    (map list (=> (* 3 @)))  ## ==> [[3 6 9]]

But that is not all. Functors can be open-ended. Reactive programming will use functors to process information as it becomes available. See the message chapter for more details.

While _map_ creates a new list of values calculated from the old list, _filter_ produces a subset of the incoming data.

    (ref list [[1 2 3]])
    (filter list (=> (< @ 3)) ## ==> [[1 2]]

Because it is very common to translate items with _map_ then _filter_ then Lispz provides a _map-and-filter_ function.

## Tail-call Recursion

Another trait common to 'real' functional languages is tail-call recursion. Functional languages (almost) never have imperative loop syntax such as _for_ and _while_. Instead functions will call themselves to process sequences. This is called recursion.

    (ref count-down (lambda [count]
      (ref next (- count 1))
      (cond next
        (count-down next)
      (else)
        next
      )
    ))
    (count-down 10)
    (count-down 1000000)

Yes, I know, there could be no more meaningless function. The first call will work fine, but the second will cause a stack overflow. This is because we are building up calls and loading up the stack for each 'iteration'. Most functional languages implement tail-call recursion to 'resolve' this issue. If the function calls itself as the last expression then the language compiler turns this into a jump to the start of the function rather than using the return stack. I have always thought that tail-call recursion feels like a bit of a hack - and one easily misused. The code above would not be a candidate. It would have to be written as

    (ref count-down (lambda [count]
      (ref next (- count 1))
      (cond _(not_ next _)_
        next
      (else)
        (count-down next)
      )
    ))

This is too implicit. Besides it is also theoretical since JavaScript does not (yet) support tail-call recursion. In Lispz it is explicit, and because it is explicit it is not restricted to the last expression.

    (ref count-down (recursion [count]
      (ref next (- count 1))
      (cond next
        (count-down next)
      (else)
        next
      )
    ))
    (count-down 10)
    (count-down 1000000)

Now the second function will not cause a stack overflow. Explicit is better than implicit.

Oh, and the implementation is quite interesting - but not simple to understand. I will leave understanding as an exercise to the reader - as I can't ...quite... know how to describe it in words. As always in Lispz the bulk of the work is in a function with a macro so that it can be used like any other function definition.

    (global #recursion (lambda [context func]
      (lambda
          (ref args (\*arguments))
          (cond context.queue
            (context.queue.push args)
          (else)  (do
            (context.update! { queue: [[args]]})
            (#join '' 'while(' (ref next-args (context.queue.shift)) '){'
              (context.update! { result: (func.apply null next-args)})
            '}'))
          )
          context.result
        )
    ))
    (macro recursion [?params \*body]
      (#recursion (stateful) (lambda ?params \*body))
    )
