# Domain Management Redesign Plan

## Key Changes Required:

### 1. Data Structure Fix
**Problem:** Cards showing mixed data from all sub-domains
**Solution:** Each card must only show its OWN department and semester (linked by IDs)

### 2. Remove Chips - Use Text Inputs
**Replace:**
- Chip displays → Plain text with labels
- Chip inputs → Regular TextField inputs

### 3. Card Display Format
```
Sub-Domain Name: B.E
Type: Undergraduate (full text, no truncation)
Department: Computer Science
Semester: 3rd Semester
Description: -------------
Status: Active ●

[Edit] [Delete] [Manage Sub-Domain]
```

### 4. Unified Form Changes
- Remove chips
- Use plain TextFields
- Status toggle on RIGHT side of dialog title
- Type dropdown shows FULL text

### 5. Manage Dialog Changes
- Status toggle in TOP-RIGHT corner
- Remove "Add Department" and "Add Semester" buttons
- Show only the ONE department and ONE semester for THIS sub-domain
- Use TextFields instead of chips

### 6. Backend Unchanged
- Same API calls
- Just UI presentation changes

## Implementation Steps:
1. Fix data filtering - each card shows only its own dept/sem
2. Replace chip displays with text labels
3. Update unified form layout
4. Update manage dialog layout
5. Remove add buttons from manage dialog
