import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShieldCheck, CreditCard } from 'lucide-react';

export default function Checkout() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Buyer form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadProduct();
  }, [id]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      // 1. Catat Order ke Supabase (Status: Pending)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          product_id: product.id,
          seller_id: product.user_id,
          buyer_name: name,
          buyer_email: email,
          buyer_phone: whatsapp,
          amount_total: product.price,
          status: 'Pending'
        }])
        .select('*')
        .single();
        
      if (orderError) throw orderError;

      // 2. Panggil Edge Function Duitku (Untuk generate URL Pembayaran)
      const { data: invoiceData, error: funcError } = await supabase.functions.invoke('create-invoice', {
        body: { orderId: orderData.id }
      });
      
      if (funcError) throw funcError;
      
      if (invoiceData.paymentUrl) {
        alert(invoiceData.message || 'Membuka gerbang pembayaran...');
        window.location.href = invoiceData.paymentUrl;
      }
    } catch (err) {
      alert('Gagal: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Memuat produk...</div>;
  if (!product) return <div style={{textAlign:'center', padding:'50px'}}>Produk tidak ditemukan!</div>;

  return (
    <div style={{minHeight: '100vh', background: '#f5f5f7', display: 'flex', flexDirection: 'column'}}>
      <div style={{background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '16px 20px', textAlign: 'center'}}>
        <div style={{fontSize: '20px', fontWeight: 'bold'}}><span style={{color: 'var(--accent)'}}>Fincops</span> Checkout Aman</div>
      </div>
      
      <div style={{maxWidth: '800px', margin: '40px auto', width: '100%', padding: '0 20px'}}>
        <div className="grid-2">
          
          {/* Detail Produk */}
          <div className="card" style={{padding: '24px'}}>
            <div style={{width: '100%', height: '200px', backgroundColor: '#e8f4fe', borderRadius: '12px', marginBottom: '16px'}} />
            <h1 style={{fontSize: '24px', margin: '0 0 8px'}}>{product.title}</h1>
            <div style={{fontSize: '28px', color: 'var(--accent)', fontWeight: 'bold', marginBottom: '16px'}}>
              Rp {product.price.toLocaleString('id-ID')}
            </div>
            <p style={{color: 'var(--text2)', lineHeight: '1.6'}}>
              {product.description || 'Tidak ada deskripsi rinci untuk produk digital ini.'}
            </p>
            <hr style={{margin: '24px 0', border: 'none', borderTop: '1px dashed var(--border)'}} />
            <div style={{display: 'flex', gap: '8px', color: 'var(--text2)', fontSize: '14px', alignItems: 'center'}}>
              <ShieldCheck size={18} color="green" /> Transaksi diamankan oleh enkripsi Duitku
            </div>
          </div>

          {/* Form Pembeli */}
          <div className="card" style={{padding: '24px'}}>
            <h2 style={{fontSize: '20px', marginBottom: '20px'}}>Informasi Pembeli</h2>
            <form onSubmit={handleCheckout}>
              <div className="form-group" style={{marginBottom: '16px'}}>
                <label style={{display:'block', marginBottom:'6px', fontWeight:'500'}}>Nama Lengkap</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid var(--border)'}} placeholder="Sesuai KTP" />
              </div>
              <div className="form-group" style={{marginBottom: '16px'}}>
                <label style={{display:'block', marginBottom:'6px', fontWeight:'500'}}>Alamat Email Aktif</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid var(--border)'}} placeholder="Akses produk dikirim ke sini" />
              </div>
              <div className="form-group" style={{marginBottom: '24px'}}>
                <label style={{display:'block', marginBottom:'6px', fontWeight:'500'}}>Nomor WhatsApp</label>
                <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid var(--border)'}} placeholder="0812xxxxxx" />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{width: '100%', padding: '16px', fontSize: '16px'}} disabled={isProcessing}>
                <CreditCard size={18} style={{marginRight: '8px', verticalAlign: 'text-bottom'}}/> 
                {isProcessing ? 'Memproses...' : 'Lanjut ke Pembayaran'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
