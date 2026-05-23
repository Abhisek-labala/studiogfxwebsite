'use client';

import styles from '../app/home.module.css';

export default function Footer({ config }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {config?.logoImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={config.logoImage} 
            alt={`${config.siteName} Logo`} 
            style={{ maxHeight: '45px', maxWidth: '150px', objectFit: 'contain', marginBottom: '10px' }} 
          />
        ) : (
          <div className={styles.footerLogo}>STUDIO GFX // PHOTOGRAPHY</div>
        )}
        <div className={styles.footerCopy}>
          &copy; {new Date().getFullYear()} STUDIO GFX. ALL RIGHTS RESERVED. POWERED BY NEXT.JS.
        </div>
      </div>
    </footer>
  );
}
