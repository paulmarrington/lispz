# Networking

Hey, we are in the browser. Of course there will be a lot of networking. Not as much as the dumb browser days and not even as much as the current thinking of a single-page-app. Still, (wo)man can't live on GUI alone.

## HTTP requests

We will start with the raw stuff that has been in the browser for yonks. Lispz adds some lightweight wrappers to make them friendlier and more functional-programming-like.

### net.http-request>

When it was first realised that browsers needed more than text, images and hyper-links to survive "they" decided to add a raw and simple way to get data from the server. This was in the days when XML was king and no-one thought of sending data in simpler ways. Hell, I remember companies advertising that they were an "XML Company". Our data format defines who we are :). Anyway the function was called XMLHttpRequest. Interesting since it just returned "stuff" - not bothering to process the XML to JavaScript objects. Just as well because it was quickly used for all sorts of data formats.

The first version was a very thin layer over the HTTP transport layer. Responses triggered callbacks with chunks of data. The programmer had to concatenate them and wait for an end callback or an error callback before continuing.

Because the Internet is forever (or at least until next decade), the original XMLHttpRequest processing still exists today. There is now thankfully an _onload_ callback that returns with the full result or error as may be. The chunking version is still useful if you are expecting a lot of data or a slow connection - and you can process an unfinished stream. The latter usually names the code much harder.

Interesting fact - HTTP headers are not accessible to the page when it loads, but is for subsequent XMLHttpRequest calls. Useful if you need authorisation information placed their by a proxy.

The "next" html standard is going to provide a much simpler _fetch()_ method. The naming is better, but so far there is little to add that we don't already have - at least if you use Lispz.

### net.http-get

### net.json-request

## Loading External CSS

## Loading Script Libraries

There are many script libraries available for many subjects.

### Basic Loading

### For Lispz Library Containers

### CDNJS - Scripts on the Web

### GitHub - The Major Source Repository

## URL Recognition and Processing

### net.external?

### net.url-path

### net.url-actor

### net.dict-to-query

### net.base64
