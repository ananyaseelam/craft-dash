import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

interface Project {
  id: string;
  image: string;
  caption: string;
  timestamp: number;
}

export default function CraftProjectFeed() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [caption, setCaption] = useState('');
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(null);
  const [imageData, setImageData] = useState<string | ArrayBuffer | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Google Sans', sans-serif";
    
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        .main-container { width: 95% !important; }
        .card-container { width: 100% !important; }
        .projects-grid { flex-direction: column !important; margin: 1rem !important; }
        .project-card { width: 100% !important; margin: 0.5rem 0 !important; }
        .title-text { font-size: 24px !important; }
        .header-padding { padding: 1rem !important; margin: 0.5rem !important; }
        .upload-content { width: 95% !important; }
        .textarea-input { width: 95% !important; }
        .upload-button { width: 95% !important; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.body.style.fontFamily = '';
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    try {
      const loadedProjects : Project[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('project:')) {
          const value = localStorage.getItem(key);
          if (value) {
            loadedProjects.push(JSON.parse(value));
          }
        }
      }
      loadedProjects.sort((a, b) => b.timestamp - a.timestamp);
      setProjects(loadedProjects);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageData(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (!imageData || !caption.trim()) return;

    const project = {
      id: `project_${Date.now()}`,
      image: imageData,
      caption: caption,
      timestamp: Date.now()
    };

    try {
      window.localStorage.setItem(`project:${project.id}`, JSON.stringify(project));
      loadProjects();
      setCaption('');
      setImagePreview(null);
      setImageData(null);
      setShowUpload(false);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const deleteProject = (id : string) => {
    window.localStorage.removeItem(`project:${id}`);
    loadProjects();
  };

  if (isLoading) {
    return <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh'}}>Loading...</div>;
  }

  return (
    <div style={{minHeight: '100vh', width: '100%', backgroundColor: '#e9edc9'}}>
      <div className="main-container" style={{width: '100%', padding: '1.5rem', maxWidth: '1280px', margin: '0 auto', paddingTop: '2rem'}}>
        <div className="card-container" style={{width: '60%', margin: '0 auto 1.5rem auto', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', borderRadius: '20px', position: 'sticky', top: '1rem', zIndex: 10}}>
          <div className="header-padding" style={{display: 'flex', flexDirection: 'row', flexWrap:'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', padding: '1rem', margin: '1rem'}}>
            <h1 className="title-text" style={{color: '#333', margin: '1rem', display: 'inline-block', fontSize: '35px', fontWeight: 'bold'}}>My Craft Projects</h1>
            <button
              onClick={() => setShowUpload(!showUpload)}
              style={{
                backgroundColor: '#d4a373',
                flexShrink: 0,
                margin: '1rem',
                fontSize: '1rem',
                borderRadius: '10px',
                height: 'fit-content',
                color: 'white',
                border: showUpload ? '1px solid #c49363' : 'none',
                padding: '0.375rem 0.75rem',
                marginTop: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c49363'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#d4a373'}
            >
              {showUpload ? <X size={12} /> : <Plus size={16} />}
              {showUpload ? 'Cancel' : 'Upload'}
            </button>
          </div>

          {showUpload && (
            <div style={{paddingBottom: '1.5rem'}}>
              <div style={{borderTop: '1px solid #ccd5ae', width: '95%', margin: '1.5rem auto'}}></div>
              <div className="upload-content" style={{width: '85%', margin: '0 auto', paddingTop: '0.5rem'}}>
                <div style={{marginBottom: '1rem'}}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{width: '100%', fontSize: '1rem', borderRadius: '4px', margin: '1rem'}}
                  />
                </div>
                {imagePreview && (
                  <img
                    src={imagePreview as string}
                    alt="Preview"
                    style={{height: '200px', width: '100%', maxWidth: '400px', margin: '1rem', borderRadius: '4px', objectFit: 'cover'}}
                  />
                )}
                <div style={{marginBottom: '1rem'}}>
                  <textarea
                    placeholder="Add a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="textarea-input"
                    style={{
                      fontFamily: 'Google Sans',
                      fontSize: '1rem',
                      border: '1px solid #e5e5e5',
                      backgroundColor: '#ffffff',
                      resize: 'vertical',
                      minHeight: '100px',
                      width: '90%',
                      margin: '1rem',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      outline: 'none'
                    }}
                    rows={3}
                  />
                </div>
                <button
                  onClick={handleUpload}
                  disabled={!imageData || !caption.trim()}
                  className="upload-button"
                  style={{
                    backgroundColor: imageData && caption.trim() ? '#d4a373' : '#ccc',
                    color: 'white',
                    borderRadius: '4px',
                    margin: '1rem',
                    width: '90%',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    border: 'none',
                    cursor: imageData && caption.trim() ? 'pointer' : 'not-allowed'
                  }}
                  onMouseOver={(e) => {
                    if (imageData && caption.trim()) {
                      e.currentTarget.style.backgroundColor = '#c49363';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (imageData && caption.trim()) {
                      e.currentTarget.style.backgroundColor = '#d4a373';
                    }
                  }}
                >
                  Post Project
                </button>
              </div>
            </div>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="card-container" style={{textAlign: 'center', padding: '3rem', borderRadius: '20px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', width: '60%', margin: '0 auto'}}>
            <p style={{margin: '1rem', color: '#666', fontSize: '1.125rem'}}>No projects yet!</p>
          </div>
        ) : (
          <div className="projects-grid" style={{display: 'flex', flexWrap: 'wrap', margin: '3rem', gap: '1.5rem', justifyContent: 'left'}}>
            {projects.map(project => (
              <div 
                key={project.id} 
                className="project-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#fafaf7',
                  width: 'calc(33.333% - 1rem)',
                  minWidth: '280px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <div style={{padding: '1rem', paddingBottom: '0'}}>
                  <img
                    src={project.image}
                    alt={project.caption}
                    style={{width: '100%', height: '300px', objectFit: 'cover', borderRadius: '4px'}}
                  />
                  <div style={{padding: '1rem'}}>
                    <p style={{color: '#333', marginBottom: '0.5rem', fontSize: '1.125rem'}}>{project.caption}</p>
                    <p style={{color: '#999', marginBottom: '0', fontSize: '0.875rem'}}>
                      {new Date(project.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => deleteProject(project.id)}
                  style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.7)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'}
                >
                  <X size={16} color="white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}