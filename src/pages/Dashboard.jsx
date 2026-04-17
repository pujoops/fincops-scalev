import AppLayout from '../components/AppLayout';

export default function Dashboard() {
  return (
    <AppLayout title="Dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value" id="stat-revenue">Rp 0</div>
          <div className="stat-change up">↑ 24% bulan ini</div>
          <div className="stat-icon" style={{background: '#e8f4fe'}}>💰</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Order</div>
          <div className="stat-value" id="stat-orders">0</div>
          <div className="stat-change up">↑ 18% bulan ini</div>
          <div className="stat-icon" style={{background: '#e8faf0'}}>📦</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Produk</div>
          <div className="stat-value" id="stat-products">0</div>
          <div className="stat-change up">↑ 2 produk baru</div>
          <div className="stat-icon" style={{background: '#f5eeff'}}>🛍️</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Saldo Aktif</div>
          <div className="stat-value" id="stat-balance">Rp 0</div>
          <div className="stat-change">Siap dicairkan</div>
          <div className="stat-icon" style={{background: '#fff6e8'}}>🏦</div>
        </div>
      </div>

      <div className="grid-2" style={{marginBottom: '20px'}}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Revenue 7 Hari Terakhir</div>
          </div>
          <div className="card-body">
            <div className="mini-bar-chart" id="revenueChart">
              {/* Tempat untuk memanggil komponen Chart Nanti */}
              <div style={{height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--border)'}}>Bar Chart Placeholder</div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text2)', marginTop: '6px'}} id="chartDays"></div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Order Terbaru</div>
          </div>
          <div className="card-body" id="recentOrdersWidget" style={{paddingTop: 0}}>
            <div style={{textAlign: 'center', padding: '20px', color: 'var(--text2)', fontSize: '14px'}}>
              Belum ada order.
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Produk Terlaris</div></div>
          <div className="card-body" id="topProductsWidget" style={{paddingTop: 0}}>
             <div style={{textAlign: 'center', padding: '20px', color: 'var(--text2)', fontSize: '14px'}}>
              Belum ada data.
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Aktivitas Terkini</div></div>
          <div className="card-body" id="activityWidget" style={{paddingTop: 0}}>
             <div style={{textAlign: 'center', padding: '20px', color: 'var(--text2)', fontSize: '14px'}}>
              Belum ada aktivitas.
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
