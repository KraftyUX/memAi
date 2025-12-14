# memAI Steering

Record everything significant. Never rely on context alone.

## Session Lifecycle

1. **START**: Call `start_session` with goal → Read briefing output
2. **WORK**: Record immediately on task completion, decisions, issues, implementations
3. **CHECK**: Call `memory_pulse` when unsure about recording health
4. **END**: Call `finish_session` with phase, status, progressPercent, nextSteps

## Recording Triggers

| Trigger | Action | Tool |
|---------|--------|------|
| Task/subtask complete | Record checkpoint | `record_memory` |
| Technical choice made | Record decision | `record_decision` |
| Problem encountered | Record issue | `record_memory` |
| Feature implemented | Record implementation | `record_memory` |
| User feedback received | Record interaction | `record_memory` |

## Categories (Single-Line Definitions)

- `checkpoint`: phase, action, outcome, progressPercent, tags: milestone|completed
- `decision`: decision, rationale, alternatives, impact, tags: architecture|tech-choice
- `implementation`: phase, action, context, outcome, tags: feature|refactor|api
- `issue`: severity (P0-P3), description, tags: bug|blocker|config
- `user-interaction`: action, context, outcome, tags: approval|feedback
- `insight`: topic, content, confidence, source, tags: best-practice|performance
- `validation`: testSuite, passed, failed, durationMs, tags: tests|ci

## Issue Severity

- P0: Critical (system down, security, data loss)
- P1: High impact
- P2: Medium (workaround exists)
- P3: Low/cosmetic

## Memory Health

The system tracks your recording activity and provides nudges when recording lapses.

**Health Status**:
- `healthy`: Recorded within 5 min OR memoryRatio > 0.1
- `warning`: 5-10 min since recording OR >5 tool calls with 0 memories
- `critical`: >10 min since recording OR >10 tool calls with 0 memories

**Automatic Nudges**: Read-only tools (`search_memories`, `get_briefing`) append nudges when:
- >10 min since last recording
- >10 tool calls with 0 memories recorded

Nudges suppressed if recorded within last 5 min.

## Tools Quick Reference

### Session Management
```json
{"tool": "start_session", "args": {"goal": "Implement feature X"}}
{"tool": "finish_session", "args": {"phase": "Phase", "status": "in-progress", "progressPercent": 50, "nextSteps": ["Next task"]}}
```

### Recording
```json
{"tool": "record_memory", "args": {"category": "checkpoint", "content": "Completed auth module", "tags": "auth,milestone"}}
{"tool": "record_decision", "args": {"decision": "Use OAuth 2.0", "rationale": "Industry standard", "alternatives": "JWT only", "impact": "Better security"}}
```

### Health Check
```json
{"tool": "memory_pulse", "args": {}}
```
Returns: sessionDuration, memoryCount, toolCallCount, timeSinceLastRecording, healthStatus, suggestions (when warning/critical), guidance (when critical)

### Search & Briefing
```json
{"tool": "search_memories", "args": {"query": "authentication"}}
{"tool": "get_briefing", "args": {}}
```

## Best Practices

DO:
- Be specific: "Implemented OAuth 2.0 with PKCE" not "Fixed auth"
- Include rationale and alternatives for decisions
- Use consistent tags: lowercase, hyphenated
- Record immediately, not at session end
- Include metrics: LOC, time, performance

DON'T:
- Vague entries ("fixed bug")
- Skip decisions or issues
- Record trivial changes (formatting, typos)
- Ignore nudges when they appear
