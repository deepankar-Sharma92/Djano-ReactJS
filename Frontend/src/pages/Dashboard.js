// src/pages/Dashboard.js
import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/api';

const mono = { fontFamily: "'JetBrains Mono', monospace" };

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#3b82f6,#8b5cf6)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#ef4444,#dc2626)',
  'linear-gradient(135deg,#8b5cf6,#6d28d9)',
  'linear-gradient(135deg,#14b8a6,#0d9488)',
];
const BAR_COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ec4899','#14b8a6'];
const STAT_COLORS = {
  blue:   { bg:'rgba(59,130,246,0.1)',  border:'rgba(59,130,246,0.2)',  bar:'#3b82f6', accent:'#60a5fa' },
  green:  { bg:'rgba(16,185,129,0.09)', border:'rgba(16,185,129,0.2)',  bar:'#10b981', accent:'#34d399' },
  amber:  { bg:'rgba(245,158,11,0.09)', border:'rgba(245,158,11,0.2)',  bar:'#f59e0b', accent:'#fbbf24' },
  purple: { bg:'rgba(139,92,246,0.09)', border:'rgba(139,92,246,0.2)',  bar:'#8b5cf6', accent:'#a78bfa' },
  teal:   { bg:'rgba(20,184,166,0.08)', border:'rgba(20,184,166,0.18)', bar:'#14b8a6', accent:'#2dd4bf' },
  rose:   { bg:'rgba(244,63,94,0.08)',  border:'rgba(244,63,94,0.18)',  bar:'#f43f5e', accent:'#fb7185' },
};

function StatCard({ label, value, icon, color='blue', sub, loading, onClick }) {
  const c = STAT_COLORS[color];
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:'#13161f', border:`1px solid ${hov&&onClick?c.bar+'60':c.border}`, borderRadius:'12px', padding:'18px 20px', position:'relative', overflow:'hidden', transition:'transform 0.2s,border-color 0.2s,box-shadow 0.2s', cursor:onClick?'pointer':'default', transform:hov&&onClick?'translateY(-3px)':'translateY(0)', boxShadow:hov&&onClick?`0 8px 24px ${c.bar}25`:'none' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'2.5px', background:c.bar }} />
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'14px' }}>
        <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px' }}>{icon}</div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px' }}>
          {sub && <span style={{ fontSize:'10px', fontWeight:'700', padding:'2px 8px', borderRadius:'20px', background:c.bg, color:c.accent, ...mono }}>{sub}</span>}
          {onClick && <span style={{ fontSize:'10px', color:c.accent, opacity:hov?1:0, transition:'opacity 0.2s' }}>View →</span>}
        </div>
      </div>
      <div style={{ fontSize:'30px', fontWeight:'800', color:'#f1f5f9', letterSpacing:'-1.5px', lineHeight:1, ...mono }}>
        {loading?<span style={{opacity:0.2}}>—</span>:(value??'—')}
      </div>
      <div style={{ fontSize:'12px', color:'#475569', marginTop:'5px', fontWeight:'500' }}>{label}</div>
    </div>
  );
}

function Pill({ status }) {
  const M = { active:{bg:'rgba(16,185,129,0.12)',color:'#34d399',label:'Active'}, on_leave:{bg:'rgba(245,158,11,0.12)',color:'#fbbf24',label:'On Leave'}, inactive:{bg:'rgba(244,63,94,0.1)',color:'#fb7185',label:'Inactive'}, pending:{bg:'rgba(245,158,11,0.12)',color:'#fbbf24',label:'Pending'}, approved:{bg:'rgba(16,185,129,0.12)',color:'#34d399',label:'Approved'}, rejected:{bg:'rgba(244,63,94,0.1)',color:'#fb7185',label:'Rejected'} };
  const s = M[status]||M.active;
  return <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'2px 9px', borderRadius:'20px', background:s.bg, color:s.color, fontSize:'11px', fontWeight:'600' }}><span style={{ width:'5px', height:'5px', borderRadius:'50%', background:'currentColor', display:'inline-block' }}/>{s.label}</span>;
}

