// src/pages/Leaves.js
import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/api';

const mono = { fontFamily: "'JetBrains Mono', monospace" };
const STATUS_MAP = {
  pending:  { bg:'rgba(245,158,11,0.12)',  color:'#fbbf24', label:'Pending' },
  approved: { bg:'rgba(16,185,129,0.12)',  color:'#34d399', label:'Approved' },
  rejected: { bg:'rgba(244,63,94,0.1)',    color:'#fb7185', label:'Rejected' },
};

function Pill({ status }) {
  const s = STATUS_MAP[status]||STATUS_MAP.pending;
  return <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'3px 10px', borderRadius:'20px', background:s.bg, color:s.color, fontSize:'11px', fontWeight:'600' }}><span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'currentColor', display:'inline-block' }}/>{s.label}</span>;
}

export default function Leaves() {
  const [leaves,      setLeaves]      = useState([]);
  const [employees,   setEmployees]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filterStat,  setFilterStat]  = useState('pending');
  const [actionId,    setActionId]    = useState(null);
  const [toast,       setToast]       = useState(null);
  const [showApply,   setShowApply]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [rejectModal, setRejectModal] = useState(null);
  const [reason,      setReason]      = useState('');

  const [applyForm, setApplyForm] = useState({
    employee:'', leave_type:'casual',
    start_date:'', end_date:'', notes:'',
  });

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/leaves/?ordering=-created_at';
      if (filterStat) url += `&status=${filterStat}`;
      const [lRes, eRes] = await Promise.all([
        api.get(url),
        api.get('/employees/?ordering=first_name'),
      ]);
      setLeaves(lRes.data.results??lRes.data);
      setEmployees(eRes.data.results??eRes.data);
    } catch { showToast('Failed to load.','error'); }
    finally { setLoading(false); }
  }, [filterStat]);

  useEffect(()=>{ load(); },[load]);

  // Apply for leave
  const handleApply = async (e) => {
    e.preventDefault();
    if (!applyForm.employee||!applyForm.start_date||!applyForm.end_date) {
      showToast('Fill all required fields.','error'); return;
    }
    if (applyForm.end_date < applyForm.start_date) {
      showToast('End date must be after start date.','error'); return;
    }
    try {
      setSubmitting(true);
      await api.post('/leaves/', {
        employee:   parseInt(applyForm.employee),
        leave_type: applyForm.leave_type,
        start_date: applyForm.start_date,
        end_date:   applyForm.end_date,
        status:     'pending',
        notes:      applyForm.notes,
      });
      showToast('Leave applied successfully! ✅');
      setShowApply(false);
      setApplyForm({ employee:'', leave_type:'casual', start_date:'', end_date:'', notes:'' });
      setFilterStat('pending');
      load();
    } catch(err) {
      showToast(err.response?.data?.detail||'Failed to apply leave.','error');
    } finally { setSubmitting(false); }
  };

  const handleApprove = async (leave) => {
    try {
      setActionId(leave.id);
      await api.patch(`/leaves/${leave.id}/approve/`);
      showToast(`✅ Approved for ${leave.employee_name||'employee'}`);
      load();
    } catch(err) { showToast(err.response?.data?.detail||'Cannot approve.','error'); }
    finally { setActionId(null); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      setActionId(rejectModal.id);
      await api.patch(`/leaves/${rejectModal.id}/reject/`, { reason });
      showToast(`❌ Rejected for ${rejectModal.employee_name||'employee'}`);
      setRejectModal(null);
      load();
    } catch(err) { showToast(err.response?.data?.detail||'Cannot reject.','error'); }
    finally { setActionId(null); }
  };

  const inputStyle = { background:'#0d1018', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'9px 12px', color:'#e2e8f0', fontFamily:"'Outfit',sans-serif", fontSize:'13px', outline:'none', width:'100%' };

  const TABS = [
    { key:'pending',  label:'Pending',  color:'#fbbf24' },
    { key:'approved', label:'Approved', color:'#34d399' },
    { key:'rejected', label:'Rejected', color:'#fb7185' },
    { key:'',         label:'All',      color:'#60a5fa' },
  ];

  return (
    <div style={{ padding:'24px', fontFamily:"'Outfit',sans-serif", position:'relative' }}>
      {/* Toast */}
      {toast && <div style={{ position:'fixed', top:'20px', right:'20px', padding:'12px 20px', borderRadius:'10px', border:'1px solid', fontSize:'13px', fontWeight:'600', zIndex:2000, background:toast.type==='error'?'rgba(244,63,94,0.15)':'rgba(16,185,129,0.15)', borderColor:toast.type==='error'?'rgba(244,63,94,0.3)':'rgba(16,185,129,0.3)', color:toast.type==='error'?'#fb7185':'#34d399' }}>{toast.msg}</div>}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <div style={{ fontSize:'18px', fontWeight:'700', color:'#f1f5f9' }}>Leave Records</div>
          <div style={{ fontSize:'12px', color:'#475569', marginTop:'3px' }}>Manage and approve employee leaves</div>
        </div>
        <button onClick={()=>setShowApply(true)} style={{ padding:'9px 18px', borderRadius:'8px', border:'none', background:'linear-gradient(135deg,#3b82f6,#6366f1)', color:'#fff', fontSize:'13px', fontWeight:'700', cursor:'pointer', fontFamily:"'Outfit',sans-serif" }}>
          + Apply Leave
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'16px', flexWrap:'wrap' }}>
        {TABS.map(tab=>(
          <button key={tab.key} onClick={()=>setFilterStat(tab.key)} style={{ padding:'7px 16px', borderRadius:'8px', fontSize:'12.5px', fontWeight:'600', cursor:'pointer', fontFamily:"'Outfit',sans-serif", transition:'all 0.15s', background:filterStat===tab.key?tab.color+'20':'transparent', color:filterStat===tab.key?tab.color:'#475569', border:`1px solid ${filterStat===tab.key?tab.color+'40':'rgba(255,255,255,0.06)'}` }}>
            {tab.label}
            <span style={{ marginLeft:'6px', padding:'1px 7px', borderRadius:'20px', background:filterStat===tab.key?tab.color+'30':'rgba(255,255,255,0.05)', fontSize:'10px', fontWeight:'700', ...mono }}>
              {tab.key===''?leaves.length:leaves.filter(l=>l.status===tab.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:'#13161f', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              {['Employee','Leave Type','From','To','Days','Status','Actions'].map(h=>(
                <th key={h} style={{ textAlign:'left', fontSize:'10.5px', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', color:'#1e293b', padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{ padding:'40px', textAlign:'center', color:'#334155' }}>Loading…</td></tr>
                : leaves.length===0 ? (
                  <tr><td colSpan={7} style={{ padding:'40px', textAlign:'center', color:'#334155' }}>
                    <div style={{ fontSize:'28px', marginBottom:'8px' }}>📋</div>
                    No {filterStat||''} leave requests.
                  </td></tr>
                ) : leaves.map(leave=>{
                  const days = leave.duration_days||(leave.start_date&&leave.end_date?Math.ceil((new Date(leave.end_date)-new Date(leave.start_date))/86400000)+1:'—');
                  return (
                    <tr key={leave.id} style={{ transition:'background 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.025)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    >
                      <td style={{ padding:'11px 16px', fontWeight:'600', color:'#e2e8f0', borderBottom:'1px solid rgba(255,255,255,0.04)', fontSize:'12.5px' }}>{leave.employee_name||`#${leave.employee}`}</td>
                      <td style={{ padding:'11px 16px', fontSize:'12px', color:'#94a3b8', borderBottom:'1px solid rgba(255,255,255,0.04)', textTransform:'capitalize' }}>{leave.leave_type}</td>
                      <td style={{ padding:'11px 16px', fontSize:'11px', color:'#475569', borderBottom:'1px solid rgba(255,255,255,0.04)', ...mono }}>{leave.start_date}</td>
                      <td style={{ padding:'11px 16px', fontSize:'11px', color:'#475569', borderBottom:'1px solid rgba(255,255,255,0.04)', ...mono }}>{leave.end_date}</td>
                      <td style={{ padding:'11px 16px', fontSize:'11px', color:'#475569', borderBottom:'1px solid rgba(255,255,255,0.04)', ...mono }}>{days}</td>
                      <td style={{ padding:'11px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}><Pill status={leave.status}/></td>
                      <td style={{ padding:'11px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                        {leave.status==='pending' ? (
                          <div style={{ display:'flex', gap:'6px' }}>
                            <button disabled={actionId===leave.id} onClick={()=>handleApprove(leave)}
                              style={{ padding:'4px 11px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', cursor:'pointer', border:'none', background:'rgba(16,185,129,0.12)', color:'#34d399' }}
                              onMouseEnter={e=>e.currentTarget.style.background='rgba(16,185,129,0.25)'}
                              onMouseLeave={e=>e.currentTarget.style.background='rgba(16,185,129,0.12)'}
                            >{actionId===leave.id?'…':'✓ Approve'}</button>
                            <button disabled={actionId===leave.id} onClick={()=>{setRejectModal(leave);setReason('');}}
                              style={{ padding:'4px 11px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', cursor:'pointer', border:'none', background:'rgba(244,63,94,0.1)', color:'#fb7185' }}
                              onMouseEnter={e=>e.currentTarget.style.background='rgba(244,63,94,0.2)'}
                              onMouseLeave={e=>e.currentTarget.style.background='rgba(244,63,94,0.1)'}
                            >✕ Reject</button>
                          </div>
                        ) : <span style={{ fontSize:'11px', color:'#334155' }}>{leave.status==='approved'?'✓ Done':'✕ Done'}</span>}
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLY LEAVE Modal */}
      {showApply && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)' }} onClick={()=>setShowApply(false)}>
          <div style={{ background:'#13161f', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px', padding:'24px', width:'100%', maxWidth:'460px', boxShadow:'0 25px 50px rgba(0,0,0,0.6)' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
              <div style={{ fontSize:'15px', fontWeight:'700', color:'#f1f5f9' }}>Apply for Leave</div>
              <span style={{ cursor:'pointer', color:'#475569', fontSize:'18px' }} onClick={()=>setShowApply(false)}>✕</span>
            </div>
            <form onSubmit={handleApply} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

              {/* Employee */}
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'11.5px', fontWeight:'600', color:'#64748b' }}>Employee *</label>
                <select style={{ ...inputStyle, cursor:'pointer' }} value={applyForm.employee} onChange={e=>setApplyForm({...applyForm,employee:e.target.value})} required>
                  <option value="">Select Employee</option>
                  {employees.map(emp=><option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id})</option>)}
                </select>
              </div>

              {/* Leave Type */}
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'11.5px', fontWeight:'600', color:'#64748b' }}>Leave Type *</label>
                <select style={{ ...inputStyle, cursor:'pointer' }} value={applyForm.leave_type} onChange={e=>setApplyForm({...applyForm,leave_type:e.target.value})}>
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="annual">Annual Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                  <option value="maternity">Maternity Leave</option>
                  <option value="paternity">Paternity Leave</option>
                </select>
              </div>

              {/* Dates */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                  <label style={{ fontSize:'11.5px', fontWeight:'600', color:'#64748b' }}>Start Date *</label>
                  <input type="date" style={{ ...inputStyle, colorScheme:'dark' }} value={applyForm.start_date} onChange={e=>setApplyForm({...applyForm,start_date:e.target.value})} required/>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                  <label style={{ fontSize:'11.5px', fontWeight:'600', color:'#64748b' }}>End Date *</label>
                  <input type="date" style={{ ...inputStyle, colorScheme:'dark' }} value={applyForm.end_date} onChange={e=>setApplyForm({...applyForm,end_date:e.target.value})} required/>
                </div>
              </div>

              {/* Notes */}
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'11.5px', fontWeight:'600', color:'#64748b' }}>Notes <span style={{ color:'#334155', fontWeight:'400' }}>(optional)</span></label>
                <textarea style={{ ...inputStyle, resize:'vertical', minHeight:'72px' }} placeholder="Reason for leave…" value={applyForm.notes} onChange={e=>setApplyForm({...applyForm,notes:e.target.value})}/>
              </div>

              <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
                <button type="button" onClick={()=>setShowApply(false)} style={{ flex:1, padding:'10px', borderRadius:'8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#64748b', fontSize:'13px', fontWeight:'600', cursor:'pointer', fontFamily:"'Outfit',sans-serif" }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex:2, padding:'10px', borderRadius:'8px', border:'none', background:'linear-gradient(135deg,#3b82f6,#6366f1)', color:'#fff', fontSize:'13px', fontWeight:'700', cursor:'pointer', fontFamily:"'Outfit',sans-serif", opacity:submitting?0.7:1 }}>{submitting?'Applying…':'📤 Apply Leave'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT REASON Modal */}
      {rejectModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)' }} onClick={()=>setRejectModal(null)}>
          <div style={{ background:'#13161f', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px', padding:'24px', width:'100%', maxWidth:'440px', boxShadow:'0 25px 50px rgba(0,0,0,0.6)' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
              <div style={{ fontSize:'15px', fontWeight:'700', color:'#f1f5f9' }}>Reject Leave Request</div>
              <span style={{ cursor:'pointer', color:'#475569', fontSize:'18px' }} onClick={()=>setRejectModal(null)}>✕</span>
            </div>
            <div style={{ background:'rgba(244,63,94,0.08)', border:'1px solid rgba(244,63,94,0.2)', borderRadius:'8px', padding:'12px 14px', marginBottom:'16px' }}>
              <div style={{ fontSize:'12.5px', color:'#94a3b8' }}><strong style={{ color:'#f1f5f9' }}>{rejectModal.employee_name}</strong> — {rejectModal.leave_type} leave</div>
              <div style={{ fontSize:'11px', color:'#475569', marginTop:'4px', ...mono }}>{rejectModal.start_date} → {rejectModal.end_date}</div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'16px' }}>
              <label style={{ fontSize:'11.5px', fontWeight:'600', color:'#64748b' }}>Reason <span style={{ color:'#334155', fontWeight:'400' }}>(optional)</span></label>
              <textarea style={{ background:'#0d1018', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'10px 12px', color:'#e2e8f0', fontFamily:"'Outfit',sans-serif", fontSize:'13px', outline:'none', resize:'vertical', minHeight:'90px', width:'100%' }}
                placeholder="e.g. Insufficient leave balance, project deadline…" value={reason} onChange={e=>setReason(e.target.value)}/>
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={()=>setRejectModal(null)} style={{ flex:1, padding:'10px', borderRadius:'8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#64748b', fontSize:'13px', fontWeight:'600', cursor:'pointer', fontFamily:"'Outfit',sans-serif" }}>Cancel</button>
              <button disabled={!!actionId} onClick={handleReject} style={{ flex:2, padding:'10px', borderRadius:'8px', border:'none', background:'linear-gradient(135deg,#f43f5e,#dc2626)', color:'#fff', fontSize:'13px', fontWeight:'700', cursor:'pointer', fontFamily:"'Outfit',sans-serif", opacity:actionId?0.7:1 }}>{actionId?'Rejecting…':'✕ Confirm Reject'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
