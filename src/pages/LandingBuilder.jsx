import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { ArrowLeft, Save, Code, LayoutTemplate, Type, Image as ImageIcon, Send, Clock, MessageSquare, HelpCircle, Columns } from 'lucide-react';

const BLOCK_TYPES = [
  { type: 'hero', icon: <LayoutTemplate size={16}/>, label: 'Hero / Header' },
  { type: 'text', icon: <Type size={16}/>, label: 'Teks & Judul' },
  { type: 'image', icon: <ImageIcon size={16}/>, label: 'Gambar' },
  { type: 'cta', icon: <Send size={16}/>, label: 'Call to Action' },
  { type: 'countdown', icon: <Clock size={16}/>, label: 'Countdown Timer' },
  { type: 'testimonial', icon: <MessageSquare size={16}/>, label: 'Testimonial' },
  { type: 'faq', icon: <HelpCircle size={16}/>, label: 'FAQ' },
  { type: 'html', icon: <Code size={16}/>, label: 'Custom HTML' },
  { type: 'form', icon: <Columns size={16}/>, label: 'Form Order' }
];

const DEFAULT_CONTENT = {
  hero: { title: 'Tulis Judul Penawaran Paling Menarik Disini', subtitle: 'Jelaskan manfaat utama dari produk yang membuat pengunjung ingin membeli.' },
  text: { content: '<p>Ketik penjelasan detail atau narasi produk disini...</p>' },
  image: { url: 'https://via.placeholder.com/800x400?text=Gambar+Placeholder' },
  cta: { buttonText: 'Beli Sekarang', link: '#' },
  countdown: { targetDate: new Date(Date.now() + 86400000).toISOString() },
  testimonial: { name: 'Budi Santoso', comment: 'Sangat bermanfaat! Saya merekomendasikan produk ini.' },
  faq: { question: 'Apakah ini sekali bayar?', answer: 'Ya, Anda hanya membayar 1 kali untuk akses selamanya.' },
  html: { rawHtml: '<div style="padding: 20px; background: #eee; text-align: center;">\n  <h3>Ini kode HTML Kustom</h3>\n  <p>Silakan edit saya sesuka hati!</p>\n</div>' },
  form: { notice: 'Form checkout otomatis akan muncul di sini saat di-publish.' }
};

