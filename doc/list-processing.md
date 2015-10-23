# List Processing

Lisp was named as a shorter form of 'list processing'. When I first heard of lisp in the early 80's, I did not follow up on it as I did not see the value for my work in a language that gave priority to lists. Who needs specialised list processing when we have loops? This at a time I was using FORTH without thinking that I was treating the stack as a list. Time has moved on (a lot) and with the era of multiple cores starts, functional programming has gained new ground.

Lispz compiles to JavaScript on the browser, so has very little opportunity at this time to use multiple cores. It will work happily with web workers once they become ubiquitous, but that is more the architecture of the workers than the language to use.

Enough... on to lists. JavaScript ES5 has already added quite a few referentially transparent list processing functions. In this case it means they will not change the lists provided as input.

    (var l1 [[1 2 3]]   l2 [[4 5]]   l3 [[6 7]])
    
    (l1.concat l2 l3)                                               ## [[1 2 3 4 5 6 7]]
    (l1.indexOf 2 from)                                             ## 1  ## from defaults to 0
    (li.join ", ")                                                  ## "1, 2, 3"
    (li.lastIndexOf 2 from)                                         ## 1  ## from default to last element
    
    (l1.every (lambda [item idx lst] (return (< idx 2))))           ## [[1 2]]  ## index, lst are optional
    (l1.filter (lambda [item idx lst] (return (% idx 2))))          ## [[1 3]]
    (l1.forEach (lambda [item idx lst] (console.log item)))         ## 1\n2\n3
    (l1.map (lambda [item idx lst] (return (* item 2))))            ## [[2 4 6]]
    (l1.reduce (lambda [prev item idx lst] (return (+ prev item))) seed)      ## 6 ## seed optional
    (l1.reduceRight (lambda [prev item idx lst] (return (+ prev item))) seed) ## 6 ## seed optional
    (l1.slice 1 2)                                                  ## [[2]] ## -ve from end
    (l1.some (lambda [item idx lst] (is item 4)))                   ## false  ## true if (is item 2)
    
The following are not referentially transparent

    (l1.pop)                                                        ## 3  ## (is l1 [[1 2]])
    (l1.push 88)                                                    ## [[1 2 3 88]]
    (l1.reverse)                                                    ## (is l1 [[3 2 1]])
    (l1.shift))                                                     ## 1  ## (is l1 [[2 3]])
    (l1.sort (lambda [a b] (- b a)))                                ## [[3 2 1]]  ## function optional
