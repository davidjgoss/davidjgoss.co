---
date: 2021-01-01
title: Adaptive headlines with CSS functions
summary: A short one about how using CSS functions like `clamp()`, `min()` and `max()` can help a design adapt without using media queries.
latest: using CSS functions for adaptive headings
---

Like many blogs, this site is basically just text, so options for making it visually interesting are mostly limited to typography. I quite like using big, bold headlines for this, and think the effect at `3.5rem` on a large display is pretty nice.

However, that aspect of the design doesn't work very well on a small display, and is just plain _bad_ when the headline is long and/or includes long words:

![Screenshots, in portrait and landscape, of an article with a long headline in an iPhone-sized viewport](/static/blog/css-min-max-before-screenshots.png)

I really want at least the first paragraph of content to be readable on a small display without having to scroll. Media queries could help, but in cases like this they're a bit of a blunt instrument. I'd need to set one or more breakpoints at which the size would increase, accounting for both width and height, and there'd still be some sizes at which it wasn't quite right.

CSS has other tools available to us in the form of [functions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions), where we can compute values based on various other values, including the current font size and the viewport width and height.

After some experimentation, here's what I have now:

```css
h1 {
	font-size: 2rem;
	font-size: clamp(2rem, min(10vw, 10vh), 3.5rem);
	line-height: 1em;
}
```

The `2rem` declaration is in as a safe fallback for older browsers; if the syntax of the next declaration isn't recognised, it'll be ignored and the `2rem` will stand.

The next declaration using a combination of [`clamp()`](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp()) and [`min()`](https://developer.mozilla.org/en-US/docs/Web/CSS/min()) breaks down like this:

> Use whichever is the smaller of 10% of the viewport width or 10% of the viewport height[^vwvhwhy], but prevent it from being any smaller than 2x the root font size or any larger than 3.5x the root font size.

[^vwvhwhy]: The 10% number just came out of trial and error.

Finally, a `line-height` of `1em` provides an appropriate leading based on the computed font size.

- - -

`clamp()`, `min()` and other similar functions are things you can't do at build time with preprocessors, because the values are evaluated at runtime.

My example isn't anything special, but I think the ability to nest functions, as well as their support for mixing units as I have done here, makes them very powerful for achieving precision in contexts that are both complex and dynamic, and adaptiveness in ways that aren't tied to specific pixel breakpoints. This is especially true of [`calc()`](https://developer.mozilla.org/en-US/docs/Web/CSS/calc()), which (as I sometimes forget) is supported all the way back to Internet Explorer 9.

Stray observations:

- As you might expect, we have [`max()`](https://developer.mozilla.org/en-US/docs/Web/CSS/max()) to go with `min()`
- Though most examples show them used with two values, `min()` and `max()` can take as many different values as you'd like
- Take care with `vh`; things like the disappearing browser chrome on iOS Safari can make it behave in unexpected ways, so I tend to avoid it for layout - but it's great for things like this