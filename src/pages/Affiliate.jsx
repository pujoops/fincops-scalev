import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Copy, Users, DollarSign, Settings as SettingsIcon } from 'lucide-react';

export default function Affiliate() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ default_commission: 20, cookie_duration: 30, is_active: false });
  const [stats, setStats] = useState({ total_affiliators: 0, total_unpaid: 0 });
  
  // Data Affiliators yang bergabung
  const [affiliateLinks, setAffiliateLinks] = useState([]);

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      setLoading(true);
      // Fetch Settings
      const { data: setRes, error: errSet } = await supabase.from('affiliate_settings').select('*').eq('user_id', user.id).single();
      if (!errSet && setRes) {
        setSettings(setRes);
      } else if (errSet && errSet.code === 'PGRST116') {
        // Insert default if absent
        const { error: errIns } = await supabase.from('affiliate_settings').insert([{ user_id: user.id }]);
        if(errIns) console.error(errIns);
      }

      // Fetch Links/Affiliators data
      const { data: linkRes, error: errLink } = await supabase.from('affiliate_links').select('*, products(title)').eq('user_id', user.id);
      if (!errLink && linkRes) {
        setAffiliateLinks(linkRes);
        setStats({
          total_affiliators: new Set(linkRes.map(l => l.affiliator_email)).size,
          total_unpaid: linkRes.reduce((acc, curr) => acc + Number(curr.unpaid_commission), 0)
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const { error } = await supabase.from('affiliate_settings')
        .update({ 
          default_commission: settings.default_commission, 
          cookie_duration: settings.cookie_duration, 
          is_active: settings.is_active 
        })
        .eq('user_id', user.id);
      if (error) throw error;
      alert('Pengaturan afiliasi berhasil disimpan!');
    } catch (err) {
      alert('Gagal menyimpan pengaturan: ' + err.message);
    }
  };

  const payAffiliate = async (linkId) => {
    if(!window.confirm('Tandai tagihan Afiliator ini sebagai sudah Anda lunasi secara transfer Bank manual?')) return;
    try {
      const { error } = await supabase.from('affiliate_links').update({ unpaid_commission: 0 }).eq('id', linkId);
      if (error) throw error;
      alert('Tercatat lunas!');
      fetchAffiliateData(); // Refresh stats
    } catch (err) {
      alert(err.message);
    }
  };

  const copyLink = (code) => {
    // Generate dummy domain format for now
    const url = `${window.location.origin}/p/${code}?ref=1`;
    navigator.clipboard.writeText(url);
    alert('Link Afiliasi disalin!');
  };

  return (
    <AppLayout title="Sistem Afiliasi">
      <div style={{marginBottom: '20px'}}>
        <div className="section-title">Sistem Afiliasi Terpusat</div>
        <div className="section-sub" style={{marginBottom: 0}}>Buka peluang orang lain mempromosikan dagangan Anda</div>
      </div>

      <div className="grid-2" style={{marginBottom:'24px'}}>
        <div className="stat-card">
          <div className="stat-label">Total Afiliator Aktif</div>
          <div className="stat-value">{stats.total_affiliators}</div>
          <div className="stat-icon" style={{background:'#e8faf0'}}><Users size={24} color="#00ca51"/></div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Hutang Komisi (Belum Dibayar)</div>
          <div className="stat-value" style={{color: stats.total_unpaid > 0 ? 'var(--red)' : 'var(--text-h)'}}>
            Rp {stats.total_unpaid.toLocaleString('id-ID')}
          </div>
          <div className="stat-icon" style={{background:'#fff0ee'}}><DollarSign size={24} color="#ff3b30"/></div>
        </div>
      </div>

      <div className="grid-2" style={{alignItems: 'start'}}>
        {/* PENGATURAN */}
        <div className="card">
          <div className="card-header" style={{display:'flex', gap:'8px', alignItems:'center'}}>
            <SettingsIcon size={18} color="var(--accent)"/> <div className="card-title" style={{margin:0}}>Pengaturan Base</div>
          </div>
          <div className="card-body">
            <div className="form-group" style={{marginBottom:'16px'}}>
              <label style={{display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px'}}>Komisi Default (%)</label>
              <input type="number" min="1" max="90" value={settings.default_commission} onChange={(e)=>setSettings({...settings, default_commission: Number(e.target.value)})} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid var(--border)'}}/>
            </div>
            <div className="form-group" style={{marginBottom:'16px'}}>
              <label style={{display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px'}}>Durasi Cookie (Hari)</label>
              <input type="number" min="1" value={settings.cookie_duration} onChange={(e)=>setSettings({...settings, cookie_duration: Number(e.target.value)})} style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid var(--border)'}}/>
            </div>
            
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 0', borderTop:'1px solid var(--border-light)'}}>
              <div>
                <div style={{fontWeight:'600'}}>Program Afiliasi Aktif</div>
                <div style={{fontSize:'13px', color:'var(--text2)'}}>Izinkan publik mendaftar afiliasi.</div>
              </div>
              <button 
                onClick={() => setSettings({...settings, is_active: !settings.is_active})}
                style={{
                  width:'46px', height:'26px', borderRadius:'26px', border:'none', cursor:'pointer', position:'relative', transition:'0.3s',
                  background: settings.is_active ? 'var(--accent)' : 'var(--border)'
                }}
              >
                <div style={{
                  width:'22px', height:'22px', background:'#fff', borderRadius:'50%', position:'absolute', top:'2px', transition:'0.3s',
                  left: settings.is_active ? '22px' : '2px'
                }}></div>
              </button>
            </div>
            
            <button className="btn btn-primary" style={{width:'100%', marginTop:'8px'}} onClick={saveSettings}>Simpan Pengaturan</button>
          </div>
        </div>

        {/* DAFTAR AFILIATOR */}
        <div className="card">
          <div className="card-header"><div className="card-title">Daftar Afiliator / Penjualan</div></div>
          {loading ? (
             <div style={{padding:'40px', textAlign:'center', color:'var(--text3)'}}>Memuat Data...</div>
          ) : affiliateLinks.length === 0 ? (
            <div style={{padding:'40px 20px', textAlign:'center'}}>
              <div style={{color:'var(--text3)', fontSize:'14px'}}>Belum ada satupun afiliator yang bergabung.</div>
            </div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table style={{width:'100%', borderCollapse:'collapse', fontSize:'14px'}}>
                <thead>
                  <tr style={{background:'#f5f5f7', textAlign:'left'}}>
                    <th style={{padding:'12px', borderBottom:'1px solid var(--border-light)'}}>Email Rekan</th>
                    <th style={{padding:'12px', borderBottom:'1px solid var(--border-light)'}}>Stats</th>
                    <th style={{padding:'12px', borderBottom:'1px solid var(--border-light)', textAlign:'right'}}>Komisi</th>
                    <th style={{padding:'12px', borderBottom:'1px solid var(--border-light)', textAlign:'right'}}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliateLinks.map(link => (
                    <tr key={link.id} style={{borderBottom:'1px solid #f0f0f0'}}>
                      <td style={{padding:'12px'}}>
                        <div style={{fontWeight:'500'}}>{link.affiliator_email}</div>
                        <div style={{fontSize:'12px', color:'var(--text3)'}}>{link.products?.title}</div>
                      </td>
                      <td style={{padding:'12px'}}>
                        <div style={{fontSize:'12px'}}>Klik: {link.clicks}</div>
                        <div style={{fontSize:'12px'}}>Sales: {link.sales}</div>
                      </td>
                      <td style={{padding:'12px', textAlign:'right', fontWeight:'bold', color: link.unpaid_commission > 0 ? 'var(--red)' : 'var(--text2)'}}>
                        Rp {Number(link.unpaid_commission).toLocaleString('id-ID')}
                      </td>
                      <td style={{padding:'12px', textAlign:'right'}}>
                        <div style={{display:'flex', gap:'8px', justifyContent:'flex-end'}}>
                          <button className="btn btn-secondary btn-xs" onClick={() => copyLink(link.custom_code)} title="Copy Link Aff">
                            <Copy size={14}/>
                          </button>
                          {link.unpaid_commission > 0 && (
                            <button className="btn btn-primary btn-xs" onClick={() => payAffiliate(link.id)}>Sudah Ditransfer</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
