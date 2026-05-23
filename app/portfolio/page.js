'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../home.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function PortfolioPage() {
  const [config, setConfig] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [configRes, portfolioRes] = await Promise.all([
          fetch('/api/config'),
          fetch('/api/portfolio')
        ]);

        if (configRes.ok) setConfig(await configRes.json());
        if (portfolioRes.ok) setPortfolio(await portfolioRes.json());
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
        <div className={styles.loaderText}>Loading albums...</div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Reusable Header */}
      <Header config={config} />

      <section className={styles.section} style={{ paddingTop: '140px' }}>
        <div className={styles.portfolioPageHeader}>
          <span className={styles.portfolioGreenTag}>
            <span className={styles.portfolioTagLine}></span>
            PORTFOLIO
          </span>
          <h2 className={styles.portfolioPageTitle}>SELECTED PROJECTS</h2>
          <p className={styles.portfolioPageSubtitle}>
            A few recent collaborations across editorial, sports, and brand.
          </p>
        </div>

        {portfolio.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '100px 0' }}>No portfolio albums published yet.</p>
        ) : (
          <div className={styles.portfolioRowContainer}>
            {portfolio.map((project, index) => {
              const isEven = index % 2 === 0;
              const projectYear = project.date ? project.date.split('-')[0] : '2026';
              const projectClient = project.client || 'Personal';
              
              return (
                <div 
                  key={project.id} 
                  className={`${styles.portfolioPremiumRow} ${isEven ? '' : styles.rowReverse}`}
                >
                  {/* TEXT COLUMN */}
                  <div className={styles.premiumRowTextCol}>
                    <div className={styles.premiumRowHUD}>
                      {projectYear} &middot; {projectClient}
                    </div>
                    <h3 className={styles.premiumRowTitle}>{project.title}</h3>
                    <p className={styles.premiumRowDesc}>
                      {project.description}
                    </p>
                    <Link href={`/portfolio/${project.id}`} className={styles.premiumRowLink}>
                      EXPLORE PROJECT <span>&rarr;</span>
                    </Link>
                  </div>
                  
                  {/* IMAGE COLUMN */}
                  <Link href={`/portfolio/${project.id}`} className={styles.premiumRowImgCol}>
                    <div className={styles.premiumRowImgWrapper}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={project.coverImageUrl} 
                        alt={project.title} 
                        className={styles.premiumRowImg} 
                        loading="lazy"
                      />
                      <div className={styles.premiumImageBadge}>
                        {project.category}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Reusable Footer */}
      <Footer config={config} />
    </div>
  );
}
