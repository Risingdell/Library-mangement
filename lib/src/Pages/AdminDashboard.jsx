import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import BookLoader from '../Components/BookLoader';
import { useSnackbar } from '../Context/SnackbarContext';
import { useTheme } from '../Context/ThemeContext';
import jwtService from '../services/jwtService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const { showSnackbar, showConfirmSnackbar } = useSnackbar();
  const { theme, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [pendingReturns, setPendingReturns] = useState([]);
  const [borrowingHistory, setBorrowingHistory] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const initialFormState = {
    acc_no: '',
    author: '',
    date: '',
    donated_by: '',
    sl_no: '',
    status: 'available',
    title: ''
  };
  const [form, setForm] = useState(initialFormState);
  const [marketplaceForm, setMarketplaceForm] = useState({
    type: '',
    title: '',
    author: '',
    description: '',
    acc_no: '',
    contact: 'admin@library.com'
  });
  const [uploadStatusMessage, setUploadStatusMessage] = useState('');
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [branchBookRequests, setBranchBookRequests] = useState([]);
  const [approvedBranchRequests, setApprovedBranchRequests] = useState([]);

  // Fetch admin on load
  useEffect(() => {
    console.log('📊 AdminDashboard mounting...');
    // JWT interceptor already set up in main.jsx - don't call again!

    const fetchAdmin = async () => {
      console.log('📊 fetchAdmin function called');

      // Check if token exists
      const hasToken = jwtService.isAuthenticated();
      console.log('✅ Token exists:', hasToken);
      if (!hasToken) {
        console.error('❌ No token found - redirecting to login');
        window.location.href = '/admin-login';
        return;
      }

      console.log('📋 Token value:', jwtService.getToken()?.substring(0, 50) + '...');

      // Minimum 5 seconds loading time for book animation
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 5000));

      try {
        console.log('🔄 [DASHBOARD] Fetching admin profile from /api/admin/me');
        const [res] = await Promise.all([
          axios.get(`${API_URL}/api/admin/me`),
          minLoadingTime
        ]);

        console.log('✅ [DASHBOARD] Admin data received:', res.data);

        if (res.data && res.data.id) {
          setAdmin(res.data);
          console.log('✅ [DASHBOARD] Admin dashboard loaded successfully');
        } else {
          console.error('❌ [DASHBOARD] Admin data format unexpected:', res.data);
          setAdmin(null);
          window.location.href = '/admin-login';
        }
      } catch (err) {
        console.error('❌ [DASHBOARD] Failed to fetch admin profile');
        console.error('   Status:', err.response?.status);
        console.error('   Data:', err.response?.data);
        console.error('   Message:', err.message);
        // Clear token on auth failure
        jwtService.clearToken();
        // Wait for animation to complete before redirecting
        await minLoadingTime;
        window.location.href = '/admin-login';
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  // Fetch borrowed, expired books, pending returns, history, pending users, or members based on tab
  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      try {
        let res;
        if (activeTab === 'borrowed') {
          res = await axios.get(`${API_URL}/api/admin/borrowed-books`);
          if (res) setBorrowedBooks(res.data);
        } else if (activeTab === 'expired') {
          res = await axios.get(`${API_URL}/api/admin/expired-books`);
          if (res) setBorrowedBooks(res.data);
        } else if (activeTab === 'pending-returns') {
          res = await axios.get(`${API_URL}/api/admin/pending-returns`);
          if (res) setPendingReturns(res.data);
        } else if (activeTab === 'history') {
          res = await axios.get(`${API_URL}/api/admin/borrowing-history`);
          if (res) setBorrowingHistory(res.data);
        } else if (activeTab === 'registration-requests') {
          res = await axios.get(`${API_URL}/api/admin/pending-users`);
          if (res) setPendingUsers(res.data);
        } else if (activeTab === 'members') {
          res = await axios.get(`${API_URL}/api/admin/members`);
          if (res) setMembers(res.data);
        } else if (activeTab === 'purchase-requests') {
          res = await axios.get(`${API_URL}/api/admin/purchase-requests`);
          if (res) setPurchaseRequests(res.data);
        } else if (activeTab === 'branch-book-requests') {
          res = await axios.get(`${API_URL}/api/admin/branch-books/pending-requests`);
          if (res) setBranchBookRequests(res.data);
        } else if (activeTab === 'branch-book-handover') {
          res = await axios.get(`${API_URL}/api/admin/branch-books/approved-requests`);
          if (res) setApprovedBranchRequests(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err.response?.data?.message || err.message);
      }
    };

    if (activeTab === 'borrowed' || activeTab === 'expired' || activeTab === 'pending-returns' || activeTab === 'history' || activeTab === 'registration-requests' || activeTab === 'members' || activeTab === 'purchase-requests' || activeTab === 'branch-book-requests' || activeTab === 'branch-book-handover') {
      fetchBorrowedBooks();
    }
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/admin/add-book`, form);
      showSnackbar('success', 'Book added successfully!');
      setForm(initialFormState);
    } catch (err) {
      console.error(err);
      showSnackbar('error', err.response?.data?.message || 'Error adding book');
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    setAdmin(null);
    sessionStorage.removeItem('admin');
    // Clear JWT tokens
    jwtService.clearTokens();
    window.location.href = '/admin-login';
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Collapse sidebar only on mobile (screen width <= 768px)
    if (window.innerWidth <= 768) {
      setSidebarCollapsed(true);
    }
  };

  const handleApproveReturn = async (borrowId) => {
    showConfirmSnackbar(
      'Are you sure you want to approve this book return?',
      async () => {
        try {
          const res = await axios.post(
            `${API_URL}/api/admin/approve-return`,
            { borrow_id: borrowId }
          );
          showSnackbar('success', res.data.message);
          // Refresh pending returns list
          const updatedRes = await axios.get(`${API_URL}/api/admin/pending-returns`);
          setPendingReturns(updatedRes.data);
        } catch (err) {
          console.error('Approve failed:', err);
          showSnackbar('error', err.response?.data?.message || 'Failed to approve return');
        }
      },
      'success'
    );
  };

  const handleRejectReturn = async (borrowId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason || reason.trim() === '') {
      showSnackbar('warning', 'Rejection reason is required');
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/admin/reject-return`,
        { borrow_id: borrowId, reason: reason.trim() },
              );
      showSnackbar('success', res.data.message);
      // Refresh pending returns list
      const updatedRes = await axios.get(`${API_URL}/api/admin/pending-returns`);
      setPendingReturns(updatedRes.data);
    } catch (err) {
      console.error('Reject failed:', err);
      showSnackbar('error', err.response?.data?.message || 'Failed to reject return');
    }
  };

  const handleApproveUser = async (userId) => {
    showConfirmSnackbar(
      'Are you sure you want to approve this user registration?',
      async () => {
        try {
          const res = await axios.post(
            `${API_URL}/api/admin/approve-user`,
            { user_id: userId },
                      );
          showSnackbar('success', res.data.message);
          // Refresh pending users list
          const updatedRes = await axios.get(`${API_URL}/api/admin/pending-users`);
          setPendingUsers(updatedRes.data);
        } catch (err) {
          console.error('Approve failed:', err);
          showSnackbar('error', err.response?.data?.message || 'Failed to approve user');
        }
      },
      'success'
    );
  };

  const handleRejectUser = async (userId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason || reason.trim() === '') {
      showSnackbar('warning', 'Rejection reason is required');
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/admin/reject-user`,
        { user_id: userId, reason: reason.trim() },
              );
      showSnackbar('success', res.data.message);
      // Refresh pending users list
      const updatedRes = await axios.get(`${API_URL}/api/admin/pending-users`);
      setPendingUsers(updatedRes.data);
    } catch (err) {
      console.error('Reject failed:', err);
      showSnackbar('error', err.response?.data?.message || 'Failed to reject user');
    }
  };

  const handleConfirmBookReceived = async (requestId) => {
    showConfirmSnackbar(
      'Confirm that the student has physically received this book?',
      async () => {
        try {
          const res = await axios.post(
            `${API_URL}/api/admin/confirm-book-received`,
            { request_id: requestId },
                      );
          showSnackbar('success', res.data.message);
          // Refresh purchase requests list
          const updatedRes = await axios.get(`${API_URL}/api/admin/purchase-requests`);
          setPurchaseRequests(updatedRes.data);
        } catch (err) {
          console.error('Confirm failed:', err);
          showSnackbar('error', err.response?.data?.message || 'Failed to confirm book handover');
        }
      },
      'success'
    );
  };

  const handleRejectPurchaseRequest = async (requestId) => {
    const reason = prompt('Enter rejection reason (optional):');

    try {
      const res = await axios.post(
        `${API_URL}/api/admin/reject-purchase-request`,
        { request_id: requestId, rejection_reason: reason },
              );
      showSnackbar('success', res.data.message);
      // Refresh purchase requests list
      const updatedRes = await axios.get(`${API_URL}/api/admin/purchase-requests`);
      setPurchaseRequests(updatedRes.data);
    } catch (err) {
      console.error('Reject failed:', err);
      showSnackbar('error', err.response?.data?.message || 'Failed to reject purchase request');
    }
  };

  // Branch Book Request Handlers
  const handleApproveBranchRequest = async (requestId) => {
    showConfirmSnackbar(
      'Approve this branch book request?',
      async () => {
        try {
          const res = await axios.post(
            `${API_URL}/api/admin/branch-books/approve`,
            { request_id: requestId },
                      );
          showSnackbar('success', res.data.message || 'Request approved successfully');
          // Refresh all three lists in parallel
          const [updatedRes, branchRes, approvedRes] = await Promise.all([
            axios.get(`${API_URL}/api/admin/purchase-requests`),
            axios.get(`${API_URL}/api/admin/branch-books/pending-requests`),
            axios.get(`${API_URL}/api/admin/branch-books/approved-requests`),
          ]);
          setPurchaseRequests(updatedRes.data);
          setBranchBookRequests(branchRes.data);
          setApprovedBranchRequests(approvedRes.data);
        } catch (err) {
          console.error('Approve failed:', err);
          showSnackbar('error', err.response?.data?.message || 'Failed to approve request');
        }
      },
      'success'
    );
  };

  const handleRejectBranchRequest = async (requestId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) {
      showSnackbar('warning', 'Rejection cancelled - reason is required');
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/admin/branch-books/reject`,
        { request_id: requestId, rejection_reason: reason },
              );
      showSnackbar('success', res.data.message || 'Request rejected successfully');
      // Refresh purchase requests list (since it now shows library requests)
      const updatedRes = await axios.get(`${API_URL}/api/admin/purchase-requests`);
      setPurchaseRequests(updatedRes.data);
      // Also refresh branch book requests for other tabs
      const branchRes = await axios.get(`${API_URL}/api/admin/branch-books/pending-requests`);
      setBranchBookRequests(branchRes.data);
    } catch (err) {
      console.error('Reject failed:', err);
      showSnackbar('error', err.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleConfirmBranchHandover = async (requestId) => {
    showConfirmSnackbar(
      'Confirm that you have physically handed over this book to the student?',
      async () => {
        try {
          const res = await axios.post(
            `${API_URL}/api/admin/branch-books/confirm-handover`,
            { request_id: requestId },
                      );
          showSnackbar('success', res.data.message || 'Handover confirmed! Book assigned to student.');
          // Refresh purchase requests list
          const purchaseRes = await axios.get(`${API_URL}/api/admin/purchase-requests`);
          setPurchaseRequests(purchaseRes.data);
          // Also refresh approved requests list
          const updatedRes = await axios.get(`${API_URL}/api/admin/branch-books/approved-requests`);
          setApprovedBranchRequests(updatedRes.data);
        } catch (err) {
          console.error('Confirm handover failed:', err);
          showSnackbar('error', err.response?.data?.message || 'Failed to confirm handover');
        }
      },
      'success'
    );
  };

  if (loading) {
    return <BookLoader message="Loading admin dashboard..." />;
  }

  if (!admin) {
    // This should never be reached as we redirect in useEffect
    //Dhanush M-2026-22-2
    //git check1
    return null;
  }

  return (
    <div className="main-page">
      <div className={`sidebar-overlay ${!sidebarCollapsed ? 'active' : ''}`} onClick={toggleSidebar}></div>

      {/* Maximize button when sidebar is collapsed */}
      {sidebarCollapsed && (
        <button className="maximize-btn" onClick={toggleSidebar} aria-label="Expand sidebar">
          <span className="nav-icon">☰</span>
        </button>
      )}
      <div className={`user-sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
        <button className="sidebar-toggle" onClick={toggleSidebar} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {sidebarCollapsed ? '☰' : '✕'}
        </button>

        <div className="admin-profile">
          <div className="admin-avatar">
            👤
          </div>
          <h3 className="admin-name">{admin.name || 'Admin User'}</h3>
          <p className="admin-username">@{admin.username}</p>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item${activeTab === 'profile' ? ' active' : ''}`} onClick={() => handleTabChange('profile')}>
            <span className="nav-icon">
              <img src="/home3-more.svg" alt="Home" style={{ width: '20px', height: '20px' }} />
            </span>
            <span className="nav-text">Profile</span>
          </button>
          <button className={`nav-item${activeTab === 'registration-requests' ? ' active' : ''}`} onClick={() => handleTabChange('registration-requests')}>
            <span className="nav-icon">
              <img src="/requests.svg" alt="Registration Requests" style={{ width: '20px', height: '20px' }} />
            </span>
            <span className="nav-text">Registration Requests</span>
          </button>
          <button className={`nav-item${activeTab === 'members' ? ' active' : ''}`} onClick={() => handleTabChange('members')}>
            <span className="nav-icon">
              <img src="/members.svg" alt="Members" style={{ width: '20px', height: '20px' }} />
            </span>
            <span className="nav-text">Members</span>
          </button>
          <button className={`nav-item${activeTab === 'borrowed' ? ' active' : ''}`} onClick={() => handleTabChange('borrowed')}>
            <span className="nav-icon">
              <img src="/ph--books-thin.svg" alt="Borrowed Books" style={{ width: '20px', height: '20px' }} />
            </span>
            <span className="nav-text">Borrowed Books</span>
          </button>
          <button className={`nav-item${activeTab === 'expired' ? ' active' : ''}`} onClick={() => handleTabChange('expired')}>
            <span className="nav-icon">
              <img src="/expired.svg" alt="Expired Books" style={{ width: '20px', height: '20px' }} />
            </span>
            <span className="nav-text">Expired Books</span>
          </button>
          <button className={`nav-item${activeTab === 'pending-returns' ? ' active' : ''}`} onClick={() => handleTabChange('pending-returns')}>
            <span className="nav-icon">
              <img src="/pending.svg" alt="Pending Returns" style={{ width: '20px', height: '20px' }} />
            </span>
            <span className="nav-text">Pending Returns</span>
          </button>
          <button className={`nav-item${activeTab === 'history' ? ' active' : ''}`} onClick={() => handleTabChange('history')}>
            <span className="nav-icon">
              <img src="/clarity--history-line.svg" alt="Borrowing History" style={{ width: '20px', height: '20px' }} />
            </span>
            <span className="nav-text">Borrowing History</span>
          </button>
          <button className={`nav-item${activeTab === 'purchase-requests' ? ' active' : ''}`} onClick={() => handleTabChange('purchase-requests')}>
            <span className="nav-icon">
              📦
            </span>
            <span className="nav-text">Book Purchase Requests</span>
          </button>
          <button className={`nav-item${activeTab === 'branch-book-requests' ? ' active' : ''}`} onClick={() => handleTabChange('branch-book-requests')}>
            <span className="nav-icon">📋</span>
            <span className="nav-text">Branch Book Requests</span>
            {branchBookRequests.length > 0 && (
              <span className="badge">{branchBookRequests.length}</span>
            )}
          </button>
          <button className={`nav-item${activeTab === 'branch-book-handover' ? ' active' : ''}`} onClick={() => handleTabChange('branch-book-handover')}>
            <span className="nav-icon">📖</span>
            <span className="nav-text">Confirm Handover</span>
            {approvedBranchRequests.length > 0 && (
              <span className="badge">{approvedBranchRequests.length}</span>
            )}
          </button>
          <button className={`nav-item${activeTab === 'add' ? ' active' : ''}`} onClick={() => handleTabChange('add')}>
            <span className="nav-icon">
              <img src="/add.svg" alt="Add Books" style={{ width: '20px', height: '20px' }} />
            </span>
            <span className="nav-text">Add Books</span>
          </button>
          <button className={`nav-item${activeTab === 'marketplace-upload' ? ' active' : ''}`} onClick={() => handleTabChange('marketplace-upload')}>
            <span className="nav-icon">
              📥
            </span>
            <span className="nav-text">Upload Soft Copy Books</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item theme-toggle-btn" onClick={toggleTheme} title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
            <span className="nav-icon" key={theme}>{theme === 'light' ? '🌙' : '☀️'}</span>
            <span className="nav-text">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon">
              <img src="/logout.svg" alt="Logout" style={{ width: '20px', height: '20px' }} />
            </span>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>
      <div className="main-content">
        <header className="mobile-header">
          <button className="mobile-menu-btn" onClick={toggleSidebar} aria-label="Toggle menu">
            ☰
          </button>
          <h1 className="page-title">
            {activeTab === 'profile' && 'Admin Profile'}
            {activeTab === 'registration-requests' && 'Registration Requests'}
            {activeTab === 'members' && 'Members'}
            {activeTab === 'borrowed' && 'Borrowed Books'}
            {activeTab === 'expired' && 'Expired Books'}
            {activeTab === 'pending-returns' && 'Pending Returns'}
            {activeTab === 'history' && 'Borrowing History'}
            {activeTab === 'purchase-requests' && 'Book Purchase Requests'}
            {activeTab === 'branch-book-requests' && 'Branch Book Requests (Pending Approval)'}
            {activeTab === 'branch-book-handover' && 'Confirm Book Handover'}
            {activeTab === 'add' && 'Add Books'}
            {activeTab === 'marketplace-upload' && 'Upload Soft Copy Books to Marketplace'}
          </h1>
          {/* Search bar in header */}
          {(activeTab === 'members' || activeTab === 'history') && (
            <div className="header-search">
              <input
                type="text"
                placeholder={activeTab === 'members' ? 'Search members...' : 'Search borrowing history...'}
                value={activeTab === 'members' ? memberSearchQuery : historySearchQuery}
                onChange={(e) => activeTab === 'members' ? setMemberSearchQuery(e.target.value) : setHistorySearchQuery(e.target.value)}
                className="header-search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
          )}
        </header>
        <div className="content-area">
          {activeTab === 'profile' && (
            <div className="dashboard-content">
              <h2 className="section-title">Admin Profile</h2>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '40px',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                borderRadius: '12px',
                marginTop: '20px'
              }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '48px',
                  marginBottom: '20px',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                }}>
                  👤
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#2d3748', margin: '0 0 8px' }}>
                  {admin.name || 'Admin User'}
                </h3>
                <p style={{ fontSize: '16px', color: '#718096', margin: '0 0 24px' }}>
                  @{admin.username}
                </p>
                <div style={{
                  background: 'white',
                  padding: '20px 40px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <p style={{ margin: '8px 0', fontSize: '16px', color: '#4a5568' }}>
                    <strong>Admin ID:</strong> {admin.id}
                  </p>
                  <p style={{ margin: '8px 0', fontSize: '16px', color: '#4a5568' }}>
                    <strong>Role:</strong> System Administrator
                  </p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'registration-requests' && (
            <div className="dashboard-content">
              <h2 className="section-title">Registration Requests ({pendingUsers.length})</h2>
              {pendingUsers.length === 0 ? (
                <p>No pending registration requests.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Username</th>
                      <th>USN</th>
                      <th>Email</th>
                      <th>Registered On</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.username}</td>
                        <td>{user.usn}</td>
                        <td>{user.email}</td>
                        <td>{new Date(user.registered_at).toLocaleDateString()}</td>
                        <td>
                          <span className="status-badge status-pending">
                            {user.approval_status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="approve-btn"
                            onClick={() => handleApproveUser(user.id)}
                          >
                            ✅ Approve
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => handleRejectUser(user.id)}
                          >
                            ❌ Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {activeTab === 'members' && (() => {
            // Filter members based on search query
            const filteredMembers = members.filter(member => {
              if (!memberSearchQuery) return true;
              const query = memberSearchQuery.toLowerCase();
              return (
                member.firstName?.toLowerCase().includes(query) ||
                member.lastName?.toLowerCase().includes(query) ||
                member.username?.toLowerCase().includes(query) ||
                String(member.usn || '').toLowerCase().includes(query) ||
                member.email?.toLowerCase().includes(query) ||
                String(member.id || '').includes(query)
              );
            });

            return (
              <div className="dashboard-content">
                <h2 className="section-title">All Members ({members.length})</h2>

                {/* Search Bar */}
                <div style={{
                  marginBottom: '20px',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center'
                }}>
                  <div style={{
                    flex: 1,
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '18px'
                    }}>🔍</span>
                    <input
                      type="text"
                      placeholder="Search members by name, username, USN, email, or ID..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 12px 12px 40px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                  {memberSearchQuery && (
                    <button
                      onClick={() => setMemberSearchQuery('')}
                      style={{
                        padding: '12px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#ef4444',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                      onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {filteredMembers.length === 0 ? (
                  <p>{memberSearchQuery ? `No members found matching "${memberSearchQuery}"` : 'No members found.'}</p>
                ) : (
                  <table>
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Username</th>
                      <th>USN</th>
                      <th>Email</th>
                      <th>Registered On</th>
                      <th>Approved On</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((member) => (
                      <tr key={member.id}>
                        <td>{member.id}</td>
                        <td>{member.firstName} {member.lastName}</td>
                        <td>{member.username}</td>
                        <td>{member.usn}</td>
                        <td>{member.email}</td>
                        <td>{new Date(member.registered_at).toLocaleDateString()}</td>
                        <td>
                          {member.approved_at
                            ? new Date(member.approved_at).toLocaleDateString()
                            : '-'}
                        </td>
                        <td>
                          <span className={`status-badge status-${member.approval_status}`}>
                            {member.approval_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>
            );
          })()}
          {activeTab === 'borrowed' && (
            <div className="dashboard-content">
              <h2 className="section-title">Borrowed Books</h2>
              {borrowedBooks.length === 0 ? (
                <p>No borrowed books.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Borrow ID</th>
                      <th>Book Title</th>
                      <th>Author</th>
                      <th>Borrower Name</th>
                      <th>Username</th>
                      <th>Borrow Date</th>
                      <th>Expiry Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowedBooks.map((entry) => (
                      <tr key={entry.borrow_id}>
                        <td>{entry.borrow_id}</td>
                        <td>{entry.book_title}</td>
                        <td>{entry.author}</td>
<td>{entry.borrower_name}</td>
<td>{entry.username}</td>
                        <td>{new Date(entry.borrow_date).toLocaleDateString()}</td>
                        <td>{new Date(entry.expiry_date).toLocaleDateString()}</td>
                        <td>{entry.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {activeTab === 'expired' && (
            <div className="dashboard-content">
              <h2 className="section-title">Expired Borrowed Books</h2>
              {borrowedBooks.length === 0 ? (
                <p>No expired borrowed books found.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Book Title</th>
                      <th>Author</th>
                      <th>Borrower</th>
                      <th>Username</th>
                      <th>Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowedBooks.map((book, index) => (
                      <tr key={index}>
                        <td>{book.book_title}</td>
                        <td>{book.book_author}</td>
<td>{book.borrower_username}</td>
<td>{book.borrower_username}</td>
                        <td>{new Date(book.expiry_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {activeTab === 'pending-returns' && (
            <div className="dashboard-content">
              <h2 className="section-title">Pending Book Returns ({pendingReturns.length})</h2>
              {pendingReturns.length === 0 ? (
                <p>No pending return requests.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Book Title</th>
                      <th>Author</th>
                      <th>Acc No</th>
                      <th>Borrower</th>
                      <th>Username</th>
                      <th>Borrowed On</th>
                      <th>Submitted On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingReturns.map((item) => (
                      <tr key={item.borrow_id}>
                        <td>{item.book_title}</td>
                        <td>{item.book_author}</td>
                        <td>{item.acc_no}</td>
                        <td>{item.borrower_name}</td>
                        <td>{item.borrower_username}</td>
                        <td>{new Date(item.borrow_date).toLocaleDateString()}</td>
                        <td>{new Date(item.returned_at).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="approve-btn"
                            onClick={() => handleApproveReturn(item.borrow_id)}
                          >
                            ✅ Approve
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => handleRejectReturn(item.borrow_id)}
                          >
                            ❌ Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {activeTab === 'history' && (() => {
            // Filter borrowing history based on search query
            const filteredHistory = borrowingHistory.filter(item => {
              if (!historySearchQuery) return true;
              const query = historySearchQuery.toLowerCase();
              return (
                item.book_title?.toLowerCase().includes(query) ||
                item.author?.toLowerCase().includes(query) ||
                String(item.acc_no || '').toLowerCase().includes(query) ||
                item.borrower_name?.toLowerCase().includes(query) ||
                item.username?.toLowerCase().includes(query) ||
                String(item.borrow_id || '').includes(query)
              );
            });

            return (
              <div className="dashboard-content">
                <h2 className="section-title">Complete Borrowing History ({borrowingHistory.length})</h2>
                {filteredHistory.length === 0 ? (
                  <p>{historySearchQuery ? `No records found matching "${historySearchQuery}"` : 'No borrowing records found.'}</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Borrow ID</th>
                        <th>Book Title</th>
                        <th>Author</th>
                        <th>Acc No</th>
                        <th>Borrower</th>
                        <th>Username</th>
                        <th>Borrowed On</th>
                        <th>Expiry Date</th>
                        <th>Returned On</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((item) => (
                      <tr key={item.borrow_id}>
                        <td>{item.borrow_id}</td>
                        <td>{item.book_title}</td>
                        <td>{item.author}</td>
                        <td>{item.acc_no}</td>
                        <td>{item.borrower_name}</td>
                        <td>{item.username}</td>
                        <td>{new Date(item.borrow_date).toLocaleDateString()}</td>
                        <td>{new Date(item.expiry_date).toLocaleDateString()}</td>
                        <td>
                          {item.returned_at
                            ? new Date(item.returned_at).toLocaleDateString()
                            : '-'}
                        </td>
                        <td>
                          <span className={`status-badge status-${item.return_status}`}>
                            {item.status_display}
                          </span>
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })()}
          {activeTab === 'add' && (
            <div className="dashboard-content">
              <h2 className="section-title">Add New Book</h2>
              <form onSubmit={handleSubmit}>
                <label>
                  Acc No:
                  <input type="number" name="acc_no" value={form.acc_no} onChange={handleChange} required />
                </label>
                <label>
                  Author:
                  <input type="text" name="author" value={form.author} onChange={handleChange} required />
                </label>
                <label>
                  Title:
                  <input type="text" name="title" value={form.title} onChange={handleChange} required />
                </label>
                <label>
                  Serial No:
                  <input type="number" name="sl_no" value={form.sl_no} onChange={handleChange} required />
                </label>
                <label>
                  Date:
                  <input type="date" name="date" value={form.date} onChange={handleChange} />
                </label>
                <label>
                  Donated By:
                  <input type="text" name="donated_by" value={form.donated_by} onChange={handleChange} />
                </label>
                <label>
                  Status:
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="available">Available</option>
                    <option value="borrowed">Borrowed</option>
                  </select>
                </label>
                <button type="submit">Add Book</button>
              </form>
            </div>
          )}

          {activeTab === 'purchase-requests' && (
            <div className="dashboard-content">
              <h2 className="section-title">Book Requests ({purchaseRequests.length})</h2>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                Approve or reject student requests for library books. Approved requests move to <strong>Confirm Handover</strong>.
              </p>

              {purchaseRequests.length === 0 ? (
                <div className="empty-state">
                  <p>✅ No pending book requests</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Book Title</th>
                      <th>Acc No.</th>
                      <th>Student</th>
                      <th>USN</th>
                      <th>Requested On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseRequests.map((request) => (
                      <tr key={request.request_id}>
                        <td>
                          <strong>{request.title}</strong>
                          {request.author && (
                            <div style={{ fontSize: '0.9em', color: '#666' }}>by {request.author}</div>
                          )}
                        </td>
                        <td>{request.acc_no}</td>
                        <td>
                          {request.student_first_name} {request.student_last_name}
                          <div style={{ fontSize: '0.9em', color: '#666' }}>@{request.student_username}</div>
                        </td>
                        <td>{request.student_usn}</td>
                        <td>
                          {new Date(request.requested_at).toLocaleDateString()}
                          <div style={{ fontSize: '0.85em', color: '#888' }}>
                            {new Date(request.requested_at).toLocaleTimeString()}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9em'
                              }}
                              onClick={() => handleApproveBranchRequest(request.request_id)}
                            >
                              ✅ Approve
                            </button>
                            <button
                              style={{
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9em'
                              }}
                              onClick={() => handleRejectBranchRequest(request.request_id)}
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

          {activeTab === 'marketplace-upload' && (
            <div className="dashboard-content">
              <h2 className="section-title">Upload Soft Copy Book to Marketplace</h2>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                Upload digital books (PDF, DOCX, etc.) that will be available for instant download by all students.
              </p>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);

                // Validate file upload
                if (!formData.get('bookFile')?.name) {
                  setUploadStatusMessage('❌ Please select a file to upload.');
                  return;
                }

                // Add book_format as soft_copy
                formData.set('book_format', 'soft_copy');

                const url = API_URL + '/sell-book';
                axios.post(url, formData, {
                  headers: {
                    'Content-Type': 'multipart/form-data'
                  }
                })
                  .then(() => {
                    setUploadStatusMessage('✅ Soft copy book uploaded successfully and available to all students!');
                    e.target.reset();
                    setMarketplaceForm({
                      type: '',
                      title: '',
                      author: '',
                      description: '',
                      acc_no: '',
                      contact: 'admin@library.com'
                    });
                  })
                  .catch((err) => {
                    const errorMsg = err.response?.data?.message || 'Failed to upload. Try again.';
                    setUploadStatusMessage('❌ ' + errorMsg);
                  });
              }}>
                <label>
                  Upload File (PDF, DOCX, EPUB, TXT):
                  <input
                    type="file"
                    name="bookFile"
                    accept=".pdf,.doc,.docx,.epub,.txt"
                    required
                  />
                  <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
                    Maximum file size: 50MB
                  </small>
                </label>

                <label>
                  Type of Material:
                  <select
                    name="type"
                    value={marketplaceForm.type}
                    onChange={(e) => setMarketplaceForm({ ...marketplaceForm, type: e.target.value })}
                    required
                  >
                    <option value="">-- Select Type --</option>
                    <option value="Notes">Notes</option>
                    <option value="Xerox">Xerox</option>
                    <option value="Textbook">Textbook</option>
                    <option value="question-Paper">Question Papers</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label>
                  Title:
                  <input
                    type="text"
                    name="title"
                    value={marketplaceForm.title}
                    onChange={(e) => setMarketplaceForm({ ...marketplaceForm, title: e.target.value })}
                    placeholder="e.g., Engineering Math Notes"
                    required
                  />
                </label>

                <label>
                  Author:
                  <input
                    type="text"
                    name="author"
                    value={marketplaceForm.author}
                    onChange={(e) => setMarketplaceForm({ ...marketplaceForm, author: e.target.value })}
                    placeholder="e.g., B.S. Grewal"
                  />
                </label>

                <label>
                  Description:
                  <textarea
                    name="description"
                    value={marketplaceForm.description}
                    onChange={(e) => setMarketplaceForm({ ...marketplaceForm, description: e.target.value })}
                    rows="5"
                    placeholder="Provide details like modules, schema, subject coverage, etc."
                    required
                  />
                </label>

                <label>
                  Accession Number / Identifier:
                  <input
                    type="text"
                    name="acc_no"
                    value={marketplaceForm.acc_no}
                    onChange={(e) => setMarketplaceForm({ ...marketplaceForm, acc_no: e.target.value })}
                    placeholder="Optional unique code or ID"
                  />
                </label>

                <input type="hidden" name="contact" value="admin@library.com" />
                <input type="hidden" name="status" value="available" />

                <button type="submit" style={{ marginTop: '10px' }}>
                  📥 Upload to Marketplace
                </button>

                {uploadStatusMessage && (
                  <p style={{
                    marginTop: '15px',
                    padding: '10px',
                    borderRadius: '5px',
                    backgroundColor: uploadStatusMessage.startsWith('✅') ? '#d4edda' : '#f8d7da',
                    color: uploadStatusMessage.startsWith('✅') ? '#155724' : '#721c24',
                    border: `1px solid ${uploadStatusMessage.startsWith('✅') ? '#c3e6cb' : '#f5c6cb'}`
                  }}>
                    {uploadStatusMessage}
                  </p>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


//addedadmin-api fixed