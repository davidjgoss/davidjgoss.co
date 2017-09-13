---
title: Moving to AngularJS Components
tags:
- javascript
- angularjs
summary:
  Components are a new feature in AngularJS since version 1.5 that promote a hierarchical structure of small, reusable, predictable blocks. If you're wondering whether to start moving your Angular codebase over, I have some opinions for you.
---

[Components](https://docs.angularjs.org/guide/component) are a new feature in AngularJS since version 1.5. They've immediately become the recommended way to build in Angular - to the extent that the [beginner's tutorial](https://docs.angularjs.org/tutorial) uses them[^1]. People who are responsible for existing Angular codebases might be wondering whether it's a good idea to start moving over to Components, and if so why. I *do* think it's a good idea, so here's my attempt at articulating the why.

[^1]: To my considerable chagrin - before this, when new people arrived we could send them through the Angular tutorial and they'd be mostly ready to start work on our app.

At a technical level, Components are simply a restricted subset of [Directives](https://docs.angularjs.org/guide/directive). On its own, I admit that doesn't sound especially helpful, so we need to come up to a conceptual level to find out what's really going on.

[Angular 2](https://angular.io/) has a vision for how JavaScript applications should be structured and developed - one it loosely shares with other frameworks and libraries like [React](https://facebook.github.io/react/). The way it goes, your app should be a tree of components, each one having these characteristics:

- **Small** - it should do a small, knowable amount of functionality; ideally, it's small enough that you can inline its template with the script
- **Reusable** - it should explicitly require its own dependencies and should be portable to elsewhere in the app (or even outside the app) without reworking 
- **Predictable** - it should get data passed in through one-way bindings *which it should not mutate directly*, but rather send events back up the tree in response to user actions (yeah, we'll come back to this one)

Moving your application over to this kind of architecture is basically a good thing; you'll find your code nicely organised, well tested and easier to make changes to. Equally, this is a move away from a pattern that is deprecated in Angular 2, so it's an important step on that road. In fact, that also applies if you're thinking of moving to a different technology, but one that also subscribes to this way of working with components, like the aforementioned React or [Polymer](https://www.polymer-project.org/1.0/).

## Writing a Component

So, coming back to what Components actually *are* in an Angular 1 app, it's best illustrated by comparison to a Directive. The following two code blocks show the definitions for a Component and a Directive respectively; which are basically equivalent.

```javascript
/*
 * bar.component.js
 * Usage: <foo-bar/>
 */

const definition = {
    templateUrl: "foo/bar/bar.html",
    bindings: {
        items: "<",
        translations: "@",
        onModify: "&"
    },
    controller: Ctrl
};

angular.module("foo").component("fooBar", definition); 
```

```javascript
/*
 * bar.directive.js
 * Usage: <foo-bar/>
 */
 
function definition() {
    return {
        restrict: "E",
        templateUrl: "foo/bar/bar.html",
        scope: {
            items: "<",
            translations: "@",
            onModify: "&"
        },
        controller: Ctrl,
        controllerAs: "$ctrl",
        bindToController: true
    };
}

angular.module("foo").directive("fooBar", definition);
```

### Format

You'll notice that when declaring a Component, we are passing in a definition object, rather than a function that returns one. I wouldn't give this a second thought --- whilst you could inject dependencies into a directive function, this sort of becomes moot with components, as we'll see.

### Element only

There's no `restrict`; Components cannot be invoked by attributes or classes, *only by elements*. Also, there's no `replace` option either - the "selector" element (i.e. `<foo-bar/>` in our example above) is the root element, and anything in the component's template goes inside it[^2].

[^2]: I *really* didn't like this at first, because it can make life harder when writing CSS for these apps, especially when you want to stick to [only using classes](http://cssguidelin.es/#reusability) as styling hooks. However, it makes more sense in the Web Components world, and there are [well-known issues](https://github.com/angular/angular.js/issues/7636#issuecomment-50142079) with `replace`.

### Isolate scope

There are no options for `scope` - you automatically get an isolate scope, and you can bind your `bindings` to it much like you can on a Directive. This is a clear message from Angular; inherited scopes (ala `scope: false`) are done and you need to stop using them.

### Controller only

If you were wondering about there just being a controller: no, there are no `compile` or `link` functions available in Components, which means direct manipulation of the DOM is off the table. Now, you're likely to need to do *some* DOM work at some point, so how does this fit in? Well, according to Angular, *attribute* Directives are still going to be a thing going forward, so the answer is to use one of those.

To elaborate, I think the best advice for doing that is to use an attribute directive within your component, access the same scope (e.g. `scope: true`), place it exactly where it needs to be and do the simplest link function you can get away with - keeping as much of the logic as possible still within your component code.

### One-way binding

Anyone who's used Angular will know about two-way data binding. This was one of the most touted features of the framework in its early days - how you could just pop `ng-model="foo"` on an input and thereafter the model and view would magically stay in sync without any further intervention from you.

Since then, the prevailing wisdom has changed to the model that React espouses: State should flow one way (downwards), and events flow back upwards to the source, so you know there is only one place your data is actually being changed from.

Along with Components, Angular 1.5 introduced the `<` type for binding to isolate scopes, as a "one-way" alternative to the familiar `=` type for two-way bindings. This all makes sense in the greater context of wanting to allow developers to write Components in the right way, but it feels almost half-hearted in how it's done. For example, if it's an Array or Object that you bind with `<`, it's just the reference that is one-way bound, so you can still mutate its items or properties and the changes will make their way upwards. This is likely a technical limitation as much as anything else, but it feels like there could have been more done to mitigate it, like a version of ng-model that doesn't apply user changes to the model but still triggers an ng-change. Anyway, I digress.

## A More Modern Controller

Writing Angular 1 code in the way it was envisaged, you tend to end up with a lot of functions - functions for controllers, for directives, for compile and link hooks.

But modern JavaScript has [classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), and the modern frameworks are making good use of them. Opinion was rather divided on classes when they were first specced - the against argument being that they aren't really classes, just prototypes with syntacic sugar - but I'm a fan myself and relished the chance to use them with Angular for components.[^3]

[^3]: Given the current state of browser support for classes (and other ES2015 features), this means you'll need to add [Babel](https://babeljs.io/) to your setup if it's not there already. If you don't have much of a build process in place now, this is as good a start as any.

Here's what a modern controller looks like:


```javascript
class Ctrl {
    constructor($stateParams, fooService) {
        "ngInject";
        this.$stateParams = $stateParams;
        this.fooService = fooService;
    }

    $onInit() {
        this.fooService.loadFoo(this.$stateParams.fooId).then(data => {
            this.data = data;
        });
    }

    save() {
        fooService.saveFoo(this.data);
    }
}
```

The first thing to notice is that we use the `constructor` to do our dependency injection, and that we map the dependencies onto own properties of the class (via `this`). There's also the `"ngInject"` annotation which triggers the [angularjs-annotate Babel plugin](https://www.npmjs.com/package/babel-plugin-angularjs-annotate) to decorate it with the `$inject` array for [strict dependency injection](https://docs.angularjs.org/guide/di#using-strict-dependency-injection). If you've ever used Spring services with autowired constructors, you'll feel right at home here.

One other nice thing we have since Angular 1.6 is the `$onInit` lifecycle method --- this is where we can start doing things with our component, like an initial request for data from the server, safe in the knowledge the template has been compiled and any bindings have been bound. It's a lot like `componentDidMount` in React or `postCreate` in Dojo.

You won't see it here, but any bindings we defined on the component will come in as properties, thus accessible via `this` like everything else. Properties and methods on the controller are referenced from the template with `$ctrl`, so expressions like `{% raw %}{{{% endraw %} $ctrl.data.bar {% raw %}}}{% endraw %}` or `{% raw %}{{{% endraw %} $ctrl.save() {% raw %}}}{% endraw %}` would be applicable for our example above.

## Testing a Component

You might be familiar with [unit testing a directive](https://docs.angularjs.org/guide/unit-testing#testing-directives) in Angular, where you compile the directive and get a handle on the resultant element[^4], then make assertions about what's in it and how it behaves. This is a great way to test, and works just the same for components.

[^4]: Or, more accurately, the jQuery wrapper around the element - this makes it really nice to write concise tests

What that documentation doesn't cover is how to stub components. The central idea of unit testing is that you are only testing the logic in your particular unit of code - anything outside the unit is out of scope, and therefore we would often want to [stub or mock](https://martinfowler.com/articles/mocksArentStubs.html) those outside parts to keep our test as pure as possible. This principle applies just as well to Components - if we have Component A which does some of its own stuff and also uses Component B within, then Component A's tests should only be concerned with its own functionality, including how it interacts with Component B, but without having to factor in Component B's full complexity - particularly if it's going to start making Ajax requests and emitting events or whatever else.
 
Stubbing components is possible in Angular, although it's rather ugly. Let's pretend we want to stub our component we defined earlier:

```javascript
beforeEach(module("foo", function($provide) {
    $provide.decorator("fooBarDirective", function($delegate) {
        angular.extend($delegate[0], {
            template: `<button ng-click="onModify()"></button>`,
            controller: null
        });
        return $delegate;
    });
}));
```

What we're telling Angular here is *give me a handle on the "fooBar" Component from the "foo" module so I can alter its definition*[^5]. What we then do with it is up to us, but in this case we've stripped it right back and given it just enough to be able to fire the `onModify` callback, so we can test whether our consuming Component will handle it correctly.

[^5]: No, `Directive` wasn't a typo there. That's a secret about Components in Angular 1.5 - they are just a scaled-back API on top of the same old Directives architecture. (It's also why the two examples earlier on work exactly the same - because essentially they are exactly the same).

This is, you might have noticed, a bit awkward, both to look at and to write. I certainly don't use it religiously to stub every external component being used, but I'll tend to reach for it if said external component is large, complex or does some Ajax of its own.

## Components as Routes

We've seen a pretty clear path for moving your existing Directives to Components, but there's a fair chance that you have some routes in your app that consist of a controller and a template. These are, you may have guessed, not exempt from the "Components for everything" rule. You definitely don't want them around, because they lack test coverage - even if you have diligently written unit tests for the controller's public methods, you're just assuming there are no mistakes in the template, which is quite dangerous.[^6]

[^6]: This is one of the reasons I like React's JSX so much - because the templates are JavaScript rather than strings, if you make a mistake in there (e.g. reference a property that doesn't exist)

The way out of this is to make a component out of what's there, and in your route config just define your template as simply an instance of that component:

```javascript
$stateProvider
    .state("foo", {
        url: "/foo:fooId",
        template: "<foo/>"
    });
```

If your route has a resolve function, and you are relying on the resolved value being bound to your scope, you could pass it into the component as a binding instead:[^7]

[^7]: I'm not actually a big fan of this though --- I prefer letting the component decide what it wants to load and handling any errors gracefully. Easier to test, too.

```javascript
$stateProvider
    .state("document-verification", {
        url: "/foo",
        template: "<foo locale='locale'/>",
        resolve: {
            locale: ["$http", $http => $http.get("/api/locale")]
        }
    });
```


## Planning your Move

If you've got a decent-sized Angular app that is made of controllers-with-templates and some directives, moving to this new Components architecture is going to need a strategy, not just headphones and a Saturday code freeze. If the codebase is active and changes and regularly being made, you have a good opportunity for developers to convert code to the new way as and when they touch it to make changes (and, needless to say, when they add anything new). Make that your policy, and sooner or later the old-style code will be in a small minority and you can take care of it in one fell swoop.

It helps enormously if you have some end-to-end tests, probably with Protractor, covering your app's behaviour at the highest level so you can refactor with more confidence - remember, you might be refactoring unit tests as well, so there's a chance you'll make some mistakes.

## Further Reading

- [Exploring the Angular 1.5 .component() method](https://toddmotto.com/exploring-the-angular-1-5-component-method/) by *Todd Motto*