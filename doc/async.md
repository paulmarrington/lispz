# Philosophy
There are three kinds of people in the world - those that can count and those who can't. And there are two ways to treat asynchronous events at the language/platform level. Either stop the process while waiting for something...

    (while (read) (print)) ## this won't work in a JavaScript engine
    
...or provide actions to do when an event happens...

    (read (=> (print))) ## Call an anonymous function when event fires.
    
For some reason the first approach is called synchronous. In practice it means you can't do anything until the event you are waiting for occurs. Systems that work this way compensate by making it easy to create multiple threads - allowing code to appear to work in parallel. The developer does not have much control on when the processor switches from one thread to another. This means that data can appear to change like magic between two instructions on one thread because another thread has been active. Not only does this make referential integrity impossible, but it makes for the need for locks and semaphores and other mind-bending and program-slowing mechanisms.

By contrast the second approach is called asynchronous. It takes the mind-bending from an apparently optional later process and makes it important from the start. This is because we humans have been trained to think in a synchronous manner when solving problems or writing programs.

One more tale before getting back to lispz. Microsoft Windows prior to '95 used what they called "cooperative multi-processing". This meant that the operating system never took the CPU away from a program without the program first giving permission. Hmmm, very similar to a JavaScript machine based on asynchronous methods, isn't it. The complaint then is that badly behaved applications could freeze the UI by not releasing the CPU often enough. Since JavaScript runs on the UI thread it can also freeze the UI in the same way. A well behaved program, on the other hand, is more efficient and far easier to write.

# Callbacks
Callbacks provide the simplest mechanism for asynchronous responses. Any function that want to initiate something that will complete at an undetermined later time can take a reference to a function to call at that time (or thereabouts)

    (delay 2000 (=> (console.log "delay over")))
    
Many callbacks producers follow the node-js approach of providing error and response parameters.

    (read my-url (lambda [err response]
      (cond err (throw "read failed"))
      (return response.text)
    )
    
## Benefits
1. Very simple with minimal overheads
2. Can be called many times
3. Cause and effect are sequential in code

## Disadvantages
1. Empiric in nature
2. Highly coupled
3. Leads to hard-to-read code in more complex event sequences.
4. Exceptions are lost if not processed within the callback
5. Actions triggered before the callback is set are lost

# Promises
ES2015 has introduced native promises into the language. As of November 2015 it is available on all mainstream browsers. Even if not, there are shims that work in an identical(ish) manner.

Functions that want to return information in an asynchronous manner return a promise object. This object can be passed around and whoever needs the data it will or does contain can ask for it with a callback function.

A function that creates a promise uses the 'promise' keyword instead of 'lambda'. Whe the promise is fulfilled it will call (resolve-promise data). If it fails it calls (reject-promise err).

    (var read (promise [addr param1 param2]
      (http-get (+ addr "?&" param1 "&" param2) (lambda [err response]
        (return-if err (reject-promise err))
        (resolve-promise response.text)
      ))
    ))
    


## Benefits
1. Separates cause and effect more clearly
2. Results are available even it the promise is resolved before inspection
3. You can pass around a promise just like the data it will contain
4. Handles exceptions in a structured way

## Disadvantages
2. Still fairly highly coupled
3. Only allows one action - not for repetitive events
4. Developer view needs to change from sequential perspective

# Events
# Messaging
