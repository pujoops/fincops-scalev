import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { PackageSearch, Download } from 'lucide-react';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Join with products table to get product title
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products!inner (title, price, user_id)
        `)
        .eq('products.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Filter out null products (which means the order didn't belong to this user's products)
      const validOrders = data?.filter(o => o.products !== null) || [];
      setOrders(validOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatus = (status) => {
    if(status === 'PAID') return <span className="badge badge-success">Lunas</span>;
    if(status === 'PENDING') return <span className="badge badge-warning">Menunggu</span>;
    return <span className="badge badge-error">{status}</span>;
  };

  return (
    <AppLayout title="Pesanan (Orders)">
      <div style={{marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <div className="section-title">Semua Pesanan</div>
          <div className="section-sub" style={{marginBottom: 0}}>Rekap seluruh transaksi pembeli produk Anda.</div>
        </div>
        <button className="btn btn-secondary btn-sm"><Download size={16}/> Export CSV</button>
      </div>

      <div className="card">
        {loading ? (
           <div style={{padding:'40px', textAlign:'center', color:'var(--text3)'}}>Memuat Data Pesanan...</div>
        ) : orders.length === 0 ? (
          <div style={{padding:'60px 20px', textAlign:'center'}}>
            <PackageSearch size={48} color="var(--border)" style={{margin:'0 auto 16px'}}/>
            <h3 style={{fontSize:'18px', color:'var(--text-h)', marginBottom:'8px'}}>Belum Ada Transaksi</h3>
            <p style={{color:'var(--text2)', fontSize:'14px'}}>Sebarkan link Landing Page Anda untuk mendapatkan pesanan pertama.</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={{width:'100%', borderCollapse:'collapse', fontSize:'14px'}}>
              <thead>
                <tr style={{background:'#f5f5f7', textAlign:'left'}}>
                  <th style={{padding:'12px', borderBottom:'1px solid var(--border-light)'}}>Invoice ID</th>
                  <th style={{padding:'12px', borderBottom:'1px solid var(--border-light)'}}>Pelanggan</th>
                  <th style={{padding:'12px', borderBottom:'1px solid var(--border-light)'}}>Produk</th>
                  <th style={{padding:'12px', borderBottom:'1px solid var(--border-light)', textAlign:'right'}}>Nominal (Rp)</th>
                  <th style={{padding:'12px', borderBottom:'1px solid var(--border-light)', textAlign:'center'}}>Status</th>
                  <th style={{padding:'12px', borderBottom:'1px solid var(--border-light)', textAlign:'right'}}>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{borderBottom:'1px solid #f0f0f0'}}>
                    <td style={{padding:'12px', fontFamily:'monospace', fontSize:'12px'}}>{order.id.split('-')[0]}</td>
                    <td style={{padding:'12px'}}>
                      <div style={{fontWeight:'500'}}>{order.customer_name}</div>
                      <div style={{fontSize:'12px', color:'var(--text3)'}}>{order.customer_email}</div>
                    </td>
                    <td style={{padding:'12px', color:'var(--text2)'}}>{order.products?.title || 'Produk Dihapus'}</td>
                    <td style={{padding:'12px', textAlign:'right', fontWeight:'500'}}>
                      {Number(order.amount_idr).toLocaleString('id-ID')}
                    </td>
                    <td style={{padding:'12px', textAlign:'center'}}>
                     {calculateStatus(order.status)}
                    </td>
                    <td style={{padding:'12px', textAlign:'right', fontSize:'12px', color:'var(--text3)'}}>
                      {new Date(order.created_at).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
