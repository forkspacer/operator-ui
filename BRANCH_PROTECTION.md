# Branch Protection Rules

This document outlines the recommended branch protection rules for the `main` branch to ensure code quality and security.

## Recommended Settings for `main` Branch

### How to Configure

1. Go to **Settings** > **Branches** in your GitHub repository
2. Click **Add rule** under "Branch protection rules"
3. Enter `main` as the branch name pattern
4. Apply the settings below

---

## Protection Rules

### Require Pull Request Reviews Before Merging

- **Enable:** Yes
- **Required approving reviews:** 1
- **Dismiss stale pull request approvals when new commits are pushed:** Yes
- **Require review from Code Owners:** No (unless CODEOWNERS file is added)
- **Restrict who can dismiss pull request reviews:** No

**Why:** Ensures all code is reviewed by at least one other person before merging.

---

### Require Status Checks to Pass Before Merging

- **Enable:** Yes
- **Require branches to be up to date before merging:** Yes

**Required status checks:**
- `CLA Assistant`
- `Lint`
- `Test`
- `Build`
- `Docker Build (Verification)`

**Why:** Ensures all CI checks pass before code can be merged. Prevents broken code from entering main branch.

---

### Require Conversation Resolution Before Merging

- **Enable:** Yes

**Why:** Ensures all review comments are addressed before merging.

---

### Require Signed Commits

- **Enable:** No (optional, but recommended for higher security)

**Why:** Verifies commit authenticity. Optional but adds extra security.

---

### Require Linear History

- **Enable:** Yes

**Why:** Prevents merge commits, keeps git history clean. Forces rebase workflow.

---

### Require Deployments to Succeed Before Merging

- **Enable:** No

**Why:** Not applicable for this repo (no preview deployments configured).

---

### Lock Branch

- **Enable:** No

**Why:** Would make branch read-only. Not needed for active development.

---

### Do Not Allow Bypassing the Above Settings

- **Enable:** Yes
- **Allow specified actors to bypass required pull requests:** No

**Why:** Ensures even administrators follow the same rules. Prevents accidental force pushes.

---

### Restrict Who Can Push to Matching Branches

- **Enable:** No (optional)
- **If enabled, restrict to:** Maintainers only

**Why:** Optional. Can restrict direct pushes to only maintainers, forcing everyone to use PRs.

---

### Allow Force Pushes

- **Enable:** No

**Why:** Prevents rewriting history on main branch.

---

### Allow Deletions

- **Enable:** No

**Why:** Prevents accidental deletion of main branch.

---

## Summary

These rules ensure:
1. All code is reviewed before merging
2. All automated tests pass
3. CLA is signed by contributors
4. Git history stays clean and linear
5. No accidental force pushes or deletions
6. All review comments are resolved

## Setting Up Required Status Checks

After pushing your first code and CI workflows run, the status check names will appear in the branch protection settings. You'll need to:

1. Push code to `main` (initial commit)
2. Open a test PR to trigger CI workflows
3. Go to branch protection settings
4. Select the status checks that appeared from the CI run
5. Save the rule

## For Maintainers

When configuring branch protection:
- Apply these rules AFTER the first commit to main
- You may need to temporarily bypass protections for initial setup
- Test with a draft PR to ensure all checks work correctly
- Document any deviations from these recommendations
