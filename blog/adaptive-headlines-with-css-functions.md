---
date: 2021-01-01
title: Adaptive headlines with CSS functions
summary: A short one about how using CSS functions like `min()` and `max()` can help a design adapt without using media queries.
latest: CSS `min()` and `max()` functions
---

Like many blogs, this site is basically just text, so options for making it visually interesting are mostly limited to typography. I quite like using big, bold headlines for this, and think the effect at `3.5rem` on a large display is pretty nice.

However, that aspect of the design doesn't work very well on a small display, and is just plain _bad_ when the headline is long and/or includes long words:

![Screenshots, in portrait and landscape, of an article with a long headline in an iPhone-sized viewport](/static/blog/css-min-max-before-screenshots.png)

I really want at least the first paragraph of content to be readable on a small display without having to scroll. Media queries could help with this, but I'd need to set one or more breakpoints at which the size would increase, accounting for both width and height.

Instead, I've gone with a leaner solution that makes use of CSS's [`min()`](https://developer.mozilla.org/en-US/docs/Web/CSS/min()) and [`max()`](https://developer.mozilla.org/en-US/docs/Web/CSS/max()) functions:

```css
h1 {
	font-size: 2rem;
	font-size: max(2rem, min(10vw, 10vh, 3.5rem));
	line-height: 1em;
}
```

The `2rem` declaration is in as a safe fallback for older browsers; if the syntax of the next declaration isn't recognised, it'll be ignored and the `2rem` will stand.

The next declaration breaks down like this:

- Whichever is the largest of
    - 2x the root font size
    - Whichever is the smallest of
        - 10% of the viewport width
        - 10% of the viewport height
        - 3.5x the root font size

In other words, the size is allowed to grow between 2x and 3.5x the root font size, but is constrained from getting too large in relation to the size of the viewport[^vwvhwhy] in both dimensions.

[^vwvhwhy]: The 10% number just came out of trial and error.

Finally, a `line-height` of `1em` provides an appropriate leading based on the computed font size.

- - -

`min()` and `max()`, and other similar [functions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions), are things you can't do at build time with preprocessors, because the values are evaluated at runtime.

My example isn't anything special, but I think the ability to nest functions, as well as their support for mixing units as I have done here, makes them very powerful for achieving precision in contexts that are both complex and dynamic, and adaptiveness in ways that aren't tied to specific pixel breakpoints. This is especially true of [`calc()`](https://developer.mozilla.org/en-US/docs/Web/CSS/calc()), which (as I sometimes forget) is supported all the way back to Internet Explorer 9.
