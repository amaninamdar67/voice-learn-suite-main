# Message Locations Guide

## Overview
Messages between parents and mentors are displayed in two main locations:

---

## 1. **Mentor Module - Messages Page**
**File:** `src/pages/Mentor/MentorMessages.tsx`

### What's Displayed:
- **Messages FROM Parents TO Mentor** (incoming messages)
- **Replies FROM Mentor TO Parents** (outgoing replies)

### Structure:
- Left sidebar: List of parents grouped by student
- Main area: Messages from selected parent about specific student
- Dialog: Full message details with reply composition

### Key Features:
- Shows parent name and number of students
- Lists students under each parent
- Displays message subject and preview
- Can view full message and send replies
- Can delete messages (soft delete)

---

## 2. **Parent Module - Children View Page**
**File:** `src/pages/Parent/ChildrenView.tsx`

### What's Displayed:
- **Replies FROM Mentor TO Parent** (incoming replies about their children)
- **Original Messages FROM Parent** (context for replies)

### Structure:
- Tab 2 (Messages): Send messages to mentor
- Tab 3 (Replies): View mentor's replies to your messages

### Key Features:
- Shows mentor name assigned to the child
- Displays original message sent by parent (compact view)
- Shows mentor's reply below original message
- Can expand/collapse long replies
- Can delete original messages
- Shows timestamps for both original and reply

---

## Data Flow

```
Parent sends message
    ↓
Stored in mentor_parent_messages table
    ↓
Mentor sees in MentorMessages page
    ↓
Mentor sends reply
    ↓
Stored in mentor_parent_messages table (with reply_to_id)
    ↓
Parent sees in ChildrenView Replies tab
```

---

## Message Cleanup Behavior

### When Parent is Changed:
- All messages FROM old parent are deleted
- Messages FROM mentor to old parent are deleted (if no other students)

### When Mentor is Changed:
- Messages FROM mentor to old parent are deleted (if no other students)

### When Student is Unlinked:
- All messages FROM parent are deleted
- All messages FROM mentor are deleted

---

## Database Tables

- **mentor_parent_messages**: Stores all messages and replies
  - `parent_id`: Parent who sent the message
  - `mentor_id`: Mentor who received/sent reply
  - `student_id`: Student the message is about
  - `reply_to_id`: ID of original message (if this is a reply)
  - `is_deleted`: Soft delete flag

