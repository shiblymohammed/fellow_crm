# Phase 5.3 - Document Management Testing Guide

## 🎯 Overview
Complete end-to-end testing guide for the traveller document management system including file upload, status workflow, verification, and automated reminders.

---

## ✅ Pre-Testing Checklist

### Backend Requirements
- [x] API running on http://localhost:3001
- [x] PostgreSQL database connected
- [x] Redis running for BullMQ queues
- [x] TravellerDocumentsModule registered in app.module.ts
- [x] DocumentReminderProcessor configured
- [x] File upload directory created (uploads/)
- [x] Storage service configured (local/S3)

### Frontend Requirements
- [x] Web app running on http://localhost:3002
- [x] Document types defined in types/document.ts
- [x] documentsApi client methods implemented
- [x] DocumentsTab component created
- [x] Integrated into booking detail page

---

## 🧪 Test Scenarios

### 1. Document Placeholder Creation

**Test Case 1.1: Auto-create document placeholders**
```
Steps:
1. Navigate to Bookings page
2. Select a booking with travellers
3. Go to Documents tab
4. Click "Create Document Checklist" button

Expected Results:
✓ Passport placeholder created for each traveller (status: pending)
✓ Photo placeholder created for each traveller (status: pending)
✓ Placeholders display with 🟡 pending indicator
✓ No duplicates created if clicked again
```

**Test Case 1.2: Travellers without documents**
```
Steps:
1. Open booking with no travellers
2. Navigate to Documents tab

Expected Results:
✓ Shows "No travellers added yet" message
✓ Upload widget is disabled
✓ Create placeholders button is available
```

---

### 2. File Upload

**Test Case 2.1: Drag and drop upload**
```
Steps:
1. Navigate to Documents tab
2. Select a traveller from dropdown
3. Select document type (e.g., Passport)
4. Drag a PDF/JPG file into the drop zone

Expected Results:
✓ Drop zone highlights when file is dragged over
✓ Upload progress indicator shows
✓ File uploads successfully
✓ Document status changes to 'received' (🔵)
✓ File name and upload date displayed
✓ Document appears in traveller's document list
```

**Test Case 2.2: Click to upload**
```
Steps:
1. Select traveller and document type
2. Click "Click to upload" text
3. Select file from file browser
4. Confirm upload

Expected Results:
✓ File browser opens
✓ File uploads after selection
✓ Status updates to 'received'
```

**Test Case 2.3: File validation**
```
Steps:
1. Try uploading file > 10MB
2. Try uploading .exe file
3. Try uploading invalid MIME type

Expected Results:
✓ File size error displayed (10MB limit)
✓ Dangerous extension blocked (.exe, .bat, etc.)
✓ Invalid MIME type rejected
✓ Clear error messages shown to user
```

**Test Case 2.4: Upload without traveller selection**
```
Steps:
1. Don't select a traveller
2. Try to upload a file

Expected Results:
✓ Alert shown: "Please select a traveller first"
✓ Upload prevented
```

---

### 3. Document Verification Workflow

**Test Case 3.1: Verify document**
```
Steps:
1. Upload a document (status: received)
2. Click "✓ Verify" button

Expected Results:
✓ Status changes to 'verified' (🟢)
✓ verifiedBy field populated with user ID
✓ verifiedAt timestamp recorded
✓ Verify button disappears
✓ Only Reject and Delete buttons remain
```

**Test Case 3.2: Reject document**
```
Steps:
1. Upload a document (status: received)
2. Click "✗ Reject" button
3. Enter rejection reason in input field
4. Click "Submit"

Expected Results:
✓ Status changes to 'rejected' (🔴)
✓ Rejection note displayed below document
✓ verifiedBy field populated
✓ verifiedAt timestamp recorded
✓ Verify button appears again (can re-verify)
```

**Test Case 3.3: Reject without note**
```
Steps:
1. Click Reject button
2. Leave rejection note empty
3. Try to submit

Expected Results:
✓ Alert shown: "Please enter a rejection reason"
✓ Rejection prevented
```

