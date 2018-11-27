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

A while ago, me and a couple of colleagues set about trying to make the CI build faster for our main Maven project. Since then, we have found a lot of interesting things you can do that won't make any difference to the build time, some others that will make the build fail, and a handful that will actually speed it up. Along the way, it's turned into an unhealthy obsession for all of us. But why did we get so worked up about how much time the build takes anyway?

When someone has pushed the last commit to their pull request, they want to see that successful build so they can merge it and move on. The longer the build takes, the more productivity they'll lose, context-switching as they try to stay busy - we want a fast feedback loop. Also, a slower build means more time before you can ship to production - including when you need to deploy a fix for a critical issue. If you're serious about anything like continuous deployment, your build _needs_ to be fast.

In a less direct way, continually pushing to keep your builds fast is good for the health of your codebase. You'll find and address numerous bugs, inefficiencies and defunct code, and most improvements you make will help developers working locally as well as the CI pipeline.

## Measure

There are a lot of different things we can look at doing, and it's tempting to just dive right in, but first we need to stop and decide how we're going to measure results. Remember a minute ago when I said we found a lot of ways to break the build and make it slower? I wasn't joking; I'd say at least every other thing we tried either didn't help or made it worse. If you rush around doing everything all in one go, you won't know what worked and what didn't.

Having created a feature branch in your project, ideally you'd want to pick a CI server and isolate it, so the only thing it's going to do today is run your feature branch. After each change you can then run the build a few times and take the average as your measurement. It's still not exactly scientific, especially if the CI servers are virtualised, but it should be good enough to sort the winners from the losers.

## Quick wins on the command line

Let's take a look at the Maven command that's likely running for your builds[^1]:

```
mvn clean verify
```

[^1]: The goal would be `verify` for a feature branch build, but would be `deploy` when building a snapshot or release from master - the rest applies either way. Also, what a CI tool like Jenkins or TeamCity _actually_ runs will look very different to this, with the locations of Java, Maven etc heavily parameterised and a bunch of other parameters thrown in, but nevertheless it should let you configure goals and options, even if it does add some bits and pieces of its own.

This seems fine - it's basically what you would run locally. But we can get things moving faster from here without touching any of our code yet:

```
mvn verify -Dmaven.artifact.threads=10 -T1C
```

(There are a few changes here; whilst I'm pretty confident in all of them it's probably still best to apply and measure them one at a time to make sure.)

First, we dropped the `clean` goal. The clean plugin is not very efficient, but more to the point your CI tool should already be giving you a completely clean directory to work in, ideally cleaning it during idle time but at least right before your build starts. It will probably do it faster than the clean plugin as well.

Next, we set the `maven.artifact.threads` property to 10. This controls the number of dependencies Maven will allow itself to download in parallel, and while the default of 5 is not bad, a reasonable-sized project could probably benefit from more.

The last and most interesting is the `-T` argument, which is an alias for `--threads`, Maven's under-publicised option for building reactor modules in parallel. As you'd hope, it's smart enough to work out the inter-dependencies of your modules and parallelise as much as possible without ever starting a module before other ones it depends on have finished. It will use up to the specified number of threads; the default is 1, meaning modules are built entirely in serial unless you specify otherwise.

With `-T1C`, we're telling Maven to use one thread per available CPU core. This seems to be the best balance; every time I've tried to use more than this, it's performed the same or worse, presumably as too many different threads compete for finite resources.

The vast majority of Maven plugins support running in this multi-threaded mode, including all the first-party ones. If you're not already doing it, it's almost certainly the single biggest gain you can make; your mileage may vary, but an instant 80% improvement is not unrealistic for a project with a dozen or more modules.

## Maven modules and dependencies

If you have a lot of Maven modules in your project (like, 30+), it's worth giving them an audit to see if the structure has some inefficiency. Each module in Maven has an inherent cost: resolving dependencies, building artifacts etc. If you have any modules that are doing comparatively little (i.e. they just contain a handful of classes) then you might have a chance to fold that module into another one and save some time. Bear in mind that, taken too far, this risks negating the benefits of multi-threaded mode.

Another thing worth auditing is the dependencies in your `pom.xml` files. Dependencies are very easy to add and use, but tend to get left in even when the code has changed and no longer relies on that dependency. This can cause unused dependencies to mount up and waste time in our build. You can use [`maven-dependency-plugin:analyze`](https://maven.apache.org/plugins/maven-dependency-plugin/analyze-mojo.html) to identify unused dependencies and remove them.

## Unit tests

Unit tests written with JUnit and Mockito will run very fast in Maven, but we should still configure the [Surefire plugin](https://maven.apache.org/surefire/maven-surefire-plugin/) right to extract the best performance:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    ...
    <configuration>
        <parallel>all</parallel>
        <threadCount>2</threadCount>
        <perCoreThreadCount>true</perCoreThreadCount>
    </configuration>
</plugin>
```

This tells Maven to spin up multiple threads to run tests within the same module. If you have many hundreds or even over a thousand tests in one module, you'll probably see a saving.

## Integration tests

This is where things get tougher. "Integration tests" has a bit of a broad definition these days, but for the sake of argument let's say we mean stuff that runs at the `integration-test` phase in the Maven lifecycle, using [Spring test](https://docs.spring.io/spring/docs/current/spring-framework-reference/testing.html#integration-testing) to bring up an application context against a database and test the app via its entry points.

Naturally, being [higher in the pyramid](https://martinfowler.com/articles/practical-test-pyramid.html), these tests are going to take a _lot_ longer to run than unit tests. As ever, parallelisation is the key to gaining time, but with the nature of this kind of testing we are more likely to run into problems; for example, any thread safety issues in your application will be brutally exposed.

By the way, our Surefire configuration looks a bit different in our integration test module:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    ...
    <configuration>
        <parallel>classes</parallel>
        <threadCount>2</threadCount>
        <perCoreThreadCount>true</perCoreThreadCount>
        <trimStackTrace>false</trimStackTrace>
    </configuration>
</plugin>
```

Notice that in our `parallel` property, we have "classes" instead of "all" - this means Maven will use multiple threads to run tests, but will only parallelise down to class level, so every test method in a given class will run one at a time on the same thread. This is certainly not ideal, but parallelisation down to method level [simply didn't work](https://stackoverflow.com/questions/26882936/why-does-springjunit4classrunner-not-work-with-surefire-parallel-methods) with Spring test, as we found to our cost[^2].

[^2]: In theory it's now [possible using the latest versions](https://jira.spring.io/browse/SPR-5863) of Spring and JUnit, though we haven't been able to test it yet.

You can do things to work around this limitation; if you have an expensive setup operation ("calculate a quote", "create a document" etc), the result of which is asserted on by multiple methods that don't change any state themselves, you may be able to refactor to do that expensive operation fewer times whist maintaining the same coverage.

Ultimately, of course, the tests are only ever going to be as fast as your app lets them be. Running [JProfiler](https://www.ej-technologies.com/products/jprofiler/overview.html) or something similar against your tests to find hotspots will help your users just as much as your build times, and is something you should go back to on a regular basis, even if you're "happy" with how fast your build is.

## Some perspective

Trying to make the build faster can be a very frustrating endeavour. More than once I have spent the morning making a change I was 100% certain would gain significant time, only for it to make no difference.

But everything's relative; if you're ever feeling a little sad about not having sub-3 minute builds, spare a thought for the people working at Oracle, where [according to this Hacker News thread](https://news.ycombinator.com/item?id=18442941) the feedback loop is some 30 hours.