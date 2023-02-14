# Conventions

How should I name it? What should I name it? Where should I put it?

All the questions and more are answered here!


# Branches

A branch should have two parts, the "type" and the context. The type can be something like "feature" or "fix", and the context simply explains what you accomplished in that branch. For instance, lets say you have a PR where you implemented password hashing and storing in the database, you should name your branch something like: `feature/password-hashing`. Another example is a PR for fixing a bug with the profile biography not being scrollable: `fix/biography-scroll-bug`.

Implicit spaces in branch names should always be separated by a dash `-`.

## PR Merges

For PR merging, you should always squash commits, meaning that all the commits you have done under a single PR branch will be turned into one commit with a much more succinct name, making things much cleaner. We also want to discard previous commit messages into one, we will use `fixup` instead of `squash` for this reason. To do this is with interactive rebase is quite simple, you simply have to know how many commits you made in the branch so far (in this example we will use 3):

```
git rebase -i HEAD~3
```
Edit the new screen to look like this:
```
pick 123 Latest commit
pick 321 The one before that commit
pick 111 First commit

->

pick 123 Latest commit
fixup 321 The one before that commit
fixup 111 First commit
```

You will then be presented with the last screen where you can make the new commit message for the final singular commit. **You should contain the PR id in the commit message, such as: `Final commit message (#123)`**

More info here: https://www.git-tower.com/learn/git/faq/git-squash