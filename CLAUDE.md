# CLAUDE.md

Fælles instruktioner for alle agenter står i AGENTS.md og gælder også for Claude:

@AGENTS.md

## Kun for Claude Code

- Svar brugeren på dansk.
- Start prototypen med preview-værktøjet (konfigurationen ligger i `.claude/launch.json`) eller med `npm start`.
- Browserpanelet maler ikke nye billeder, mens det er skjult. Brug sidens tekst, JavaScript eller en headless browser til visuelle tjek i stedet for at stole på et skærmbillede.
- Når Codex afleverer en runde: kør `npm run tjek:assets`, se kontaktarkene, og se filerne i prototypen, før du anbefaler godkendelse. Giv brugeren en færdig besked til Codex med rettelser og næste runde.
- Ændr ikke i mapper, Codex er i gang med (se "I gang" i PROGRESS.md).
