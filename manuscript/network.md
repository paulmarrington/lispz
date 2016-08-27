# Networking

Hey, we are in the browser. Of course there will be a lot of networking. Not as much as the dumb browser days and not even as much as the current thinking of a single-page-app. Still, (wo)man can't live on GUI alone.

## HTTP Request and friends

We will start with the raw stuff that has been in the browser for yonks. Lispz adds some lightweight wrappers to make them friendlier and more functional-programming-like.

When it was first realised that browsers needed more than text, images and hyper-links to survive "they" decided to add a raw and simple way to get data from the server. This was in the days when XML was king and no-one thought of sending data in simpler ways. Hell, I remember companies advertising that they were an "XML Company". Our data format defines who we are :). Anyway the function was called XMLHttpRequest. Interesting since it just returned "stuff" - not bothering to process the XML to JavaScript objects. Just as well because it was quickly used for all sorts of data formats.

The first version was a very thin layer over the HTTP transport layer. Responses triggered callbacks with chunks of data. The programmer had to concatenate them and wait for an end callback or an error callback before continuing.

Because the Internet is forever (or at least until next decade), the original XMLHttpRequest processing still exists today. There is now thankfully an _onload_ callback that returns with the full result or error as may be. The chunking version is still useful if you are expecting a lot of data or a slow connection - and you can process an unfinished stream. The latter usually names the code much harder.

Interesting fact - HTTP headers are not accessible to the page when it loads, but is for subsequent XMLHttpRequest calls. Useful if you need authorisation information placed their by a proxy.

The "next" html standard is going to provide a much simpler _fetch()_ method. The naming is better, but so far there is little to add that we don't already have - at least if you use Lispz.

Down to brass tacks. _(http-request>)_ takes between 2 and 4 parameters and returns a promise.

    (net.http-request> type url headers body)

There are many standard request types including GET, POST, PUT, HEAD and DELETE. The URL is obvious - and can be fully qualified with domain name, absolute to the current domain root or relative to the current page.

The header can be updated, most commonly for cookies and _Cache-Control: no-cache_. some request types, POST and PUT, allow additional information to be sent in the _body_.

Because retrieving data is one of the most common network activities, we have a shortcut for it...

    (net.http-get url headers)

...and because most modern APIs send JSON data we have a further shortcut.

    (net.json-request uri headers)

As I mentioned in passing, all these requests return a promise that will be fulfilled or rejected by the underlying network access code. The easiest way to see this in action is to show the _json-request_ implementation:

    (ref json-request (lambda [uri headers]
      (after (http-get uri headers) (JSON.parse @))
    ))

## Loading External CSS

CSS files are loaded with a _<link>_ node in the header of the HTML document. It is possible to inject a prepared link with code using:

    (net.css url)

## Loading Script Libraries

Traditionally scripts are loaded by providing the URL to a script tag. The script is loaded over the network then run.

### Basic Loading

We are told by the DOM when loading is complete, but not when the script is ready to use. This is one occasion where Lispz uses polling. In almost all cases a script is ready to use when it write it's prime entry point into the global name-space.

    (net.script url check max-ms)
    ## as in
    (net.script "/etc/jquery.min.js" (=> window.$))

The timeout value is optional, defaulting to 5 seconds.

### For Lispz Library Containers

A common pattern is to create an functions in a separate Lispz Modules. Among other things, the adapter needs to load the library, wait for it to initialise and export any public functions.

    (net.loader filename test-func export-dictionary)

The example below is in markdown.js. It loads ext/showdown.js, waits for the code to create window.showdown, then exports the global for fun and profit.

    (using [net]
      (net.loader "showdown" window.showdown { markdown: window.showdown })
    )

## URL Recognition and Processing

### Is a URL on my server or another?

    (net.external? url) ## returns true if url contains a domain

### How do I convert a dictionary into a query string to send to a server?

    (net.dict-to-query { a: 1 b: "the end" }) ## returns ?a=1&b=the+end

and, yes, it does encode any special keys or values so they will not confuse the server.

### Data references and net.base64

JavaScript in the browser has never been much good and dealing with binary data. Modern browsers can have data-hrefs. These contain the binary contents as base64. Hence we need to convert unknown content to base64 to create them.

    (ref encoded (net.base64 gif))
    (ref uri (net.data-uri encoded))
    ((document.getElementById "image").setAttribute "src" uri)
