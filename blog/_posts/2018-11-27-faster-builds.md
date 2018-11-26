---
title: In Search of Faster Maven Builds
tags:
- java
- maven
- performance
- ci
summary:
  TBA
latest:
  faster Maven builds
---

A while ago, me and a couple of colleagues set about trying to make the CI build faster for our main Maven project. Since then, we have found a lot of interesting things you can do that won't make any difference to the build time, and a handful that will. Along the way, it's turned into an unhealthy obsession for all of us. But why did we get so worked up about how much time the build takes anyway?

When someone has pushed the last commit to their pull request, they want to see that successful build so they can merge it and move on. The longer the build takes, the more productivity they'll lose, context-switching as they try to stay busy - we want a fast feedback loop. Also, a slower build means more time before you can ship to production - including when you need to deploy a fix for a critical issue. If you're serious about anything like continuous deployment, your build _needs_ to be fast.

In a less direct way, continually pushing to keep your builds fast is good for the health of your codebase. You'll find and address numerous bugs, inefficiencies and defunct code, and most improvements you make will help developers working locally as well as the CI pipeline.

## Measure

There are a lot of different things we can look at doing, and it's tempting to just dive right in, but first we need to stop and decide how we're going to measure results. Remember a minute ago when I said we found a lot of ways to break the build and make it slower? I wasn't joking; I'd say at least every other thing we tried either didn't help or made it worse. If you rush around doing everything all in one go, you won't know what worked and what didn't.

Having created a feature branch in your project, ideally you'd want to pick a CI server and isolate it, so the only thing it's going to do today is run your feature branch. After each change you can then run the build a few times and take the average as your measurement. It's still not exactly scientific, especially if the CI servers are virtualised, but it should be good enough to sort the winners from the losers.


Let's take a look at the Maven command that's likely running for your builds[^1]:

```
mvn clean verify
```

[^1]: The gaol would be `verify` for a feature branch build, but would be `deploy` when building a snapshot or release from master - the rest applies either way. Also, what a CI tool like Jenkins or TeamCity _actually_ runs will look very different to this, particularly where the `mvn` part is concerned, but nevertheless it should let you configure goals and options, even if it does add some bits and pieces of its own.

This seems fine - it is basically what you would run locally. But we can do better.

```
mvn verify -T 1C
```

Maven's `clean` is not particularly efficient, your CI tool should already be cleaning the working directory for you either right before the build or earlier during idle time, and will probably do it quicker and better than Maven.

The `-T` argument is an alias for `--threads`, Maven's much underpublicised option for building reactor modules in parallel. As you'd hope, it's smart enough to work out the inter-dependencies of your modules and parallelise as much as possible without starting a module before other ones it depends on have finished. It will use up to the specified number of threads; the default is 1, meaning builds are entirely serial unless you specify otherwise.

With `-T 1C`, we're telling Maven to use one thread per available CPU core. This seems to be the best balance; every time I've tried to use more than this, it's performed the same or worse, presumably as too many different threads compete for finite resources.

The vast majority of Maven plugins support running in this multi-threaded mode, including all the first-party ones. If you're not already doing it, it's probably the single biggest gain you can make - it instantly reduced our build time by 75% when we first added it.

Trying to make the build faster can be a very frustrating endeavour. More than once I have spent the morning making a change I was absolutely certain would gain significant time, only for it to make it slightly worse. If you're ever feeling a little sad about not having sub-5 minute builds, spare a thought for the people working at Oracle, where [according to one HN thread](https://news.ycombinator.com/item?id=18442941) the feedback loop is 20-30 hours.