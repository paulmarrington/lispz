# Installation

This is the shortest section in the book. If you have an Internet connection, then no installation is required. Just point your browser to http://lispz.net. This points to the latest released version of the Lispz repl. The html is just over a dozen lines.

    <!DOCTYPE html>
    <html manifest=index.cache-manifest>
      <head>
        <meta charset="utf-8">
        <title></title>
      </head>
      <body>
        <lispz class=riot></lispz>
        <script
        src=https://lispz.net/ext/lispz.js#riot>
        </script>
      </body>
    </html>

All of the core Lispz functionality is loaded with a single call to a CDN. If the manifest is used, the load will only happen once per browser until the version changes.

When you use Empiric to create your single-page applications, it will generate all the needed support files including the manifest. The _index.html_ will have two source loads - one for your system and one for Lispz.
