## Particle - for decoupling web components

Every framework is designed to make our life easier. But, even the name indications the limitations. A framework will make it difficult or impossible to do some tasks. Often this is good, but sometimes very annoying and limiting. As software developers we spend a good portion of our time finding and implementing workarounds or solutions to limitations in our tools and frameworks.

There is a sometimes obscure difference between workarounds and solutions. Typically a workaround is a hack that takes advantage of an edge-case in the framework. By contrast a solution is an add-on or plugin to the framework that provides new functionality.

The _particle_ component is a solution that is best understood by working through the problem.

RIOT is a cleanroom implementation with a structure similar to web components (without waiting the years for the standard to be fully adopted). I suspect the problem I am about to describe exists in Polymer, Angular 2 and other systems of web components. These systems will have other solution.

### The Problem

Web components are often made up of other web components. Sometimes we need to define content in an outer component for use in an inner. RIOT has the yield tag for this purpose:

    <!-- definition -->
    <my-tag>Combining "_<yield/>_" in a RIOT tag</my-tag>
    <!-- usage -->
    <my-tag>This is <b>HTML</b></my-tag>

RIOT even allows named yields. This is a tightly coupled solution. The problem arises when we want to add to the DOM of an inner component.

    <!-- definition -->
    <panel>
      <div>
        <div class=panel-heading>_filled by higher level parent_</div>
      </div>
    </panel>
    <code-editor>
      <panel></panel>
    </code-editor>
    <!-- usage -->
    <code-editor>
      I want to test to display on the toolbar or the inner panel component
    </code-editor>

### The Workaround

I thought of this as a solution at the time - until a RIOT update changed processing to disallow nested yields.

    <!-- definition -->
    <panel>
      <div>
        <div class=panel-heading><yield from=heading/></div>
      </div>
    </panel>
    <code-editor>
      <panel><yield from=heading><yield to=heading/></yield></panel>
    </code-editor>
    <!-- usage -->
    <code-editor>
      <yield to=heading>
        I want to test to display on the toolbar or the inner panel component
      </yield>
    </code-editor>

As you can see I am passing HTML content down through the layers to the destination. It is still closely coupled and it requires a syntax change at the top level to work.

### The Solution

In short - use components.

    <!-- definition -->
    <panel>
      <div>
        <div class=panel-heading>
          <particle class=riot if={ opts.toolbar } name={ opts.toolbar }/>
        </div>
      </div>
    </panel>
    <code-editor>
      <panel toolbar={ opts.toolbar}></panel>
    </code-editor>
    <!-- usage -->
    <code-editor toolbar=code.toolbar>
      <particle class=riot name=code.toolbar>
        I want to test to display on the toolbar or the inner panel component
      </particle>
    </code-editor>

### Differences to Yield

* A particle is decoupled - it can be created and located in otherwise unrelated HTML
* A particle is created in the source context. Yield is text based, so it will generate in the target context. This makes <yield> more difficult to use opts - making it even more tightly coupled.
* Particle names/paths are application global.
* It does not matter whether the source or destination tags are processed first. If they are not nested, care must be taken to update both together.
* The particle source is extremely ([particle.lispz](https://github.com/paulmarrington/lispz/blob/master/particle.lispz)) simple If you want a JavaScript version, compile the lists at http://lispz.net.
