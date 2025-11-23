# Admin Dashboard UI Sections for Branch Book Requests

## Instructions

Add these sections to `src/Pages/AdminDashboard.jsx`:

---

## 1. ADD SIDEBAR BUTTONS

Find the sidebar navigation section (around line 358-363) where you see:

```jsx
<button className={`nav-item${activeTab === 'purchase-requests' ? ' active' : ''}`} onClick={() => handleTabChange('purchase-requests')}>
```

**ADD THESE TWO BUTTONS AFTER THE "Book Purchase Requests" button:**

```jsx
<button className={`nav-item${activeTab === 'branch-book-requests' ? ' active' : ''}`} onClick={() => handleTabChange('branch-book-requests')}>
  <span className="icon">📋</span>
  <span className="nav-text">Branch Book Requests</span>
  {branchBookRequests.length > 0 && (
    <span className="badge">{branchBookRequests.length}</span>
  )}
</button>

<button className={`nav-item${activeTab === 'branch-book-handover' ? ' active' : ''}`} onClick={() => handleTabChange('branch-book-handover')}>
  <span className="icon">📖</span>
  <span className="nav-text">Confirm Handover</span>
  {approvedBranchRequests.length > 0 && (
    <span className="badge">{approvedBranchRequests.length}</span>
  )}
</button>
```

---

## 2. ADD HEADER TITLES

Find where the header titles are set (around line 403) where you see:

```jsx
{activeTab === 'purchase-requests' && 'Book Purchase Requests'}
```

**ADD THESE LINES AFTER:**

```jsx
{activeTab === 'branch-book-requests' && 'Branch Book Requests (Pending Approval)'}
{activeTab === 'branch-book-handover' && 'Confirm Book Handover'}
```

---

## 3. ADD CONTENT SECTIONS

Find the content section for 'purchase-requests' (around line 867).

**ADD THESE TWO SECTIONS AFTER THE 'purchase-requests' SECTION (after its closing `</div>`):**

### Section A: Branch Book Requests (Pending Approval)

```jsx
{activeTab === 'branch-book-requests' && (
  <div className="dashboard-content">
    <h2 className="section-title">Branch Book Requests (Pending Approval)</h2>
    <p style={{ marginBottom: '20px', color: '#666' }}>
      Review and approve student requests for branch library books. Once approved, the request moves to the handover confirmation stage.
    </p>

    {branchBookRequests.length === 0 ? (
      <div className="empty-state">
        <p>✅ No pending branch book requests</p>
      </div>
    ) : (
      <table className="data-table">
        <thead>
          <tr>
            <th>Book Title</th>
            <th>Student</th>
            <th>USN</th>
            <th>Acc No.</th>
            <th>Requested Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {branchBookRequests.map((request) => (
            <tr key={request.request_id}>
              <td>
                <strong>{request.title}</strong>
                {request.author && (
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    by {request.author}
                  </div>
                )}
              </td>
              <td>
                {request.student_first_name} {request.student_last_name}
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  @{request.student_username}
                </div>
              </td>
              <td>{request.student_usn}</td>
              <td>{request.acc_no}</td>
              <td>
                {new Date(request.requested_at).toLocaleDateString()}
                <div style={{ fontSize: '0.85em', color: '#888' }}>
                  {new Date(request.requested_at).toLocaleTimeString()}
                </div>
              </td>
              <td>
                <span style={{
                  color: '#f59e0b',
                  fontWeight: 'bold',
                  padding: '4px 8px',
                  background: '#fef3c7',
                  borderRadius: '4px',
                  fontSize: '0.9em'
                }}>
                  ⏳ Pending Approval
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="action-btn success"
                    onClick={() => handleApproveBranchRequest(request.request_id)}
                    title="Approve request"
                  >
                    ✅ Approve
                  </button>
                  <button
                    className="action-btn danger"
                    onClick={() => handleRejectBranchRequest(request.request_id)}
                    title="Reject request"
                  >
                    ❌ Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
)}
```

### Section B: Confirm Handover (Approved Requests)

```jsx
{activeTab === 'branch-book-handover' && (
  <div className="dashboard-content">
    <h2 className="section-title">Confirm Book Handover</h2>
    <p style={{ marginBottom: '20px', color: '#666' }}>
      <strong>⚠️ Important:</strong> Only click "Confirm Handover" AFTER you have physically given the book to the student.
      This will permanently assign the book to the student and remove it from available books.
    </p>

    {approvedBranchRequests.length === 0 ? (
      <div className="empty-state">
        <p>✅ No approved requests awaiting handover</p>
      </div>
    ) : (
      <table className="data-table">
        <thead>
          <tr>
            <th>Book Title</th>
            <th>Student</th>
            <th>USN</th>
            <th>Acc No.</th>
            <th>Approved Date</th>
            <th>Approved By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {approvedBranchRequests.map((request) => (
            <tr key={request.request_id}>
              <td>
                <strong>{request.title}</strong>
                {request.author && (
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    by {request.author}
                  </div>
                )}
              </td>
              <td>
                {request.student_first_name} {request.student_last_name}
                <div style={{ fontSize: '0.9em', color: '#666' }}>
                  @{request.student_username}
                </div>
                <div style={{ fontSize: '0.85em', color: '#888' }}>
                  📧 {request.student_email}
                </div>
              </td>
              <td>{request.student_usn}</td>
              <td>{request.acc_no}</td>
              <td>
                {new Date(request.approved_at).toLocaleDateString()}
                <div style={{ fontSize: '0.85em', color: '#888' }}>
                  {new Date(request.approved_at).toLocaleTimeString()}
                </div>
              </td>
              <td>
                Admin #{request.approved_by_admin}
              </td>
              <td>
                <button
                  className="action-btn success"
                  onClick={() => handleConfirmBranchHandover(request.request_id)}
                  title="Confirm that book has been handed over to student"
                  style={{
                    background: '#10b981',
                    fontWeight: 'bold'
                  }}
                >
                  ✅ Confirm Handover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}

    {approvedBranchRequests.length > 0 && (
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#fef3c7',
        borderRadius: '8px',
        border: '1px solid #f59e0b'
      }}>
        <strong>📝 Handover Checklist:</strong>
        <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Verify student identity (check USN)</li>
          <li>Physically hand over the book to the student</li>
          <li>Click "Confirm Handover" button above</li>
          <li>Book will be automatically assigned to student's "My Books"</li>
        </ol>
      </div>
    )}
  </div>
)}
```

---

## 4. COMPLETE WORKFLOW

After adding these sections, the complete workflow will be:

### Student Side:
1. Student clicks "Request Book" on a branch library book
2. Request submitted (Book still visible in "All Available Books")
3. Student waits for admin approval

### Admin Side:
4. Admin sees request in "Branch Book Requests" tab
5. Admin clicks "Approve" (Book still visible in "All Available Books")
6. Request moves to "Confirm Handover" tab
7. Admin physically gives book to student
8. Admin clicks "Confirm Handover"
9. **System automatically:**
   - Removes book from "All Available Books"
   - Creates entry in borrowed_books
   - Book appears in student's "My Books"
   - Book status changes to 'borrowed'

---

## 5. TESTING

After adding these sections:

1. Start your backend: `cd server && npm start`
2. Start your frontend: `npm run dev`
3. Login as student and request a book
4. Login as admin and approve the request
5. Confirm handover
6. Verify book appears in student's borrowed books

---

**All sections are ready to be added to your AdminDashboard.jsx file!**
