# Security Policy

## Reporting a vulnerability

Report it privately. Do not open a public issue, and do not post the details in a discussion or
a pull request.

Use GitHub's private vulnerability reporting on this repository: open the **Security** tab and
choose **Report a vulnerability**. That opens a private advisory that only you and the maintainer
can read. If that is unavailable to you, email sudarshantechlabs@gmail.com instead.

Please include whatever you have:

- what the problem is, and what an attacker gets out of it
- the steps or the request that triggers it
- the affected version, commit or release tag
- anything that narrows it down: logs, a stack trace, a minimal reproduction

## What to expect

This is a one-person project, maintained alongside other work, so the honest numbers are:

- an acknowledgement within 7 days
- an assessment, with a fix or a reasoned rejection, within 30 days of the acknowledgement
- credit in the advisory and the release notes when a report leads to a fix, unless you ask to
  stay anonymous

A report that turns out to be a non-issue still gets an answer explaining why.

## Supported versions

Only the latest release on the default branch is supported. Fixes are not backported, so a
reported issue is fixed in the next release rather than patched into an older tag.

## Scope

In scope: the code in this repository, its build and release workflows, and its dependency
manifests.

Out of scope: findings that depend on an attacker already controlling the machine or the account,
automated scanner output with no demonstrated impact, missing hardening headers on a page that
serves no data, and vulnerabilities in third-party services this project only calls out to.
Report those to the service that owns them.
