import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function AuthScreen() {
  const [screen, setScreen] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (screen === 'login') {
        const { error } = await signIn({ email, password });
        if (error) throw error;
      } else if (screen === 'register') {
        const { error } = await signUp({ 
          email, 
          password,
          options: {
            data: { full_name: name }
          }
        });
        if (error) throw error;
        alert('Cek email Anda untuk konfirmasi pendaftaran.');
        setScreen('login');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (user) return null; // Let the useEffect redirect

  return (
    <>
      {screen === 'login' && (
        <div className="auth-screen">
          <div className="auth-card">
            <div className="auth-logo">
              <div className="logo-mark">Fc</div>
              <div className="logo-text">Fincops</div>
              <div className="logo-sub">Platform Jualan Digital</div>
            </div>
            <div className="auth-title">Masuk ke akun</div>
            <div className="auth-sub">Selamat datang kembali 👋</div>
            
            <form onSubmit={handleAuth}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="email@kamu.com" 
                       value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="••••••••" 
                       value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Memuat...' : 'Masuk'}
              </button>
            </form>
            
            <div className="auth-switch">Belum punya akun? <a onClick={() => setScreen('register')}>Daftar gratis</a></div>
            <div className="auth-switch" style={{marginTop: '8px'}}><a style={{color: 'var(--text2)'}} onClick={() => setScreen('forgot')}>Lupa password?</a></div>
          </div>
        </div>
      )}

      {screen === 'register' && (
        <div className="auth-screen">
          <div className="auth-card">
            <div className="auth-logo">
              <div className="logo-mark">Fc</div>
              <div className="logo-text">Fincops</div>
            </div>
            <div className="auth-title">Buat akun gratis</div>
            <div className="auth-sub">Mulai jualan digital sekarang 🚀</div>
            
            <form onSubmit={handleAuth}>
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input type="text" placeholder="Nama kamu" 
                       value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="email@kamu.com" 
                       value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="Min. 8 karakter" 
                       value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Memuat...' : 'Buat Akun Gratis'}
              </button>
            </form>
            
            <div className="auth-switch">Sudah punya akun? <a onClick={() => setScreen('login')}>Masuk</a></div>
          </div>
        </div>
      )}

      {screen === 'forgot' && (
        <div className="auth-screen">
          <div className="auth-card">
            <div className="auth-logo"><div className="logo-mark">Fc</div></div>
            <div className="auth-title">Reset Password</div>
            <div className="auth-sub">Masukkan email untuk mendapat link reset</div>
            
            <form onSubmit={(e) => { e.preventDefault(); alert('Kirim link reset (Belum Terhubung)'); }}>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="email@kamu.com" />
              </div>
              <button type="submit" className="btn btn-primary">Kirim Link Reset</button>
            </form>
            
            <div className="auth-switch"><a onClick={() => setScreen('login')}>← Kembali ke login</a></div>
          </div>
        </div>
      )}
    </>
  );
}
