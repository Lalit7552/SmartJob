# Direct Chat Navigation Implementation Plan

## Overview
Implement chat buttons in EmployeeDashboard and WorkerDashboard to open specific person's chat directly.

**Status: [IN PROGRESS]**

## Step-by-Step Tasks

### 1. [DONE] ✅ Create TODO.md
   - Status: Completed

### 2. [DONE] ✅ Update EmployeeDashboard.jsx
   - Modify WorkerRow chat button onClick to pass worker.id as query param: `/employee/chats?workerId=${worker.id}`
   - Status: Completed

### 3. [DONE] ✅ Update WorkerDashboard.jsx  
   - Modify job list chat button onClick to pass job.employerId: `/worker/chats?employerId=${job.employerId}`
   - Status: Completed

### 4. [PENDING] Update EmployeeChats.jsx
   - Add useSearchParams from "react-router-dom" 
   - Add const [searchParams] = useSearchParams();
   - Add useEffect to auto-select worker by workerId from URL on mount after workers load

### 5. [PENDING] Update WorkerChat.jsx
   - Add useSearchParams  
   - Add const [searchParams] = useSearchParams();
   - Add useEffect to auto-select employer by employerId from URL on mount after jobs load

### 6. [PENDING] ✅ Test Implementation
   - Run frontend: `cd frontend && npm run dev`
   - Login as employer: Click worker chat → verify opens specific worker chat
   - Login as worker: Click job chat → verify opens specific employer chat
   - Verify messages load and socket works

### 7. [PENDING] ✅ Complete Task
   - Mark all complete and attempt_completion

**Next Action:** Complete Step 4 - Update EmployeeChats.jsx auto-select logic (insert useEffect after workers load).

## Commands
```bash
# Start dev server (if not running)
cd frontend && npm run dev
```

