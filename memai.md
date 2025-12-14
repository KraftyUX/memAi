# memAI Steering

Guidelines for AI agents using memAI.

## Session Lifecycle

1. **Start**: Call `start_session` with goal
2. **Work**: Record decisions, implementations, issues as you go
3. **Check**: Call `memory_pulse` if unsure about recording health
4. **End**: Call `finish_session` with status and next steps

## When to Record

| Event | Category | Tool |
|-------|----------|------|
| Task complete | `checkpoint` | `record_memory` |
| Technical choice | `decision` | `record_decision` |
| Problem found | `issue` | `record_memory` |
| Feature done | `implementation` | `record_memory` |
| User feedback | `user-interaction` | `record_memory` |

## Categories

- `checkpoint` - Milestones, phase completions
- `decision` - Technical/architectural choices
- `implementation` - Code changes, features
- `issue` - Problems (severity: P0-P3)
- `validation` - Test results
- `insight` - Learnings, best practices
- `user-interaction` - Approvals, feedback

## Issue Severity

- P0: Critical (system down, security, data loss)
- P1: High impact
- P2: Medium (workaround exists)
- P3: Low/cosmetic

## Health Status

The system tracks recording activity:

- `healthy`: Recorded within 5 minutes
- `warning`: 5-10 minutes since recording
- `critical`: >10 minutes since recording

Nudges appear on read-only tools when recording lapses.

## Tool Examples

```json
{"tool": "start_session", "args": {"goal": "Implement feature X"}}
```

```json
{"tool": "record_memory", "args": {
  "category": "implementation",
  "action": "Added auth middleware",
  "outcome": "Tests passing",
  "tags": "auth"
}}
```

```json
{"tool": "record_decision", "args": {
  "decision": "Use JWT",
  "rationale": "Stateless, scalable",
  "alternatives": "Sessions"
}}
```

```json
{"tool": "finish_session", "args": {
  "phase": "Auth",
  "status": "completed",
  "progressPercent": 100,
  "nextSteps": ["Deploy"]
}}
```

## Best Practices

**Do:**
- Be specific: "Added OAuth 2.0 with PKCE" not "Fixed auth"
- Include rationale for decisions
- Record immediately, not at session end
- Use consistent lowercase tags

**Don't:**
- Vague entries ("fixed bug")
- Skip decisions or issues
- Record trivial changes (formatting, typos)
- Ignore nudges