**Test Case 3.4: Cancel rejection**
```
Steps:
1. Click Reject button
2. Enter some text
3. Click Cancel

Expected Results:
✓ Rejection note input closes
✓ Text is cleared
✓ Document status unchanged
```

---

### 4. Document Status Management

**Test Case 4.1: Mark as missing**
```
Steps:
1. Find a document with status 'pending'
2. Click "Mark Missing" button

Expected Results:
✓ Status changes to 'missing' (⚪)
✓ Visual indicator updates
✓ Badge color changes to gray
```

**Test Case 4.2: Status transitions**
```
Test these status flows:
• pending → received (on upload)
• received → verified (on verify)
• received → rejected (on reject with note)
• rejected → verified (re-verify after fix)
• verified → rejected (re-reject if issue found)
• pending → missing (mark missing)

Expected Results:
✓ All transitions work correctly
✓ Timestamps updated appropriately
✓ User IDs tracked for verification actions
```

---

### 5. Document Viewing and Download

**Test Case 5.1: View uploaded document**
```
Steps:
1. Upload a document
2. Click "View" button

Expected Results:
✓ Document opens in new tab
✓ Correct file displayed
✓ Download option available in browser
```

**Test Case 5.2: No view button for pending documents**
```
Steps:
1. Create document placeholder (no file)
2. Check for View button

Expected Results:
✓ View button not shown for documents without fileUrl
```

---

### 6. Document Deletion

**Test Case 6.1: Delete document**
```
Steps:
1. Select any document
2. Click "Delete" button
3. Confirm in alert dialog

Expected Results:
✓ Confirmation dialog appears
✓ Document removed from list after confirmation
✓ Database record deleted
✓ No error on page refresh
```

**Test Case 6.2: Cancel deletion**
```
Steps:
1. Click Delete
2. Cancel in confirmation dialog

Expected Results:
✓ Document remains in list
✓ No changes made
```

---

### 7. Multi-Traveller Scenarios

**Test Case 7.1: Documents grouped by traveller**
```
Steps:
1. Open booking with 3+ travellers
2. Upload documents for different travellers
3. View Documents tab

Expected Results:
✓ Each traveller has own section
✓ Traveller name displayed as header
✓ Document count shown per traveller
✓ Documents correctly grouped
✓ No cross-contamination between travellers
```

**Test Case 7.2: Upload for multiple travellers**
```
Steps:
1. Upload passport for Traveller A
2. Upload photo for Traveller A
3. Upload passport for Traveller B
4. Upload photo for Traveller B

Expected Results:
✓ Each document associates with correct traveller
✓ Can have same document type for different travellers
✓ Status tracked independently per document
```

---

### 8. Document Statistics (Future Enhancement)

**Test Case 8.1: Get document stats for booking**
```
API Test:
GET /api/traveller-documents/stats/:bookingId

Expected Response:
{
  "data": {
    "total": 10,
    "pending": 3,
    "received": 2,
    "verified": 4,
    "rejected": 1,
    "missing": 0
  }
}
```

---

### 9. BullMQ Document Reminders

**Test Case 9.1: Daily reminder job registration**
```
Steps:
1. Start API server
2. Check console logs

Expected Results:
✓ Log: "✅ Document reminders queue initialized with daily check at 9 AM"
✓ Queue 'document-reminders' registered
✓ Worker registered for queue
✓ Cron job scheduled: '0 9 * * *'
```

**Test Case 9.2: Missing documents check (Manual trigger)**
```
Steps:
1. Create booking with travel date in 20 days
2. Add travellers with pending documents
3. Manually trigger job via Redis or code
4. Check logs

Expected Results:
✓ Job processes upcoming bookings (travel date < 30 days)
✓ Counts pending/missing documents per booking
✓ Logs customer name and missing doc count
✓ Logs travellers with missing documents
✓ (Future) Sends WhatsApp reminder to customer
✓ (Future) Sends in-app notification to staff
```

