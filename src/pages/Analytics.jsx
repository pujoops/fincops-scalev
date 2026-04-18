import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { TrendingUp } from 'lucide-react';

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Fetch all paid orders for the user's products
      const { data: orders, error } = await supabase
        .from('orders')
        .select('amount_idr, created_at, products!inner(user_id, title)')
        .eq('status', 'PAID')
        .eq('products.user_id', user.id);

      if (error) throw error;

      // Process 7-day revenue chart
      const days = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        days.push({ 
          label: d.toLocaleDateString('id-ID', { weekday: 'short' }),
          dateString: d.toISOString().split('T')[0],
          total: 0 
        });
      }

      const productSales = {}; // Tracking top products

      (orders || []).forEach(order => {
        // Chart aggregation
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        const dayMatch = days.find(d => d.dateString === orderDate);
        if (dayMatch) {
          dayMatch.total += Number(order.amount_idr);
        }

        // Product aggregation
        const pTitle = order.products?.title;
        if (pTitle) {
          if (!productSales[pTitle]) productSales[pTitle] = { title: pTitle, revenue: 0, count: 0 };
          productSales[pTitle].revenue += Number(order.amount_idr);
          productSales[pTitle].count += 1;
        }
      });

      // Find max for chart scaling
      const maxTotal = Math.max(...days.map(d => d.total), 1); // fallback to 1 to avoid /0
      setChartData(days.map(d => ({ ...d, heightPercent: (d.total / maxTotal) * 100 })));

      // Sort top products
      const sortedProducts = Object.values(productSales).sort((a,b) => b.revenue - a.revenue).slice(0, 5);
      setTopProducts(sortedProducts);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Analitik Pendapatan">
      <div style={{marginBottom: '20px'}}>
        <div className="section-title">Laporan Performa</div>
        <div className="section-sub" style={{marginBottom: 0}}>Rekapitulasi penjualan Anda selama 7 hari terakhir.</div>
      </div>

      <div className="card" style={{marginBottom: '24px'}}>
        <div className="card-header">
           <div className="card-title" style={{display:'flex', alignItems:'center', gap:'8px'}}>
             <TrendingUp size={20} color="var(--accent)"/> Grafik Revenue (7 Hari Terakhir)
           </div>
        </div>
        <div className="card-body">
          {loading ? (
             <div style={{padding:'40px', textAlign:'center', color:'var(--text3)'}}>Menghitung Data...</div>
          ) : (
             <div style={{height: '250px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap:'2%', padding:'20px 0 0 0', position:'relative'}}>
               {/* Grid lines */}
               {[0, 25, 50, 75, 100].map(pct => (
                 <div key={pct} style={{position:'absolute', width:'100%', height:'1px', background:'var(--border-light)', bottom: `${pct}%`, left:0, zIndex:0}}></div>
               ))}

               {chartData.map((d, i) => (
                 <div key={i} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex:1, height: '100%'}}>
                   <div style={{
                     flex: 1, 
                     display: 'flex', 
                     alignItems: 'flex-end', 
                     width:'100%', 
                     justifyContent:'center',
                     paddingBottom: '8px'
                   }}>
                     <div 
                       title={`Rp ${d.total.toLocaleString('id-ID')}`}
                       style={{
                         width: '70%', 
                         maxWidth: '50px',
                         height: `${Math.max(d.heightPercent, 2)}%`, 
                         background: 'linear-gradient(to top, var(--accent), #5ac8fa)',
                         borderRadius: '6px 6px 0 0',
                         transition: 'height 1s ease-out'
                       }}
                     />
                   </div>
                   <div style={{fontSize:'12px', color:'var(--text2)', borderTop:'1px solid var(--border-light)', width:'100%', textAlign:'center', paddingTop:'8px'}}>{d.label}</div>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Top 5 Produk Terlaris</div></div>
        <div className="card-body" style={{padding:0}}>
           {loading ? (
              <div style={{padding:'40px', textAlign:'center', color:'var(--text3)'}}>Memuat Klasemen...</div>
           ) : topProducts.length === 0 ? (
              <div style={{padding:'40px', textAlign:'center', color:'var(--text3)'}}>Belum ada penjualan.</div>
           ) : (
             <table style={{width:'100%', borderCollapse:'collapse', fontSize:'14px'}}>
               <tbody>
                 {topProducts.map((p, i) => (
                   <tr key={i} style={{borderBottom:'1px solid var(--border-light)'}}>
                     <td style={{padding:'16px', width:'40px', fontWeight:'bold', color:'var(--text3)'}}>#{i+1}</td>
                     <td style={{padding:'16px', fontWeight:'500'}}>{p.title}</td>
                     <td style={{padding:'16px', textAlign:'center'}}>{p.count} Unit</td>
                     <td style={{padding:'16px', textAlign:'right', fontWeight:'bold', color:'var(--accent)'}}>Rp {p.revenue.toLocaleString('id-ID')}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
        </div>
      </div>

    </AppLayout>
  );
}
