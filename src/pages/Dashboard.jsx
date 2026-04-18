import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, balance: 0 });
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardInfo();
  }, []);

  const fetchDashboardInfo = async () => {
    try {
      setLoading(true);

      // Fetch Product Count
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch orders for user's products
      const { data: orders } = await supabase
        .from('orders')
        .select('*, products!inner(user_id, title)')
        .eq('products.user_id', user.id)
        .order('created_at', { ascending: false });

      const paidOrders = (orders || []).filter(o => o.status === 'PAID');
      
      const totalRevenue = paidOrders.reduce((acc, curr) => acc + Number(curr.amount_idr), 0);
      
      // Affiliate Unpaid
      const { data: affLinks } = await supabase
        .from('affiliate_links')
        .select('unpaid_commission')
        .eq('user_id', user.id);
      
      const unpaidAffiliate = (affLinks || []).reduce((acc, curr) => acc + Number(curr.unpaid_commission), 0);
      const balance = totalRevenue - unpaidAffiliate;

      setStats({
        revenue: totalRevenue,
        orders: paidOrders.length,
        products: productCount || 0,
        balance: balance > 0 ? balance : 0
      });

      // Recent 5
      setRecentOrders((orders || []).slice(0, 5));

      // Product sales counting
      const pCount = {};
      paidOrders.forEach(o => {
        const title = o.products?.title;
        if(title) {
          pCount[title] = (pCount[title] || 0) + 1;
        }
      });
      const topArr = Object.entries(pCount).sort((a,b) => b[1] - a[1]).slice(0, 5);
      setTopProducts(topArr);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Keuntungan Bersih</div>
          <div className="stat-value" id="stat-revenue">Rp {stats.revenue.toLocaleString('id-ID')}</div>
          <div className="stat-change up">↑ Semua waktu</div>
          <div className="stat-icon" style={{background: '#e8f4fe'}}>💰</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Penjualan Lunas</div>
          <div className="stat-value" id="stat-orders">{stats.orders}</div>
          <div className="stat-change up">↑ Semua waktu</div>
          <div className="stat-icon" style={{background: '#e8faf0'}}>📦</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Produk Dibuat</div>
          <div className="stat-value" id="stat-products">{stats.products}</div>
          <div className="stat-change up">Produk digital aktif</div>
          <div className="stat-icon" style={{background: '#f5eeff'}}>🛍️</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Estimasi Saldo Mengendap</div>
          <div className="stat-value" id="stat-balance">Rp {stats.balance.toLocaleString('id-ID')}</div>
          <div className="stat-change">Potong tagihan afiliasi</div>
          <div className="stat-icon" style={{background: '#fff6e8'}}>🏦</div>
        </div>
      </div>

      <div className="grid-2" style={{marginBottom: '20px'}}>
        <div className="card">
          <div className="card-header"><div className="card-title">Produk Terlaris</div></div>
          <div className="card-body" style={{padding:0}}>
            {loading ? <div style={{padding:'20px', textAlign:'center'}}>Memuat...</div> : topProducts.length === 0 ? (
               <div style={{textAlign: 'center', padding: '20px', color: 'var(--text2)', fontSize: '14px'}}>Belum ada produk yang terjual lunas.</div>
            ) : (
               <div style={{display:'flex', flexDirection:'column'}}>
                 {topProducts.map((p, idx) => (
                    <div key={idx} style={{padding:'16px', borderBottom:'1px solid var(--border-light)', display:'flex', justifyContent:'space-between'}}>
                      <span style={{fontWeight:'500'}}>{p[0]}</span>
                      <span style={{color:'var(--accent)', fontWeight:'bold'}}>{p[1]} Laku</span>
                    </div>
                 ))}
               </div>
            )}
          </div>
        </div>
        
        <div className="card">
          <div className="card-header"><div className="card-title">Penjualan Terkini (Live)</div></div>
          <div className="card-body" style={{padding:0}}>
            {loading ? <div style={{padding:'20px', textAlign:'center'}}>Memuat...</div> : recentOrders.length === 0 ? (
               <div style={{textAlign: 'center', padding: '20px', color: 'var(--text2)', fontSize: '14px'}}>Belum ada transaksi terekam.</div>
            ) : (
               <div style={{display:'flex', flexDirection:'column'}}>
                 {recentOrders.map((o) => (
                    <div key={o.id} style={{padding:'12px 16px', borderBottom:'1px solid var(--border-light)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <div style={{display:'flex', flexDirection:'column'}}>
                        <span style={{fontWeight:'500', fontSize:'14px'}}>{o.products?.title || 'Produk'}</span>
                        <span style={{fontSize:'12px', color:'var(--text2)'}}>{o.customer_name}</span>
                      </div>
                      <div style={{textAlign:'right'}}>
                         <div style={{fontWeight:'bold', fontSize:'14px'}}>Rp {Number(o.amount_idr).toLocaleString('id-ID')}</div>
                         <div style={{fontSize:'11px', color: o.status === 'PAID' ? 'var(--green)' : 'var(--orange)'}}>{o.status}</div>
                      </div>
                    </div>
                 ))}
               </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
