'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../app/home.module.css';

export default function Header({ config }) {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Contact Us', path: '/contact' }
  ];

  return (
    <header className={styles.header}>
      <Link href="/">
        <div className={styles.logoArea}>
          {config?.logoImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={config.logoImage} 
              alt={`${config.siteName} Logo`} 
              style={{ maxHeight: '55px', maxWidth: '180px', objectFit: 'contain' }} 
            />
          ) : (
            <div className={styles.logoGlow}>
              <span>STUDIO <span className={styles.logoGreen}>GFX</span></span>
              <span className={styles.logoSub}>PHOTOGRAPHY</span>
            </div>
          )}
        </div>
      </Link>

      <nav className={styles.nav}>
        {navLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link 
              key={link.path}
              href={link.path}
              className={`${styles.navLink} ${isActive ? 'nav-link-active' : ''}`}
            >
              {link.name}
            </Link>
          );
        })}
        {/* Quick Admin Navigation */}
        <Link href="/admin" className="btn-neon" style={{ padding: '8px 16px', fontSize: '0.75rem', marginLeft: '10px' }}>
          Portal
        </Link>
      </nav>
    </header>
  );
}
