# Foreword

I was a little sad when in 1996 Microsoft moved from _'cooperative multitasking'_ to '_preemptive multitasking'_ for Windows 95. The reasoning included that it would be more responsive. This was only true for poorly written Windows 3 programs. On the slower hardware of the time, task switching was expensive and could easily bog down a system to the point where it was slower.

It is now 20 years later - and the browser is the new Windows 3. We talk about event driven programming, but in practice it is identical to cooperative multitasking. Code running in the browser is on the same thread as display update. This is why a browser application freezes if a program goes rogue. Of course our systems are so much faster that you can do most things without being concerned about blocking the UI.

I believe that the browser has finally come of age. We can cache our programs, store data locally, be disconnection tolerant and do most things a stand-alone program can do. A _single page application_ can be more than just a larger web application.

I am developing an open source application for creating single page applications on the browser with no dedicated server - just GitHub to save and share code. You could program with it on a smart TV if you wanted to. JavaScript makes a good modern assembler, but I did not want to write in it. I wanted to understand functional programming better - and for me the best way is to implement a functional programming language.
