// src/pages/Employees.js
import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/api';

const mono = { fontFamily: "'JetBrains Mono', monospace" };
const AVATARS = ['linear-gradient(135deg,#3b82f6,#8b5cf6)','linear-gradient(135deg,#10b981,#059669)','linear-gradient(135deg,#f59e0b,#d97706)','linear-gradient(135deg,#ef4444,#dc2626)','linear-gradient(135deg,#8b5cf6,#6d28d9)','linear-gradient(135deg,#14b8a6,#0d9488)'];
const STATUS_MAP = { active:{bg:'rgba(16,185,129,0.12)',color:'#34d399',label:'Active'}, on_leave:{bg:'rgba(245,158,11,0.12)',color:'#fbbf24',label:'On Leave'}, inactive:{bg:'rgba(244,63,94,0.1)',color:'#fb7185',label:'Inactive'} };

export default function Employees() {
  const [employees,   setEmployees]   = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [searching,   setSearching]   = useState(false);
  const [showAdd,     setShowAdd]     = useState(false);
  const [editEmp,     setEditEmp]     = useState(null); // employee being edited
  const [submitting,  setSubmitting]  = useState(false);
  const [deleteId,    setDeleteId]    = useState(null);
  const [toast,       setToast]       = useState(null);
  const [addForm,     setAddForm]     = useState({ employee_id:'', first_name:'', last_name:'', email:'', department:'' });
  const [editForm,    setEditForm]    = useState({ first_name:'', last_name:'', department:'' });

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [e,d] = await Promise.all([api.get('/employees/?ordering=last_name'), api.get('/departments/')]);
      setEmployees(e.data.results??e.data);
      setDepartments(d.data.results??d.data);
    } catch { showToast('Failed to load.','error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(()=>{ loadAll(); },[loadAll]);

  // Search with debounce
  useEffect(() => {
    if (!search.trim()) { loadAll(); return; }
    const t = setTimeout(async () => {
      try {
        setSearching(true);
        const r = await api.get(`/employees/?search=${encodeURIComponent(search)}&ordering=last_name`);
        setEmployees(r.data.results??r.data);
      } catch { showToast('Search failed.','error'); }
      finally { setSearching(false); }
    }, 400);
    return ()=>clearTimeout(t);
  }, [search]); // eslint-disable-line

  // Add employee
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addForm.employee_id||!addForm.first_name||!addForm.last_name||!addForm.email||!addForm.department) {
      showToast('Fill all required fields.','error'); return;
    }
    try {
      setSubmitting(true);
      await api.post('/employees/', { ...addForm, department:parseInt(addForm.department), status:'active', employment_type:'full_time', gender:'M', salary:0, hire_date:new Date().toISOString().split('T')[0] });
      showToast('Employee added! ✅');
      setShowAdd(false);
      setAddForm({ employee_id:'', first_name:'', last_name:'', email:'', department:'' });
      loadAll();
    } catch(err) {
      showToast(err.response?.data?.employee_id?.[0]||err.response?.data?.email?.[0]||'Failed.','error');
    } finally { setSubmitting(false); }
  };

  // Edit employee — name + department only
  const openEdit = (emp) => {
    setEditEmp(emp);
    setEditForm({ first_name:emp.first_name, last_name:emp.last_name, department: emp.department||'' });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editForm.first_name||!editForm.last_name) { showToast('Name is required.','error'); return; }
    try {
      setSubmitting(true);
      await api.patch(`/employees/${editEmp.id}/`, {
        first_name:  editForm.first_name,
        last_name:   editForm.last_name,
        department:  parseInt(editForm.department),
      });
      showToast('Employee updated! ✅');
      setEditEmp(null);
      loadAll();
    } catch { showToast('Update failed.','error'); }
    finally { setSubmitting(false); }
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      setDeleteId(id);
      await api.delete(`/employees/${id}/`);
      setEmployees(prev=>prev.filter(e=>e.id!==id));
      showToast('Deleted. 🗑️');
    } catch { showToast('Delete failed.','error'); }
    finally { setDeleteId(null); }
  };

  const inputStyle = { background:'#0d1018', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'9px 12px', color:'#e2e8f0', fontFamily:"'Outfit', sans-serif", fontSize:'13px', outline:'none', width:'100%' };

  return (
    <div style={{ padding:'24px', fontFamily:"'Outfit', sans-serif", position:'relative' }}>
      {/* Toast */}
      {toast && <div style={{ position:'fixed', top:'20px', right:'20px', padding:'12px 20px', borderRadius:'10px', border:'1px solid', fontSize:'13px', fontWeight:'600', zIndex:2000, background:toast.type==='error'?'rgba(244,63,94,0.15)':'rgba(16,185,129,0.15)', borderColor:toast.type==='error'?'rgba(244,63,94,0.3)':'rgba(16,185,129,0.3)', color:toast.type==='error'?'#fb7185':'#34d399' }}>{toast.msg}</div>}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <div style={{ fontSize:'18px', fontWeight:'700', color:'#f1f5f9' }}>Employees</div>
          <div style={{ fontSize:'12px', color:'#475569', marginTop:'3px' }}>{employees.length} records{search&&` · "${search}"`}</div>
        </div>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'#13161f', border:`1px solid ${search?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.07)'}`, borderRadius:'8px', padding:'8px 14px', width:'280px', transition:'border-color 0.2s' }}>
            <span style={{ color:'#475569', fontSize:'13px' }}>{searching?'⏳':'🔍'}</span>
            <input style={{ background:'none', border:'none', outline:'none', color:'#e2e8f0', fontFamily:"'Outfit',sans-serif", fontSize:'12.5px', width:'100%' }}
              placeholder="Search name, ID, email, job title…" value={search} onChange={e=>setSearch(e.target.value)}/>
            {search && <span style={{ color:'#475569', cursor:'pointer', fontSize:'12px' }} onClick={()=>setSearch('')}>✕</span>}
          </div>
          <button onClick={()=>setShowAdd(true)} style={{ padding:'9px 18px', borderRadius:'8px', border:'none', background:'linear-gradient(135deg,#3b82f6,#6366f1)', color:'#fff', fontSize:'13px', fontWeight:'700', cursor:'pointer', fontFamily:"'Outfit',sans-serif" }}>
            + Add Employee
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background:'#13161f', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              {['Employee','Email','Department','Job Title','Hire Date','Status','Actions'].map(h=>(
                <th key={h} style={{ textAlign:'left', fontSize:'10.5px', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', color:'#1e293b', padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{ padding:'40px', textAlign:'center', color:'#334155' }}>Loading…</td></tr>
                : employees.length===0 ? <tr><td colSpan={7} style={{ padding:'40px', textAlign:'center', color:'#334155' }}>{search?`No results for "${search}"`:'No employees.'}</td></tr>
                : employees.map((emp,i)=>{
                  const initials=`${emp.first_name?.[0]??''}${emp.last_name?.[0]??''}`.toUpperCase();
                  const st=STATUS_MAP[emp.status]||STATUS_MAP.active;
                  return (
                    <tr key={emp.id} style={{ transition:'background 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.025)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    >
                      <td style={{ padding:'11px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:AVATARS[i%AVATARS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'800', color:'#fff', flexShrink:0 }}>{initials}</div>
                          <div>
                            <div style={{ fontSize:'13px', fontWeight:'600', color:'#e2e8f0' }}>{emp.first_name} {emp.last_name}</div>
                            <div style={{ fontSize:'10.5px', color:'#334155', ...mono }}>{emp.employee_id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'11px 16px', fontSize:'12px', color:'#64748b', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>{emp.email}</td>
                      <td style={{ padding:'11px 16px', fontSize:'12.5px', color:'#94a3b8', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>{emp.department_name||'—'}</td>
                      <td style={{ padding:'11px 16px', fontSize:'12.5px', color:'#94a3b8', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>{emp.job_title||'—'}</td>
                      <td style={{ padding:'11px 16px', fontSize:'11px', color:'#475569', borderBottom:'1px solid rgba(255,255,255,0.04)', ...mono }}>{emp.hire_date||'—'}</td>
                      <td style={{ padding:'11px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'2px 9px', borderRadius:'20px', background:st.bg, color:st.color, fontSize:'11px', fontWeight:'600' }}>
                          <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'currentColor', display:'inline-block' }}/>{st.label}
                        </span>
                      </td>
                      <td style={{ padding:'11px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display:'flex', gap:'6px' }}>
                          {/* Edit button */}
                          <button onClick={()=>openEdit(emp)}
                            style={{ padding:'4px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', cursor:'pointer', border:'none', background:'rgba(59,130,246,0.1)', color:'#60a5fa', fontFamily:"'Outfit',sans-serif" }}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(59,130,246,0.2)'}
                            onMouseLeave={e=>e.currentTarget.style.background='rgba(59,130,246,0.1)'}
                          >✏️ Edit</button>
                          {/* Delete button */}
                          <button disabled={deleteId===emp.id}
                            onClick={()=>{ if(window.confirm(`Delete ${emp.first_name}?`)) handleDelete(emp.id); }}
                            style={{ padding:'4px 10px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', cursor:'pointer', border:'none', background:'rgba(244,63,94,0.1)', color:'#fb7185', fontFamily:"'Outfit',sans-serif" }}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(244,63,94,0.2)'}
                            onMouseLeave={e=>e.currentTarget.style.background='rgba(244,63,94,0.1)'}
                          >{deleteId===emp.id?'…':'🗑 Delete'}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD Modal */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)' }} onClick={()=>setShowAdd(false)}>
          <div style={{ background:'#13161f', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px', padding:'24px', width:'100%', maxWidth:'460px', boxShadow:'0 25px 50px rgba(0,0,0,0.6)' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
              <div style={{ fontSize:'15px', fontWeight:'700', color:'#f1f5f9' }}>Add New Employee</div>
              <span style={{ cursor:'pointer', color:'#475569', fontSize:'18px' }} onClick={()=>setShowAdd(false)}>✕</span>
            </div>
            <form onSubmit={handleAdd} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'11.5px', fontWeight:'600', color:'#64748b' }}>Employee ID *</label>
                <input style={inputStyle} value={addForm.employee_id} placeholder="e.g. EMP010" onChange={e=>setAddForm({...addForm,employee_id:e.target.value})} required/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                  <label style={{ fontSize:'11.5px', fontWeight:'600', color:'#64748b' }}>First Name *</label>
                  <input style={inputStyle} value={addForm.first_name} placeholder="First name" onChange={e=>setAddForm({...addForm,first_name:e.target.value})} required/>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                  <label style={{ fontSize:'11.5px', fontWeight:'600', color:'#64748b' }}>Last Name *</label>
                  <input style={inputStyle} value={addForm.last_name} placeholder="Last name" onChange={e=>setAddForm({...addForm,last_name:e.target.value})} required/>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'11.5px', fontWeight:'600', color:'#64748b' }}>Email *</label>
                <input style={inputStyle} type="email" value={addForm.email} placeholder="email@company.com" onChange={e=>setAddForm({...addForm,email:e.target.value})} required/>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'11.5px', fontWeight:'600', color:'#64748b' }}>Department *</label>
                <select style={{ ...inputStyle, cursor:'pointer' }} value={addForm.department} onChange={e=>setAddForm({...addForm,department:e.target.value})} required>
                  <option value="">Select Department</option>
                  {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
                <button type="button" onClick={()=>setShowAdd(false)} style={{ flex:1, padding:'10px', borderRadius:'8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#64748b', fontSize:'13px', fontWeight:'600', cursor:'pointer', fontFamily:"'Outfit',sans-serif" }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex:2, padding:'10px', borderRadius:'8px', border:'none', background:'linear-gradient(135deg,#3b82f6,#6366f1)', color:'#fff', fontSize:'13px', fontWeight:'700', cursor:'pointer', fontFamily:"'Outfit',sans-serif", opacity:submitting?0.7:1 }}>{submitting?'Adding…':'+ Add Employee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT Modal — name + department */}
      {editEmp && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, backdropFilter:'blur(4px)' }} onClick={()=>setEditEmp(null)}>
          <div style={{ background:'#13161f', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px', padding:'24px', width:'100%', maxWidth:'420px', boxShadow:'0 25px 50px rgba(0,0,0,0.6)' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
              <div>
                <div style={{ fontSize:'15px', fontWeight:'700', color:'#f1f5f9' }}>Edit Employee</div>
                <div style={{ fontSize:'11px', color:'#475569', marginTop:'2px' }}>{editEmp.employee_id}</div>
              </div>
              <span style={{ cursor:'pointer', color:'#475569', fontSize:'18px' }} onClick={()=>setEditEmp(null)}>✕</span>
            </div>
            <form onSubmit={handleEdit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                  <label style={{ fontSize:'11.5px', fontWeight:'600', color:'#64748b' }}>First Name *</label>
                  <input style={inputStyle} value={editForm.first_name} onChange={e=>setEditForm({...editForm,first_name:e.target.value})} required/>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                  <label style={{ fontSize:'11.5px', fontWeight:'600', color:'#64748b' }}>Last Name *</label>
                  <input style={inputStyle} value={editForm.last_name} onChange={e=>setEditForm({...editForm,last_name:e.target.value})} required/>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                <label style={{ fontSize:'11.5px', fontWeight:'600', color:'#64748b' }}>Department</label>
                <select style={{ ...inputStyle, cursor:'pointer' }} value={editForm.department} onChange={e=>setEditForm({...editForm,department:e.target.value})}>
                  <option value="">Select Department</option>
                  {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
                <button type="button" onClick={()=>setEditEmp(null)} style={{ flex:1, padding:'10px', borderRadius:'8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#64748b', fontSize:'13px', fontWeight:'600', cursor:'pointer', fontFamily:"'Outfit',sans-serif" }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex:2, padding:'10px', borderRadius:'8px', border:'none', background:'linear-gradient(135deg,#3b82f6,#6366f1)', color:'#fff', fontSize:'13px', fontWeight:'700', cursor:'pointer', fontFamily:"'Outfit',sans-serif", opacity:submitting?0.7:1 }}>{submitting?'Saving…':'💾 Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
