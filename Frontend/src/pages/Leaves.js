// src/pages/Leaves.js
import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/api';

const mono = { fontFamily: "'JetBrains Mono', monospace" };

const STATUS_MAP = {
  pending:  { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', label: 'Pending' },
  approved: { bg: 'rgba(16,185,129,0.12)', color: '#34d399', label: 'Approved' },
  rejected: { bg: 'rgba(244,63,94,0.1)',   color: '#fb7185', label: 'Rejected' },
};

function Pill({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', background: s.bg, color: s.color, fontSize: '11px', fontWeight: '600' }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {s.label}
    </span>
  );
}

export default function Leaves() {
  const [leaves,      setLeaves]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filterStat,  setFilterStat]  = useState('pending');
  const [actionId,    setActionId]    = useState(null);
  const [toast,       setToast]       = useState(null);

  // Reject reason modal
  const [rejectModal, setRejectModal] = useState(null); // leave object
  const [reason,      setReason]      = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/leaves/?ordering=-created_at';
      if (filterStat) url += `&status=${filterStat}`;
      const res = await api.get(url);
      setLeaves(res.data.results ?? res.data);
    } catch {
      showToast('Failed to load leaves.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterStat]);

  useEffect(() => { load(); }, [load]);

  // Approve
  const handleApprove = async (leave) => {
    try {
      setActionId(leave.id);
      await api.patch(`/leaves/${leave.id}/approve/`);
      showToast(`✅ Leave approved for ${leave.employee_name || 'employee'}`);
      load();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Cannot approve.', 'error');
    } finally {
      setActionId(null);
    }
  };

  // Reject with reason
  const openReject = (leave) => {
    setRejectModal(leave);
    setReason('');
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      setActionId(rejectModal.id);
      await api.patch(`/leaves/${rejectModal.id}/reject/`, { reason });
      showToast(`❌ Leave rejected for ${rejectModal.employee_name || 'employee'}`);
      setRejectModal(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Cannot reject.', 'error');
    } finally {
      setActionId(null);
    }
  };

  const counts = {
    all:      leaves.length,
    pending:  leaves.filter((l) => l.status === 'pending').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
  };

  return (
    <div style={css.root}>
      {toast && (
        <div style={{ ...css.toast,
          background: toast.type === 'error' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)',
          borderColor: toast.type === 'error' ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)',
          color: toast.type === 'error' ? '#fb7185' : '#34d399',
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={css.header}>
        <div>
          <div style={css.pageTitle}>Leave Records</div>
          <div style={css.pageSub}>Manage and approve employee leaves</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={css.tabs}>
        {[
          { key: 'pending',  label: 'Pending',  color: '#fbbf24' },
          { key: 'approved', label: 'Approved', color: '#34d399' },
          { key: 'rejected', label: 'Rejected', color: '#fb7185' },
          { key: '',         label: 'All',      color: '#60a5fa' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStat(tab.key)}
            style={{
              ...css.tab,
              background: filterStat === tab.key ? tab.color + '20' : 'transparent',
              color: filterStat === tab.key ? tab.color : '#475569',
              border: `1px solid ${filterStat === tab.key ? tab.color + '40' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            {tab.label}
            <span style={{
              marginLeft: '6px', padding: '1px 7px', borderRadius: '20px',
              background: filterStat === tab.key ? tab.color + '30' : 'rgba(255,255,255,0.05)',
              fontSize: '10px', fontWeight: '700', ...mono,
            }}>
              {tab.key === '' ? leaves.length : leaves.filter((l) => l.status === tab.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={css.tableCard}>
        <div style={{ overflowX: 'auto' }}>
          <table style={css.table}>
            <thead>
              <tr>
                {['Employee', 'Leave Type', 'From', 'To', 'Days', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={css.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={css.centerCell}>Loading…</td></tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={7} style={css.centerCell}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>
                    No {filterStat} leave requests.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => {
                  const days = leave.duration_days ||
                    (leave.start_date && leave.end_date
                      ? Math.ceil((new Date(leave.end_date) - new Date(leave.start_date)) / 86400000) + 1
                      : '—');
                  return (
                    <tr key={leave.id}
                      style={{ transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={css.td}>
                        <span style={{ fontWeight: '600', color: '#e2e8f0' }}>
                          {leave.employee_name || `#${leave.employee}`}
                        </span>
                      </td>
                      <td style={{ ...css.td, textTransform: 'capitalize' }}>{leave.leave_type}</td>
                      <td style={{ ...css.td, ...mono, fontSize: '11px' }}>{leave.start_date}</td>
                      <td style={{ ...css.td, ...mono, fontSize: '11px' }}>{leave.end_date}</td>
                      <td style={{ ...css.td, ...mono, fontSize: '11px', color: '#475569' }}>{days}</td>
                      <td style={css.td}><Pill status={leave.status} /></td>
                      <td style={css.td}>
                        {leave.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              style={css.approveBtn}
                              disabled={actionId === leave.id}
                              onClick={() => handleApprove(leave)}
                              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16,185,129,0.25)')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(16,185,129,0.12)')}
                            >
                              {actionId === leave.id ? '…' : '✓ Approve'}
                            </button>
                            <button
                              style={css.rejectBtn}
                              disabled={actionId === leave.id}
                              onClick={() => openReject(leave)}
                              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(244,63,94,0.2)')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(244,63,94,0.1)')}
                            >
                              ✕ Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#334155' }}>
                            {leave.status === 'approved' ? '✓ Done' : '✕ Done'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Reason Modal */}
      {rejectModal && (
        <div style={css.overlay} onClick={() => setRejectModal(null)}>
          <div style={css.modal} onClick={(e) => e.stopPropagation()}>
            <div style={css.modalHeader}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#f1f5f9' }}>Reject Leave Request</div>
              <span style={{ cursor: 'pointer', color: '#475569', fontSize: '18px' }}
                onClick={() => setRejectModal(null)}>✕</span>
            </div>

            <div style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                <strong style={{ color: '#f1f5f9' }}>{rejectModal.employee_name}</strong> — {rejectModal.leave_type} leave
              </div>
              <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', fontFamily: "'JetBrains Mono', monospace" }}>
                {rejectModal.start_date} → {rejectModal.end_date}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <label style={{ fontSize: '11.5px', fontWeight: '600', color: '#64748b' }}>
                Reason for Rejection <span style={{ color: '#475569', fontWeight: '400' }}>(optional)</span>
              </label>
              <textarea
                style={{ background: '#0d1018', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 12px', color: '#e2e8f0', fontFamily: "'Outfit', sans-serif", fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '90px' }}
                placeholder="e.g. Insufficient leave balance, project deadline…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={css.cancelBtn} onClick={() => setRejectModal(null)}>Cancel</button>
              <button
                style={{ ...css.rejectSubmitBtn, opacity: actionId ? 0.7 : 1 }}
                disabled={!!actionId}
                onClick={handleReject}
              >
                {actionId ? 'Rejecting…' : '✕ Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const css = {
  root: { flex: 1, overflowY: 'auto', background: '#0d1018', padding: '24px', fontFamily: "'Outfit', sans-serif", position: 'relative' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  pageTitle: { fontSize: '18px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '-0.3px' },
  pageSub: { fontSize: '12px', color: '#475569', marginTop: '3px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  tab: { padding: '7px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'all 0.15s' },
  tableCard: { background: '#13161f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: '10.5px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#1e293b', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' },
  td: { padding: '11px 16px', fontSize: '12.5px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  centerCell: { padding: '40px', textAlign: 'center', color: '#334155', fontSize: '13px' },
  approveBtn: { padding: '4px 11px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', border: 'none', background: 'rgba(16,185,129,0.12)', color: '#34d399', transition: 'background 0.15s' },
  rejectBtn: { padding: '4px 11px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', border: 'none', background: 'rgba(244,63,94,0.1)', color: '#fb7185', transition: 'background 0.15s' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modal: { background: '#13161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 50px rgba(0,0,0,0.6)' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
  cancelBtn: { flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" },
  rejectSubmitBtn: { flex: 2, padding: '10px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#f43f5e,#dc2626)', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" },
  toast: { position: 'fixed', top: '20px', right: '20px', padding: '12px 20px', borderRadius: '10px', border: '1px solid', fontSize: '13px', fontWeight: '600', zIndex: 2000 },
};
