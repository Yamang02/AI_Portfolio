# Planning Phase Auto-Catch System
**Purpose**: Automatically detect when developer reaches planning phase and suggest documentation

## Core Concept
Detect planning signals and proactively offer to document the plan before implementation begins.

## Planning Signal Detection

### Explicit Planning Signals
```
✅ Detect when developer says:
- "계획을 세워보자" / "구체적인 계획이 나왔어"
- "이제 구현 계획을 정리해줘" / "다음 단계를 정리해줘"
- "TO-DO를 만들어보자" / "작업 순서를 정해보자"
```

### Implicit Planning Indicators
```
✅ Detect patterns:
- Multiple "그럼", "그러면", "그래서" in sequence
- Questions about "어떻게", "무엇을", "언제"
- "먼저", "그 다음", "마지막으로" sequence
- "이렇게 하면", "그러면 이제" transition phrases
```

### Context Clues
```
✅ Planning phase indicators:
- Developer asks "어떻게 구현할까?"
- Lists multiple options or approaches
- Mentions "단계별로", "순서대로"
- Discusses dependencies or prerequisites
```

## Auto-Catch Workflow

### 1. Signal Detection
```
Monitor conversation → Detect planning patterns → Confirm planning phase
```

### 2. Proactive Offer
```
"구체적인 계획이 나온 것 같습니다. 구현 전에 계획을 문서로 정리해드릴까요?"
```

### 3. Plan Documentation
```
- Extract planning elements
- Structure into actionable steps
- Identify dependencies
- Create implementation roadmap
```

## Plan Document Structure
- **Goal**: What we're trying to achieve
- **Approach**: Chosen strategy/method
- **Steps**: Sequential implementation plan
- **Dependencies**: Prerequisites and order
- **Risks**: Potential issues to watch
- **Success Criteria**: How to know it's done

## Don't Auto-Catch
- Simple Q&A about existing code
- Single-step implementations
- Debugging sessions
- Code review discussions

---
*Catch plans early. Document before implementation. Reduce planning overhead.*
