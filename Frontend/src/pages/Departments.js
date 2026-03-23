// src/pages/Departments.js
import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/api';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [editData,    setEditData]    = useState(null); // null = add, obj = edit
  const [submitting,  setSubmitting]  = useState(false);
  const [deleteId,    setDeleteId]    = useState(null);
  const [toast,       setToast]       = useState(null);
  const [form,        setForm]        = useState({ name: '', description: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments/');
      setDepartments(res.data.results ?? res.data);
    } catch {
      showToast('Failed to load departments.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditData(null);
    setForm({ name: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (dept) => {
    setEditData(dept);
    setForm({ name: dept.name, description: dept.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast('Department name required.', 'error'); return; }
    try {
      setSubmitting(true);
      if (editData) {
        await api.put(`/departments/${editData.id}/`, form);
        showToast('Department updated! ✅');
      } else {
        await api.post('/departments/', form);
        showToast('Department added! ✅');
      }
      setShowModal(false);
      load();
    } catch {
      showToast('Operation failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" department?`)) return;
    try {
      setDeleteId(id);
      await api.delete(`/departments/${id}/`);
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      showToast('Department deleted. 🗑️');
    } catch {
      showToast('Cannot delete — employees may be assigned.', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ec4899','#14b8a6'];

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
          <div style={css.pageTitle}>Departments</div>
          <div style={css.pageSub}>{departments.length} departments</div>
        </div>
        <button style={css.addBtn} onClick={openAdd}>+ Add Department</button>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={css.center}>Loading…</div>
      ) : departments.length === 0 ? (
        <div style={css.center}>No departments found.</div>
      ) : (
        <div style={css.grid}>
          {departments.map((dept, i) => (
            <div key={dept.id} style={css.card}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = COLORS[i % COLORS.length] + '50')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
            >
              {/* Color bar */}
              <div style={{ height: '3px', background: COLORS[i % COLORS.length], borderRadius: '3px 3px 0 0', margin: '-20px -20px 16px' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  background: COLORS[i % COLORS.length] + '20',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px',
                }}>🏢</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9' }}>{dept.name}</div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                    {dept.employee_count ?? 0} active employees
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '16px', minHeight: '36px' }}>
                {dept.description || 'No description provided.'}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={css.editBtn} onClick={() => openEdit(dept)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(59,130,246,0.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(59,130,246,0.1)')}>
                  ✏️ Edit
                </button>
                <button style={css.deleteBtn}
                  disabled={deleteId === dept.id}
                  onClick={() => handleDelete(dept.id, dept.name)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(244,63,94,0.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(244,63,94,0.1)')}>
                  {deleteId === dept.id ? '…' : '🗑 Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={css.overlay} onClick={() => setShowModal(false)}>
          <div style={css.modal} onClick={(e) => e.stopPropagation()}>
            <div style={css.modalHeader}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#f1f5f9' }}>
                {editData ? 'Edit Department' : 'Add Department'}
              </div>
              <span style={{ cursor: 'pointer', color: '#475569', fontSize: '18px' }}
                onClick={() => setShowModal(false)}>✕</span>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={css.label}>Department Name <span style={{ color: '#fb7185' }}>*</span></label>
                <input style={css.input} value={form.name} placeholder="e.g. Engineering"
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={css.label}>Description</label>
                <textarea style={{ ...css.input, resize: 'vertical', minHeight: '80px' }}
                  value={form.description} placeholder="Brief description…"
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button type="button" style={css.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={{ ...css.submitBtn, opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
                  {submitting ? 'Saving…' : editData ? '✓ Update' : '+ Add Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const css = {
  root: { flex: 1, overflowY: 'auto', background: '#0d1018', padding: '24px', fontFamily: "'Outfit', sans-serif", position: 'relative' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
  pageTitle: { fontSize: '18px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '-0.3px' },
  pageSub: { fontSize: '12px', color: '#475569', marginTop: '3px' },
  addBtn: { padding: '9px 18px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' },
  card: { background: '#13161f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px', transition: 'border-color 0.2s' },
  center: { textAlign: 'center', color: '#334155', fontSize: '13px', padding: '60px' },
  editBtn: { flex: 1, padding: '7px', borderRadius: '7px', border: 'none', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'background 0.15s' },
  deleteBtn: { flex: 1, padding: '7px', borderRadius: '7px', border: 'none', background: 'rgba(244,63,94,0.1)', color: '#fb7185', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'background 0.15s' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
  modal: { background: '#13161f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px rgba(0,0,0,0.6)' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  label: { fontSize: '11.5px', fontWeight: '600', color: '#64748b' },
  input: { background: '#0d1018', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '9px 12px', color: '#e2e8f0', fontFamily: "'Outfit', sans-serif", fontSize: '13px', outline: 'none', width: '100%' },
  cancelBtn: { flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" },
  submitBtn: { flex: 2, padding: '10px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" },
  toast: { position: 'fixed', top: '20px', right: '20px', padding: '12px 20px', borderRadius: '10px', border: '1px solid', fontSize: '13px', fontWeight: '600', zIndex: 2000 },
};
