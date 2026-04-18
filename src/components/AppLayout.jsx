import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { 
  LayoutDashboard, ShoppingBag, Box, LayoutTemplate, 
  GraduationCap, Share2, LineChart, Mail, Settings, CreditCard,
  Bell, Plus
} from 'lucide-react';

export default function AppLayout({ children, title = 'Dashboard', actionButton }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();

  const navItemsUtama = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'orders', label: 'Order', icon: ShoppingBag, path: '/orders' },
    { id: 'products', label: 'Produk', icon: Box, path: '/products' },
    { id: 'landing', label: 'Landing Page', icon: LayoutTemplate, path: '/landing' },
    { id: 'lms', label: 'LMS / Kelas', icon: GraduationCap, path: '/lms' },
  ];

  const navItemsMarketing = [
    { id: 'affiliate', label: 'Afiliasi', icon: Share2, path: '/affiliate' },
    { id: 'analytics', label: 'Analitik', icon: LineChart, path: '/analytics' },
    { id: 'email', label: 'Email Follow-up', icon: Mail, path: '/email' },
  ];

  const navItemsAkun = [
    { id: 'settings', label: 'Pengaturan', icon: Settings, path: '/settings' },
    { id: 'withdrawal', label: 'Withdrawal', icon: CreditCard, path: '/withdrawal' },
  ];

  const renderNavItems = (items) => {
    return items.map((item) => {
      const Icon = item.icon;
      const isActive = location.pathname.startsWith(item.path);
      return (
        <div 
          key={item.id} 
          className={`nav-item ${isActive ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <Icon size={20} />
          <span>{item.label}</span>
          {item.badge && <span className="nav-badge">{item.badge}</span>}
        </div>
      );
    });
  };

  const userInitial = user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A';
  const userName = user?.user_metadata?.full_name || 'Admin Fincops';

  return (
    <div className="app active">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">Fc</div>
          <div className="logo-text">Fincops</div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-label">Utama</div>
            {renderNavItems(navItemsUtama)}
          </div>
          <div className="nav-section">
            <div className="nav-section-label">Marketing</div>
            {renderNavItems(navItemsMarketing)}
          </div>
          <div className="nav-section">
            <div className="nav-section-label">Akun</div>
            {renderNavItems(navItemsAkun)}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile" onClick={() => navigate('/settings')}>
            <div className="avatar">{userInitial}</div>
            <div className="user-info">
              <div className="user-name">{userName}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{width: '100%', marginTop: '8px'}} onClick={signOut}>
            Keluar
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-title">{title}</div>
          <div className="topbar-actions">
            <button className="btn btn-secondary btn-sm" onClick={() => alert('Fitur Notifikasi akan hadir pada versi mendatang.')}>
              <Bell size={16} />
            </button>
            {actionButton || (
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/products')}>
                <Plus size={16} style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '4px'}}/> Produk Baru
              </button>
            )}
          </div>
        </div>
        
        <div className="page-content active">
          {children}
        </div>
      </main>
    </div>
  );
}
