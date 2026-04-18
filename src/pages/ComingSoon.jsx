import AppLayout from '../components/AppLayout';
import { Construction } from 'lucide-react';

export default function ComingSoon() {
  return (
    <AppLayout title="Fase Pengembangan">
      <div style={{
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{
          width: '80px', 
          height: '80px', 
          background: '#fff3cd', 
          color: '#856404', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: '24px'
        }}>
          <Construction size={40} />
        </div>
        <h2 style={{fontSize: '24px', marginBottom: '12px'}}>Modul Segera Hadir</h2>
        <p style={{color: 'var(--text2)', maxWidth: '600px', lineHeight: '1.6'}}>
          Menu yang Anda klik saat ini belum kita kembangkan di dalam Rencana Tahap 1. Fitur ini sengaja dikosongkan dahulu atau diagendakan pada iterasi berikutnya.
        </p>
      </div>
    </AppLayout>
  );
}
