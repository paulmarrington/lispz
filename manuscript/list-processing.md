# List Processing

Lisp was named as a shorter form of 'list processing'. When I first heard of lisp in the late 70's, I did not follow up on it as I did not see the value for my work in a language that gave priority to lists. Who needs specialised list processing when we have loops? This at a time I was using FORTH without thinking that I was treating the stack as a list. Time has moved on (a lot) and with the era of multiple cores, functional programming has gained new ground.

Lispz compiles to JavaScript on the browser, so has very little opportunity at this time to use multiple cores. It will work happily with web workers once they become ubiquitous, but that is more the architecture of the workers than the language to use.

Enough... on to lists. JavaScript ES5 has already added quite a few referentially transparent list processing functions. In this case it means they will not change the lists provided as input.

    (ref l1 [[1 2 3]]) (ref l2 [[4 5]]) (ref l3 [[6 7]])

    (l1.concat l2 l3)             ## [[1 2 3 4 5 6 7]]
    (l1.indexOf 2 from)           ## 1  ## from defaults to 0
    (li.join ", ")                ## "1, 2, 3"
    (li.lastIndexOf 2 from)       ## 1  ## from default to last element
    (l1.slice 1 2)               ## [[2]] ## -ve from end

    ## idx, lst and seed (index and last) are optional
    (l1.every (lambda [item idx lst] (< idx 2)))   ## [[1 2]]
    (l1.filter (lambda [item idx lst] (% idx 2)))  ## [[1 3]]
    (l1.forEach (lambda [item idx lst] (console.log item))) ## 1\n2\n3
    (l1.map (lambda [item idx lst] (* item 2)))    ## [[2 4 6]]
    (l1.some (lambda [item idx lst] (is item 4)))
    (l1.reduce (lambda [prev item idx lst] (+ prev item)) seed) ## 6 ## seed optional
    (l1.reduceRight (lambda [prev item idx lst] (+ prev item)) seed) ## 6 ## seed optional

The following are not referentially transparent (use (stateful []) instead)

    (l1.pop)                    ## 3  ## (is l1 [[1 2]])  ## use (li.pop!)
    (l1.push 88)                ## [[1 2 3 88]]           ## use (li.push!)
    (l1.reverse)                ## (is l1 [[3 2 1]])
    (l1.shift))                 ## 1  ## (is l1 [[2 3]])  ## use (first) & (rest)
    (l1.sort (lambda [a b] (- b a)))    ## [[3 2 1]]  ## use (list.sort)
    (l1.splice 1 1 32 33)       ## [[1 32 33 3]]  ## idx delcnt adds
    (l1.unshift 99)             ## [[99 1 2 3]]           ## use l1.concat

Lispz has less convenient access to specific entries for updates or removals.
They are not only more 'functional', they can also handle nulls more gracefully.

    (for-each l1 (=> proc(@)))  ## handles null and non-array items as well
    (length l1)                 ## same as l1.length - works for strings also
    (list.filter l1 (lambda [item idx lst] (% idx 2)))  ## [[1 3]]
    (get l1 1)                  ## 2
    (list.map l1 (=> (* @ 2)))  ## [[2 4 6]]
    (slice l1 1 2)              ## [[2]] -- extracts a sub-list (can be -ve end)

And for more functional processing

    (first l1)                  ## 1 -- also second, third and fourth
    (rest l1)                   ## [[2 3]]
    (last l1)                   ## 3

And others...

    (contains l1 2)             ## works for strings/substrings also
    (flatten l1)                ## reduce any list of lists into a single level
    ((get-from l1) 1)           ## 2 -- return e function to retrieve from a list
    (reverse l1)                ## [[3 2 1]] referentially transparent reverse
    (sort l1)                   ## [[1 2 3]] referentially transparent sort

The _flatten_ function is quite interesting. It is not uncommon to get lists of
results from more than one source. You end up with a list of lists. Use _flatten_
to create a single list for _map_ and _filter_ type operations.