export default function LandingBuilder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  
  const [blocks, setBlocks] = useState([]);
  const [draggedType, setDraggedType] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Editor Modal
  const [editingBlockIndex, setEditingBlockIndex] = useState(null);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      loadLandingPage(selectedProductId);
    } else {
      setBlocks([]);
    }
  }, [selectedProductId]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('products').select('id, title').eq('user_id', user.id);
      if (error) throw error;
      setProducts(data || []);
      if (data && data.length > 0) setSelectedProductId(data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const loadLandingPage = async (pid) => {
    try {
      const { data, error } = await supabase.from('landing_pages').select('blocks').eq('product_id', pid).single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      setBlocks(data ? data.blocks : []);
    } catch (err) {
      console.error('Gagal memuat landing page:', err);
    }
  };

  const saveLandingPage = async () => {
    if (!selectedProductId) return alert('Pilih produk terlebih dahulu!');
    setIsSaving(true);
    try {
      const payload = { product_id: selectedProductId, user_id: user.id, blocks };
      
      const { data: existing } = await supabase.from('landing_pages').select('id').eq('product_id', selectedProductId).single();
      
      if (existing) {
        const { error } = await supabase.from('landing_pages').update({ blocks }).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('landing_pages').insert([payload]);
        if (error) throw error;
      }
      alert('Landing Page berhasil disimpan!');
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragStart = (e, type) => {
    setDraggedType(type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedType) {
      const newBlock = { 
        id: Date.now().toString(), 
        type: draggedType, 
        content: JSON.parse(JSON.stringify(DEFAULT_CONTENT[draggedType])) 
      };
      setBlocks([...blocks, newBlock]);
      setDraggedType(null);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const removeBlock = (index) => {
    setBlocks(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index, dir) => {
    const newBlocks = [...blocks];
    if (dir === 'up' && index > 0) {
      [newBlocks[index-1], newBlocks[index]] = [newBlocks[index], newBlocks[index-1]];
    } else if (dir === 'down' && index < newBlocks.length - 1) {
      [newBlocks[index+1], newBlocks[index]] = [newBlocks[index], newBlocks[index+1]];
    }
    setBlocks(newBlocks);
  };

  const openEditor = (index) => {
    setEditingBlockIndex(index);
    setEditForm(JSON.parse(JSON.stringify(blocks[index].content)));
  };

  const saveEditor = () => {
    const newBlocks = [...blocks];
    newBlocks[editingBlockIndex].content = editForm;
    setBlocks(newBlocks);
    setEditingBlockIndex(null);
  };

  // Renderer untuk Kanvas (Preview)
  const renderBlockPreview = (block) => {
    switch(block.type) {
      case 'hero':
        return <div style={{textAlign:'center', padding:'60px 20px', background:'#fff', borderBottom:'1px solid #eee'}}>
          <h1 style={{fontSize:'32px', marginBottom:'16px'}}>{block.content.title}</h1>
          <p style={{fontSize:'18px', color:'#666'}}>{block.content.subtitle}</p>
        </div>;
      case 'text':
        return <div style={{padding:'20px', lineHeight:'1.6'}} dangerouslySetInnerHTML={{__html: block.content.content}} />;
      case 'image':
        return <div style={{padding:'20px', textAlign:'center'}}><img src={block.content.url} alt="block" style={{maxWidth:'100%', borderRadius:'8px'}}/></div>;
      case 'cta':
        return <div style={{padding:'40px 20px', textAlign:'center', background:'#f8f9fa'}}>
          <a href={block.content.link} className="btn btn-primary" style={{padding:'15px 30px', fontSize:'18px'}}>{block.content.buttonText}</a>
        </div>;
      case 'html': // Fitur Custom HTML Render
        return <div dangerouslySetInnerHTML={{__html: block.content.rawHtml}} />;
      default:
        return <div style={{padding:'20px', textAlign:'center', background:'#f5f5f5', border:'1px dashed #ccc'}}>Preview '{block.type}' block</div>;
    }
  };

  return (
    <div style={{display:'flex', minHeight:'100vh', background:'#f0f2f5', fontFamily:'var(--font-sans, "DM Sans")'}}>
      
      {/* SIDEBAR PROPERTIES */}
      <div style={{width:'280px', background:'#fff', borderRight:'1px solid #e5e5e5', display:'flex', flexDirection:'column', zIndex:10}}>
        <div style={{padding:'20px', borderBottom:'1px solid #e5e5e5', display:'flex', alignItems:'center', gap:'12px'}}>
          <button onClick={() => navigate('/dashboard')} style={{background:'none', border:'none', cursor:'pointer'}}><ArrowLeft size={20}/></button>
          <div style={{fontWeight:'600', fontSize:'16px'}}>Landing Builder</div>
        </div>
        
        <div style={{padding:'20px', flex:1, overflowY:'auto'}}>
          <div style={{marginBottom:'24px'}}>
            <label style={{fontSize:'13px', fontWeight:'600', color:'#555', marginBottom:'8px', display:'block'}}>Pilih Produk target:</label>
            <select style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ccc'}} value={selectedProductId} onChange={e=>setSelectedProductId(e.target.value)}>
              <option value="" disabled>-- Pilih Produk --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>

          <label style={{fontSize:'12px', fontWeight:'bold', color:'#888', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'12px', display:'block'}}>Tarik Blok (Drag)</label>
          <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            {BLOCK_TYPES.map(bt => (
              <div 
                key={bt.type}
                draggable
                onDragStart={(e) => handleDragStart(e, bt.type)}
                style={{
                  display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', background:'#f8f9fa', 
                  border:'1px solid #eef0f2', borderRadius:'8px', cursor:'grab', transition:'0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#eef0f2'}
              >
                <div style={{color:'var(--accent)'}}>{bt.icon}</div>
                <div style={{fontSize:'14px', fontWeight:'500'}}>{bt.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{padding:'20px', borderTop:'1px solid #e5e5e5'}}>
          <button onClick={saveLandingPage} disabled={isSaving || !selectedProductId} className="btn btn-primary" style={{width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'12px'}}>
            <Save size={18}/> {isSaving ? 'Menyimpan...' : 'Simpan & Publish'}
          </button>
        </div>
      </div>

      {/* KANVAS BUILDER */}
      <div 
        style={{flex:1, overflowY:'auto', padding:'40px', position:'relative'}} 
        onDrop={handleDrop} 
        onDragOver={handleDragOver}
      >
        <div style={{maxWidth:'800px', margin:'0 auto', minHeight:'600px', background:'#fff', boxShadow:'0 10px 40px rgba(0,0,0,0.05)', borderRadius:'12px', overflow:'hidden', position:'relative'}}>
          
          {blocks.length === 0 ? (
            <div style={{height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#999', padding:'100px 20px'}}>
              <LayoutTemplate size={48} style={{opacity:0.3, marginBottom:'16px'}}/>
              <h2 style={{fontSize:'20px', margin:'0 0 8px', color:'#666'}}>Kanvas Kosong</h2>
              <p>Tarik masuk blok dari panel kiri ke area kanvas putih ini.</p>
            </div>
          ) : (
            blocks.map((block, index) => (
              <div key={block.id} style={{position:'relative', border:'2px solid transparent', transition:'0.2s', group: 'block-hover'}} 
                   onMouseOver={(e) => e.currentTarget.style.border = '2px dashed var(--accent)'} 
                   onMouseOut={(e) => e.currentTarget.style.border = '2px solid transparent'}>
                {renderBlockPreview(block)}
                
                {/* Block Overlays / Controls */}
                <div style={{position:'absolute', top:'10px', right:'10px', display:'flex', gap:'6px', opacity: 0.8}}>
                  <button onClick={() => moveBlock(index, 'up')} style={{padding:'6px 12px', background:'#fff', border:'1px solid #ccc', borderRadius:'4px', cursor:'pointer'}}>↑</button>
                  <button onClick={() => moveBlock(index, 'down')} style={{padding:'6px 12px', background:'#fff', border:'1px solid #ccc', borderRadius:'4px', cursor:'pointer'}}>↓</button>
                  <button onClick={() => openEditor(index)} style={{padding:'6px 12px', background:'#007AFF', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}>Edit</button>
                  <button onClick={() => removeBlock(index)} style={{padding:'6px 12px', background:'#FF3B30', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}>Hapus</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SETTINGS MODAL */}
      {editingBlockIndex !== null && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.6)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div style={{background:'#fff', width:'600px', borderRadius:'12px', padding:'24px', boxShadow:'0 20px 40px rgba(0,0,0,0.2)'}}>
            <h2 style={{marginTop:0, marginBottom:'20px'}}>Edit Blok: {blocks[editingBlockIndex].type.toUpperCase()}</h2>
            
            <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
              {Object.keys(editForm).map(key => {
                const label = key.charAt(0).toUpperCase() + key.slice(1);
                
                // Khusus untuk Teks Area / Custom HTML
                if (key === 'rawHtml' || key === 'content' || key === 'subtitle') {
                  return (
                    <div key={key}>
                      <label style={{display:'block', marginBottom:'6px', fontWeight:'600'}}>{label}</label>
                      <textarea 
                        rows={key === 'rawHtml' ? 12 : 4}
                        style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #ccc', fontFamily: key === 'rawHtml' ? 'monospace' : 'inherit', fontSize:'14px'}}
                        value={editForm[key]}
                        onChange={e => setEditForm({...editForm, [key]: e.target.value})}
                      />
                    </div>
                  );
                }

                // Default input teks biasa
                return (
                  <div key={key}>
                    <label style={{display:'block', marginBottom:'6px', fontWeight:'600'}}>{label}</label>
                    <input 
                      type="text" 
                      style={{width:'100%', padding:'12px', borderRadius:'8px', border:'1px solid #ccc', fontSize:'14px'}}
                      value={editForm[key]}
                      onChange={e => setEditForm({...editForm, [key]: e.target.value})}
                    />
                  </div>
                );
              })}
            </div>

            <div style={{display:'flex', justifyContent:'flex-end', gap:'12px', marginTop:'24px'}}>
              <button className="btn btn-secondary" onClick={() => setEditingBlockIndex(null)}>Batal</button>
              <button className="btn btn-primary" onClick={saveEditor}>Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
