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

A menu is a multi-level option selection. Both menu contents and results selected communicate by messages.

Menu contents loading can be driven by the menu component or an external provider. For the former, the menu component sends out a message when a user asks to open the menu. It is up to a listener to provide the data requested. Use this if the menu contents change between uses.

      (message.listen "specifications-menu-open" (=>
        (var menu (dict.map lispz_modules (lambda [title source]
          (return {topic: "specifications" title source})
        )))
        (message.send "specifications-menu" (menu.sort))
      ))
      
This example has a flat single-level list. All menus send a message when displayed with the name of the menu concatenated to _.open_. They also listen on the menu name as an address, so you can pass the resulting menu back.

If an external controller knows when the menu changes, or if the menu is static, then send the contents to a named message address so that the specified menu can be reloaded. If this happens before the menu is displayed the menu will not be loaded. To fix this, wait for the menu to be ready.

      (when (message.ready "specifications-menu") []
        (message.send "specifications-menu" nenu)
      )        
The menu itself is a dictionary with the format:

     (var test-menu
        [[
          { header: true title: "Heading 1" }
          { title: "Item 1" topic: "Test menu item 1" }
          { title: "Item 2" children: [[{ title: "Item 2a" }]] }
          { divider: true }
          { title: "item 2" disabled: true }
        ]]
      )
    (message.send "test-menu" test-menu)
    
where _header_ and _divider_ are list separates that cannot be selected. For the rest, _title_ is the text displayed, _topic_ is part of the the address for the message sent, _children_ defines sub-menus and _disabled_ is for items that cannot be selected.

If a menu item has a topic entry, a message will be sent to that an address made up of the component owner, dash, topic.

    (message.listen "Test Panel 2 - Test menu item 1" (lambda [data] (debug data)))

## bars-menu

This menu type displays three horizontal bars - sometime call a _hamburger_. Click it opens up a drop-down menu.

    <bars-menu align=left|center|right name=name owner=owning-component />
    
The owner is prepended to the response to a menu selection so that the correct component can respond.

# Trees

A tree provides an identical interface to a menu. Visually all levels to the current selection remain displayed. Selecting a branch will toggle it opened or closed. Selecting a leaf will send a message to the owning component.

# Side-bar

A side-bar is a slide-in draw. When hidden it displays a string down the left side of the screen. Clicking on the 3-bars icon at the top will slide the panel in and out.
