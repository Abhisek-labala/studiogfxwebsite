'use client';

import { useState, useEffect } from 'react';
import styles from '../home.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ContactPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Contact Form States
  const [contactForm, setContactForm] = useState({ 
    name: '', 
    email: '', 
    date: '', 
    venue: '', 
    collection: 'The Editorial', 
    message: '' 
  });
  const [submitStatus, setSubmitStatus] = useState({ success: null, message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/config');
        if (res.ok) setConfig(await res.json());
      } catch (err) {
        console.error('Failed to load database:', err);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    }
    fetchData();
  }, []);

  // Submit handler
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus({ success: null, message: '' });

    // Pack wedding details into subject for backend compatibility
    const subject = `Wedding Booking Inquiry: ${contactForm.date} at ${contactForm.venue} (${contactForm.collection})`;
    const payload = {
      name: contactForm.name,
      email: contactForm.email,
      subject: subject,
      message: `Wedding Date: ${contactForm.date}\nVenue/City: ${contactForm.venue}\nSelected Package: ${contactForm.collection}\n\nClient Message:\n${contactForm.message}`
    };

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitStatus({ success: true, message: 'Wedding booking inquiry sent! Studio GFX will consult with you shortly.' });
        setContactForm({ name: '', email: '', date: '', venue: '', collection: 'The Editorial', message: '' });
      } else {
        setSubmitStatus({ success: false, message: data.error || 'Failed to deliver booking request.' });
      }
    } catch (err) {
      setSubmitStatus({ success: false, message: 'Server communication error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !config) {
    return (
      <div className={styles.loaderOverlay}>
        <div className={styles.loaderRing}></div>
        <div className={styles.loaderText}>Loading Booking Form...</div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Reusable Header */}
      <Header config={config} />

      <section className={styles.section} style={{ paddingTop: '140px' }}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Commission Queries</span>
          <h2 className={styles.sectionTitle} style={{ fontSize: '2.5rem' }}>Secure Your Date</h2>
        </div>

        <div className={styles.contactGrid}>
          <div className={styles.contactDetails}>
            <div>
              <h3 className={styles.contactTitle} style={{ fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: '2.2rem', fontWeight: 400 }}>Start Your Legacy</h3>
              <p className={styles.contactDesc}>
                We document weddings globally. Dates are highly limited to preserve our fine-art post-processing standards. Share your wedding vision and let&apos;s build beautiful visual coven memoirs together.
              </p>
            </div>

            <div className={styles.contactInfoCard}>
              <div className={styles.contactInfoItem}>
                <div className={styles.contactIconCircle}>&#9993;</div>
                <div>
                  <div className={styles.contactInfoTextLabel}>Send an Email</div>
                  <div className={styles.contactInfoValue}>{config.email}</div>
                </div>
              </div>
              <div className={styles.contactInfoItem}>
                <div className={styles.contactIconCircle}>&#9742;</div>
                <div>
                  <div className={styles.contactInfoTextLabel}>Call Studio</div>
                  <div className={styles.contactInfoValue}>{config.phone}</div>
                </div>
              </div>
              <div className={styles.contactInfoItem}>
                <div className={styles.contactIconCircle}>&#9670;</div>
                <div>
                  <div className={styles.contactInfoTextLabel}>Creative Base</div>
                  <div className={styles.contactInfoValue}>{config.location}</div>
                </div>
              </div>
            </div>

            <div className={styles.socialRow}>
              {Object.keys(config.socialLinks).map((plat) => (
                <a 
                  key={plat}
                  href={config.socialLinks[plat]} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.socialIconBtn}
                  title={plat}
                >
                  <span style={{ textTransform: 'capitalize', fontSize: '0.8rem', fontWeight: 600 }}>
                    {plat.substring(0, 2)}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className={styles.contactFormCard}>
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Your Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter name"
                    className="form-input" 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email Address</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="name@domain.com"
                    className="form-input" 
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Wedding Date</label>
                  <input 
                    type="date" 
                    required 
                    className="form-input" 
                    value={contactForm.date}
                    onChange={(e) => setContactForm({ ...contactForm, date: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Wedding Venue &amp; City</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Tokyo Chapel, Japan"
                    className="form-input" 
                    value={contactForm.venue}
                    onChange={(e) => setContactForm({ ...contactForm, venue: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Selected Collection Package</label>
                <select 
                  className="form-input" 
                  value={contactForm.collection}
                  onChange={(e) => setContactForm({ ...contactForm, collection: e.target.value })}
                  style={{ background: '#121214', color: '#fff' }}
                >
                  <option value="The Elopement">The Elopement Collection ($2,200)</option>
                  <option value="The Editorial">The Editorial Collection ($3,800)</option>
                  <option value="The Noir Coven">The Noir Coven Collection ($5,500)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Share Your Wedding Story / Vision</label>
                <textarea 
                  required 
                  placeholder="Tell us about the vibes of your day, fashion style, lighting concept, and custom elopement visions..."
                  className={`form-input ${styles.formTextarea}`}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                />
              </div>

              {submitStatus.message && (
                <div className={`${styles.statusMessage} ${submitStatus.success ? styles.statusSuccess : styles.statusError}`}>
                  {submitStatus.message}
                </div>
              )}

              <button 
                type="submit" 
                disabled={submitting} 
                className="btn-neon" 
                style={{ width: '100%', marginTop: '10px' }}
              >
                {submitting ? 'Delivering Proposal Request...' : 'Submit Booking Inquiry'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Reusable Footer */}
      <Footer config={config} />
    </div>
  );
}
