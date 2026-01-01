# Claude Instructions for This Project

## Git Workflow

**CRITICAL: Never commit or push without explicit user instruction.**

- Do NOT automatically run `git commit` unless the user explicitly asks to commit
- Do NOT automatically run `git push` unless the user explicitly asks to push
- When the user says "commit" or "commit changes", create the commit but DO NOT push
- Only push when the user explicitly says "push" or "commit and push"

## Examples

**User says:** "commit changes"
**Action:** Run `git add -A && git commit -m "message"` ONLY. Do not push.

**User says:** "push"
**Action:** Run `git push` ONLY (assumes changes are already committed).

**User says:** "commit and push" or "commit changes and push up"
**Action:** Run `git add -A && git commit -m "message" && git push`

**User says:** "make these changes"
**Action:** Make the code changes. Do NOT commit or push.

## Summary

Wait for explicit user instructions before any git operations. Never assume the user wants to commit or push.
