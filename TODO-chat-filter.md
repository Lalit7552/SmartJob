# Chat Page Filter - Only Show People With Existing Chats

**Status: [IN PROGRESS]**

## Step-by-Step Tasks

### 1. [DONE] ✅ Plan & Approval
### 2. [PENDING] Update EmployeeChats.jsx
   - Load workers
   - Promise.all fetchChatMessages(limit=1) for each worker
   - Filter to conversations[w.id]?.length > 0

### 3. [PENDING] Update WorkerChat.jsx 
   - Same for employers from jobs

### 4. [PENDING] Test
   - Only people with messages show in chat list

**Next:** Update chat pages with conversation filter logic.

