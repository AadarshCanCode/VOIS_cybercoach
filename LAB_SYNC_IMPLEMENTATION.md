# Lab Sync Implementation Guide

## Overview
This document explains how lab completion status syncs from external render websites to the CyberCoach database.

## Architecture

### Flow:
```
Student → CyberCoach UI → Opens Lab → Redirects to Render Website
                                                      ↓
Student completes lab on Render Website
                                                      ↓
Render Website → Webhook API → Supabase Database
                                                      ↓
CyberCoach UI polls/updates → Shows completion status
```

## 🔌 Webhook Endpoint

### Endpoint
```
POST /api/student/labs/webhook/complete
```

### Request Headers
```json
{
  "Content-Type": "application/json"
  // Optional: "X-Webhook-Secret": "<secret>" (for future security)
}
```

### Request Body
```json
{
  "studentId": "uuid-of-student",
  "labId": "broken-access-control",
  "completedAt": "2024-01-20T10:30:00Z", // Optional, defaults to now
  "metadata": { // Optional
    "score": 100,
    "timeSpent": 1800,
    "attempts": 1
  }
}
```

### Response (Success)
```json
{
  "success": true,
  "message": "Lab completion synced successfully",
  "completion": {
    "id": "completion-uuid",
    "labId": "broken-access-control",
    "completedAt": "2024-01-20T10:30:00Z"
  }
}
```

### Response (Error)
```json
{
  "error": "Invalid studentId. Must be a valid UUID string."
}
```

## 🔐 Security

### Current Implementation:
- ✅ Rate limiting (30 requests/minute per IP)
- ✅ Input validation (UUID format, required fields)
- ✅ Error logging
- ✅ No sensitive data exposure

### Future Enhancements:
- Add webhook secret authentication
- IP whitelist for render website
- Signed payloads (HMAC)

## 📝 Integration Guide for Render Website

### Step 1: Get Student ID
When student opens lab from CyberCoach, pass student ID as URL parameter:
```
https://vulnarable-labs.onrender.com/lab/access-control?studentId=<uuid>&returnUrl=<cybercoach-url>
```

### Step 2: On Lab Completion
When student completes lab, call webhook:

```javascript
// Example: Render website code
async function onLabComplete(studentId, labId) {
    const webhookUrl = 'https://your-backend.com/api/student/labs/webhook/complete';
    
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                studentId: studentId,
                labId: labId, // e.g., 'broken-access-control'
                completedAt: new Date().toISOString(),
                metadata: {
                    score: calculateScore(),
                    timeSpent: getTimeSpent(),
                }
            }),
        });

        if (response.ok) {
            console.log('Lab completion synced successfully');
            // Optionally redirect back to CyberCoach
            window.location.href = returnUrl + '?labCompleted=' + labId;
        } else {
            console.error('Failed to sync:', await response.json());
        }
    } catch (error) {
        console.error('Webhook error:', error);
        // Still show success to user, sync will retry or be manual
    }
}
```

### Step 3: Handle Return
After completion, redirect back to CyberCoach:
```
https://cybercoach.com/labs?labCompleted=broken-access-control
```

## 🧪 Testing

### Test Webhook Locally:
```bash
curl -X POST http://localhost:4000/api/student/labs/webhook/complete \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "123e4567-e89b-12d3-a456-426614174000",
    "labId": "broken-access-control",
    "completedAt": "2024-01-20T10:30:00Z"
  }'
```

### Test Health Check:
```bash
curl http://localhost:4000/api/student/labs/webhook/health
```

### Expected Response:
```json
{
  "status": "ok",
  "service": "lab-sync-webhook",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

## 🔄 Frontend Integration

### Update Lab Viewer to Handle External Completion

When student returns from render website:
1. Check URL parameter `?labCompleted=<labId>`
2. Poll or refresh lab status
3. Show completion message

### Example Implementation:
```typescript
// In LabViewer component
useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const completedLabId = params.get('labCompleted');
    
    if (completedLabId && completedLabId === labId) {
        // Refresh lab status
        checkLabStatus();
        // Show success message
        setShowCompletionMessage(true);
    }
}, [labId]);
```

## 📊 Database Schema

### Table: `lab_completions`
```sql
CREATE TABLE public.lab_completions (
  id uuid PRIMARY KEY,
  student_id uuid REFERENCES auth.users(id),
  lab_id text NOT NULL,
  completed_at timestamp with time zone,
  created_at timestamp with time zone,
  UNIQUE(student_id, lab_id)
);
```

## 🚀 Deployment Checklist

- [ ] Run database migration (`20250120_create_lab_completions.sql`)
- [ ] Set environment variables:
  - `NEXT_PUBLIC_BACKEND_URL` (for webhook URL)
  - `LAB_WEBHOOK_SECRET` (optional, for future security)
- [ ] Test webhook endpoint
- [ ] Configure render website to call webhook
- [ ] Test end-to-end flow
- [ ] Monitor logs for sync issues

## 🔍 Monitoring

### Logs to Monitor:
- Webhook requests: `logger.info('Lab completion webhook received')`
- Errors: `logger.error('Lab completion webhook error')`
- Rate limit hits: Check for 429 responses

### Metrics to Track:
- Webhook success rate
- Average sync time
- Failed syncs by reason
- Lab completion rate

## 🐛 Troubleshooting

### Issue: Webhook returns 400
**Solution:** Check studentId format (must be UUID), labId must be non-empty string

### Issue: Webhook returns 429
**Solution:** Rate limit exceeded, wait 1 minute or increase limit

### Issue: Lab not showing as completed
**Solution:** 
1. Check webhook was called successfully
2. Verify studentId matches authenticated user
3. Check database for completion record
4. Refresh UI

### Issue: Duplicate completions
**Solution:** Database has UNIQUE constraint on (student_id, lab_id), so duplicates are prevented

## 📝 Future Enhancements

1. **Webhook Authentication**
   - Add HMAC signature verification
   - IP whitelist for render website
   - API key authentication

2. **Retry Mechanism**
   - Queue failed webhooks
   - Automatic retry with exponential backoff
   - Dead letter queue for permanent failures

3. **Lab Session Tracking**
   - Track when student opens lab
   - Track time spent in lab
   - Track completion attempts

4. **Real-time Updates**
   - WebSocket for instant completion updates
   - Server-sent events (SSE)
   - Polling fallback

5. **Analytics**
   - Lab completion rates
   - Average completion time
   - Most popular labs
   - Student progress tracking

