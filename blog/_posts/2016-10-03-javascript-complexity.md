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

It was, as they say, a bit of an eye-opener, and as a custodian of that particular front-end codebase I felt an obligation to make it better for next time. So, here are my ideas:

## Provide a simple developer CLI

Newcomers don't need to know right away (it might be quite a while before they care) which particular tools you're using for task running, transpiling, linting, testing, bundling etc. and how they all work together. [npm scripts](https://docs.npmjs.com/misc/scripts) can help with this. I find their value is in abtracting your "developer CLI" away from the many individual tools it uses, and removing the requirement to have anyone working on the project install a bunch of dependencies globally.

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

## Write Documentation

- Which versions of Node and npm are safe to use?
- What if I have problems installing?
- Why does the watch fail sometimes?
- How can I best set my editor/IDE up for this project?

Have all these questions (and more) answered, and not on some distant wiki that no one thinks to check --- put your documentation in the source (in Markdown format, of course), and keep it updated. People say documentation just sits there getting out of date, but only if it's no one's job to update it. If it's no one's job right now, make it yours.

As well as having the developer CLI documented, you should have a style guide --- not just for how you write JavaScript, but for how you use the framework you're using and how the project is structured. Good developers can come to a project, look at existing code and quickly figure out how to do what they want to do, but this is much harder if every example they look at is done differently.

## Remove complexity

Go back over your tooling choices periodically, looking at each one. Do we need this? Is the tool providing enough benefit when weighed against its costs? Could this problem be solved more simply?

## Final thought

I was surprised to see the point of the original post sail over so many people's heads. Some people got pretty defensive and angry; several rants consisting of far too many tweets were posted. The post was written very tongue-in-cheek, but it does convey a real issue and the JavaScript space doesn't make itself look too clever by refusing to acknowledge it properly.

(In amongst the outranged responses, [Addy Osmani's](https://medium.com/@addyosmani/totally-get-your-frustration-ea11adf237e3) was refreshingly measured and helpful.)