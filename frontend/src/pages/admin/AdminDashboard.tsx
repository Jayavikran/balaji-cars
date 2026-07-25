// Update the grid sections - find and replace with:

<div className="admin-dashboard-grid">
  {cards.map((c) => (
    <Link
      key={c.label}
      to={c.to}
      className="admin-stat-card bg-white rounded-2xl shadow-card p-5 flex items-center gap-4 transition-shadow hover:shadow-lg cursor-pointer"
    >
      <div className={`w-12 h-12 rounded-2xl ${c.color} text-white flex items-center justify-center shrink-0`}>
        <c.icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-ink">{isLoading ? '—' : c.value}</p>
        <p className="text-xs text-body">{c.label}</p>
      </div>
    </Link>
  ))}
</div>

// For the revenue section:
<div className="admin-dashboard-grid mt-6">
  {[...revenueCards].map((r) => (
    <div key={r.label} className="admin-stat-card bg-white rounded-2xl shadow-card p-5">
      <p className="flex items-center gap-1.5 text-xs text-body mb-1"><IndianRupee size={12} /> {r.label}</p>
      <p className="text-xl font-bold text-ink">{data ? formatLakh(r.value ?? 0) : '—'}</p>
      <p className="text-xs text-body mt-1">{r.sub}</p>
    </div>
  ))}
</div>

// Charts section - stack vertically:
<div className="space-y-6 mt-6">
  <div className="bg-white rounded-2xl shadow-card p-6">
    {/* Sales chart */}
  </div>
  <div className="bg-white rounded-2xl shadow-card p-6">
    {/* Recent enquiries */}
  </div>
  <div className="bg-white rounded-2xl shadow-card p-6">
    {/* Recent uploads */}
  </div>
</div>