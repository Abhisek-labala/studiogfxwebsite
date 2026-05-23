'use client';

import { useState, useEffect } from 'react';
import styles from '../home.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Lightbox from '../../components/Lightbox';

export default function GalleryPage() {
  const [config, setConfig] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Lightbox States
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(-1);

  useEffect(() => {
    async function fetchData() {
      try {
        const [configRes, galleryRes] = await Promise.all([
          fetch('/api/config'),
          fetch('/api/gallery')
        ]);

        if (configRes.ok) setConfig(await configRes.json());
        if (galleryRes.ok) setGallery(await galleryRes.json());
      } catch (err) {
        console.error('Failed to load database:', err);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
    fetchData();
  }, []);

  if (loading || !config) {
    return (
      <div className={styles.loaderOverlay}>
        <div className={styles.loaderRing}></div>
        <div className={styles.loaderText}>Loading curations...</div>
      </div>
    );
  }

  // Compute unique gallery categories
  const categories = ['All', ...new Set(gallery.map(item => item.category))];

  // Filter gallery items
  const filteredGallery = activeFilter === 'All' 
    ? gallery 
    : gallery.filter(item => item.category === activeFilter);

  // Lightbox handlers
  const handlePhotoClick = (item) => {
    const index = filteredGallery.findIndex(photo => photo.id === item.id);
    setSelectedPhoto(item);
    setSelectedPhotoIndex(index);
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex > 0) {
      const nextIndex = selectedPhotoIndex - 1;
      setSelectedPhoto(filteredGallery[nextIndex]);
      setSelectedPhotoIndex(nextIndex);
    }
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex < filteredGallery.length - 1) {
      const nextIndex = selectedPhotoIndex + 1;
      setSelectedPhoto(filteredGallery[nextIndex]);
      setSelectedPhotoIndex(nextIndex);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Reusable Header */}
      <Header config={config} />

      <section className={styles.section} style={{ paddingTop: '140px' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Curated Visuals</span>
          <h2 className={styles.sectionTitle}>The Gallery</h2>
        </div>

        {/* Dynamic Category Filtering Bar */}
        <div className={styles.galleryFilterBar}>
          {categories.map((cat) => (
            <button 
              key={cat} 
              className={`${styles.filterBtn} ${activeFilter === cat ? styles.filterBtnActive : ''}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry Image Grid */}
        {gallery.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '100px 0' }}>No gallery items published yet.</p>
        ) : (
          <div className={styles.galleryGrid}>
            {filteredGallery.map((item) => (
              <div 
                key={item.id} 
                className={styles.galleryItem}
                onClick={() => handlePhotoClick(item)}
              >
                <div className={styles.galleryImgWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className={styles.galleryImg} 
                    loading="lazy"
                  />
                </div>
                <div className={styles.galleryHoverOverlay}>
                  <span className={styles.galleryItemCategory}>{item.category}</span>
                  <h4 className={styles.galleryItemTitle}>{item.title}</h4>
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
          onNext={selectedPhotoIndex < filteredGallery.length - 1 ? handleNextPhoto : null}
        />
      )}

      {/* Reusable Footer */}
      <Footer config={config} />
    </div>
  );
}
