# CLAUDE.md

Shared instructions for all agents are in AGENTS.md and also apply to Claude:

@AGENTS.md

## Claude Code only

- Always reply to the user in Danish. The game and the files are in English.
- Start the prototype with the preview tool (the configuration is in `.claude/launch.json`) or with `npm start`.
- The browser pane does not paint new frames while it is hidden. Use the page's text, JavaScript or a headless browser for visual checks instead of relying on a screenshot.
- When Codex delivers a round: run `npm run check:assets`, look at the contact sheets, and look at the files in the prototype before you recommend approval. Give the user a ready-made message for Codex with corrections and the next round.
- Do not change folders Codex is working in (see "In progress" in PROGRESS.md).
