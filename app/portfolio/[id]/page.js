'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../../home.module.css';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Lightbox from '../../../components/Lightbox';

export default function ProjectDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [config, setConfig] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Lightbox States
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(-1);

  useEffect(() => {
    async function fetchData() {
      try {
        const [configRes, portfolioRes] = await Promise.all([
          fetch('/api/config'),
          fetch('/api/portfolio')
        ]);

        if (configRes.ok) setConfig(await configRes.json());
        
        if (portfolioRes.ok) {
          const portfolioData = await portfolioRes.json();
          const activeProject = portfolioData.find(p => p.id === id);
          setProject(activeProject || null);
        }
      } catch (err) {
        console.error('Failed to load project database:', err);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loaderOverlay}>
        <div className={styles.loaderRing}></div>
        <div className={styles.loaderText}>Opening Album...</div>
      </div>
    );
  }

  if (!config || !project) {
    return (
      <div className={styles.loaderOverlay} style={{ gap: '20px' }}>
        <h2 className="neon-text-glow" style={{ fontSize: '2rem', fontFamily: 'Syne' }}>Folder Not Found</h2>
        <p style={{ color: 'var(--text-muted)' }}>The portfolio album ID does not exist in the database.</p>
        <Link href="/portfolio" className="btn-neon">
          Return to Portfolio
        </Link>
      </div>
    );
  }

  // Set up lightbox image array matching the project captures format
  const projectPhotos = project.images.map((imgUrl, i) => ({
    id: `project_img_${i}`,
    title: `${project.title} - Frame ${i+1}`,
    category: project.category,
    imageUrl: imgUrl,
    description: `Captured in the custom "${project.title}" photo series.`
  }));

  // Lightbox triggers
  const handlePhotoClick = (item) => {
    const index = projectPhotos.findIndex(p => p.id === item.id);
    setSelectedPhoto(item);
    setSelectedPhotoIndex(index);
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex > 0) {
      const nextIndex = selectedPhotoIndex - 1;
      setSelectedPhoto(projectPhotos[nextIndex]);
      setSelectedPhotoIndex(nextIndex);
    }
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex < projectPhotos.length - 1) {
      const nextIndex = selectedPhotoIndex + 1;
      setSelectedPhoto(projectPhotos[nextIndex]);
      setSelectedPhotoIndex(nextIndex);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Reusable Header */}
      <Header config={config} />

      {/* 1. Cinematic Banner */}
      <div className={styles.portfolioCoverWrapper} style={{ height: '55vh', borderBottom: 'var(--border-glass)', marginTop: '80px', position: 'relative' }}>
        <div className={styles.heroOverlay} style={{ background: 'linear-gradient(to top, var(--bg-primary) 0%, rgba(7,7,8,0.3) 100%)' }}></div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={project.coverImageUrl} 
          alt={project.title} 
          className={styles.portfolioCover} 
          style={{ height: '100%', width: '100%', objectPosition: 'center 40%' }}
        />
        
        {/* Absolute Banner Title overlay */}
        <div style={{ position: 'absolute', bottom: '40px', left: '5%', zIndex: 10 }}>
          <span className={styles.portfolioCategory} style={{ background: 'var(--accent-neon-dim)', border: '1px solid rgba(118,255,3,0.3)', padding: '5px 15px', borderRadius: 'var(--radius-full)', textShadow: 'none' }}>
            {project.category}
          </span>
          <h1 className={styles.sectionTitle} style={{ fontSize: '3rem', marginTop: '15px' }}>{project.title}</h1>
        </div>
      </div>

      {/* 2. Project Metadata and Bio Section */}
      <section className={styles.section} style={{ minHeight: 'auto', paddingTop: '60px', paddingBottom: '60px' }}>
        {/* Back Link */}
        <Link href="/portfolio" className={styles.modalCloseBtn} style={{ marginBottom: '40px' }}>
          &larr; Return to Portfolio listing
        </Link>

        <div className={styles.aboutGrid} style={{ gridTemplateColumns: '1fr 2fr', gap: '50px', alignItems: 'start' }}>
          {/* Metadata Cards */}
          <div className={styles.contactInfoCard} style={{ padding: '25px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <span className={styles.infoLabel}>Commission Client</span>
                <div className={styles.infoValue} style={{ fontSize: '1.1rem', marginTop: '4px' }}>{project.client}</div>
              </div>
              <div style={{ borderTop: 'var(--border-glass)', paddingTop: '15px' }}>
                <span className={styles.infoLabel}>Completion Date</span>
                <div className={styles.infoValue} style={{ fontSize: '1.1rem', marginTop: '4px' }}>{project.date}</div>
              </div>
              <div style={{ borderTop: 'var(--border-glass)', paddingTop: '15px' }}>
                <span className={styles.infoLabel}>Shooting Medium</span>
                <div className={styles.infoValue} style={{ fontSize: '1.1rem', marginTop: '4px' }}>High-Resolution Anamorphic Digital</div>
              </div>
            </div>
          </div>

          {/* Narrative Text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: '1.5rem', color: 'var(--text-white)' }}>THE ALBUM STORY</h3>
            <p className={styles.portfolioDesc} style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-light)' }}>
              {project.description}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Album Captures Column Grid */}
      <section className={styles.section} style={{ minHeight: 'auto', paddingTop: '30px', paddingBottom: '100px' }}>
        <div className={styles.sectionHeader} style={{ marginBottom: '40px' }}>
          <span className={styles.sectionTag}>Album Grid Wall</span>
          <h2 className={styles.sectionTitle} style={{ fontSize: '2rem' }}>Captured Frames</h2>
        </div>

        {projectPhotos.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '50px 0' }}>No frame captures published in this folder.</p>
        ) : (
          <div className={styles.galleryGrid} style={{ columnCount: 2 }}>
            {projectPhotos.map((photo) => (
              <div 
                key={photo.id} 
                className={styles.galleryItem}
                onClick={() => handlePhotoClick(photo)}
                title="Click to Zoom Frame"
              >
                <div className={styles.galleryImgWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.title} 
                    className={styles.galleryImg} 
                    loading="lazy"
                  />
                </div>
                <div className={styles.galleryHoverOverlay}>
                  <span className={styles.galleryItemCategory}>Zoom Frame</span>
                  <h4 className={styles.galleryItemTitle}>{photo.title}</h4>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Gallery Lightbox Modal */}
      {selectedPhoto && (
        <Lightbox 
          item={selectedPhoto}
          onClose={() => { setSelectedPhoto(null); setSelectedPhotoIndex(-1); }}
          onPrev={selectedPhotoIndex > 0 ? handlePrevPhoto : null}
          onNext={selectedPhotoIndex < projectPhotos.length - 1 ? handleNextPhoto : null}
        />
      )}

      {/* Reusable Footer */}
      <Footer config={config} />
    </div>
  );
}
