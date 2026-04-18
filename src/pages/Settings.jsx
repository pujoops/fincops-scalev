import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { UserCircle, Shield, Building } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ fullName: '', phone: '', bankName: '', bankAccount: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Populate from Auth User metadata
    if(user?.user_metadata) {
      setProfile({
        fullName: user.user_metadata.full_name || '',
        phone: user.user_metadata.phone || '',
        bankName: user.user_metadata.bankName || '',
        bankAccount: user.user_metadata.bankAccount || '',
      });
    }
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: profile
      });
      if (error) throw error;
      alert('Info Profil berhasil disimpan!');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if(!window.confirm('Kirim email reset password ke ' + user.email + '?')) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      if (error) throw error;
      alert('Tautan reset password berhasil dikirim ke email Anda!');
    } catch(err) {
      alert(err.message);
    }
  };

  return (
    <AppLayout title="Pengaturan Akun">
       <div style={{marginBottom: '20px'}}>
        <div className="section-title">Profil & Preferensi</div>
        <div className="section-sub" style={{marginBottom: 0}}>Atur informasi bisnis dan penarikan bank Anda.</div>
      </div>

      <div className="grid-2" style={{alignItems: 'start'}}>
        
        {/* PROFIL UTAMA */}
        <div className="card">
          <div className="card-header">
             <div className="card-title" style={{display:'flex', alignItems:'center', gap:'8px'}}>
               <UserCircle size={20} color="var(--accent)"/> Data Diri Pemilik
             </div>
          </div>
          <div className="card-body">
            <form onSubmit={saveProfile}>
              <div className="form-group" style={{marginBottom:'16px'}}>
                <label style={{display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px'}}>Alamat Email (Login ID)</label>
                <input type="text" value={user?.email || ''} readOnly disabled style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid var(--border)', background:'#f5f5f7', color:'var(--text2)'}}/>
              </div>
              <div className="form-group" style={{marginBottom:'16px'}}>
                <label style={{display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px'}}>Nama Lengkap Pribadi / Biosis Bisnis</label>
                <input type="text" value={profile.fullName} onChange={e=>setProfile({...profile, fullName: e.target.value})} placeholder="Misal: PT Fincops Maju" style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid var(--border)'}}/>
              </div>
              <div className="form-group" style={{marginBottom:'24px'}}>
                <label style={{display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px'}}>Nomor Telepon (WhatsApp)</label>
                <input type="text" value={profile.phone} onChange={e=>setProfile({...profile, phone: e.target.value})} placeholder="6281xxxx" style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid var(--border)'}}/>
              </div>
              
              <div style={{borderTop:'1px solid var(--border-light)', paddingTop:'20px', marginBottom:'24px'}}>
                <h4 style={{margin:'0 0 16px 0', display:'flex', alignItems:'center', gap:'8px'}}><Building size={16}/> Informasi Rekening Pencairan</h4>
                <div className="form-group" style={{marginBottom:'16px'}}>
                  <label style={{display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px'}}>Nama Bank (BCA/Mandiri/dsb)</label>
                  <input type="text" value={profile.bankName} onChange={e=>setProfile({...profile, bankName: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid var(--border)'}}/>
                </div>
                <div className="form-group" style={{marginBottom:'16px'}}>
                  <label style={{display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px'}}>Nomor Rekening</label>
                  <input type="text" value={profile.bankAccount} onChange={e=>setProfile({...profile, bankAccount: e.target.value})} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid var(--border)'}}/>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{width:'100%'}} disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
              </button>
            </form>
          </div>
        </div>

        {/* KEAMANAN */}
        <div className="card">
          <div className="card-header">
             <div className="card-title" style={{display:'flex', alignItems:'center', gap:'8px'}}>
               <Shield size={20} color="var(--red)"/> Keamanan & Sistem
             </div>
          </div>
          <div className="card-body">
             <div style={{padding:'16px', background:'#fff0ee', borderRadius:'8px', marginBottom:'20px', border:'1px solid #fedcdb'}}>
               <h4 style={{color:'var(--red)', margin:'0 0 8px 0'}}>Kata Sandi Akses</h4>
               <p style={{fontSize:'13px', color:'var(--text2)', margin:'0 0 12px 0'}}>Gunakan fitur ini jika Anda mencurigai ada pihak lain yang mengetahui kata sandi Fincops Anda.</p>
               <button className="btn" style={{background:'#fff', color:'var(--red)', border:'1px solid var(--red)'}} onClick={handlePasswordReset}>Kirim Tautan Atur Ulang Sandi</button>
             </div>
             
             <div style={{padding:'16px', background:'#f5f5f7', borderRadius:'8px'}}>
               <h4 style={{margin:'0 0 8px 0'}}>Database & Storage Limit</h4>
               <p style={{fontSize:'13px', color:'var(--text2)', margin:'0 0 12px 0'}}>Anda menggunakan Database Supabase Publik Fincops dengan pembagian multitenant RLS. Tagihan limit gratis bulanan diatur oleh administrator pusat.</p>
             </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
