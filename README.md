My tools for working with GitHub

Currently only one command: Open on GitHub.

Open the current file (or selected line range) on GitHub.

There are a bunch of these, but none seem to work for me,
often because they require the current branch to be tracking a remote,
when I ~always want to open a file on the 'origin' repo,
so that's what this does.

Assumptions:

- The latest ref on the current branch is available on `origin` (e.g. in a PR or on a branch)

Uses the `gh` command-line tool to check if the latest commit is available on `origin`.
If it's not, it will

The idea here is to always browse somewhere, rather than refusing to do anything if it can't guess where to browse,
which is what other GitHub extensions seem to choose.

## TODO

- use tracking branch, if defined
- make requests directly to the GitHub API to check for refs instead of relying on `gh`
- error handling

## Usage

Defines the command "Open on GitHub" command, which opens the current file (and selected line range) on GitHub.
No default key-bindings, but I use cmd-option-G.
