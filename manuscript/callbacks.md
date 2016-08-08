## Callbacks
Callbacks provide the simplest mechanism for asynchronous responses. Any function that wants to initiate something that will complete at an undetermined later time can take a reference to a function to call at that time (or thereabouts)

    (delay 2000 (lambda (console.log "delay over")))

Many callbacks producers follow the node-js approach of providing error and response parameters.

    (read my-url (lambda [err response]
      (cond err (throw "read failed") (else) response.text)
    )

### Benefits
1. Very simple with minimal overheads
2. Can be called many times
3. Cause and effect are sequential in code

### Disadvantages
1. Empiric in nature
2. Highly coupled
3. Leads to hard-to-read code in more complex event sequences.
4. Exceptions are lost if not processed within the callback
