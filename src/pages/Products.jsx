import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Edit, Trash, Plus } from 'lucide-react';

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([
          { 
            user_id: user.id,
            title, 
            price: parseFloat(price.replace(/\D/g, '')), 
            description 
          }
        ])
        .select();
        
      if (error) throw error;
      
      setProducts([...data, ...products]);
      setIsModalOpen(false);
      setTitle(''); setPrice(''); setDescription('');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  const actionButton = (
    <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
      <Plus size={16} style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '4px'}}/> Produk Baru
    </button>
  );

  return (
    <AppLayout title="Produk Digital" actionButton={actionButton}>
      <div style={{marginBottom: '20px'}}>
        <div className="section-title">Produk Digital</div>
        <div className="section-sub" style={{marginBottom: 0}}>Kelola semua produk digitalmu</div>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '40px', color: 'var(--text2)'}}>Memuat Produk...</div>
      ) : products.length === 0 ? (
        <div style={{textAlign: 'center', padding: '40px', color: 'var(--text2)', background: 'var(--surface)', borderRadius: '12px'}}>
          Belum ada produk. Klik tombol "+ Produk Baru" untuk menambahkan.
        </div>
      ) : (
        <div className="grid-3">
          {products.map(product => (
            <div className="card" key={product.id} style={{padding: '16px'}}>
              <div style={{
                height: '160px', 
                background: 'linear-gradient(45deg, var(--accent-bg), #e8f4fe)', 
                borderRadius: '8px', 
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
                fontWeight: '600'
              }}>
                {product.image_url ? <img src={product.image_url} alt={product.title} style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'8px'}}/> : 'Tidak ada gambar'}
              </div>
              <h3 style={{fontSize: '16px', margin: '0 0 4px', color: 'var(--text-h)'}}>{product.title}</h3>
              <div style={{fontWeight: '600', color: 'var(--accent)', marginBottom: '8px'}}>Rp {product.price.toLocaleString('id-ID')}</div>
              <p style={{fontSize: '13px', color: 'var(--text2)', marginBottom: '16px'}}>{product.description || 'Tidak ada deskripsi.'}</p>
              
              <div style={{display: 'flex', gap: '8px'}}>
                <button className="btn btn-secondary btn-sm" style={{flex: 1}}><Edit size={14} style={{verticalAlign: 'text-bottom'}} /> Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product.id)}><Trash size={14} style={{verticalAlign: 'text-bottom'}} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Produk */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{width: '90%', maxWidth: '500px', margin: 'auto', padding: '24px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px'}}>
              <h2 style={{margin: 0, fontSize: '20px'}}>Tambah Produk Baru</h2>
              <button style={{background:'none', border:'none', fontSize:'24px', cursor:'pointer', color:'var(--text2)'}} onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleAddProduct}>
              <div className="form-group" style={{marginBottom: '16px'}}>
                <label style={{display:'block', marginBottom:'6px', fontSize:'13px', fontWeight:'500'}}>Judul Produk</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Ebook Jago Jualan" required style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)'}} />
              </div>
              <div className="form-group" style={{marginBottom: '16px'}}>
                <label style={{display:'block', marginBottom:'6px', fontSize:'13px', fontWeight:'500'}}>Harga (Rp)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="50000" required style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)'}} />
              </div>
              <div className="form-group" style={{marginBottom: '16px'}}>
                <label style={{display:'block', marginBottom:'6px', fontSize:'13px', fontWeight:'500'}}>Deskripsi Singkat</label>
                <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Jelaskan produk ini..." style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'inherit'}}></textarea>
              </div>
              <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px'}}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Produk</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
