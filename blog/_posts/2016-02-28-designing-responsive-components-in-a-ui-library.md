---
title: Designing responsive components in a UI library
tags:
- css
- rwd
- design
summary:
  I've been working on a standard CSS framework and UI library at work for the past little while, and it's thrown up some tricky challenges. One of the more interesting ones has been that of how to design components to be responsive without knowing which context(s) they'll be used in.
latest:
  designing responsive components in a UI library
---

I've been working on a standard CSS framework and UI library at work for the past little while, and it's thrown up some tricky challenges. One of the more interesting ones has been that of how to design components to be responsive without knowing which context(s) they'll be used in.

Designing a UI library component in isolation is quite a fun task. I can tackle its "default" presentation first[^firstmaybe], then try some different viewport sizes and write alternate styles within media queries where the default stops looking right.

[^firstmaybe]: People often cite "mobile first" here, saying the default should be the smallest variant, but I don't necessarily agree; the default should be whatever takes the least code to write and then undo. For instance, it's *much* simpler in terms of code to style data tables in their tabular form and then use `max-width` media queries to "flatten" them to a single column than try to do it all mobile first. In <del>most</del> many cases, media queries support is now a given and you don't need to protect against its absence by doing *everything* mobile first.

~~~css
.component {
	// default presentation
}

@media (min-width:500px) {
	.component {
		// better presentation for wider viewports
	}
}

@media (min-width:800px) {
	.component {
		// even better presentation for widest viewports
	}
}
~~~

Now fast forward to a real project that uses our UI library. The layout my component is being used within has some responsive design of its own, and switches to two equal columns once the viewport is 700px wide. Suddenly, my component is being presented in a way that works in 500px or more of space, but it only has 350px to play with so the design falls down.

I've been designing and building this UI library at the same time as designing screens for a big-ish app that's going to consume it. This has been a good process --- each entity has informed and influenced the other --- and because of it, the issue of responsive variants not working presented itself pretty early on.

## Theoretical solution: Container queries

The concept of container queries, where you would be able to write alternate styles for a component based on the dimensions of *the container it's in* would solve this problem. In fact, container queries (or "element queries" as some call them) would be nothing short of revolutionary to the world of UI libraries.

In the case of our component from earlier, we could use container queries instead of media queries to wrap the alternate styles, so instead of saying "when the viewport is 500px wide or more, apply these styles", we'd be saying "when the component is in 500px of space or more, apply these styles". Something like this (beware, this syntax is speculative at best):

~~~css
.component {
	// default presentation
}

@container (min-width:500px) {
	.component {
		// better presentation for wider viewports
	}
}

@container (min-width:800px) {
	.component {
		// even better presentation for widest viewports
	}
}
~~~

Then, it wouldn't matter where in a project the component got dropped into - two columns, three columns, whatever -- it would just work. Perfect!

Unfortunately, container queries are unlikely to happen any time soon, if at all. [Tab Atkins explains it](http://www.xanthir.com/b4VG0) better than I could, but essentially there are circularity issues with no apparent way around them.

## Hacky workaround: Mixins

We can use [mixins](https://sass-lang.com/documentation/at-rules/mixin) to make the responsive variants of our components composable in projects that use them.

Obviously, I'm making a fairly large assumption at this point that any serious UI library is going to be using a CSS preprocessor like Sass. Yes, preprocessors are a double-edged sword and people can make a mess by abusing extends etc, but your UI library is important and its source should be carefully controlled, and contributions well-reviewed.

With our example component, we can pull out the container-specific styles into a couple of mixins, so the library itself is only writing out the default presentation to its own CSS, but providing the tools to apply the responsive variants as required by consuming projects[^repetition].

[^repetition]: This might raise a red flag with some people, like "If the component is being used in several different places, you'll be writing the same styles several times in the output CSS", which is factually correct but not really a problem. Firstly, as to the repetition itself, this is not something to be afraid of in the output CSS --- computers are really good at dealing with repetition! --- as long as the repetition stays *out of the source* (which is what mixins are for). Secondly, although the size of the output CSS file might grow as a result of the repetition, [Harry Roberts points out](http://csswizardry.com/2016/02/mixins-better-for-performance/) that our trusty friend gzip will mostly negate that.

In library:

~~~less
.component {
	// default presentation
}

.component-wider-presentation() {
	// better presentation for wider containers (about 500px+)
}

.component-widest-presentation() {
	// even better presentation for widest containers (about 800px+)
}
~~~

In consuming project:

~~~markup
<div class="stats-page-component component">...</div>
~~~

~~~less
.stats-page-component {
	@media (min-width:500px) and (max-width:699px), (min-width:1000px) {
		.component-wider-presentation();
	}
}
~~~

Whilst working this way will ensure your UI library doesn't ship with counter-productive responsive behaviour, it does mean that in the majority of cases things won't "just work" out of the box --- that is, you'll tend to have to use the mixins to make a component look right in your project's context, rather than just chuck it in. You could worry about whether people working on the consuming projects will get this right, but instead spend that time writing documentation so you can help them get it right.
