'use client';

import { useEffect } from 'react';
import styles from './Lightbox.module.css';

export default function Lightbox({ item, onClose, onPrev, onNext }) {
  
  // Listen for keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when lightbox is active
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose, onPrev, onNext]);

  if (!item) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      {/* Close Button */}
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
        &times;
      </button>

      {/* Navigation - Left Arrow */}
      {onPrev && (
        <button 
          className={`${styles.navBtn} ${styles.prevBtn}`} 
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label="Previous image"
        >
          &#8249;
        </button>
      )}

      {/* Center Image Container */}
      <div className={styles.contentContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.mediaWrapper}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={item.imageUrl} 
            alt={item.title} 
            className={styles.lightboxImage}
          />
        </div>

        {/* Dynamic Meta Info Footer */}
        <div className={styles.metaFooter}>
          <div className={styles.metaHeader}>
            <span className={styles.categoryTag}>{item.category}</span>
            <h3 className={styles.title}>{item.title}</h3>
          </div>
          {item.description && <p className={styles.description}>{item.description}</p>}
        </div>
      </div>

      {/* Navigation - Right Arrow */}
      {onNext && (
        <button 
          className={`${styles.navBtn} ${styles.nextBtn}`} 
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Next image"
        >
          &#8250;
        </button>
      )}
    </div>
  );
}
