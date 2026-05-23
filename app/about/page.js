'use client';

import { useState, useEffect } from 'react';
import styles from '../home.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function AboutPage() {
  const [config, setConfig] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <div className={styles.loaderText}>Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Reusable Header */}
      <Header config={config} />

      <section className={styles.section} style={{ paddingTop: '140px' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Photographer Profile</span>
          <h2 className={styles.sectionTitle}>About Us</h2>
        </div>

        <div className={styles.aboutGrid}>
          <div className={styles.aboutProfileCard}>
            <div className={styles.profileAvatar} style={{ overflow: 'hidden', padding: '0px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={config.aboutProfileImage || "/uploads/about_profile.png"} 
                alt={`${config.aboutName || "Lead Photographer"} Portrait`} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <h3 className={styles.aboutProfileTitle}>{config.aboutName || "Aria Vance"}</h3>
            <span className={styles.aboutProfileSubtitle}>{config.aboutRole || "Lead Creative Director & Visionary"}</span>
            
            <div className={styles.aboutStatsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{config.aboutYears || "12+"}</div>
                <div className={styles.statLabel}>Years Documenting</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>{gallery.length}+</div>
                <div className={styles.statLabel}>Weddings Chronicled</div>
              </div>
            </div>
          </div>

          <div className={styles.aboutContent}>
            <blockquote className={styles.aboutQuote}>
              &ldquo;{config.aboutQuote}&rdquo;
            </blockquote>
            
            <h3 style={{ fontFamily: 'Syne', color: 'var(--text-white)', fontSize: '1.25rem', marginTop: '10px' }}>MEET THE VISIONARY</h3>
            <p className={styles.aboutBio}>
              {config.aboutText}
            </p>
            {config.aboutBio2 && (
              <p className={styles.aboutBio} style={{ marginTop: '10px' }}>
                {config.aboutBio2}
              </p>
            )}
            
            {config.aboutManifesto && (
              <>
                <h3 style={{ fontFamily: 'Syne', color: 'var(--text-white)', fontSize: '1.25rem', marginTop: '20px' }}>OUR LOVE MANIFESTO</h3>
                <p className={styles.aboutBio}>
                  {config.aboutManifesto}
                </p>
              </>
            )}
            
            {(config.aboutGear1 || config.aboutGear2 || config.aboutGear3 || config.aboutGear4) && (
              <div className={styles.specList} style={{ marginTop: '25px', borderTop: 'var(--border-glass)', paddingTop: '20px' }}>
                <h4 style={{ fontFamily: 'Syne', color: 'var(--text-white)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>EXECUTIVE GEAR REGISTRY</h4>
                {config.aboutGear1 && (
                  <div className={styles.specItem}>
                    <div className={styles.specIcon}></div>
                    <div className={styles.specText}>
                      {config.aboutGear1.includes(':') ? (
                        <>
                          <strong className={styles.specLabel}>{config.aboutGear1.split(':')[0]}:</strong>
                          {config.aboutGear1.split(':').slice(1).join(':')}
                        </>
                      ) : (
                        config.aboutGear1
                      )}
                    </div>
                  </div>
                )}
                {config.aboutGear2 && (
                  <div className={styles.specItem}>
                    <div className={styles.specIcon}></div>
                    <div className={styles.specText}>
                      {config.aboutGear2.includes(':') ? (
                        <>
                          <strong className={styles.specLabel}>{config.aboutGear2.split(':')[0]}:</strong>
                          {config.aboutGear2.split(':').slice(1).join(':')}
                        </>
                      ) : (
                        config.aboutGear2
                      )}
                    </div>
                  </div>
                )}
                {config.aboutGear3 && (
                  <div className={styles.specItem}>
                    <div className={styles.specIcon}></div>
                    <div className={styles.specText}>
                      {config.aboutGear3.includes(':') ? (
                        <>
                          <strong className={styles.specLabel}>{config.aboutGear3.split(':')[0]}:</strong>
                          {config.aboutGear3.split(':').slice(1).join(':')}
                        </>
                      ) : (
                        config.aboutGear3
                      )}
                    </div>
                  </div>
                )}
                {config.aboutGear4 && (
                  <div className={styles.specItem}>
                    <div className={styles.specIcon}></div>
                    <div className={styles.specText}>
                      {config.aboutGear4.includes(':') ? (
                        <>
                          <strong className={styles.specLabel}>{config.aboutGear4.split(':')[0]}:</strong>
                          {config.aboutGear4.split(':').slice(1).join(':')}
                        </>
                      ) : (
                        config.aboutGear4
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Reusable Footer */}
      <Footer config={config} />
    </div>
  );
}
