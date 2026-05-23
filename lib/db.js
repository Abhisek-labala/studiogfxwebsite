import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure the data directory exists
function initDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Helpers for read/write
function readJSON(filename, defaultData = []) {
  initDir();
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    writeJSON(filename, defaultData);
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading database file ${filename}:`, err);
    return defaultData;
  }
}

function writeJSON(filename, data) {
  initDir();
  const filePath = path.join(DATA_DIR, filename);
  const tempPath = `${filePath}.tmp`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (err) {
    console.error(`Error writing database file ${filename}:`, err);
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch (_) {}
    }
    return false;
  }
}

// Default config
const DEFAULT_CONFIG = {
  siteName: "STUDIO GFX WEDDINGS",
  tagline: "Fine-Art Editorial Wedding Photography for the Bold & Romantic",
  themeColor: "#76ff03",
  secondaryColor: "#ffffff",
  email: "weddings@studiogfx.com",
  phone: "+1 (555) 019-2834",
  location: "New York / Tokyo",
  aboutText: "We document love stories that defy the traditional rules. Combining high-fashion editorial aesthetics with dark, moody lighting and vibrant neon play, our mission is to capture the real, raw, and untamed emotions of your vows. From rain-slicked city streets in Tokyo to brutalist concrete chapels, we frame your legacy like a movie still. We specialize in non-traditional weddings for couples who want their love documented as fine art.",
  aboutQuote: "Capturing the electric, raw, and untamed romance of your forever.",
  socialLinks: {
    instagram: "https://instagram.com/studiogfx.weddings",
    twitter: "https://twitter.com/studiogfx",
    facebook: "https://facebook.com/studiogfx",
    youtube: "https://youtube.com/studiogfx"
  },
  heroImage: "/uploads/hero_default.png",
  logoImage: "",
  aboutName: "Aria Vance",
  aboutRole: "Lead Creative Director & Visionary",
  aboutProfileImage: "/uploads/about_profile.png",
  aboutBio2: "Aria Vance has spent over a decade documenting celebrations across New York, Tokyo, Milan, and beyond. Her work is recognized for its uncompromising visual drama—blending raw, unposed photojournalistic storytelling with luxurious, high-fashion editorial styling. By working closely with each couple, she captures not just the events, but the unique energetic pulse and silent connections of their celebration.",
  aboutManifesto: "We believe that your love is an avant-garde masterpiece. We reject traditional wedding photography checklists, forced static posing, and over-processed filters. Our approach is deeply immersive, observing the quiet heartbeats, the electric glances, and the wild, untamed dancefloor memories. We treat every celebration as a cinematic feature film, ensuring your memories are preserved as fine art.",
  aboutGear1: "Medium Format System: Hasselblad X2D 100C / Hasselblad XCD prime lenses",
  aboutGear2: "Candid Camera System: Leica M11 Monochrom / Summilux 35mm f/1.4",
  aboutGear3: "Secondary System: Sony Alpha 7R V / Sony 50mm f/1.2 GM prime",
  aboutGear4: "Lighting Artistry: Profoto B10X AirTTL / Custom neon atmospheric continuous grids",
  aboutYears: "12+"
};

// Default admin config (password is hashed: studiogfxadmin)
// Salted bcrypt hash for "studiogfxadmin"
const DEFAULT_ADMIN = {
  username: "admin",
  passwordHash: "$2b$10$J/6sJCDKP0FtpRr2dpVXNeQ6csCJppMBPUuRrmlRwqP7ql/fTa/CG"
};

import { createClient } from '@vercel/kv';

// Initialize a client dynamically that supports both Vercel KV and Upstash Redis integrations!
const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const kvClient = (kvUrl && kvToken) ? createClient({ url: kvUrl, token: kvToken }) : null;

export const db = {
  // Helper to read data (local file or Vercel KV / Upstash Redis)
  async read(key, defaultData) {
    if (kvClient) {
      try {
        const val = await kvClient.get(key);
        return val !== null ? val : defaultData;
      } catch (err) {
        console.error(`KV read error for key ${key}:`, err);
        return defaultData;
      }
    }
    return readJSON(`${key}.json`, defaultData);
  },

  // Helper to write data (local file or Vercel KV / Upstash Redis)
  async write(key, data) {
    if (kvClient) {
      try {
        await kvClient.set(key, data);
        return true;
      } catch (err) {
        console.error(`KV write error for key ${key}:`, err);
        return false;
      }
    }
    return writeJSON(`${key}.json`, data);
  },

  // Config Operations
  async getConfig() {
    return this.read('config', DEFAULT_CONFIG);
  },
  async updateConfig(newConfig) {
    const current = await this.getConfig();
    const updated = { ...current, ...newConfig };
    await this.write('config', updated);
    return updated;
  },

  // Admin Credentials Operations
  async getAdmin() {
    return this.read('admin', DEFAULT_ADMIN);
  },
  async updateAdmin(username, passwordHash) {
    const data = { username, passwordHash };
    await this.write('admin', data);
    return data;
  },

  // Gallery CRUD Operations
  async getGallery() {
    return this.read('gallery', []);
  },
  async addGalleryItem(item) {
    const gallery = await this.getGallery();
    const newItem = {
      id: `gal_${Date.now()}`,
      title: item.title || "Untitled",
      category: item.category || "General",
      imageUrl: item.imageUrl,
      description: item.description || "",
      createdAt: new Date().toISOString()
    };
    gallery.unshift(newItem);
    await this.write('gallery', gallery);
    return newItem;
  },
  async deleteGalleryItem(id) {
    const gallery = await this.getGallery();
    const filtered = gallery.filter(item => item.id !== id);
    const deletedItem = gallery.find(item => item.id === id);
    await this.write('gallery', filtered);
    return deletedItem;
  },

  // Portfolio CRUD Operations
  async getPortfolio() {
    return this.read('portfolio', []);
  },
  async addPortfolioProject(project) {
    const portfolio = await this.getPortfolio();
    const newProject = {
      id: `port_${Date.now()}`,
      title: project.title || "New Project",
      category: project.category || "Creative",
      description: project.description || "",
      client: project.client || "Self",
      date: project.date || new Date().toISOString().substring(0, 7),
      coverImageUrl: project.coverImageUrl || "/uploads/hero_default.jpg",
      images: project.images || []
    };
    portfolio.unshift(newProject);
    await this.write('portfolio', portfolio);
    return newProject;
  },
  async updatePortfolioProject(id, updatedFields) {
    const portfolio = await this.getPortfolio();
    const index = portfolio.findIndex(p => p.id === id);
    if (index === -1) return null;

    portfolio[index] = { ...portfolio[index], ...updatedFields };
    await this.write('portfolio', portfolio);
    return portfolio[index];
  },
  async deletePortfolioProject(id) {
    const portfolio = await this.getPortfolio();
    const filtered = portfolio.filter(p => p.id !== id);
    const deletedProject = portfolio.find(p => p.id === id);
    await this.write('portfolio', filtered);
    return deletedProject;
  },

  // Messages CRUD Operations
  async getMessages() {
    return this.read('messages', []);
  },
  async addMessage(msg) {
    const messages = await this.getMessages();
    const newMsg = {
      id: `msg_${Date.now()}`,
      name: msg.name,
      email: msg.email,
      subject: msg.subject || "Photography Inquiry",
      message: msg.message,
      read: false,
      createdAt: new Date().toISOString()
    };
    messages.unshift(newMsg);
    await this.write('messages', messages);
    return newMsg;
  },
  async markMessageRead(id, isRead = true) {
    const messages = await this.getMessages();
    const index = messages.findIndex(m => m.id === id);
    if (index === -1) return null;
    messages[index].read = isRead;
    await this.write('messages', messages);
    return messages[index];
  },
  async deleteMessage(id) {
    const messages = await this.getMessages();
    const filtered = messages.filter(m => m.id !== id);
    const deleted = messages.find(m => m.id === id);
    await this.write('messages', filtered);
    return deleted;
  }
};
