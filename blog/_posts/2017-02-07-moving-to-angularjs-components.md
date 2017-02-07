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

Moving your application over to this kind of architecture is basically a good thing; you'll find your code nicely organised, well tested and easier to make changes to. What's more, if you want to move up to Angular 2 at some point, this is definitely a significant step in the right direction. In fact, that also applies if you're thinking of moving to a different technology, but one that also subscribes to this way of working with components, like the aforementioned React or [Polymer](https://www.polymer-project.org/1.0/).

## Writing a Component

So, coming back to what Components actually *are* in an Angular 1 app, it's best illustrated by comparison to a Directive. The following two code blocks show the definitions for a Component and a Directive respectively; they produce exactly the same behaviour in the application.

```javascript
/*
 * bar.component.js
 * Usage: <foo-bar/>
 */

function Ctrl() {
    
}

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
 
function Ctrl() {
    
}
 
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

You'll notice that when declaring a Component, we are passing in a definition object directly, rather than a function that returns one. I wouldn't give this a second thought, although you could inject dependencies via that function if you needed them for a Directive's link function - more on that later.

### Element only

There's no `restrict`; Components cannot be invoked by attributes or classes, *only by elements*. Also, there's no `replace` option either - the "selector" element (i.e. `<foo-bar/>` in our example above) is the root element, and anything in the component's template goes inside it[^2].

[^2]: I *really* didn't like this at first, because it can make life harder when writing CSS for these apps, especially when you want to stick to [only using classes](http://cssguidelin.es/#reusability) as styling hooks. However, it makes more sense in the Web Components world, and there are [well-known issues](https://github.com/angular/angular.js/issues/7636#issuecomment-50142079) with `replace`.

### Isolate scope

There are no options for `scope` - you automatically get an isolate scope, and you can bind your `bindings` to it much like you can on a Directive. This is a strong signal from Angular; inherited scopes (ala `scope: false`) are to be avoided.

The other important change to note here is that the bindings are bound to the isolate scope against a variable called `$ctrl`, rather than directly on `$scope` itself, by default. So, from your controller you'd be referencing `$scope.$ctrl.items` and in your template writing something like `<li ng-repeat="item in $ctrl.items"/>`. There's quite a smart convention - as popularised by [John Papa's style guide](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#controlleras-with-vm) - for doing `controllerAs: "vm"` instead, although I personally prefer sticking with the built-in defaults where possible, so it's `$ctrl` for me.

### Controller only

If you were wondering about there just being a controller: no, there are no `compile` or `link` functions available in Components, which means direct manipulation of the DOM is off the table. Now, you're likely to need to do *some* DOM work at some point, so how does this fit in? Well, according to Angular, *attribute* Directives are still going to be a thing going forward, so the answer is to use one of those.

To elaborate, I think the best advice for doing that is to use an attribute directive within your component, access the same scope (e.g. `scope: true`), place it exactly where it needs to be and do the simplest link function you can get away with - keeping as much of the logic as possible still within your component code.

### One-way binding

Anyone who's used Angular will know about two-way data binding. This was one of the most attractive features of the framework in its early days - how you could just pop `ng-model="foo"` on an input and thereafter the model and view would magically stay in sync without any further intervention from you.

Since then, the prevailing wisdom has changed to the model that React espouses: State should flow one way (downwards), and events flow back upwards to the source, so you know there is only one place your data is actually being changed from.

Along with Components, Angular 1.5 introduced the `<` type for binding to isolate scopes, as a "one-way" alternative to the familiar `=` type for two-way bindings. This all makes sense in the greater context of wanting to allow developers to write Components in the right way, but it feels almost half-hearted in how it's done. For example, if it's an Array or Object that you bind with `<`, it's just the reference that is one-way bound, so you can still mutate its items or properties and the changes will make their way upwards. This is likely a technical limitation as much as anything else, but it feels like there could have been more done to mitigate it, like a version of ng-model that doesn't apply user changes to the model but still triggers an ng-change. Anyway, I digress.

## Testing a Component

You might be familiar with [unit testing a directive](https://docs.angularjs.org/guide/unit-testing#testing-directives) in Angular, where you compile the directive and get a handle on the resultant element[^3], then make assertions about what's in it and how it behaves. This is a great way to test, and works just the same for components.

[^3]: Or, more accurately, the jQuery wrapper around the element - this makes it really nice to write concise tests

What that documentation doesn't cover is how to stub components. The idea of unit testing is that you are only testing the logic in your particular unit of code - anything outside the unit is out of scope, and therefore we would often want to [stub or mock](https://martinfowler.com/articles/mocksArentStubs.html) those outside parts to keep our test as pure as possible. This principle applies just as well to Components - if we have Component A which does some of its own stuff and also uses Component B within, then Component A's tests should only be concerned with its own functionality, including how it interacts with Component B, but without having to factor in Component B's full complexity - particularly if it's going to start making Ajax requests and emitting events or whatever else.
 
Stubbing components is possible in Angular, although it's rather ugly. Let's pretend we want to stub our component we defined earlier:

```javascript
beforeEach(module("foo", function($provide) {
    $provide.decorator("fooBarDirective", function($delegate) {
        angular.extend($delegate[0], {
            templateUrl: null,
            template: `<button ng-click="onModify()"></button>`,
            controller: null
        });
        return $delegate;
    });
}));
```

What we're telling Angular here is *give me a handle on the "fooBar" Directive from the "foo" module so I can alter its definition*[^4]. What we then do with it is up to us, but in this case we've stripped it right back and given it just enough to be able to fire the `onModify` callback, so we can test whether our consuming Component will handle it correctly.

[^4]: No, "directive" wasn't a typo there. That's a secret about Components in Angular 1.5 - they are just a scaled-back API on top of the same old Directives architecture. (It's also why the two examples earlier on work exactly the same - because essentially they are exactly the same).

## Components as Routes

We've seen a pretty clear path for moving your existing Directives to Components, but there's a fair chance that you have some routes in your app that consist of a controller and a template. These are, you may have guessed, not exempt from the "Components for everything" rule. You definitely don't want them around, because they lack test coverage - even if you have diligently written unit tests for the controller, you're just assuming the template has been hooked up right, which is quite dangerous.

The way out of this is to make a component out of what's there, and in your route config just define your template as simply an instance of that component:

```javascript
$stateProvider
    .state("foo", {
        url: "/foo",
        template: "<foo/>"
    });