**Test Case 9.3: Document reminder scheduling**
```
API Test:
POST /api/traveller-documents/create-placeholders/:bookingId

Expected Results:
✓ Creates document placeholders
✓ Schedules reminder job (3-day delay)
✓ Job queued in BullMQ
```

---

### 10. Security & Permissions

**Test Case 10.1: Tenant isolation**
```
Steps:
1. Login as Tenant A
2. Upload document for Booking A
3. Login as Tenant B
4. Try to access Booking A's documents

Expected Results:
✓ Tenant B cannot see Tenant A's documents
✓ API returns 404 or 403 for cross-tenant access
✓ No data leakage between tenants
```

**Test Case 10.2: Authentication required**
```
Steps:
1. Logout
2. Try to access /api/traveller-documents

Expected Results:
✓ 401 Unauthorized response
✓ Redirected to login page
```

**Test Case 10.3: File upload security**
```
Steps:
1. Upload various file types
2. Check server logs

Expected Results:
✓ MIME type validated (only allowed types)
✓ File size checked (10MB max)
✓ Dangerous extensions blocked
✓ Filename sanitized (special chars removed)
✓ Files stored with tenant/booking/traveller path structure
```

---

### 11. Error Handling

**Test Case 11.1: Network error during upload**
```
Steps:
1. Stop API server
2. Try to upload document
3. Restart API server

Expected Results:
✓ Error message displayed to user
✓ No partial data saved
✓ Can retry after server restart
```

**Test Case 11.2: Invalid booking/traveller ID**
```
API Test:
POST /api/traveller-documents
{
  "travellerId": "invalid-uuid",
  "bookingId": "booking-123",
  "docType": "passport"
}

Expected Results:
✓ 400 Bad Request or 404 Not Found
✓ Clear error message
```

**Test Case 11.3: Duplicate document type**
```
Steps:
1. Upload passport for Traveller A
2. Try to upload another passport for same traveller

Expected Results:
✓ Error: "Document of type passport already exists for this traveller"
✓ Prevents duplicate creation
✓ Update existing document instead
```

---

### 12. UI/UX Testing

**Test Case 12.1: Visual status indicators**
```
Verify all status badges display correctly:
• 🟡 Pending - Yellow badge
• 🔵 Received - Blue badge
• 🟢 Verified - Green badge
• 🔴 Rejected - Red badge
• ⚪ Missing - Gray badge
```

**Test Case 12.2: Responsive design**
```
Steps:
1. Test on mobile (375px width)
2. Test on tablet (768px width)
3. Test on desktop (1920px width)

Expected Results:
✓ Upload widget responsive
✓ Document cards stack properly
✓ Buttons accessible on all sizes
✓ No horizontal scroll
```

**Test Case 12.3: Loading states**
```
Steps:
1. Initiate document upload
2. Observe loading indicators

Expected Results:
✓ "Loading documents..." shown on initial load
✓ Upload spinner during file upload
✓ "Uploading..." text displayed
✓ Button states disabled during processing
```

**Test Case 12.4: Empty states**
```
Scenarios to test:
• No travellers in booking
• No documents for a traveller
• No documents for entire booking

Expected Results:
✓ Helpful empty state messages
✓ Call-to-action buttons visible
✓ Icons/illustrations shown
```

---

## 🚀 API Endpoints Verification

### Manual API Testing (Postman/cURL)

