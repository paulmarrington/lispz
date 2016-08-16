# Philosophy
There are three kinds of people in the world - those who can count and those who can't. And there are two ways to treat asynchronous events at the language/platform level. Either stop the process while waiting for something...

    (while (read) (print)) ## this won't work in a JavaScript engine

...or provide actions to do when an event happens...

    (read (lambda (print))) ## Call an anonymous function when event fires.

For some reason the first approach is called synchronous. In practice it means you can't do anything until the event you are waiting for occurs. Systems that work this way compensate by making it easy to create multiple threads - allowing code to appear to work in parallel. The developer does not have much control on when the processor switches from one thread to another. This means that data can appear to change like magic between two instructions on one thread because another thread has been active. Not only does this make referential integrity difficult, but it makes for the need for locks and semaphores and other mind-bending and program-slowing mechanisms. On the bright side, a program can use multiple cores without any instruction from the developer.

By contrast the second approach is called asynchronous. It takes the mind-bending from an apparently optional later process and makes it important from the start. This is because we humans have been trained to think in a synchronous manner when solving problems or writing programs.

One more tale before getting back to lispz. Microsoft Windows prior to '95 used what they called "cooperative multi-processing". This meant that the operating system never took the CPU away from a program without the program first giving permission. Hmmm, very similar to a JavaScript machine based on asynchronous methods, isn't it. The complaint then is that badly behaved applications could freeze the UI by not releasing the CPU often enough. Since JavaScript runs on the UI thread it can also freeze the UI in the same way. A well behaved program, on the other hand, is more efficient and far easier to write and debug.

## Simple Simon

Some functions related to asynchronous actions are ubiquitous and do not belong in any sub-category.

### Delays

Sometimes an action needs to happen after a time period. Since time-slicing in the JavaScript VM is not preemptive, the time may be longer than specified.

    (delay 10000 (console.log "After 10 seconds"))

Sometimes it is just a matter of letting others on the asynchronous queue to have a go. Since the UI may be waiting, this reduces stuck display syndrome.

    (ref list (get-big-list))
    (list.forEach (lambda [item] (yield (process item))))
