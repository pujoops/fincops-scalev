import AppLayout from '../components/AppLayout';
import { Mail, Send, Activity, Info } from 'lucide-react';

export default function Email() {
  return (
    <AppLayout title="Sistem Email Otomatis">
      <div style={{marginBottom: '20px'}}>
        <div className="section-title">Log Email SMTP</div>
        <div className="section-sub" style={{marginBottom: 0}}>Rekam jejak aliran email transaksi otomatis ke pelanggan (via SMTP Resend).</div>
      </div>

      <div className="grid-2" style={{marginBottom: '24px'}}>
        <div className="stat-card">
          <div className="stat-label">Email Terkirim Bulan Ini</div>
          <div className="stat-value">0 / 3000</div>
          <div className="stat-change">Kuota Batas SMTP Gratis</div>
          <div className="stat-icon" style={{background: '#f5eeff'}}><Send size={24} color="var(--primary)"/></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tingkat Kegagalan (Bounces)</div>
          <div className="stat-value">0%</div>
          <div className="stat-change">Kesehatan domain sangat baik</div>
          <div className="stat-icon" style={{background: '#e8faf0'}}><Activity size={24} color="var(--green)"/></div>
        </div>
      </div>

      <div style={{padding:'20px', background:'#e8f4fe', borderRadius:'12px', marginBottom:'24px', display:'flex', gap:'12px', border:'1px solid #b8daff'}}>
        <Info size={24} color="var(--accent)"/>
        <div>
          <h4 style={{margin:'0 0 6px 0', color:'var(--accent)'}}>Modul Integrasi Keamanan SMTP</h4>
          <p style={{margin:0, fontSize:'14px', color:'var(--text2)', lineHeight:'1.5'}}>
            Fincops dirancang untuk mengirimkan email resi ketika pelanggan melunasi tagihan (Duitku), dan mengirimkan tautan akses ke produk secara otomatis. Untuk memandu transmisi ini, Anda perlu meminta konsultan teknis Fincops menyuntikkan API Key Resend/Brevo ke dalam Supabase Edge Functions. Ini memproteksi alamat penjual agar tidak masuk spam.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
           <div className="card-title" style={{display:'flex', alignItems:'center', gap:'8px'}}>
             <Mail size={20} color="var(--accent)"/> Log Skenario Pengiriman
           </div>
        </div>
        <div className="card-body" style={{padding:0}}>
           <div style={{padding:'60px 20px', textAlign:'center'}}>
             <Mail size={48} color="var(--border)" style={{margin:'0 auto 16px'}}/>
             <h3 style={{fontSize:'18px', color:'var(--text-h)', marginBottom:'8px'}}>Belum Ada Riwayat Mailbox</h3>
             <p style={{color:'var(--text2)', fontSize:'14px'}}>Sistem otomatis (*Abandoned Cart / Lunas*) baru akan mencatat log kemari apabila *Secret Key* SMTP Anda telah aktif.</p>
           </div>
        </div>
      </div>
    </AppLayout>
  );
}