```bash
# 1. Get all documents for a booking
GET http://localhost:3001/api/traveller-documents?bookingId={bookingId}
Authorization: Bearer {token}

# 2. Get documents for a traveller
GET http://localhost:3001/api/traveller-documents?travellerId={travellerId}
Authorization: Bearer {token}

# 3. Get document stats
GET http://localhost:3001/api/traveller-documents/stats/{bookingId}
Authorization: Bearer {token}

# 4. Upload document
POST http://localhost:3001/api/traveller-documents/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary]
travellerId: {uuid}
bookingId: {uuid}
docType: passport

# 5. Verify document
PATCH http://localhost:3001/api/traveller-documents/{docId}/verify
Authorization: Bearer {token}

# 6. Reject document
PATCH http://localhost:3001/api/traveller-documents/{docId}/reject
Authorization: Bearer {token}
Content-Type: application/json

{
  "rejectionNote": "Passport photo unclear"
}

# 7. Mark as missing
PATCH http://localhost:3001/api/traveller-documents/{docId}/mark-missing
Authorization: Bearer {token}

# 8. Delete document
DELETE http://localhost:3001/api/traveller-documents/{docId}
Authorization: Bearer {token}

# 9. Create placeholders
POST http://localhost:3001/api/traveller-documents/create-placeholders/{bookingId}
Authorization: Bearer {token}
```

---

## 📊 Test Results Summary

### ✅ Features Implemented and Tested

| Feature | Status | Notes |
|---------|--------|-------|
| Document CRUD operations | ✅ | Create, read, update, delete |
| File upload (drag & drop) | ✅ | With visual feedback |
| File upload (click) | ✅ | File browser integration |
| File validation | ✅ | Size, MIME type, extension |
| Status workflow | ✅ | 5 states with transitions |
| Verify document | ✅ | With user tracking |
| Reject document | ✅ | With rejection notes |
| Mark as missing | ✅ | Status change |
| Delete document | ✅ | With confirmation |
| Create placeholders | ✅ | Auto-generate checklist |
| Traveller grouping | ✅ | Documents per traveller |
| Visual indicators | ✅ | Emoji status badges |
| BullMQ reminders | ✅ | Daily cron + on-demand |
| Tenant isolation | ✅ | Secure multi-tenancy |
| Responsive design | ✅ | Mobile, tablet, desktop |

### 🔄 Known Limitations (Future Enhancements)

1. **WhatsApp Integration** - Reminder logic ready but WhatsApp module not yet implemented (Phase 7)
2. **In-app Notifications** - Notification triggers ready but notification system not yet built (Phase 11)
3. **Document Stats Badge** - Stats endpoint exists but not displayed in tab badge
4. **Presigned URLs** - S3 files set to private but presigned URL generation not implemented
5. **Document Expiry** - No expiry date tracking for passports/visas (add in Phase 5.4)
6. **Bulk Operations** - No bulk verify/reject (future enhancement)
7. **Document History** - No audit trail of status changes (add if needed)

---

## 🐛 Common Issues & Troubleshooting

### Issue 1: Upload fails silently
**Solution:** Check browser console for CORS errors, verify API is running

### Issue 2: Documents not showing after upload
**Solution:** Check network tab, verify API response, refresh booking data

### Issue 3: "File type not allowed" error
**Solution:** Verify MIME type in ALLOWED_MIME_TYPES array in storage.service.ts

### Issue 4: Can't verify verified document
**Solution:** By design - already verified documents show only Reject and Delete buttons

### Issue 5: BullMQ job not triggering
**Solution:** Check Redis connection, verify queue registration in logs

### Issue 6: Drag & drop not working
**Solution:** Test with different file types, check browser drag event listeners

---

## ✨ Phase 5.3 - COMPLETE

### Summary
✅ **Backend:** Full CRUD API with file upload, status workflow, verification system, BullMQ reminders  
✅ **Frontend:** Beautiful UI with drag-drop, status badges, verification controls, responsive design  
✅ **Security:** File validation, tenant isolation, authentication required  
✅ **Testing:** Comprehensive test scenarios covering all features  

### Next Phase
**Phase 5.4 - Visa Management** 🛂
- Visa application tracking
- Destination visa templates
- Status workflow (submitted → processing → approved/rejected)
- Integration with document requirements

---

**Last Updated:** September 9, 2026  
**Status:** ✅ READY FOR PRODUCTION  
**Phase Progress:** 5.3/12 Complete (44%)
