# Feedback Workflow

## Collecting Feedback

### From Venue Owner
- Post-event interview or survey
- Questions: Was the platform easy to use? Did it save time? What was missing?

### From Promoter
- Quick survey (3-5 questions)
- Questions: Was guest communication easy? Did the guestlist help promotion?

### From Door Staff
- In-person debrief or written form
- Questions: Was check-in fast? Any technical issues? What would you change?

### From Guests
- Short survey (optional, via QR at exit or follow-up)
- Questions: Was reservation easy? Was check-in smooth? Would you use it again?

## Categorizing Findings

| Category | Description | Example |
|----------|-------------|---------|
| **Bug** | Something doesn't work as expected | QR code not rendering for some guests |
| **UX Issue** | Something is confusing or hard to use | Admin search doesn't work on mobile |
| **Feature Request** | New capability requested | Waitlist for sold-out events |
| **Operational Issue** | Process or workflow problem | Staff forgot to approve reservations |
| **Performance Issue** | System is slow or unresponsive | Analytics page takes 10s to load |

## Bug Triage Process

### Priority Levels

| Priority | Label | SLA | Description |
|----------|-------|-----|-------------|
| **P0** | `critical` | Immediate | Blocks entire event; no workaround |
| **P1** | `high` | 24 hours | Affects operations; workaround exists |
| **P2** | `medium` | 1 week | UX improvement; not blocking |
| **P3** | `low` | Future | Nice-to-have; cosmetic issues |

### Triage Workflow

1. **Report received** → Create GitHub Issue with label
2. **Categorize** → Assign priority (P0-P3) and category
3. **Assign** → Assign to developer (or queue)
4. **Fix** → Implement fix
5. **Verify** → Confirm fix works in production
6. **Close** → Close issue with summary

### GitHub Issue Template

```markdown
## Description
[What happened]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happened]

## Environment
- Device: [e.g. iPhone 14]
- Browser: [e.g. Chrome 126]
- URL: [e.g. https://your-domain/admin/scanner]

## Priority
- [ ] P0 - Critical (blocks event)
- [ ] P1 - High (affects operations)
- [ ] P2 - Medium (UX issue)
- [ ] P3 - Low (future enhancement)

## Category
- [ ] Bug
- [ ] UX Issue
- [ ] Feature Request
- [ ] Operational Issue
- [ ] Performance Issue
```

## Tracking

All issues tracked in GitHub Issues with labels:
- `bug`, `ux`, `feature`, `operational`, `performance`
- `p0`, `p1`, `p2`, `p3`
- `venue-owner`, `door-staff`, `guest`, `admin`

## Feedback Storage

```
docs/feedback/
├── venue-owner.md
├── promoter.md
├── door-staff.md
└── guest.md
```

Each file contains raw feedback + categorized findings + action items.
