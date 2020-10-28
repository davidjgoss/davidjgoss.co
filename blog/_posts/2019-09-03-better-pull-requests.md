---
title: Better Pull Requests
summary:
  I spend a lot of my time at work on pull requests - between ones I request and review, dozens per day. Through this, I've formed some opinions about what works and what doesn't in the pull request process.
latest:
  better pull requests
---

*I spend a lot of my time at work on pull requests - between ones I request and review, dozens per day. Through this, I've formed some opinions about what works and what doesn't in the pull request process.*

- - - 
    
## Be a good requester

*TLDR: Make it easy for reviewers.*

As the person creating a pull request, you're going to be asking reviewers for some of their time and attention; both are finite, so do what you can to make it easy for them. It'll help you get this change in faster and, if you keep it up, might earn you a reputation in your company as someone who does good work and is thoughtful.

### Keep it small (if you can)

Small, focused pull requests from [short-lived feature branches](https://trunkbaseddevelopment.com/short-lived-feature-branches/) have the easiest time getting merged. They are:

- Quicker and more digestible (and reviewers are less likely to bail)
- Less likely to need lengthy rework if you've taken a wrong turn
- Less likely to get conflicted with the main branch and need manual resolution

In reality you'll sometimes need to do a large change that takes several days or even weeks to finish, but that doesn't mean you should sit on one branch for that time and raise a "big bang" pull request at the end. Instead, find ways to split it up into smaller changes that can be done incrementally without breaking anything.

For example, you might be doing some [preparatory refactoring](https://martinfowler.com/articles/preparatory-refactoring-example.html) to lay the groundwork for your new functionality, or bolstering test coverage of existing behaviour to give you the confidence to start making changes. Both are good candidates for a pull request in their own right.

Once you get into actually adding your new functionality, keep to this mantra of small and incremental changes. Try working from the outside in --- starting with the UI or the API entry point, stubbing the next layer in as you go, and using feature flags to keep it hidden until it's ready. As well as preventing you from drifting off the mainline and/or doing too-big pull requests, this approach gives you a chance to tag expert reviewers when working in their area, without dragging in too many people at a time.

### Tell the story with your commits (sometimes)

If you _do_ end up with a big pull request --- e.g. dozens of files and hundreds of lines affected --- reviewers could have a hard time getting a sense of what your change is really about, where the important bits are, etc. Trawling through a huge diff looking for the big picture is no fun, and your reviewers didn't sign up for it.

This is where your commits[^onlygit] can be really helpful and tell a lot of the story for you. However, this does depend on having a sequence of commits that form a coherent narrative. This sounds like a lot of effort, but you don't have to obsess about as you go along; it's a by-product of committing frequently.

[^onlygit]: When I talk about commits, I am really only talking about Git; if you are using something else, I honestly don't know what to tell you.

By frequently, I don't mean daily or hourly, I mean with _every change_ you make, in a tight loop of "compile, test, commit"[^compiletestcommit]. By the time you're ready to open your pull request, you'll have a list of commits that is probably too granular and a bit messy, but you can use [interactive rebase](https://tgvashworth.com/2014/02/24/rebase-you-interactively-for-great-good.html) to clean up and consolidate[^moarrebase] into something that's useful for a reviewer to follow.

[^compiletestcommit]: There are [variations](https://medium.com/@kentbeck_7670/test-commit-revert-870bbd756864), but you get the idea.

[^moarrebase]: That post by Tom Ashworth includes a great tutorial of using interactive rebase to edit each commit in detail, but mostly I find that a mixture of `fixup` and `reword` is enough to get my commits in shape for review.

### Housekeeping

Away from the actual code, there are a few things you can do to make sure your pull request is approachable.

Don't leave the description blank. Use it to clearly outline:

- The reason for the changes
- What they consist of at a high level
- What behaviour they produce

This should give reviewers some good context for what they're about to see, and save them having to go off and read issue descriptions or acceptance criteria. If the changes have a non-trivial UI impact, think about adding a couple of screenshots.

If you can predict any queries that reviewers might have, try to address them pre-emptively by adding comments yourself, inline with the code. You can call out mitigating factors and/or other approaches that were considered and discarded.

Finally, spend five minutes looking over the pull request yourself before you add any reviewers; you'll be amazed how often you find typos, commented-out code you forgot to delete, defunct tests etc. This will save your reviewers time and might save you some embarassment.

### Choice of reviewers

Pull requests are a really good opportunity for people to learn[^notjustagate], so it's a bit of a waste if each developer in a team just tags the lead for review. I usually tag everyone in the team who's at work that day, perhaps sparing anyone who is super-focused on something and/or on a deadline. I don't expect _everyone_ will review or provide feedback, but at least everyone gets a chance to see what's going on.

[^notjustagate]: Just one of several good side effects of having more sets of eyes on a piece of work, beyond just making sure it's "good enough". It's why when I see hot takes about code review just slowing people down, I can't help but think they're missing the point.

Also, think about people outside the immediate team: is there someone who has worked in this area a lot and could give some valuable feedback, or someone who's expressed an interest in a tool or technique you've used and might like to see what you've done?

If there's one person whose approval you _really_ want before you're happy to merge, make sure you tell them, so they can avoid being an unwitting blocker.

- - - 

## Be a good reviewer

*TLDR: Be nice.*

### Manage expectations

There will be times when you aren't going to review a pull request you've been tagged on. It might be that you're too busy to give it the proper attention in a timely manner, or that you don't feel you're best-placed to give a meaningful review, given your skills/knowledge etc. Either way, say so to the requester (either in the comments or privately, as you see fit) and nominate one or two other people to review instead.

### Critique with care

Coming into a code review, resist the urge to go straight in and start commenting on stuff that jumps out at you. Instead, do a quick pass over the whole pull request --- the answers to your questions might be in there, if you take a minute to look.

When you do come to leave some critical feedback, think carefully about what to say and how. As with most communication that isn't face-to-face, it's easy to come across like a jerk even if you don't mean to[^tone], so it's worth going out of your way to be cordial and constructive. When you've spotted a problem, consider putting to the requester as a question, like "Not sure, but this looks to me like it will break if the second argument is null, could you add a test to check?", or "This might read better using a stream, what do you think?".

[^tone]: And remember, other people are watching - you are setting the tone.

Many comments or suggestions you add will be subjective to some degree, so it's good to provide information that supports your point of view. For example, if you're pointing out that some internal standard or convention is being broken, link to where the standards are documented, and to a conforming example elsewhere in the codebase. If you are suggesting a different tool or technique for something, link to an article that explains it.

Also, don't forget about positive feedback. Yes, the main purpose of the review is to address any shortcomings before merging, but it's also a chance for you to call out any good stuff you see. The odd "This is a nice pattern, would like to see more of it" won't do any harm, and might provide a bit of balance if you have left some more critical feedback elsewhere.

### Automate

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">@ programmers: do any of you actually enjoy manually reminding your coworkers about manual styling issues everyday?</p>&mdash; lynn (they) (@lynncyrin) <a href="https://twitter.com/lynncyrin/status/1293981514644910081?ref_src=twsrc%5Etfw">August 13, 2020</a></blockquote>

If you find yourself leaving comments on pull requests about code style (indents, spacing, etc), something is wrong. Tools like [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) were built to do exactly this sort of thing, so get going with one now if you haven't already. Being told your code doesn't look right hurts your feelings; better that it comes from a robot than a person.

Aside from stylistic stuff, if you find yourself repeatedly picking up on the same pitfall or anti-pattern in code reviews, look into whether you can automate that too; many lint tools provide a way to [write custom rules](https://whiteclarkegroup.github.io/liquibase-linter/docs/custom-rules).

- - -

That's it. Hopefully, you've gotten the sense that what's good practise for smooth pull requests is also good practise for software in general, and that time taken to get them right is time well spent.

Further reading:

- [_Code Reviews at Medium_](https://medium.engineering/code-reviews-at-medium-bed2c0dce13a) by Christine Donovan
