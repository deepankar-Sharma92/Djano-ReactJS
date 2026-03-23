// src/pages/Performance.js
import React from 'react';

export default function Performance() {
  return (
    <div style={css.root}>
      <div style={css.pageTitle}>Performance Reviews</div>
      <div style={css.pageSub}>Employee appraisals & ratings</div>

      <div style={css.banner}>
        <div style={{ fontSize: '28px', marginBottom: '12px' }}>🚧</div>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#f1f5f9', marginBottom: '8px' }}>
          Coming Soon
        </div>
        <div style={{ fontSize: '13px', color: '#475569', maxWidth: '340px', textAlign: 'center', lineHeight: '1.6' }}>
          Performance reviews and appraisals are outside the current assessment scope. This feature will be available in a future update.
        </div>
        <div style={{ marginTop: '16px', padding: '6px 16px', borderRadius: '20px', background: 'rgba(245,158,11,0.12)', color: '#fbbf24', fontSize: '12px', fontWeight: '600' }}>
          Out of Scope — Assessment v1.0
        </div>
      </div>
    </div>
  );
}

const css = {
  root: { flex: 1, overflowY: 'auto', background: '#0d1018', padding: '24px', fontFamily: "'Outfit', sans-serif" },
  pageTitle: { fontSize: '18px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '-0.3px', marginBottom: '4px' },
  pageSub: { fontSize: '12px', color: '#475569', marginBottom: '24px' },
  banner: { background: '#13161f', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
};
