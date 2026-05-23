'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../admin.module.css';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Database States
  const [config, setConfig] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [messages, setMessages] = useState([]);

  // Form State: Config Editor
  const [configForm, setConfigForm] = useState({});
  const [configSaving, setConfigSaving] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [aboutProfileUploading, setAboutProfileUploading] = useState(false);
  const [newFeatureInputs, setNewFeatureInputs] = useState(['', '', '']);

  // Form State: Gallery Uploader
  const [galleryForm, setGalleryForm] = useState({ title: '', category: '', imageUrl: '', description: '' });
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState(null);
  const [editingPortfolioProject, setEditingPortfolioProject] = useState(null);

  // Form State: Portfolio Album Creator
  const [portfolioForm, setPortfolioForm] = useState({
    title: '', category: '', description: '', client: '', date: '', coverImageUrl: '', images: []
  });
  const [coverUploading, setCoverUploading] = useState(false);
  const [multiUploading, setMultiUploading] = useState(false);
  const [portfolioSaving, setPortfolioSaving] = useState(false);

  // Refs for file uploads
  const heroFileRef = useRef(null);
  const logoFileRef = useRef(null);
  const aboutProfileFileRef = useRef(null);
  const galleryFileRef = useRef(null);
  const coverFileRef = useRef(null);
  const multiFileRef = useRef(null);

  // Action status indicators
  const [alertInfo, setAlertInfo] = useState({ tab: '', success: null, message: '' });

  // 1. Session verification on load
  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await fetch('/api/auth');
        if (!res.ok) {
          router.push('/admin');
          return;
        }
        const data = await res.json();
        if (data.authenticated) {
          setAuthorized(true);
          await loadAllData();
        } else {
          router.push('/admin');
        }
      } catch (err) {
        console.error('Session verify error:', err);
        router.push('/admin');
      } finally {
        setLoading(false);
      }
    }
    verifyAuth();
  }, [router]);

  // Load all system data
  async function loadAllData() {
    try {
      const [configRes, galleryRes, portfolioRes, messagesRes] = await Promise.all([
        fetch('/api/config'),
        fetch('/api/gallery'),
        fetch('/api/portfolio'),
        fetch('/api/messages')
      ]);

      if (configRes.ok) {
        const c = await configRes.json();
        setConfig(c);
        setConfigForm(c);
      }
      if (galleryRes.ok) setGallery(await galleryRes.json());
      if (portfolioRes.ok) setPortfolio(await portfolioRes.json());
      if (messagesRes.ok) setMessages(await messagesRes.json());
    } catch (err) {
      console.error('Failed to reload systems:', err);
    }
  }

  // Trigger temporary notification banners
  const triggerAlert = (tab, success, message) => {
    setAlertInfo({ tab, success, message });
    setTimeout(() => setAlertInfo({ tab: '', success: null, message: '' }), 4000);
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth', { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Helper to convert PSD to standard PNG inside the client's browser (offloads server load and limits)
  const processPsdClientSide = async (file, alertTabName) => {
    triggerAlert(alertTabName, true, 'Parsing Photoshop PSD file client-side... (converting to high-fidelity PNG to bypass size limits)');
    try {
      const { readPsd } = await import('ag-psd');
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target.result;
            const psd = readPsd(arrayBuffer);
            
            if (!psd.canvas) {
              reject(new Error('PSD does not contain a valid flattened preview. Please enable "Maximize Compatibility" in Photoshop when saving.'));
              return;
            }
            
            psd.canvas.toBlob((blob) => {
              if (blob) {
                const pngFile = new File([blob], file.name.replace(/\.psd$/i, '.png'), { type: 'image/png' });
                resolve(pngFile);
              } else {
                reject(new Error('Failed to render PSD canvas.'));
              }
            }, 'image/png');
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read PSD file array buffer.'));
        reader.readAsArrayBuffer(file);
      });
    } catch (err) {
      console.error('Client-side PSD converter error:', err);
      throw new Error('PSD converter error: ' + err.message);
    }
  };

  // Image Upload Core Handler
  const uploadImageFile = async (file, alertTabName = 'config') => {
    let fileToUpload = file;
    if (file.name.toLowerCase().endsWith('.psd')) {
      try {
        fileToUpload = await processPsdClientSide(file, alertTabName);
      } catch (psdErr) {
        triggerAlert(alertTabName, false, psdErr.message);
        throw psdErr;
      }
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);
    
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'File upload failed');
    }

    const data = await res.json();
    return data.url; // Returns /uploads/filename.ext
  };

  // --- CONFIG ACTIONS ---
  const handleHeroImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setHeroUploading(true);
    try {
      const imageUrl = await uploadImageFile(file);
      setConfigForm(prev => ({ ...prev, heroImage: imageUrl }));
      triggerAlert('config', true, 'Hero image uploaded to preview! Save to apply.');
    } catch (err) {
      triggerAlert('config', false, err.message);
    } finally {
      setHeroUploading(false);
    }
  };

  const handleLogoImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const imageUrl = await uploadImageFile(file);
      setConfigForm(prev => ({ ...prev, logoImage: imageUrl }));
      triggerAlert('config', true, 'Logo image uploaded to preview! Save to apply.');
    } catch (err) {
      triggerAlert('config', false, err.message);
    } finally {
      setLogoUploading(false);
    }
  };

  const handleAboutProfileImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAboutProfileUploading(true);
    try {
      const imageUrl = await uploadImageFile(file);
      setConfigForm(prev => ({ ...prev, aboutProfileImage: imageUrl }));
      triggerAlert('config', true, 'Profile photo uploaded to preview! Save to apply.');
    } catch (err) {
      triggerAlert('config', false, err.message);
    } finally {
      setAboutProfileUploading(false);
    }
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    setConfigSaving(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configForm)
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        triggerAlert('config', true, 'Global settings saved and active live!');
      } else {
        triggerAlert('config', false, 'Failed to save site configurations.');
      }
    } catch (err) {
      triggerAlert('config', false, 'Server connection lost.');
    } finally {
      setConfigSaving(false);
    }
  };
 
  // Handle package field changes
  const handlePackageFieldChange = (index, field, value) => {
    const updatedPkgs = [...(configForm.packages || [])];
    if (updatedPkgs[index]) {
      updatedPkgs[index] = { ...updatedPkgs[index], [field]: value };
      setConfigForm(prev => ({ ...prev, packages: updatedPkgs }));
    }
  };

  // Set a specific package as "featured" and disable others
  const handleSetFeaturedPackage = (index) => {
    const updatedPkgs = (configForm.packages || []).map((pkg, idx) => ({
      ...pkg,
      featured: idx === index
    }));
    setConfigForm(prev => ({ ...prev, packages: updatedPkgs }));
  };

  // Add a feature inclusion to a package
  const handleAddPackageFeature = (index, featureText) => {
    if (!featureText || !featureText.trim()) return;
    const updatedPkgs = [...(configForm.packages || [])];
    if (updatedPkgs[index]) {
      const activeFeats = [...(updatedPkgs[index].features || [])];
      activeFeats.push(featureText.trim());
      updatedPkgs[index] = { ...updatedPkgs[index], features: activeFeats };
      setConfigForm(prev => ({ ...prev, packages: updatedPkgs }));
    }
  };

  // Delete a feature inclusion from a package
  const handleDeletePackageFeature = (pkgIndex, featIndex) => {
    const updatedPkgs = [...(configForm.packages || [])];
    if (updatedPkgs[pkgIndex]) {
      const activeFeats = (updatedPkgs[pkgIndex].features || []).filter((_, idx) => idx !== featIndex);
      updatedPkgs[pkgIndex] = { ...updatedPkgs[pkgIndex], features: activeFeats };
      setConfigForm(prev => ({ ...prev, packages: updatedPkgs }));
    }
  };

  // --- GALLERY ACTIONS ---
  const handleGalleryFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const imageUrl = await uploadImageFile(file, 'gallery');
      setGalleryForm(prev => ({ ...prev, imageUrl }));
      triggerAlert('gallery', true, 'Gallery photo uploaded successfully.');
    } catch (err) {
      triggerAlert('gallery', false, err.message);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleGalleryEditStart = (item) => {
    setEditingGalleryItem(item);
    setGalleryForm({
      title: item.title,
      category: item.category,
      imageUrl: item.imageUrl,
      description: item.description || ''
    });
    // Scroll smoothly to the top form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGalleryEditCancel = () => {
    setEditingGalleryItem(null);
    setGalleryForm({ title: '', category: '', imageUrl: '', description: '' });
    if (galleryFileRef.current) galleryFileRef.current.value = '';
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    if (!galleryForm.imageUrl) {
      triggerAlert('gallery', false, 'Please upload a photo first.');
      return;
    }
    setPhotoSaving(true);
    try {
      const isEditing = !!editingGalleryItem;
      const url = '/api/gallery';
      const method = isEditing ? 'PUT' : 'POST';
      const bodyPayload = isEditing 
        ? { id: editingGalleryItem.id, ...galleryForm } 
        : galleryForm;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      if (res.ok) {
        const data = await res.json();
        if (isEditing) {
          setGallery(prev => prev.map(item => item.id === editingGalleryItem.id ? data.item : item));
          setEditingGalleryItem(null);
          triggerAlert('gallery', true, 'Gallery photo updated successfully!');
        } else {
          setGallery(prev => [data.item, ...prev]);
          triggerAlert('gallery', true, 'Photo published successfully!');
        }
        setGalleryForm({ title: '', category: '', imageUrl: '', description: '' });
        if (galleryFileRef.current) galleryFileRef.current.value = '';
      } else {
        triggerAlert('gallery', false, isEditing ? 'Failed to update photo.' : 'Failed to publish photo.');
      }
    } catch (err) {
      triggerAlert('gallery', false, 'Database error.');
    } finally {
      setPhotoSaving(false);
    }
  };

  const handleGalleryDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this photo?')) return;
    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGallery(prev => prev.filter(item => item.id !== id));
        triggerAlert('gallery', true, 'Photo deleted successfully.');
      } else {
        triggerAlert('gallery', false, 'Failed to delete photo.');
      }
    } catch (err) {
      triggerAlert('gallery', false, 'Database error.');
    }
  };

  // --- PORTFOLIO ACTIONS ---
  const handlePortfolioCoverSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const imageUrl = await uploadImageFile(file, 'portfolio');
      setPortfolioForm(prev => ({ ...prev, coverImageUrl: imageUrl }));
      triggerAlert('portfolio', true, 'Album cover uploaded successfully.');
    } catch (err) {
      triggerAlert('portfolio', false, err.message);
    } finally {
      setCoverUploading(false);
    }
  };

  const handlePortfolioMultiSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setMultiUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const url = await uploadImageFile(file, 'portfolio');
        urls.push(url);
      }
      setPortfolioForm(prev => ({
        ...prev,
        images: [...prev.images, ...urls]
      }));
      triggerAlert('portfolio', true, `Uploaded ${files.length} project captures successfully.`);
    } catch (err) {
      triggerAlert('portfolio', false, err.message);
    } finally {
      setMultiUploading(false);
      if (multiFileRef.current) multiFileRef.current.value = '';
    }
  };

  const removeAlbumPhotoMini = (indexToRemove) => {
    setPortfolioForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handlePortfolioEditStart = (project) => {
    setEditingPortfolioProject(project);
    setPortfolioForm({
      title: project.title,
      category: project.category,
      client: project.client || '',
      date: project.date || '',
      description: project.description || '',
      coverImageUrl: project.coverImageUrl || '',
      images: project.images || []
    });
    // Scroll smoothly to the top form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePortfolioEditCancel = () => {
    setEditingPortfolioProject(null);
    setPortfolioForm({
      title: '', category: '', description: '', client: '', date: '', coverImageUrl: '', images: []
    });
    if (coverFileRef.current) coverFileRef.current.value = '';
    if (multiFileRef.current) multiFileRef.current.value = '';
  };

  const handlePortfolioSubmit = async (e) => {
    e.preventDefault();
    if (!portfolioForm.coverImageUrl) {
      triggerAlert('portfolio', false, 'Please upload a project cover image.');
      return;
    }
    setPortfolioSaving(true);
    try {
      const isEditing = !!editingPortfolioProject;
      const url = '/api/portfolio';
      const method = isEditing ? 'PUT' : 'POST';
      const bodyPayload = isEditing 
        ? { id: editingPortfolioProject.id, ...portfolioForm } 
        : portfolioForm;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      if (res.ok) {
        const data = await res.json();
        if (isEditing) {
          setPortfolio(prev => prev.map(p => p.id === editingPortfolioProject.id ? data.project : p));
          setEditingPortfolioProject(null);
          triggerAlert('portfolio', true, 'Portfolio album updated successfully!');
        } else {
          setPortfolio(prev => [data.project, ...prev]);
          triggerAlert('portfolio', true, 'Portfolio album published successfully!');
        }
        setPortfolioForm({
          title: '', category: '', description: '', client: '', date: '', coverImageUrl: '', images: []
        });
        if (coverFileRef.current) coverFileRef.current.value = '';
      } else {
        triggerAlert('portfolio', false, isEditing ? 'Failed to update album.' : 'Failed to publish album.');
      }
    } catch (err) {
      triggerAlert('portfolio', false, 'Database connection error.');
    } finally {
      setPortfolioSaving(false);
    }
  };

  const handlePortfolioDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this entire portfolio album?')) return;
    try {
      const res = await fetch(`/api/portfolio?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPortfolio(prev => prev.filter(p => p.id !== id));
        triggerAlert('portfolio', true, 'Portfolio album deleted successfully.');
      } else {
        triggerAlert('portfolio', false, 'Failed to delete album.');
      }
    } catch (err) {
      triggerAlert('portfolio', false, 'Database error.');
    }
  };

  // --- MESSAGES ACTIONS ---
  const handleMarkMessageRead = async (id, currentRead) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: !currentRead })
      });
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, read: !currentRead } : m));
        triggerAlert('messages', true, `Message marked as ${!currentRead ? 'read' : 'unread'}.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMessageDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this message record?')) return;
    try {
      const res = await fetch(`/api/messages?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
        triggerAlert('messages', true, 'Message deleted from inbox.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Unread messages count
  const unreadMessagesCount = messages.filter(m => !m.read).length;

  if (loading || !authorized) {
    return (
      <div className={styles.loginOverlay}>
        <div className={styles.loginCard} style={{ alignItems: 'center' }}>
          <div className={styles.loaderRing}></div>
          <span style={{
            fontFamily: 'Syne',
            color: 'var(--accent-neon)',
            textShadow: 'var(--accent-neon-text-glow)',
            fontSize: '0.85rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase'
          }}>Loading Systems...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      <div className={styles.dashboardWrapper}>
        
        {/* 1. Left Side Admin Navigation Bar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTop}>
            <div className={styles.sidebarBrand}>
              {config?.logoImage && !config.logoImage.endsWith('.psd') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={config.logoImage} alt="Brand Logo" style={{ maxHeight: '45px', maxWidth: '100%', objectFit: 'contain', display: 'block', margin: '0 auto 10px' }} />
              ) : (
                <>STUDIO <span className={styles.sidebarBrandGreen}>GFX</span></>
              )}
            </div>

            <nav className={styles.sidebarMenu}>
              <div 
                className={`${styles.sidebarLink} ${activeTab === 'overview' ? styles.sidebarLinkActive : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <span>&#128202;</span> Overview
              </div>
              <div 
                className={`${styles.sidebarLink} ${activeTab === 'config' ? styles.sidebarLinkActive : ''}`}
                onClick={() => setActiveTab('config')}
              >
                <span>&#9881;</span> Brand Config
              </div>
              <div 
                className={`${styles.sidebarLink} ${activeTab === 'gallery' ? styles.sidebarLinkActive : ''}`}
                onClick={() => setActiveTab('gallery')}
              >
                <span>&#128247;</span> Gallery Mgr
              </div>
              <div 
                className={`${styles.sidebarLink} ${activeTab === 'portfolio' ? styles.sidebarLinkActive : ''}`}
                onClick={() => setActiveTab('portfolio')}
              >
                <span>&#128193;</span> Portfolio Mgr
              </div>
              <div 
                className={`${styles.sidebarLink} ${activeTab === 'messages' ? styles.sidebarLinkActive : ''}`}
                onClick={() => setActiveTab('messages')}
              >
                <span>&#9993;</span> Messages
                {unreadMessagesCount > 0 && <span className={styles.unreadBadge} style={{ marginLeft: 'auto' }}>{unreadMessagesCount}</span>}
              </div>
            </nav>
          </div>

          <div className={styles.sidebarFooter}>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <span>&#128274;</span> Logout Session
            </button>
          </div>
        </aside>

        {/* 2. Main Admin Workspace */}
        <main className={styles.workspace}>
          
          <div className={styles.workspaceHeader}>
            <h1 className={styles.workspaceTitle}>{activeTab} Management</h1>
            <div className={styles.welcomeUser}>
              System Operator: <span className={styles.userBadge}>admin</span>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {/* Executive Stats Dashboard Row */}
              <div className={styles.statsRow}>
                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <span className={styles.statCardTitle}>Site Views</span>
                    <span className={styles.statIcon}>&#128065;</span>
                  </div>
                  <div className={styles.statValue}>2,840</div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <span className={styles.statCardTitle}>Total Photos</span>
                    <span className={styles.statIcon}>&#128248;</span>
                  </div>
                  <div className={styles.statValue}>{gallery.length}</div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <span className={styles.statCardTitle}>Portfolio Folders</span>
                    <span className={styles.statIcon}>&#128194;</span>
                  </div>
                  <div className={styles.statValue}>{portfolio.length}</div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statHeader}>
                    <span className={styles.statCardTitle}>Unread Inquiries</span>
                    <span className={styles.statIcon}>&#9993;</span>
                  </div>
                  <div className={styles.statValue}>{unreadMessagesCount}</div>
                </div>
              </div>

              {/* Quick Messages Summary Card */}
              <div className={styles.managerPanel}>
                <h3 className={styles.panelTitle}>Recent Client Inquiries</h3>
                {messages.length === 0 ? (
                  <p style={{ color: 'var(--text-dim)' }}>No customer inquiries on record.</p>
                ) : (
                  <div className={styles.messagesList} style={{ gap: '15px' }}>
                    {messages.slice(0, 3).map(msg => (
                      <div key={msg.id} className={`${styles.messageRow} ${!msg.read ? styles.messageRowUnread : ''}`} style={{ padding: '15px 20px' }}>
                        <div className={styles.messageHeader}>
                          <span className={styles.senderName}>
                            {msg.name} {!msg.read && <span className={styles.unreadBadge}>NEW</span>}
                          </span>
                          <span className={styles.messageDate}>{msg.createdAt.substring(0, 10)}</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>&ldquo;{msg.message.substring(0, 100)}...&rdquo;</p>
                      </div>
                    ))}
                    <button className="btn-outline" onClick={() => setActiveTab('messages')} style={{ marginTop: '10px', alignSelf: 'flex-start', padding: '8px 20px' }}>
                      Go to Inbox &rarr;
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: BRAND CONFIG */}
          {activeTab === 'config' && (
            <div className={styles.managerPanel}>
              <h3 className={styles.panelTitle}>Global Site Configuration</h3>
              
              {alertInfo.tab === 'config' && (
                <div className={`status-message ${alertInfo.success ? styles.statusSuccess : styles.statusError}`} style={{ marginBottom: '25px', padding: '12px' }}>
                  {alertInfo.message}
                </div>
              )}

              <form onSubmit={handleConfigSubmit} className={styles.configForm}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Studio Brand Name</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input"
                      value={configForm.siteName || ''}
                      onChange={(e) => setConfigForm({ ...configForm, siteName: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Hero Catchy Tagline</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input"
                      value={configForm.tagline || ''}
                      onChange={(e) => setConfigForm({ ...configForm, tagline: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Business Contact Email</label>
                    <input 
                      type="email" 
                      required 
                      className="form-input"
                      value={configForm.email || ''}
                      onChange={(e) => setConfigForm({ ...configForm, email: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Business Phone</label>
                    <input 
                      type="text" 
                      required 
                      className="form-input"
                      value={configForm.phone || ''}
                      onChange={(e) => setConfigForm({ ...configForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Studio Location Base</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input"
                    value={configForm.location || ''}
                    onChange={(e) => setConfigForm({ ...configForm, location: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Biography Statement (About Us)</label>
                  <textarea 
                    required 
                    className="form-input"
                    style={{ minHeight: '120px' }}
                    value={configForm.aboutText || ''}
                    onChange={(e) => setConfigForm({ ...configForm, aboutText: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Biography Direct Quote</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input"
                    value={configForm.aboutQuote || ''}
                    onChange={(e) => setConfigForm({ ...configForm, aboutQuote: e.target.value })}
                  />
                </div>

                <div style={{ marginTop: '30px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '25px', marginBottom: '30px' }}>
                  <h4 style={{ fontFamily: 'Syne', color: 'var(--accent-neon)', marginBottom: '20px', fontSize: '0.95rem', letterSpacing: '0.05em' }}>ABOUT US PAGE DETAILED CUSTOMIZATION</h4>
                  
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Photographer / Studio Name</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={configForm.aboutName || ''}
                        onChange={(e) => setConfigForm({ ...configForm, aboutName: e.target.value })}
                        placeholder="e.g. Aria Vance"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Professional Title / Role</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={configForm.aboutRole || ''}
                        onChange={(e) => setConfigForm({ ...configForm, aboutRole: e.target.value })}
                        placeholder="e.g. Lead Creative Director & Visionary"
                      />
                    </div>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Total Years of Experience</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={configForm.aboutYears || ''}
                        onChange={(e) => setConfigForm({ ...configForm, aboutYears: e.target.value })}
                        placeholder="e.g. 12+"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Profile Photo / Portrait Image</label>
                      <div className={styles.uploadZone}>
                        <span className={styles.uploadZoneIcon}>&#128100;</span>
                        <span className={styles.uploadZoneText}>
                          {aboutProfileUploading ? 'Uploading profile image...' : <>Drag or <span className={styles.uploadZoneGreen}>Browse</span> image for profile</>}
                        </span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className={styles.fileInputHidden}
                          ref={aboutProfileFileRef}
                          onChange={handleAboutProfileImageChange}
                          disabled={aboutProfileUploading}
                        />
                      </div>
                      {configForm.aboutProfileImage && (
                        <div className={styles.uploadPreviewWrapper} style={{ marginTop: '10px' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={configForm.aboutProfileImage} 
                            alt="Profile preview" 
                            className={styles.uploadPreviewImg} 
                          />
                          <div className={styles.uploadPreviewMeta}>
                            <span className={styles.previewName}>Active Profile Image URL</span>
                            <span className={styles.previewSize}>{configForm.aboutProfileImage}</span>
                          </div>
                          <button type="button" className={styles.removeUploadBtn} onClick={() => setConfigForm(prev => ({ ...prev, aboutProfileImage: '' }))}>
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Visionary Detailed Biography (Paragraph 2)</label>
                    <textarea 
                      className="form-input"
                      style={{ minHeight: '100px' }}
                      value={configForm.aboutBio2 || ''}
                      onChange={(e) => setConfigForm({ ...configForm, aboutBio2: e.target.value })}
                      placeholder="Enter a deeper, immersive biography paragraph describing their philosophy..."
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Creative / Love Manifesto</label>
                    <textarea 
                      className="form-input"
                      style={{ minHeight: '100px' }}
                      value={configForm.aboutManifesto || ''}
                      onChange={(e) => setConfigForm({ ...configForm, aboutManifesto: e.target.value })}
                      placeholder="Enter your photography style statement, philosophy, or vows manifesto..."
                    />
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Camera Spec 1 (Label: Value)</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={configForm.aboutGear1 || ''}
                        onChange={(e) => setConfigForm({ ...configForm, aboutGear1: e.target.value })}
                        placeholder="e.g. Medium Format System: Hasselblad X2D 100C"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Camera Spec 2 (Label: Value)</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={configForm.aboutGear2 || ''}
                        onChange={(e) => setConfigForm({ ...configForm, aboutGear2: e.target.value })}
                        placeholder="e.g. Candid Camera System: Leica M11 Monochrom"
                      />
                    </div>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Camera Spec 3 (Label: Value)</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={configForm.aboutGear3 || ''}
                        onChange={(e) => setConfigForm({ ...configForm, aboutGear3: e.target.value })}
                        placeholder="e.g. Secondary System: Sony Alpha 7R V"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Camera Spec 4 (Label: Value)</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={configForm.aboutGear4 || ''}
                        onChange={(e) => setConfigForm({ ...configForm, aboutGear4: e.target.value })}
                        placeholder="e.g. Lighting Artistry: Profoto B10X AirTTL"
                      />
                    </div>
                  </div>
                </div>

                {/* Social media connections */}
                <div>
                  <h4 style={{ fontFamily: 'Syne', color: 'var(--text-white)', marginBottom: '15px', fontSize: '0.9rem', letterSpacing: '0.05em' }}>SOCIAL MEDIA HANDLES</h4>
                  <div className={styles.socialGrid}>
                    {['instagram', 'twitter', 'facebook', 'youtube'].map((plat) => (
                      <div key={plat} className={styles.formGroup}>
                        <label className={styles.formLabel} style={{ textTransform: 'capitalize' }}>{plat}</label>
                        <input 
                          type="url" 
                          placeholder="https://..."
                          className="form-input"
                          value={configForm.socialLinks?.[plat] || ''}
                          onChange={(e) => setConfigForm({
                            ...configForm,
                            socialLinks: {
                              ...configForm.socialLinks,
                              [plat]: e.target.value
                            }
                          })}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logo Image Changer */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Upload Logo Image (PSD, JPG, PNG)</label>
                  <div className={styles.uploadZone}>
                    <span className={styles.uploadZoneIcon}>&#128193;</span>
                    <span className={styles.uploadZoneText}>
                      {logoUploading ? 'Uploading active logo...' : <>Drag or <span className={styles.uploadZoneGreen}>Browse</span> custom logo file</>}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*,.psd" 
                      className={styles.fileInputHidden}
                      ref={logoFileRef}
                      onChange={handleLogoImageChange}
                      disabled={logoUploading}
                    />
                  </div>

                  {configForm.logoImage && (
                    <div className={styles.uploadPreviewWrapper}>
                      {configForm.logoImage.endsWith('.psd') ? (
                        <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--accent-neon)', fontWeight: 'bold', fontSize: '0.85rem' }}>PSD File</div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={configForm.logoImage} 
                          alt="Logo preview" 
                          className={styles.uploadPreviewImg} 
                        />
                      )}
                      <div className={styles.uploadPreviewMeta}>
                        <span className={styles.previewName}>Active Brand Logo URL</span>
                        <span className={styles.previewSize}>{configForm.logoImage}</span>
                      </div>
                      <button type="button" className={styles.removeUploadBtn} onClick={() => setConfigForm(prev => ({ ...prev, logoImage: '' }))}>
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Hero Image Changer */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Homepage Hero Core Image</label>
                  <div className={styles.uploadZone}>
                    <span className={styles.uploadZoneIcon}>&#128190;</span>
                    <span className={styles.uploadZoneText}>
                      {heroUploading ? 'Uploading active file...' : <>Drag or <span className={styles.uploadZoneGreen}>Browse</span> photo for Homepage Cover</>}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className={styles.fileInputHidden}
                      ref={heroFileRef}
                      onChange={handleHeroImageChange}
                      disabled={heroUploading}
                    />
                  </div>

                  {configForm.heroImage && (
                    <div className={styles.uploadPreviewWrapper}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={configForm.heroImage} 
                        alt="Hero preview cover" 
                        className={styles.uploadPreviewImg} 
                      />
                      <div className={styles.uploadPreviewMeta}>
                        <span className={styles.previewName}>Active Hero Banner URL</span>
                        <span className={styles.previewSize}>{configForm.heroImage}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* --- DYNAMIC CONTACT US CUSTOMIZATION --- */}
                <div style={{ marginTop: '40px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '30px', marginBottom: '30px' }}>
                  <h4 style={{ fontFamily: 'Syne', color: 'var(--accent-neon)', marginBottom: '20px', fontSize: '0.95rem', letterSpacing: '0.05em' }}>CONTACT US PAGE CUSTOMIZATION</h4>
                  
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Contact Page Title Tag</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={configForm.contactTitle || ''}
                        onChange={(e) => setConfigForm({ ...configForm, contactTitle: e.target.value })}
                        placeholder="e.g. Secure Your Date"
                      />
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Contact Page Description Story</label>
                      <textarea 
                        className="form-input"
                        style={{ minHeight: '60px' }}
                        value={configForm.contactDescription || ''}
                        onChange={(e) => setConfigForm({ ...configForm, contactDescription: e.target.value })}
                        placeholder="We document weddings globally..."
                      />
                    </div>
                  </div>
                </div>

                {/* --- DYNAMIC WEDDING COLLECTIONS CONFIGURATOR --- */}
                <div style={{ marginTop: '40px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '30px', marginBottom: '30px' }}>
                  <h4 style={{ fontFamily: 'Syne', color: 'var(--accent-neon)', marginBottom: '10px', fontSize: '0.95rem', letterSpacing: '0.05em' }}>WEDDING COLLECTIONS (PRICING PACKAGES) CONFIGURATOR</h4>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>Configure package names, subtitles, prices, and features directly. Prices will render with Rupee symbol ₹ dynamically in the client catalog.</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    {(configForm.packages || []).map((pkg, index) => {
                      return (
                        <div key={index} style={{ background: 'rgba(255,255,255,0.02)', border: pkg.featured ? '1px solid var(--accent-neon)' : '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative' }}>
                          {pkg.featured && (
                            <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--accent-neon)', color: '#000', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              Featured
                            </span>
                          )}
                          
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Collection Name</label>
                            <input 
                              type="text" 
                              required 
                              className="form-input"
                              value={pkg.name || ''}
                              onChange={(e) => handlePackageFieldChange(index, 'name', e.target.value)}
                              placeholder="e.g. The Elopement"
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Inspiration Subtitle</label>
                            <input 
                              type="text" 
                              required 
                              className="form-input"
                              value={pkg.subtitle || ''}
                              onChange={(e) => handlePackageFieldChange(index, 'subtitle', e.target.value)}
                              placeholder="e.g. For Intimate Vows"
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Investment Price</label>
                            <div style={{ position: 'relative' }}>
                              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-neon)', fontWeight: 'bold' }}>₹</span>
                              <input 
                                type="text" 
                                required 
                                className="form-input"
                                style={{ paddingLeft: '28px' }}
                                value={pkg.price || ''}
                                onChange={(e) => handlePackageFieldChange(index, 'price', e.target.value)}
                                placeholder="e.g. ₹1,80,000"
                              />
                            </div>
                          </div>

                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Package Inclusions & Features</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.05)', padding: '10px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)' }}>
                              {(pkg.features || []).length === 0 ? (
                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>No features added yet.</span>
                              ) : (
                                (pkg.features || []).map((feat, fIdx) => (
                                  <div key={fIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid rgba(255,255,255,0.02)' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', whiteSpace: 'normal', wordBreak: 'break-word', paddingRight: '10px' }}>{feat}</span>
                                    <button 
                                      type="button" 
                                      onClick={() => handleDeletePackageFeature(index, fIdx)} 
                                      style={{ background: 'none', border: 'none', color: '#ff3b30', fontSize: '0.9rem', cursor: 'pointer', padding: '2px' }}
                                      title="Remove feature"
                                    >
                                      &times;
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                type="text" 
                                className="form-input" 
                                placeholder="Add feature detail..." 
                                style={{ fontSize: '0.8rem' }}
                                value={newFeatureInputs[index] || ''}
                                onChange={(e) => {
                                  const updatedInputs = [...newFeatureInputs];
                                  updatedInputs[index] = e.target.value;
                                  setNewFeatureInputs(updatedInputs);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddPackageFeature(index, newFeatureInputs[index]);
                                    const updatedInputs = [...newFeatureInputs];
                                    updatedInputs[index] = '';
                                    setNewFeatureInputs(updatedInputs);
                                  }
                                }}
                              />
                              <button 
                                type="button" 
                                className="btn-outline" 
                                style={{ padding: '0 15px', fontSize: '0.8rem' }}
                                onClick={() => {
                                  handleAddPackageFeature(index, newFeatureInputs[index]);
                                  const updatedInputs = [...newFeatureInputs];
                                  updatedInputs[index] = '';
                                  setNewFeatureInputs(updatedInputs);
                                }}
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Featured Popular Highlight:</span>
                            <input 
                              type="radio" 
                              name="featuredPackageRadio"
                              checked={!!pkg.featured} 
                              onChange={() => handleSetFeaturedPackage(index)}
                              style={{ cursor: 'pointer', accentColor: 'var(--accent-neon)', width: '16px', height: '16px' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={configSaving} 
                  className="btn-neon" 
                  style={{ width: '220px', alignSelf: 'flex-start' }}
                >
                  {configSaving ? 'Saving configs...' : 'Save Site Configuration'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: GALLERY MGR */}
          {activeTab === 'gallery' && (
            <>
              {/* Uploader Card */}
              <div className={styles.managerPanel}>
                <h3 className={styles.panelTitle}>
                  {editingGalleryItem ? `Edit Photo: ${editingGalleryItem.title}` : 'Publish New Photo to Gallery'}
                </h3>
                
                {alertInfo.tab === 'gallery' && (
                  <div className={`status-message ${alertInfo.success ? styles.statusSuccess : styles.statusError}`} style={{ marginBottom: '25px', padding: '12px' }}>
                    {alertInfo.message}
                  </div>
                )}

                <form onSubmit={handleGallerySubmit} className={styles.configForm}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Photo Title</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Neon Horizon" 
                        className="form-input"
                        value={galleryForm.title}
                        onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Category Tag</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Portrait, Street, Abstract" 
                        className="form-input"
                        value={galleryForm.category}
                        onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Brief Narrative / Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Long exposure under dark neon reflections." 
                      className="form-input"
                      value={galleryForm.description}
                      onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Upload High-Resolution Photo File</label>
                    <div className={styles.uploadZone}>
                      <span className={styles.uploadZoneIcon}>&#128248;</span>
                      <span className={styles.uploadZoneText}>
                        {photoUploading ? 'Uploading file...' : <>Drag or <span className={styles.uploadZoneGreen}>Browse</span> image for public grid</>}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className={styles.fileInputHidden}
                        ref={galleryFileRef}
                        onChange={handleGalleryFileSelect}
                        disabled={photoUploading}
                      />
                    </div>

                    {galleryForm.imageUrl && (
                      <div className={styles.uploadPreviewWrapper}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={galleryForm.imageUrl} 
                          alt="Gallery item preview" 
                          className={styles.uploadPreviewImg} 
                        />
                        <div className={styles.uploadPreviewMeta}>
                          <span className={styles.previewName}>Image Preview</span>
                          <span className={styles.previewSize}>{galleryForm.imageUrl}</span>
                        </div>
                        <button type="button" className={styles.removeUploadBtn} onClick={() => setGalleryForm({ ...galleryForm, imageUrl: '' })}>
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button 
                      type="submit" 
                      disabled={photoSaving} 
                      className="btn-neon" 
                      style={{ width: '220px' }}
                    >
                      {photoSaving ? 'Saving...' : (editingGalleryItem ? 'Save Photo Changes' : 'Publish Photo')}
                    </button>
                    {editingGalleryItem && (
                      <button 
                        type="button" 
                        className="btn-outline" 
                        onClick={handleGalleryEditCancel}
                        style={{ width: '150px' }}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Gallery List Management Grid */}
              <div className={styles.managerPanel} style={{ marginTop: '30px' }}>
                <h3 className={styles.panelTitle}>Active Gallery Grid Items ({gallery.length})</h3>
                {gallery.length === 0 ? (
                  <p style={{ color: 'var(--text-dim)' }}>No photos published to gallery.</p>
                ) : (
                  <div className={styles.adminPhotosGrid}>
                    {gallery.map(item => (
                      <div key={item.id} className={styles.adminPhotoCard}>
                        <button className={styles.deletePhotoOverlay} onClick={() => handleGalleryDelete(item.id)} title="Delete Image">
                          &times;
                        </button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.imageUrl} alt={item.title} className={styles.adminPhotoImg} />
                        <div className={styles.adminPhotoInfo} style={{ position: 'relative' }}>
                          <div className={styles.adminPhotoTitle}>{item.title}</div>
                          <span className={styles.adminPhotoCategory}>{item.category}</span>
                          <button 
                            type="button" 
                            onClick={() => handleGalleryEditStart(item)} 
                            style={{ 
                              position: 'absolute', 
                              right: '12px', 
                              bottom: '12px', 
                              background: 'rgba(255,255,255,0.04)', 
                              border: '1px solid rgba(255,255,255,0.1)', 
                              color: 'var(--accent-neon)', 
                              fontSize: '0.65rem', 
                              padding: '4px 10px', 
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontFamily: 'Syne',
                              fontWeight: 'bold',
                              letterSpacing: '0.05em'
                            }}
                          >
                            EDIT
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 4: PORTFOLIO MGR */}
          {activeTab === 'portfolio' && (
            <>
              {/* Creator Card */}
              <div className={styles.managerPanel}>
                <h3 className={styles.panelTitle}>
                  {editingPortfolioProject ? `Edit Portfolio Album: ${editingPortfolioProject.title}` : 'Create Custom Portfolio Album'}
                </h3>
                
                {alertInfo.tab === 'portfolio' && (
                  <div className={`status-message ${alertInfo.success ? styles.statusSuccess : styles.statusError}`} style={{ marginBottom: '25px', padding: '12px' }}>
                    {alertInfo.message}
                  </div>
                )}

                <form onSubmit={handlePortfolioSubmit} className={styles.configForm}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Album Folder Title</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Cyber City Sessions" 
                        className="form-input"
                        value={portfolioForm.title}
                        onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Category Medium</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Street Portraiture, High Fashion" 
                        className="form-input"
                        value={portfolioForm.category}
                        onChange={(e) => setPortfolioForm({ ...portfolioForm, category: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Commission Client</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Apex Design Agency / Personal" 
                        className="form-input"
                        value={portfolioForm.client}
                        onChange={(e) => setPortfolioForm({ ...portfolioForm, client: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Date Published (YYYY-MM)</label>
                      <input 
                        type="month" 
                        required 
                        className="form-input"
                        value={portfolioForm.date}
                        onChange={(e) => setPortfolioForm({ ...portfolioForm, date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Album Story narrative</label>
                    <textarea 
                      required 
                      placeholder="Describe the styling concept, lens properties, lighting conditions, and outcomes..." 
                      className="form-input"
                      style={{ minHeight: '100px' }}
                      value={portfolioForm.description}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                    />
                  </div>

                  <div className={styles.formGrid}>
                    {/* Cover Upload */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Project Folder Cover Image</label>
                      <div className={styles.uploadZone}>
                        <span className={styles.uploadZoneIcon}>&#128193;</span>
                        <span className={styles.uploadZoneText}>
                          {coverUploading ? 'Uploading file...' : <>Drag or <span className={styles.uploadZoneGreen}>Browse</span> cover</>}
                        </span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className={styles.fileInputHidden}
                          ref={coverFileRef}
                          onChange={handlePortfolioCoverSelect}
                          disabled={coverUploading}
                        />
                      </div>

                      {portfolioForm.coverImageUrl && (
                        <div className={styles.uploadPreviewWrapper}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={portfolioForm.coverImageUrl} 
                            alt="Cover preview" 
                            className={styles.uploadPreviewImg} 
                          />
                          <div className={styles.uploadPreviewMeta}>
                            <span className={styles.previewName}>Cover Preview</span>
                          </div>
                          <button type="button" className={styles.removeUploadBtn} onClick={() => setPortfolioForm({ ...portfolioForm, coverImageUrl: '' })}>
                            Clear
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Multi Upload */}
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Album Showcase Captures (Multi-upload)</label>
                      <div className={styles.uploadZone}>
                        <span className={styles.uploadZoneIcon}>&#128194;</span>
                        <span className={styles.uploadZoneText}>
                          {multiUploading ? 'Uploading package files...' : <>Upload <span className={styles.uploadZoneGreen}>multiple</span> photos</>}
                        </span>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          className={styles.fileInputHidden}
                          ref={multiFileRef}
                          onChange={handlePortfolioMultiSelect}
                          disabled={multiUploading}
                        />
                      </div>

                      {portfolioForm.images.length > 0 && (
                        <div>
                          <div className={styles.previewSize} style={{ marginTop: '8px', fontWeight: 600 }}>Active Album Captures ({portfolioForm.images.length})</div>
                          <div className={styles.albumPhotosList}>
                            {portfolioForm.images.map((img, idx) => (
                              <div key={idx} className={styles.albumPhotoMiniCard}>
                                <button type="button" className={styles.removeMiniPhotoBtn} onClick={() => removeAlbumPhotoMini(idx)}>
                                  &times;
                                </button>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img} alt="Mini preview" className={styles.albumPhotoMiniImg} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button 
                      type="submit" 
                      disabled={portfolioSaving} 
                      className="btn-neon" 
                      style={{ width: '220px' }}
                    >
                      {portfolioSaving ? 'Saving Album...' : (editingPortfolioProject ? 'Save Album Changes' : 'Publish Portfolio Album')}
                    </button>
                    {editingPortfolioProject && (
                      <button 
                        type="button" 
                        className="btn-outline" 
                        onClick={handlePortfolioEditCancel}
                        style={{ width: '150px' }}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Portfolio List */}
              <div className={styles.managerPanel} style={{ marginTop: '30px' }}>
                <h3 className={styles.panelTitle}>Active Portfolio Folders ({portfolio.length})</h3>
                {portfolio.length === 0 ? (
                  <p style={{ color: 'var(--text-dim)' }}>No portfolio albums published.</p>
                ) : (
                  <div className={styles.portfolioProjectList}>
                    {portfolio.map(p => (
                      <div key={p.id} className={styles.projectListItem}>
                        <div className={styles.projectListLeft}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.coverImageUrl} alt="Project mini cover" className={styles.projectListCover} />
                          <div>
                            <div className={styles.projectListTitle}>{p.title}</div>
                            <span className={styles.projectListCategory}>{p.category} ({p.images.length} photos)</span>
                          </div>
                        </div>
                        <div className={styles.projectListActions} style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            type="button"
                            className="btn-neon" 
                            onClick={() => handlePortfolioEditStart(p)} 
                            style={{ 
                              padding: '8px 16px', 
                              fontSize: '0.75rem',
                              width: 'fit-content'
                            }}
                          >
                            Edit Album
                          </button>
                          <button 
                            type="button"
                            className="btn-outline" 
                            onClick={() => handlePortfolioDelete(p.id)} 
                            style={{ 
                              borderColor: 'rgba(239, 68, 68, 0.4)', 
                              color: '#ef4444', 
                              padding: '8px 16px', 
                              fontSize: '0.75rem' 
                            }}
                          >
                            Delete Album
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 5: MESSAGES */}
          {activeTab === 'messages' && (
            <div className={styles.managerPanel}>
              <h3 className={styles.panelTitle}>Client Inquiry Inbox ({messages.length})</h3>
              
              {alertInfo.tab === 'messages' && (
                <div className={`status-message ${alertInfo.success ? styles.statusSuccess : styles.statusError}`} style={{ marginBottom: '25px', padding: '12px' }}>
                  {alertInfo.message}
                </div>
              )}

              {messages.length === 0 ? (
                <p style={{ color: 'var(--text-dim)' }}>Your communication inbox is completely empty.</p>
              ) : (
                <div className={styles.messagesList}>
                  {messages.map(msg => (
                    <div key={msg.id} className={`${styles.messageRow} ${!msg.read ? styles.messageRowUnread : ''}`}>
                      <div className={styles.messageHeader}>
                        <div className={styles.senderMeta}>
                          <span className={styles.senderName}>
                            {msg.name} {!msg.read && <span className={styles.unreadBadge}>UNREAD</span>}
                          </span>
                          <span className={styles.senderEmail}>{msg.email}</span>
                        </div>
                        <span className={styles.messageDate}>Received: {new Date(msg.createdAt).toLocaleString()}</span>
                      </div>

                      <div className={styles.messageSubject}>
                        Subject: {msg.subject}
                      </div>

                      <div className={styles.messageBodyText}>
                        {msg.message}
                      </div>

                      <div className={styles.messageActions}>
                        <button 
                          className="btn-outline" 
                          onClick={() => handleMarkMessageRead(msg.id, msg.read)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            borderColor: msg.read ? 'rgba(255,255,255,0.1)' : 'var(--accent-neon)',
                            color: msg.read ? 'var(--text-muted)' : 'var(--accent-neon)'
                          }}
                        >
                          {msg.read ? 'Mark Unread' : 'Mark Read'}
                        </button>
                        <button 
                          className="btn-outline" 
                          onClick={() => handleMessageDelete(msg.id)}
                          style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                        >
                          Delete Inbox log
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
