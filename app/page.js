'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './home.module.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function HomePage() {
  const [config, setConfig] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial content from databases
  useEffect(() => {
    async function fetchData() {
      try {
        const [configRes, galleryRes, portfolioRes] = await Promise.all([
          fetch('/api/config'),
          fetch('/api/gallery'),
          fetch('/api/portfolio')
        ]);

        if (configRes.ok) setConfig(await configRes.json());
        if (galleryRes.ok) setGallery(await galleryRes.json());
        if (portfolioRes.ok) setPortfolio(await portfolioRes.json());
      } catch (err) {
        console.error('Failed to load portfolio database:', err);
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
        <div className={styles.loaderText}>Loading Studio GFX Weddings...</div>
      </div>
    );
  }

  // Curated Teasers
  const galleryTeaser = gallery.slice(0, 3);
  const featuredProject = portfolio[0];

  // Pricing Packages (Investment Collections)
  const packages = [
    {
      name: "The Elopement",
      subtitle: "For Intimate Vows & Clandestine Vows",
      price: "$2,200",
      features: [
        "4 Hours of Continuous Fine-Art Coverage",
        "Creative Direction by Studio GFX Lead",
        "Curated High-Contrast Digital Archive (200+ frames)",
        "Private Online Cinematic Gallery with 1-Year Hosting",
        "Personal Print Release & Delivery in 4 Weeks"
      ],
      featured: false
    },
    {
      name: "The Editorial",
      subtitle: "Our Signature Classic Storytelling Portfolio",
      price: "$3,800",
      features: [
        "8 Hours of Continuous Full-Day Coverage",
        "Creative Direction by Studio GFX Lead",
        "Pre-Wedding Noir Engagement Shoot",
        "Anamorphic Digital Archive (500+ frames)",
        "Private Online Cinematic Gallery with 2-Year Hosting",
        "Personal Print Release & Delivery in 6 Weeks"
      ],
      featured: false
    },
    {
      name: "The Noir Coven",
      subtitle: "Ultimate Editorial Fine-Art Package",
      price: "$5,500",
      features: [
        "Full Day Photographic Coverage (No Hour Limits)",
        "Studio GFX Lead + Professional Second Creative Director",
        "Pre-Wedding Noir Engagement & Concept Session",
        "Full Anamorphic Digital Archive (700+ frames)",
        "Bespoke Italian Leather Fine-Art Print Box with 30 Prints",
        "Priority 3-Week Expedited Post-Processing Delivery",
        "Lifetime Gallery Backup & Hosting"
      ],
      featured: true
    }
  ];

  return (
    <div className={styles.pageContainer}>
      {/* Reusable Header */}
      <Header config={config} />

      {/* 1. Cinematic HERO Landing */}
      <section className={`${styles.section} ${styles.heroSection}`} style={{ minHeight: '90vh' }}>
        <div className={styles.heroContent}>
          <span className={styles.heroTagline}>{config.tagline}</span>
          <h1 className={styles.heroTitle} style={{ fontWeight: 300, fontStyle: 'italic' }}>
            Fine-Art<br />
            <span className={styles.heroGreenText}>Editorial</span><br />
            Weddings
          </h1>
          <p className={styles.heroDesc}>
            {config.aboutText.substring(0, 195)}...
          </p>
          <div className={styles.heroActions}>
            <Link href="/gallery" className="btn-neon">
              Explore Gallery
            </Link>
            <Link href="/contact" className="btn-outline">
              Secure Wedding Date
            </Link>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.heroOverlay}></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={config.heroImage} 
            alt="Studio GFX Editorial Wedding Photography Cover" 
            className={styles.heroImage}
          />
        </div>
      </section>

      {/* 2. GALLERY TEASER SECTION */}
      <section className={styles.section} style={{ minHeight: 'auto', paddingTop: '60px', paddingBottom: '60px' }}>
        <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', maxWidth: 'none', width: '100%', marginBottom: '40px' }}>
          <div>
            <span className={styles.sectionTag}>Fine-Art Bridal Frames</span>
            <h2 className={styles.sectionTitle} style={{ fontSize: '2.5rem' }}>Visual Highlights</h2>
          </div>
          <Link href="/gallery" className="btn-outline" style={{ padding: '8px 24px', fontSize: '0.8rem' }}>
            Open full archives &rarr;
          </Link>
        </div>

        <div className={styles.galleryGrid} style={{ columnCount: galleryTeaser.length > 0 ? galleryTeaser.length : 1 }}>
          {galleryTeaser.map((item) => (
            <div key={item.id} className={styles.galleryItem}>
              <div className={styles.galleryImgWrapper}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className={styles.galleryImg} 
                />
              </div>
              <div className={styles.galleryHoverOverlay}>
                <span className={styles.galleryItemCategory}>{item.category}</span>
                <h4 className={styles.galleryItemTitle} style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontWeight: 500, fontSize: '1.4rem' }}>{item.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. DOCUMENTING TIMELINE (OUR PROCESS) */}
      <section className={styles.section} style={{ minHeight: 'auto', paddingTop: '80px', paddingBottom: '60px' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>How We Document Your Forever</span>
          <h2 className={styles.sectionTitle} style={{ fontSize: '2.5rem' }}>The Photographic Artistry</h2>
        </div>

        <div className={styles.timelineGrid}>
          <div className={styles.timelineCard}>
            <span className={styles.timelineStep}>Stage 01</span>
            <h3 className={styles.timelineTitle}>The Consultation</h3>
            <p className={styles.timelineDesc}>
              We align our design visions over coffee or cocktails, analyzing editorial styles, lighting mood boards, and the architecture of your coven venue.
            </p>
          </div>

          <div className={styles.timelineCard}>
            <span className={styles.timelineStep}>Stage 02</span>
            <h3 className={styles.timelineTitle}>The Noir Session</h3>
            <p className={styles.timelineDesc}>
              An intimate engagement shoot styled in high-fashion monochrome and rain reflections, ensuring you feel completely organic under the lens.
            </p>
          </div>

          <div className={styles.timelineCard}>
            <span className={styles.timelineStep}>Stage 03</span>
            <h3 className={styles.timelineTitle}>The Wedding Day</h3>
            <p className={styles.timelineDesc}>
              Unobtrusive, cinematic fine-art documentation. We capture organic, raw emotions, candids, and light plays without disruptive setups.
            </p>
          </div>

          <div className={styles.timelineCard}>
            <span className={styles.timelineStep}>Stage 04</span>
            <h3 className={styles.timelineTitle}>The Fine Art Box</h3>
            <p className={styles.timelineDesc}>
              Delivery of your dynamic anamorphic digital galleries and a hand-crafted Italian leather fine-art box housing high-contrast print keepsakes.
            </p>
          </div>
        </div>
      </section>

      {/* 4. COUPLES LOVE LETTERS (TESTIMONIALS) */}
      <section className={styles.testimonialSection}>
        <div className={styles.sectionHeader} style={{ margin: '0 auto 40px', textAlign: 'center' }}>
          <span className={styles.sectionTag}>Couples&apos; Love Letters</span>
        </div>
        <div className={styles.testimonialQuote}>
          &ldquo;Studio GFX documented our brutalist concrete wedding in Chicago... it felt like a high-fashion movie still. They didn&apos;t just take wedding photos, they built fine art masterpieces that capture the exact raw energy of our vows.&rdquo;
        </div>
        <span className={styles.testimonialCouple}>Sarah &amp; Marcus</span>
        <span className={styles.testimonialDate}>October 2025 // Chicago, IL</span>
      </section>

      {/* 5. INVESTMENT & WEDDING PACKAGES GRID */}
      <section className={styles.section} style={{ minHeight: 'auto', paddingTop: '60px', paddingBottom: '60px' }}>
        <div className={styles.sectionHeader} style={{ textAlign: 'center', margin: '0 auto 40px' }}>
          <span className={styles.sectionTag}>Fine-Art Investments</span>
          <h2 className={styles.sectionTitle} style={{ fontSize: '2.5rem' }}>Wedding Collections</h2>
        </div>

        <div className={styles.investmentGrid}>
          {packages.map((pkg, idx) => (
            <div 
              key={idx} 
              className={`${styles.packageCard} ${pkg.featured ? styles.packageCardFeatured : ''}`}
            >
              <h3 className={styles.packageName}>{pkg.name}</h3>
              <span className={styles.packageSubtitle}>{pkg.subtitle}</span>
              
              <div className={styles.packagePrice}>
                <span className={styles.packagePriceGreen}>{pkg.price.substring(0, 1)}</span>
                {pkg.price.substring(1)}
              </div>

              <ul className={styles.packageFeatures}>
                {pkg.features.map((feat, fIdx) => (
                  <li key={fIdx} className={styles.packageFeatureItem}>
                    {feat}
                  </li>
                ))}
              </ul>

              <Link href="/contact" className={pkg.featured ? "btn-neon" : "btn-outline"} style={{ width: '100%', marginTop: 'auto' }}>
                Secure Collection
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FEATURED PORTFOLIO CASE STUDY */}
      {featuredProject && (
        <section className={styles.section} style={{ minHeight: 'auto', paddingTop: '60px', paddingBottom: '100px' }}>
          <div className={styles.sectionHeader} style={{ marginBottom: '40px' }}>
            <span className={styles.sectionTag}>Featured Photographic Case Study</span>
            <h2 className={styles.sectionTitle} style={{ fontSize: '2.5rem' }}>Latest Story</h2>
          </div>

          <div className={styles.portfolioCard} style={{ cursor: 'default' }}>
            <div className={styles.aboutGrid} style={{ gridTemplateColumns: '1.2fr 1fr', gap: '0px' }}>
              <div className={styles.portfolioCoverWrapper} style={{ height: '450px', borderRight: 'var(--border-glass)', borderBottom: 'none' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={featuredProject.coverImageUrl} 
                  alt={featuredProject.title} 
                  className={styles.portfolioCover} 
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
              
              <div className={styles.portfolioMeta} style={{ padding: '40px', justifyContent: 'center' }}>
                <div className={styles.portfolioMetaHeader}>
                  <span className={styles.portfolioCategory}>{featuredProject.category}</span>
                  <span className={styles.portfolioDate}>{featuredProject.date}</span>
                </div>
                <h3 className={styles.portfolioTitle} style={{ fontSize: '2.2rem', marginBottom: '15px' }}>{featuredProject.title}</h3>
                <p className={styles.portfolioDesc} style={{ marginBottom: '30px' }}>
                  {featuredProject.description}
                </p>
                <Link href={`/portfolio/${featuredProject.id}`} className="btn-neon" style={{ alignSelf: 'flex-start' }}>
                  Open Album Folder
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Reusable Footer */}
      <Footer config={config} />
    </div>
  );
}