function Card({ children, style }) {
  return <div style={{ background:'#13161f', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px', overflow:'hidden', ...style }}>{children}</div>;
}
function CardHeader({ title, sub, right }) {
  return (
    <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <div>
        <div style={{ fontSize:'13.5px', fontWeight:'700', color:'#e2e8f0' }}>{title}</div>
        {sub && <div style={{ fontSize:'11px', color:'#475569', marginTop:'2px' }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const [stats,     setStats]     = useState(null);
  const [employees, setEmployees] = useState([]);
  const [leaves,    setLeaves]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [actionId,  setActionId]  = useState(null);
  const [error,     setError]     = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const [d, e, l] = await Promise.all([
        api.get('/dashboard/'),
        api.get('/employees/?ordering=-created_at&page_size=5'),
        api.get('/leaves/?status=pending'),
      ]);
      setStats(d.data);
      setEmployees(e.data.results ?? e.data);
      setLeaves(l.data.results ?? l.data);
    } catch { setError('Failed to load dashboard.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleLeave = async (id, action) => {
    try {
      setActionId(id);
      await api.patch(`/leaves/${id}/${action}/`);
      setLeaves(prev => prev.map(l => l.id===id ? {...l, status:action==='approve'?'approved':'rejected'} : l));
      setStats(prev => prev ? {...prev, pending_leaves: Math.max(0,(prev.pending_leaves||1)-1)} : prev);
    } catch { alert(`Could not ${action} leave.`); }
    finally { setActionId(null); }
  };

  const deptBreakdown = stats?.department_breakdown || [];
  const empTypeBreakdown = stats?.employment_type_breakdown || {};
  const empTypeEntries = Object.entries(empTypeBreakdown).filter(([,v])=>v>0);
  const empTypeTotal = empTypeEntries.reduce((a,[,v])=>a+v,0)||1;
  const deptMax = Math.max(...deptBreakdown.map(d=>d.count),1);
  const pendingLeaves = leaves.filter(l=>l.status==='pending');

  return (
    <div style={{ padding:'24px', fontFamily:"'Outfit', sans-serif" }}>
      {error && (
        <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'rgba(244,63,94,0.08)', border:'1px solid rgba(244,63,94,0.2)', borderRadius:'10px', padding:'12px 18px', color:'#fb7185', fontSize:'13px', marginBottom:'18px' }}>
          ⚠ {error} <span style={{ marginLeft:'auto', cursor:'pointer', fontSize:'12px' }} onClick={load}>Retry ↺</span>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'14px', marginBottom:'20px' }}>
        <StatCard label="Total Employees" value={stats?.total_employees} icon="👥" color="blue" loading={loading} onClick={()=>onNavigate&&onNavigate('employees')}/>
        <StatCard label="Active" value={stats?.active_employees} icon="✅" color="green" loading={loading} onClick={()=>onNavigate&&onNavigate('employees')}/>
        <StatCard label="On Leave" value={stats?.on_leave} icon="🏖" color="amber" loading={loading} onClick={()=>onNavigate&&onNavigate('attendance')}/>
        <StatCard label="Departments" value={stats?.total_departments} icon="🏢" color="purple" loading={loading} onClick={()=>onNavigate&&onNavigate('departments')}/>
        <StatCard label="New This Month" value={stats?.new_hires_this_month} icon="🆕" color="teal" loading={loading} onClick={()=>onNavigate&&onNavigate('employees')}/>
        <StatCard label="Pending Leaves" value={stats?.pending_leaves} icon="⏳" color="rose" loading={loading} sub={stats?.pending_leaves>0?'Action needed':undefined} onClick={()=>onNavigate&&onNavigate('leaves')}/>
      </div>

      {/* Row 2 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'16px', marginBottom:'16px' }}>
        <Card>
          <CardHeader title="Recent Employees" sub="Latest 5 records"
            right={<span onClick={()=>onNavigate&&onNavigate('employees')} style={{ fontSize:'11.5px', color:'#60a5fa', fontWeight:'600', cursor:'pointer' }}>View All →</span>}
          />
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>
                {['Employee','Department','Job Title','Type','Status'].map(h=>(
                  <th key={h} style={{ textAlign:'left', fontSize:'10.5px', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', color:'#1e293b', padding:'8px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={5} style={{ padding:'32px', textAlign:'center', color:'#334155' }}>Loading…</td></tr>
                  : employees.length===0 ? <tr><td colSpan={5} style={{ padding:'32px', textAlign:'center', color:'#334155' }}>No employees.</td></tr>
                  : employees.slice(0,5).map((emp,i)=>(
                    <tr key={emp.id} style={{ transition:'background 0.15s', cursor:'pointer' }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.025)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                      onClick={()=>onNavigate&&onNavigate('employees')}
                    >
                      <td style={{ padding:'11px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:AVATAR_GRADIENTS[i%AVATAR_GRADIENTS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'800', color:'#fff', flexShrink:0 }}>
                            {`${emp.first_name?.[0]??''}${emp.last_name?.[0]??''}`.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize:'13px', fontWeight:'600', color:'#e2e8f0' }}>{emp.first_name} {emp.last_name}</div>
                            <div style={{ fontSize:'10.5px', color:'#334155', ...mono }}>{emp.employee_id}</div>
                          </div>
                        </div>
                      </td>
                      {[emp.department_name||'—', emp.job_title||'—'].map((v,j)=>(
                        <td key={j} style={{ padding:'11px 16px', fontSize:'12.5px', color:'#94a3b8', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>{v}</td>
                      ))}
                      <td style={{ padding:'11px 16px', fontSize:'11px', color:'#475569', borderBottom:'1px solid rgba(255,255,255,0.04)', ...mono, textTransform:'capitalize' }}>{emp.employment_type||'—'}</td>
                      <td style={{ padding:'11px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}><Pill status={emp.status}/></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="By Department" sub="Active headcount"/>
          <div style={{ padding:'18px 20px' }}>
            {deptBreakdown.map((dept,i)=>{
              const pct=Math.round((dept.count/deptMax)*100);
              return (
                <div key={dept.name} style={{ marginBottom:'14px', cursor:'pointer' }} onClick={()=>onNavigate&&onNavigate('departments')}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
                    <span style={{ fontSize:'12.5px', fontWeight:'500', color:'#94a3b8' }}>{dept.name}</span>
                    <span style={{ fontSize:'11px', color:'#334155', ...mono }}>{dept.count}</span>
                  </div>
                  <div style={{ height:'5px', background:'rgba(255,255,255,0.05)', borderRadius:'3px', overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:BAR_COLORS[i%BAR_COLORS.length], borderRadius:'3px', transition:'width 0.6s ease' }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Row 3 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 290px', gap:'16px', marginBottom:'24px' }}>
        <Card>
          <CardHeader title="Pending Leave Requests" sub={`${pendingLeaves.length} awaiting approval`}/>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>
                {['Employee','Type','From','To','Status','Actions'].map(h=>(
                  <th key={h} style={{ textAlign:'left', fontSize:'10.5px', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase', color:'#1e293b', padding:'8px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={6} style={{ padding:'32px', textAlign:'center', color:'#334155' }}>Loading…</td></tr>
                  : leaves.length===0 ? <tr><td colSpan={6} style={{ padding:'32px', textAlign:'center', color:'#334155' }}>🎉 No pending leaves!</td></tr>
                  : leaves.map(leave=>(
                    <tr key={leave.id} style={{ transition:'background 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.025)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    >
                      <td style={{ padding:'11px 16px', fontWeight:'600', color:'#e2e8f0', borderBottom:'1px solid rgba(255,255,255,0.04)', fontSize:'12.5px' }}>{leave.employee_name||`#${leave.employee}`}</td>
                      <td style={{ padding:'11px 16px', fontSize:'12px', color:'#94a3b8', borderBottom:'1px solid rgba(255,255,255,0.04)', textTransform:'capitalize' }}>{leave.leave_type}</td>
                      <td style={{ padding:'11px 16px', fontSize:'11px', color:'#475569', borderBottom:'1px solid rgba(255,255,255,0.04)', ...mono }}>{leave.start_date}</td>
                      <td style={{ padding:'11px 16px', fontSize:'11px', color:'#475569', borderBottom:'1px solid rgba(255,255,255,0.04)', ...mono }}>{leave.end_date}</td>
                      <td style={{ padding:'11px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}><Pill status={leave.status}/></td>
                      <td style={{ padding:'11px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                        {leave.status==='pending' ? (
                          <div style={{ display:'flex', gap:'6px' }}>
                            <button disabled={actionId===leave.id} onClick={()=>handleLeave(leave.id,'approve')}
                              style={{ padding:'4px 11px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', cursor:'pointer', border:'none', background:'rgba(16,185,129,0.12)', color:'#34d399' }}
                              onMouseEnter={e=>e.currentTarget.style.background='rgba(16,185,129,0.25)'}
                              onMouseLeave={e=>e.currentTarget.style.background='rgba(16,185,129,0.12)'}
                            >{actionId===leave.id?'…':'✓ Approve'}</button>
                            <button disabled={actionId===leave.id} onClick={()=>handleLeave(leave.id,'reject')}
                              style={{ padding:'4px 11px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', cursor:'pointer', border:'none', background:'rgba(244,63,94,0.1)', color:'#fb7185' }}
                              onMouseEnter={e=>e.currentTarget.style.background='rgba(244,63,94,0.2)'}
                              onMouseLeave={e=>e.currentTarget.style.background='rgba(244,63,94,0.1)'}
                            >{actionId===leave.id?'…':'✕ Reject'}</button>
                          </div>
                        ) : <span style={{ fontSize:'11px', color:'#334155' }}>—</span>}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Employment Types" sub="Active by contract"/>
          <div style={{ padding:'20px' }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:'22px' }}>
              <div style={{ width:'110px', height:'110px', borderRadius:'50%', background:(()=>{
                if(!empTypeEntries.length) return '#1a1f2e';
                let deg=0;
                return `conic-gradient(${empTypeEntries.map(([,v],i)=>{const s=`${BAR_COLORS[i%BAR_COLORS.length]} ${deg}deg ${deg+(v/empTypeTotal)*360}deg`;deg+=(v/empTypeTotal)*360;return s;}).join(',')})`;
              })(), position:'relative' }}>
                <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'64px', height:'64px', borderRadius:'50%', background:'#13161f', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
                  <div style={{ fontSize:'17px', fontWeight:'800', color:'#f1f5f9', ...mono, lineHeight:1 }}>{empTypeTotal}</div>
                  <div style={{ fontSize:'9px', color:'#475569', letterSpacing:'0.5px', marginTop:'2px' }}>ACTIVE</div>
                </div>
              </div>
            </div>
            {empTypeEntries.map(([type,count],i)=>(
              <div key={type} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'11px' }}>
                <div style={{ width:'10px', height:'10px', borderRadius:'3px', background:BAR_COLORS[i%BAR_COLORS.length], flexShrink:0 }}/>
                <span style={{ fontSize:'12.5px', color:'#94a3b8', flex:1, textTransform:'capitalize' }}>{type}</span>
                <span style={{ fontSize:'12px', fontWeight:'700', color:'#e2e8f0', ...mono }}>{count}</span>
                <span style={{ fontSize:'10px', color:'#334155', ...mono }}>{Math.round((count/empTypeTotal)*100)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
