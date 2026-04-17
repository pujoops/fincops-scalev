import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { GraduationCap, Plus, BookOpen, Trash, Video } from 'lucide-react';

export default function LMS() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState(null);

  // Forms
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleVideoUrl, setModuleVideoUrl] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id, title, description,
          modules (id, title, video_url)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('courses').insert([
        { user_id: user.id, title: courseTitle, description: courseDesc }
      ]).select('*, modules(*)').single();

      if (error) throw error;
      // Inject empty modules array locally for immediate render
      if (!data.modules) data.modules = [];
      setCourses([data, ...courses]);
      setCourseTitle(''); setCourseDesc('');
      setIsCourseModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('modules').insert([
        { course_id: activeCourseId, title: moduleTitle, video_url: moduleVideoUrl }
      ]).select().single();

      if (error) throw error;

      setCourses(courses.map(c => {
        if (c.id === activeCourseId) {
          return { ...c, modules: [...(c.modules || []), data] };
        }
        return c;
      }));

      setModuleTitle(''); setModuleVideoUrl('');
      setIsModuleModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteCourse = async (id) => {
    if(!window.confirm('Hapus kelas ini beserta seluruh modul videonya?')) return;
    await supabase.from('courses').delete().eq('id', id);
    setCourses(courses.filter(c => c.id !== id));
  };

  const deleteModule = async (courseId, moduleId) => {
    if(!window.confirm('Hapus modul ini?')) return;
    await supabase.from('modules').delete().eq('id', moduleId);
    setCourses(courses.map(c => {
      if (c.id === courseId) {
        return { ...c, modules: c.modules.filter(m => m.id !== moduleId) };
      }
      return c;
    }));
  };

  const actionButton = (
    <button className="btn btn-primary btn-sm" onClick={() => setIsCourseModalOpen(true)}>
      <Plus size={16} style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '4px'}}/> Buat Kelas
    </button>
  );

  return (
    <AppLayout title="LMS / Area Kelas" actionButton={actionButton}>
      <div style={{marginBottom: '20px'}}>
        <div className="section-title">LMS / Member Area</div>
        <div className="section-sub" style={{marginBottom: 0}}>Kelola kelas & video digitalmu</div>
      </div>

      {loading ? (
        <div style={{textAlign:'center', padding:'40px', color:'var(--text2)'}}>Memuat Kelas...</div>
      ) : courses.length === 0 ? (
        <div className="card" style={{textAlign:'center', padding:'60px 20px', background:'var(--surface)'}}>
          <GraduationCap size={48} style={{margin:'0 auto 16px', color:'var(--border)'}}/>
          <h2 style={{fontSize:'20px', marginBottom:'8px'}}>Belum ada kelas</h2>
          <p style={{color:'var(--text2)', marginBottom:'20px'}}>Buat kelas pertamamu dan tambahkan modul materi untuk para member.</p>
          <button className="btn btn-primary" onClick={() => setIsCourseModalOpen(true)}>+ Buat Kelas Pertama</button>
        </div>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
          {courses.map(course => (
            <div key={course.id} className="card" style={{borderLeft:'4px solid var(--accent)'}}>
              <div className="card-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <h3 style={{fontSize:'18px', margin:0, display:'flex', alignItems:'center', gap:'8px'}}>
                    <BookOpen size={20} color="var(--accent)"/> {course.title}
                  </h3>
                  <p style={{color:'var(--text2)', fontSize:'14px', marginTop:'4px', marginBottom:0}}>{course.description}</p>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => deleteCourse(course.id)}>
                  <Trash size={16}/> Hapus Kelas
                </button>
              </div>
              <div className="card-body" style={{background:'#f9fbfc', padding:'16px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                  <strong>Daftar Modul / Video:</strong>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setActiveCourseId(course.id); setIsModuleModalOpen(true); }}>
                    + Tambah Modul Baru
                  </button>
                </div>
                
                {(!course.modules || course.modules.length === 0) ? (
                  <div style={{padding:'20px', textAlign:'center', color:'var(--text3)', border:'1px dashed var(--border)', borderRadius:'8px'}}>
                    Belum ada modul (video materi) di dalam kelas ini.
                  </div>
                ) : (
                  <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                    {course.modules.map((m, index) => (
                      <div key={m.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px', background:'#fff', border:'1px solid var(--border)', borderRadius:'8px'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                          <div style={{width:'32px', height:'32px', background:'var(--accent-bg)', color:'var(--accent)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'}}>{index + 1}</div>
                          <div>
                            <div style={{fontWeight:'500'}}>{m.title}</div>
                            <div style={{display:'flex', alignItems:'center', gap:'4px', color:'var(--text2)', fontSize:'12px', marginTop:'2px'}}><Video size={12}/> Tautan Video Tertaut</div>
                          </div>
                        </div>
                        <button style={{background:'none', border:'none', color:'var(--red)', cursor:'pointer'}} onClick={() => deleteModule(course.id, m.id)}>Hapus</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL BUAT KELAS */}
      {isCourseModalOpen && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div className="card" style={{width:'90%', maxWidth:'450px', padding:'24px'}}>
            <h2 style={{marginTop:0, marginBottom:'20px', fontSize:'20px'}}>Buat Kelas Baru</h2>
            <form onSubmit={handleCreateCourse}>
              <div style={{marginBottom:'16px'}}>
                <label style={{display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px'}}>Judul Kelas</label>
                <input type="text" value={courseTitle} onChange={e=>setCourseTitle(e.target.value)} required placeholder="Mis. Master Copywriting" style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid var(--border)'}}/>
              </div>
              <div style={{marginBottom:'24px'}}>
                <label style={{display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px'}}>Deskripsi Singkat</label>
                <textarea rows="3" value={courseDesc} onChange={e=>setCourseDesc(e.target.value)} placeholder="Pelajari rahasia..." style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid var(--border)', fontFamily:'inherit'}}/>
              </div>
              <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                <button type="button" className="btn btn-secondary" onClick={()=>setIsCourseModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Kelas</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BUAT MODUL */}
      {isModuleModalOpen && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div className="card" style={{width:'90%', maxWidth:'450px', padding:'24px'}}>
            <h2 style={{marginTop:0, marginBottom:'20px', fontSize:'20px'}}>Tambah Modul Video Khusus</h2>
            <form onSubmit={handleCreateModule}>
              <div style={{marginBottom:'16px'}}>
                <label style={{display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px'}}>Judul Materi</label>
                <input type="text" value={moduleTitle} onChange={e=>setModuleTitle(e.target.value)} required placeholder="Mis. Bab 1: Pendahuluan" style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid var(--border)'}}/>
              </div>
              <div style={{marginBottom:'24px'}}>
                <label style={{display:'block', marginBottom:'6px', fontWeight:'500', fontSize:'14px'}}>URL Embed Video (Privat/Unlisted)</label>
                <input type="url" value={moduleVideoUrl} onChange={e=>setModuleVideoUrl(e.target.value)} required placeholder="https://www.youtube.com/embed/..." style={{width:'100%', padding:'10px', borderRadius:'8px', border:'1px solid var(--border)'}}/>
                <div style={{fontSize:'12px', color:'var(--text2)', marginTop:'6px'}}>Gunakan format link embed Youtube atau Vimeo unlisted agar hemat quota server Fincops.</div>
              </div>
              <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                <button type="button" className="btn btn-secondary" onClick={()=>setIsModuleModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Modul</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
