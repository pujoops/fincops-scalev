import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Helper sama dengan di Builder
const renderBlock = (block, navigate, productId) => {
  switch(block.type) {
    case 'hero':
      return <div style={{textAlign:'center', padding:'80px 20px', background:'#fff'}}>
        <h1 style={{fontSize:'42px', marginBottom:'20px', color:'var(--text)'}}>{block.content.title}</h1>
        <p style={{fontSize:'20px', color:'var(--text2)', maxWidth:'600px', margin:'0 auto'}}>{block.content.subtitle}</p>
      </div>;
    case 'text':
      return <div style={{padding:'40px 20px', maxWidth:'800px', margin:'0 auto', lineHeight:'1.8', fontSize:'18px'}} dangerouslySetInnerHTML={{__html: block.content.content}} />;
    case 'image':
      return <div style={{padding:'40px 20px', textAlign:'center', maxWidth:'1000px', margin:'0 auto'}}>
        <img src={block.content.url} alt="block" style={{maxWidth:'100%', borderRadius:'12px', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}}/>
      </div>;
    case 'cta':
      return <div style={{padding:'60px 20px', textAlign:'center', background:'#f8f9fa'}}>
        <button onClick={() => navigate(`/checkout/${productId}`)} className="btn btn-primary" style={{padding:'20px 40px', fontSize:'22px', borderRadius:'12px'}}>
          {block.content.buttonText}
        </button>
      </div>;
    case 'countdown':
      // Timer Sederhana
      return <div style={{padding:'40px 20px', textAlign:'center', background:'#fff0ee', color:'#ff3b30', fontSize:'24px', fontWeight:'bold'}}>
        ⏳ Penawaran Terbatas (Hingga {new Date(block.content.targetDate).toLocaleDateString('id-ID')})
      </div>;
    case 'testimonial':
      return <div style={{padding:'40px 20px', textAlign:'center', background:'#fff', maxWidth:'600px', margin:'0 auto', border:'1px solid #eee', borderRadius:'16px'}}>
        <div style={{fontSize:'24px', marginBottom:'16px'}}>⭐⭐⭐⭐⭐</div>
        <p style={{fontSize:'18px', fontStyle:'italic', color:'var(--text2)', marginBottom:'16px'}}>"{block.content.comment}"</p>
        <div style={{fontWeight:'bold'}}>- {block.content.name}</div>
      </div>;
    case 'faq':
      return <div style={{padding:'40px 20px', maxWidth:'800px', margin:'0 auto'}}>
        <h3 style={{fontSize:'24px', marginBottom:'16px'}}>Tanya Jawab</h3>
        <div style={{borderBottom:'1px solid #eee', paddingBottom:'16px'}}>
          <div style={{fontWeight:'bold', fontSize:'18px', marginBottom:'8px'}}>Q: {block.content.question}</div>
          <div style={{color:'var(--text2)', fontSize:'16px'}}>A: {block.content.answer}</div>
        </div>
      </div>;
    case 'html': 
      return <div dangerouslySetInnerHTML={{__html: block.content.rawHtml}} />;
    case 'form':
      return <div style={{padding:'60px 20px', textAlign:'center', background:'#e8f4fe'}}>
        <h2 style={{marginBottom:'16px'}}>Siap Membeli?</h2>
        <p style={{marginBottom:'24px', color:'var(--text2)'}}>Langsung meluncur ke kasir aman kami.</p>
        <button onClick={() => navigate(`/checkout/${productId}`)} className="btn btn-primary" style={{padding:'16px 32px'}}>Lanjut ke Pembayaran</button>
      </div>;
    default:
      return null;
  }
};

export default function LandingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPage() {
      try {
        const { data, error } = await supabase.from('landing_pages').select('blocks').eq('product_id', id).single();
        if (error) throw error;
        setBlocks(data.blocks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchPage();
  }, [id]);

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Memuat Halaman...</div>;
  
  if (blocks.length === 0) return (
    <div style={{textAlign:'center', padding:'100px 20px'}}>
      <h1>Ups! Halaman Tidak Tersedia</h1>
      <p style={{color:'#666'}}>Penjual belum menerbitkan struktur desain *(blocks)* untuk produk ini.</p>
    </div>
  );

  return (
    <div style={{minHeight:'100vh', background:'#f5f5f7', fontFamily:'var(--font-sans, "DM Sans")'}}>
      {blocks.map(block => (
        <div key={block.id}>
          {renderBlock(block, navigate, id)}
        </div>
      ))}
    </div>
  );
}