```

If your route has a resolve function, and you are relying on the resolved value being bound to your scope, you could pass it into the component as a binding instead:

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

If you have nested routes (as you can with UI Router), you can still place the `<ui-view/>` tag within your top-route component, and then your sub-route can follow the same pattern of using a component:

```javascript
$stateProvider
    .state("foo.bar", {
        url: "/foo/bar",
        template: "<foo-bar/>"
    });
```

(Note that the scope in which that template is compiled will inherit the scope the `<ui-view/>` tag was used in, so you have a chance to either pass in any properties you want to cascade, or else keep the scope of the sub-route's component completely isolated.)

## Planning your Move

If you've got a decent-sized Angular app that is made of controllers-with-templates and some directives, moving to this new Components architecture is going to need a strategy, rather than just headphones and a Saturday code freeze. If the codebase is active and changes and regularly being made, you have a good opportunity for developers to convert code to the new way as and when they touch it to make changes (and, needless to say, when they add anything new). Make that your policy, and sooner or later the old-style code will be in a small minority and you can take care of it in one fell swoop.

It helps enormously if you have some end-to-end tests, with Protractor or something else, covering your app's behaviour at the highest level so you can refactor with more confidence - remember you will likely be refactoring unit tests as well, so there's a chance you'll make some mistakes.

## Further Reading

- [Exploring the Angular 1.5 .component() method](https://toddmotto.com/exploring-the-angular-1-5-component-method/) by *Todd Motto*