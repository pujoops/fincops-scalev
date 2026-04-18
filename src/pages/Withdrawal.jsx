import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { CreditCard, CheckCircle } from 'lucide-react';

export default function Withdrawal() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [debts, setDebts] = useState([]);

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('id, affiliator_email, unpaid_commission, products(title)')
        .eq('user_id', user.id)
        .gt('unpaid_commission', 0);
        
      if (error) throw error;
      setDebts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (id, amount) => {
    if(!window.confirm(`Konfirmasi pembayaran Rp ${amount.toLocaleString('id-ID')} kepada Afiliator ini secara transfer bank di luar sistem?`)) return;
    try {
      const { error } = await supabase.from('affiliate_links').update({ unpaid_commission: 0 }).eq('id', id);
      if (error) throw error;
      setDebts(debts.filter(d => d.id !== id));
      alert('Tercatat lunas!');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <AppLayout title="Penarikan Afiliasi (Disbursement)">
      <div style={{marginBottom: '20px'}}>
        <div className="section-title">Antrean Komisi Tertunda</div>
        <div className="section-sub" style={{marginBottom: 0}}>Daftar hak afiliator yang belum Anda transfer. Segera lunasi untuk menjaga kepercayaan.</div>
      </div>

      <div className="card">
        <div className="card-header">
           <div className="card-title" style={{display:'flex', alignItems:'center', gap:'8px'}}>
             <CreditCard size={20} color="var(--red)"/> Harus Segera Ditransfer
           </div>
        </div>
        <div className="card-body" style={{padding:0}}>
          {loading ? (
             <div style={{padding:'40px', textAlign:'center', color:'var(--text3)'}}>Memeriksa Laporan...</div>
          ) : debts.length === 0 ? (
             <div style={{padding:'60px 20px', textAlign:'center'}}>
               <CheckCircle size={48} color="var(--green)" style={{margin:'0 auto 16px'}}/>
               <h3 style={{fontSize:'18px'}}>Luar Biasa!</h3>
               <p style={{color:'var(--text2)', fontSize:'14px'}}>Tidak ada tunggakan hadiah komisi afiliasi saat ini. Seluruh rekap Anda bersih.</p>
             </div>
          ) : (
            <table style={{width:'100%', borderCollapse:'collapse', fontSize:'14px'}}>
               <thead>
                 <tr style={{background:'#f5f5f7', textAlign:'left'}}>
                   <th style={{padding:'16px', borderBottom:'1px solid var(--border-light)'}}>Afiliator</th>
                   <th style={{padding:'16px', borderBottom:'1px solid var(--border-light)'}}>Produk Rujukan</th>
                   <th style={{padding:'16px', borderBottom:'1px solid var(--border-light)', textAlign:'right'}}>Nominal Hutang Komisi</th>
                   <th style={{padding:'16px', borderBottom:'1px solid var(--border-light)', textAlign:'right'}}>Aksi Pelunasan</th>
                 </tr>
               </thead>
               <tbody>
                 {debts.map(d => (
                   <tr key={d.id} style={{borderBottom:'1px solid var(--border-light)'}}>
                     <td style={{padding:'16px', fontWeight:'500'}}>{d.affiliator_email}</td>
                     <td style={{padding:'16px', color:'var(--text2)'}}>{d.products?.title}</td>
                     <td style={{padding:'16px', textAlign:'right', fontWeight:'bold', color:'var(--red)'}}>Rp {Number(d.unpaid_commission).toLocaleString('id-ID')}</td>
                     <td style={{padding:'16px', textAlign:'right'}}>
                       <button className="btn btn-primary btn-sm" onClick={() => markAsPaid(d.id, d.unpaid_commission)}>
                         Tandai Sudah Ditransfer
                       </button>
                     </td>
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
