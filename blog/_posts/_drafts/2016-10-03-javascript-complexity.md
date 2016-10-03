---
title: Managing the complexity of JavaScript projects
tags:
- javascript
summary:
  All these JavaScript tools and frameworks are beneficial, but the sheer number of them coupled with the thunderous speed of change is making the JavaScript space look overwrought and self-indulgent. How to fix?
---

I both laughed and winced (in equal measure) my way through [Jose Aguinaga's *How it feels to learn JavaScript in 2016*](https://medium.com/@jjperezaguinaga/how-it-feels-to-learn-javascript-in-2016-d3a717dd577f) this evening. Its exaggeration makes it funny, of course, but somehow also hammers home how close to the truth it is; all these tools and frameworks are beneficial, but the sheer number of them coupled with the thunderous speed of change is making the JavaScript space look overwrought and self-indulgent.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">I just published “How it feels to learn Javascript in 2016” <a href="https://t.co/eLc8g704LQ">https://t.co/eLc8g704LQ</a></p>&mdash; Jose Aguinaga (@jjperezaguinaga) <a href="https://twitter.com/jjperezaguinaga/status/782962239468867586">October 3, 2016</a></blockquote>

While most of us can agree on that, and while it's good to have a laugh at our own expense, I feel the need to address this problem. There was a certain familiarity to the fictional dialogue in Jose's piece; twice in the past two weeks I've onboarded predominently back-end developers to a front-end project. These were smart, experienced developers, but as we went down the rabbit-hole of front-end tooling I could see almost see their thoughts turning to "Jesus, this is a lot of moving parts. Aren't we just building a few screens here? Why all this complexity?"

It was, as they say, a bit of an eye-opener, and as a custodian of that particular front-end codebase I felt an obligation to make it better. So, here's what I've come up with:

## Provide a clean, agnostic developer CLI

Newcomers don't need to know right away (and for a while they are unlikely to care) which particular tools you're using for task running, transpiling, linting, testing, bundling etc. and how they all work together. [npm scripts](https://docs.npmjs.com/misc/scripts) can help with this. They've been available for ages but have only recently earned wider attention. They enable many things, but their real value is in abtracting your "developer CLI" away from the many individual tools it uses, and removing the requirement to have devleopers install modules like `bower` and `gulp-cli` globally.

For example, you might use npm scripts to produce a developer CLI something like this:

```bash
# pull in all dependencies, both npm and bower,
# do all transpiling and copying - the project
# should be browser-ready after this
$ npm install

# check for lint and run all unit/integration/e2e tests
# if this finishes green, your changes should be okay
$ npm test

# start the local web server and launch the app in your browser
$ npm start

# watch for code changes and automatically recompile
$ npm run watch
```

Most projects shouldn't need any more than that. The fact that under the surface you are using Bower, Gulp, LESS, eslint, Jasmine, Karma, Express and whatever else doesn't need to be a thing for someone until they're ready to start digging into it. In the meantime, the only things they have to make sure they install are Node and npm.