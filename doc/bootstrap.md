# Bootstrap/RIOT/Lispz Combo

There is a difference of scope between bootstrap and riot. Bootstrap is designed to be used page-widw. Riot is a web component system where each component should be as independent as possible.

## Page Level Bootstrap

Any single page application that is going to use bootstrap to simplify the UI wraps the contents inside the body with a bootstrap tag. Use an inner page-content tag to allow for fluid layouts - those that change as the window changes size.

<!-- using bootstrap code-editor -->
    <body>
      <bootstrap class=riot>
        <page-content fluid=true>
          ...
        </page-content>
      </bootstrap>
    </body>
    
### Bootstrap Themes

Bootstrap sites do not have to look alike. [Bootswatch](https://bootswatch.com/) provides 16+ free themes, including ones that fit in with Metro, Polymer and Ubuntu:

> Default, Cerulean, Cosmo, Cyborg, Darkly, Flatly, Journal, Lumen, Paper, Readable, Sandstone, Simplex, Slate, Spacelab, Superhero, United, Yeti

To select a theme, send a message to _change-bootstrap-theme_ with the name of the theme to change to. If you don't provide
a theme name, a random one is chosen.

## Component Specific Bootstrap

Riot components can include a _script_ section. If you preface all entries with the name of the component then you have effectively name-spaced your css.

    <code-editor>
      <panel height={ opts.height } heading={ heading } menu={ menu } owner={ _id }>
        <div name=wrapper class=wrapper></div>
      </panel>
      <style>
        code-editor .wrapper {
          ...
        }
    </code-editor>

# Panels

A panel is a UI component that provides decorations around your content. The header includes a title and a menu button. An optional footer can include more text.

    <panel [context=default|primary|success|info|warning|danger]
              [heading=heading-text] [footer=footer-text]
              [menu=menu-id] height=[nn%,nn]>
      panel-body-content-html
    </panel>

The context defines the colours use for the decoration. The _menu-id_ is used to listen on a messaging channel that can publish menu contents.

# Modals

Modals pop up and deny access to the rest of the page until they are dismissed.

    <modal name=n [title=heading-text] [buttons=a,*b] [context=default|primary|success|info|warning|danger]>
      modal-body-content-html
    </modal>

Buttons are added to a footer, with the one starting with a star being the default. When a modal button is pressed it will send a message with a topic of _modal-name/button-name/button_.

    <modal name=login-dialog title="..." buttons="Log in,Cancel">...</modal>
    ....
    (message.listen "login-dialog/Log in/button" (=> ...)

# Menus
# Trees
# Side-bar
