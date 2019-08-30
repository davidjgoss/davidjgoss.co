---
title: Better Pull Requests
tags:
- code-review
- work

summary:
  I spend a lot of my time at work on pull requests - between ones I request and review, dozens per day. Through this, I've formed some opinions about what works and what doesn't in the pull request process. So, here are those opinions.
latest:
  better pull requests
---

*I spend a lot of my time at work on pull requests - between ones I request and review, dozens per day. Through this, I've formed some opinions about what works and what doesn't[^preach] in the pull request process. So, here are those opinions.*

(I'd note that it's coming from a perspective of pull requests inside a software company --- though much of it is also applicable to contributing to open source projects.)

[^preach]: To my colleagues: yes, yes --- I don't practise what I preach _all_ of the time. But then, you knew that.

- - - 
    
## Be a good requester

*TLDR: Make it easy for reviewers.*

As the person creating a pull request, you are going to be asking reviewers for some of their time and attention; both are finite and precious, so do what you can to make it as easy as possible for them. As well as helping you get this particular pull request merged sooner, if you keep it up it will earn you a reputation in your company as someone who does good work and is thoughtful.

### Keep it small, if you can

Small, focused pull requests from [short-lived feature branches](https://trunkbaseddevelopment.com/short-lived-feature-branches/) will have the easiest time getting merged. They are:

- Quicker and more digestible to review (and reviewers are less likely to bail altogether)
- Less likely to need lengthy rework if you've taken a wrong turn
- Less likely to get conflicted with the main branch and need manual resolution

Of course, in reality you'll often need to do a large change that takes several days or even weeks to finish, but that doesn't mean you should sit on one branch for that time and raise a "big bang" pull request at the end of it. Instead, find ways to split it up into smaller changes that can be done incrementally without breaking anything.

For example, early on, you might be doing some [preparatory refactoring](https://martinfowler.com/articles/preparatory-refactoring-example.html) to lay the groundwork for your new functionality. Or, you might be bolstering test coverage of existing behaviour to give you the confidence to start making changes. Both of these are perfect for a pull request in their own right.

Once you get into actually adding your new functionality, keep to this mantra of small and incremental changes. Try working from the outside in --- starting with the UI or the API entry point, stubbing the next layer in as you go, and using feature flags to keep it hidden until it's ready. As well as preventing you from drifting off the mainline and/or doing too-big pull requests, this approach gives you a chance to tag expert reviewers when working in their area, without dragging in too many people at a time.

### Tell the story with your commits

If you _do_ end up with a fairly big pull request, with dozens of files and hundreds of lines affected, it will be difficult for the average reviewer to build a complete picture in their mind of what your change means and how it all fits together. Figuring this out from the overall diff is a piece of detective work for which your reviewer did not sign up, and will not thank you.

This is where your commits[^onlygit] can be really helpful and tell a lot of the story for you. However, this does depend on having a sequence of commits that form a coherent narrative, which is something you have be quite deliberate about.

[^onlygit]: When I talk about commits, I am really only talking about Git; if you are using something else, I honestly don't know what to tell you.

If you're not already, get into the habit of committing little and often --- not daily or hourly, but with _every change_ you make, in a tight loop of "compile, test, commit"[^compiletestcommit]. By the time you're ready to open your pull request, you'll have a list of commits that is probably too granular and a bit messy, but you can use the amazing [interactive rebase](https://tgvashworth.com/2014/02/24/rebase-you-interactively-for-great-good.html) to clean up and consolidate[^moarrebase] into something that's useful for a reviewer to follow.

[^compiletestcommit]: There are [variations](https://medium.com/@kentbeck_7670/test-commit-revert-870bbd756864), but you get the idea.

[^moarrebase]: That post by Tom Ashworth includes a great tutorial of using interactive rebase to edit each commit in detail, but most of the time I find that a mixture of `fixup` and `reword` is sufficient to get my commits in good enough shape for review.

### Housekeeping

Away from the actual code, there is some work you should to in order to make your pull request approachable.

Don't leave the description blank. Use it to clearly outline:

- The reason for the changes
- What they consist of at a high level
- What behaviour they produce

This should give reviewers some good context for what they're about to see, and save them having to go off and read issue descriptions or acceptance criteria. If the changes have a non-trivial UI impact, think about adding a couple of screenshots.

If you can envisage any queries or concerns that reviewers might have[^burnett], try to address these pre-emptively by adding comments yourself upfront, inline with the code. You can highlight any mitigating factors, and call out other approaches that were considered and discarded.

[^burnett]: Every company has a "pretty sure you could just do this with a regex" guy who they can always see coming.

Finally, spend five minutes reviewing the pull request yourself before you add any reviewers; you'll be amazed how often you find typos, commented-out code you forgot to delete, defunct tests etc. This will save your reviewers time and potentially save you some embarassment.

### Choice of reviewers

Pull requests are a really good opportunity for people to learn, so it's disappointing to still see scrum teams where each developer just tags the tech lead for review on all their changes. I usually tag everyone in the team who's at work that day, perhaps sparing anyone who is super-focused on something and/or on a deadline. I don't expect _everyone_ will review or provide feedback, but at least everyone gets a chance to see what's going on.

You should also think about people outside the immediate team: is there someone who has worked in this area a lot and could give some valuable feedback, or someone who's expressed an interest in a tool or technique you've used?

If there's one person whose approval you really want before you're happy to merge, make sure you tell them, so they can avoid being an unwitting blocker.

- - - 

## Be a good reviewer

*TLDR: Be nice.*

### Manage expectations

Consider that there will be times when you're not going to review a pull request you've been tagged on. It might be that you're too busy to give it the proper attention in a timely manner, or that you don't feel you're best-placed to give a meaningful review, given your skills/knowledge etc. Either way, say so to the requester (either in the comments or privately, as you see fit) and nominate one or two other people to review instead.

### Critique with care

As you arrive on a pull request, resist the urge to go straight in and start commenting on stuff that jumps out at you. Instead, do a quick pass over the whole pull request --- the answers to many of your queries will be in there, if you take a minute to look.

When you do come to leave some critical feedback, think carefully about what to say and how. As with most communication that isn't face-to-face, it's very easy to come across like a jerk even if you don't mean to, so it's worth going out of your way to be cordial and constructive. When you've spotted a problem, consider putting a question to the requester, like "Not sure, but this looks to me like it will break if the second argument is null, could you add a test to check?", or "This might read better using a stream, what do you think?".

Many comments or suggestions you add will be subjective to some degree, so it's good to provide information that supports your point of view. For example, if you're pointing out that some internal standard or convention is being broken, link to where the standards are documented, and to a conforming example elsewhere in the codebase. If you are suggesting a different tool or technique for something, link to an article that introduces it.

Also, don't forget about positive feedback. Granted, the primary function of the review is to address any shortcomings before merging, but it's also a chance for you to call out any good stuff you see. The odd "This is a nice pattern, would like to see more of it" won't do any harm, and might provide a bit of balance if you have left some more critical feedback elsewhere.

### Automate

If you find yourself leaving comments on pull requests about code style, something is wrong. Tools like [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) were built to do exactly this sort of thing, so get going with one now if you haven't already. Being told your code doesn't look right will hurt your feelings; better that it comes from a robot than a person.

Aside from purely stylistic concerns, if you find yourself repeatedly picking up on the same pitfall or anti-pattern in code reviews, look into whether you can automate that too; many lint tools provide a way to [write custom rules](https://whiteclarkegroup.github.io/liquibase-linter/docs/custom-rules).

- - -

That's it. Hopefully, you've gotten the sense that what's good practise for smooth pull requests is also good practise for software in general, and that time taken to get them right is time well spent.

Above all though, always assume that people are smart and well-meaning, and remember that [everybody has their reasons](http://5by5.tv/b2w/2).
