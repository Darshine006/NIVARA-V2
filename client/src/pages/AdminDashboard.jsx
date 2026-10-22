import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRegion } from '../context/RegionContext';
import API from '../services/api';
import {
  Users,
  Stethoscope,
  Building2,
  Calendar,
  Layers,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  BookOpen,
  Wifi,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { regions, fetchRegions, activeRegion } = useRegion();

  const [stats, setStats] = useState(null);
  const [centers, setCenters] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active tab: 'overview' | 'workers' | 'centers' | 'regions' | 'articles' | 'sync'
  const [activeTab, setActiveTab] = useState('overview');

  // New Healthcare Center Modal / Form State
  const [showAddCenter, setShowAddCenter] = useState(false);
  const [newCenter, setNewCenter] = useState({
    name: '',
    village: '',
    district: '',
    state: activeRegion?.name || 'Tamil Nadu',
    contact: '',
    workingHours: '08:00 AM - 04:00 PM (Mon-Sat)',
    services: 'General Consultation, Maternal & Child Health, Vaccination, Basic Diagnostics',
  });

  // New Healthcare Worker Form State
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    region: activeRegion?.name || 'Tamil Nadu',
  });

  // New Region Form State
  const [showAddRegion, setShowAddRegion] = useState(false);
  const [newRegion, setNewRegion] = useState({
    name: '',
    defaultLanguage: 'ta',
    supportedLanguages: 'ta, en',
    services: 'General Consultation, Maternal & Child Health, Vaccination',
    districts: 'Madurai, Dindigul',
    description: '',
  });

  // New Health Article Form State
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: '',
    category: 'Maternal Health',
    content: '',
    symptoms: '',
    prevention: '',
    whenToSeekHelp: '',
    language: 'en',
    region: 'All',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Stats
      const statsRes = await API.get('/stats');
      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      }

      // 2. Centers
      const centersRes = await API.get('/centers');
      if (centersRes.data?.data) {
        setCenters(centersRes.data.data);
      }

      // 3. Workers
      const workersRes = await API.get('/admin/users?role=healthcare_worker');
      if (workersRes.data?.data) {
        setWorkers(workersRes.data.data);
      }

      // 4. Articles
      const articlesRes = await API.get('/articles');
      if (articlesRes.data?.data) {
        setArticles(articlesRes.data.data);
      }

      // 5. Sync Status
      const syncRes = await API.get('/admin/sync-status');
      if (syncRes.data) {
        setSyncStatus(syncRes.data);
      }
    } catch (err) {
      console.warn('Error loading admin statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Add Center
  const handleCreateCenter = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const payload = {
        ...newCenter,
        services: newCenter.services.split(',').map((s) => s.trim()),
      };

      const res = await API.post('/centers', payload);
      if (res.data?.success) {
        setMessage('Healthcare Center created successfully!');
        setShowAddCenter(false);
        setNewCenter({
          name: '',
          village: '',
          district: '',
          state: activeRegion?.name || 'Tamil Nadu',
          contact: '',
          workingHours: '08:00 AM - 04:00 PM (Mon-Sat)',
          services: 'General Consultation, Maternal & Child Health, Vaccination, Basic Diagnostics',
        });
        loadData();
      }
    } catch (err) {
      setError(err.message || 'Failed to create healthcare center.');
    }
  };

  // Handle Add Worker
  const handleCreateWorker = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await API.post('/admin/workers', newWorker);
      if (res.data?.success) {
        setMessage('Healthcare worker created successfully!');
        setShowAddWorker(false);
        setNewWorker({
          name: '',
          email: '',
          password: '',
          phone: '',
          region: activeRegion?.name || 'Tamil Nadu',
        });
        loadData();
      }
    } catch (err) {
      setError(err.message || 'Failed to create healthcare worker.');
    }
  };

  // Handle Add Region
  const handleCreateRegion = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const payload = {
        name: newRegion.name,
        defaultLanguage: newRegion.defaultLanguage,
        supportedLanguages: newRegion.supportedLanguages.split(',').map((l) => l.trim()),
        services: newRegion.services.split(',').map((s) => s.trim()),
        districts: newRegion.districts.split(',').map((d) => d.trim()),
        description: newRegion.description,
      };

      const res = await API.post('/regions', payload);
      if (res.data?.success) {
        setMessage('New regional deployment configuration added successfully!');
        setShowAddRegion(false);
        setNewRegion({
          name: '',
          defaultLanguage: 'ta',
          supportedLanguages: 'ta, en',
          services: 'General Consultation, Maternal & Child Health, Vaccination',
          districts: '',
          description: '',
        });
        fetchRegions();
        loadData();
      }
    } catch (err) {
      setError(err.message || 'Failed to create regional deployment.');
    }
  };

  // Handle Add Article
  const handleCreateArticle = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await API.post('/articles', newArticle);
      if (res.data?.success) {
        setMessage('Health educational article published successfully!');
        setShowAddArticle(false);
        setNewArticle({
          title: '',
          category: 'Maternal Health',
          content: '',
          symptoms: '',
          prevention: '',
          whenToSeekHelp: '',
          language: 'en',
          region: 'All',
        });
        loadData();
      }
    } catch (err) {
      setError(err.message || 'Failed to publish health article.');
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 5rem' }}>
      {/* Admin Header */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: '#ffffff',
          padding: '2rem',
          marginBottom: '2rem',
          border: 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#93c5fd', fontSize: '0.85rem', fontWeight: 700 }}>
              <ShieldCheck size={16} />
              <span>NIVARA Central Administration Console</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.25rem 0' }}>
              System Administrator Portal
            </h1>
            <p style={{ color: '#dbeafe', fontSize: '0.95rem' }}>
              Manage users, regional healthcare centers, clinical services, and synchronization pipelines.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="btn btn-secondary btn-sm"
            style={{ color: '#1e3a8a' }}
          >
            <RefreshCw size={15} />
            <span>Refresh Metrics</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 6 Key System Metric Cards */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Total Patients
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              {stats?.totalPatients ?? (loading ? '...' : 0)}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stethoscope size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Healthcare Workers
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              {stats?.totalHealthcareWorkers ?? (loading ? '...' : 0)}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Healthcare Centers
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              {stats?.totalHealthcareCenters ?? (loading ? '...' : 0)}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Appointments Today
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              {stats?.appointmentsToday ?? (loading ? '...' : 0)}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Offline Synced Records
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              {stats?.offlineSyncedRecords ?? (loading ? '...' : 0)}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Active Regions
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
              {stats?.activeRegions ?? regions.length}
            </div>
          </div>
        </div>
      </div>

      {/* Management Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', marginBottom: '1.75rem', overflowX: 'auto' }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'workers', label: 'Manage Healthcare Workers' },
          { key: 'centers', label: 'Manage Healthcare Centers' },
          { key: 'regions', label: 'Manage Regions & Services' },
          { key: 'articles', label: 'Manage Health Articles' },
          { key: 'sync', label: 'Synchronization Status' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid #2563eb' : '3px solid transparent',
              color: activeTab === tab.key ? '#2563eb' : '#64748b',
              fontWeight: activeTab === tab.key ? 700 : 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginBottom: '-2px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid-2">
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              System Configuration & Atlas Connection
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div>
                <strong>Application:</strong> NIVARA Rural Healthcare Platform v2.0
              </div>
              <div>
                <strong>Database Target:</strong> MongoDB Atlas Cluster (<code>mywebsitecluster.61me3dd.mongodb.net/nivara</code>)
              </div>
              <div>
                <strong>Active Deployment Region:</strong> {activeRegion?.name || 'Tamil Nadu'}
              </div>
              <div>
                <strong>Supported Languages:</strong> English, தமிழ் (Tamil), हिंदी (Hindi)
              </div>
              <div>
                <strong>PWA Status:</strong> Offline Service Worker Active with Local Queue
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              Quick Administrative Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('workers');
                  setShowAddWorker(true);
                }}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                <PlusCircle size={16} color="#2563eb" />
                <span>Register New Healthcare Worker / Doctor</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('centers');
                  setShowAddCenter(true);
                }}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                <PlusCircle size={16} color="#059669" />
                <span>Add Primary Healthcare Center (PHC)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('regions');
                  setShowAddRegion(true);
                }}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                <PlusCircle size={16} color="#7c3aed" />
                <span>Configure New Modular Region</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Healthcare Workers */}
      {activeTab === 'workers' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
              Healthcare Workers Directory
            </h3>
            <button
              type="button"
              onClick={() => setShowAddWorker(!showAddWorker)}
              className="btn btn-primary btn-sm"
            >
              <PlusCircle size={16} />
              <span>{showAddWorker ? 'Cancel' : 'Register New Worker'}</span>
            </button>
          </div>

          {showAddWorker && (
            <div className="card" style={{ marginBottom: '2rem', background: '#f8fafc' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                Register New Healthcare Personnel
              </h4>
              <form onSubmit={handleCreateWorker}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Dr. Priya Sundaram"
                      value={newWorker.name}
                      onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      required
                      className="form-input"
                      placeholder="priya.worker@nivara.in"
                      value={newWorker.email}
                      onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Temporary Password *</label>
                    <input
                      type="password"
                      required
                      className="form-input"
                      placeholder="Minimum 6 characters"
                      value={newWorker.password}
                      onChange={(e) => setNewWorker({ ...newWorker, password: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      className="form-input"
                      placeholder="10-digit mobile"
                      value={newWorker.phone}
                      onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assigned Region</label>
                    <select
                      className="form-select"
                      value={newWorker.region}
                      onChange={(e) => setNewWorker({ ...newWorker, region: e.target.value })}
                    >
                      {regions.map((r) => (
                        <option key={r.name} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                  <span>Provision Worker Account</span>
                </button>
              </form>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {workers.map((w) => (
              <div
                key={w._id}
                className="card"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem' }}
              >
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{w.name}</h4>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Email: {w.email} • Phone: {w.phone} • Region: {w.region}
                  </div>
                </div>
                <span className="badge badge-confirmed">Active Worker</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Manage Healthcare Centers */}
      {activeTab === 'centers' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
              Healthcare Centers Management
            </h3>
            <button
              type="button"
              onClick={() => setShowAddCenter(!showAddCenter)}
              className="btn btn-primary btn-sm"
            >
              <PlusCircle size={16} />
              <span>{showAddCenter ? 'Cancel' : 'Add New Center'}</span>
            </button>
          </div>

          {showAddCenter && (
            <div className="card" style={{ marginBottom: '2rem', background: '#f8fafc' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                Add New Primary Health Center
              </h4>
              <form onSubmit={handleCreateCenter}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Center Name *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Melur Community Health Center"
                      value={newCenter.name}
                      onChange={(e) => setNewCenter({ ...newCenter, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Village / Town *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Melur"
                      value={newCenter.village}
                      onChange={(e) => setNewCenter({ ...newCenter, village: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">District *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Madurai"
                      value={newCenter.district}
                      onChange={(e) => setNewCenter({ ...newCenter, district: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">State / Region *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={newCenter.state}
                      onChange={(e) => setNewCenter({ ...newCenter, state: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Phone *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="+91 452 2456781"
                      value={newCenter.contact}
                      onChange={(e) => setNewCenter({ ...newCenter, contact: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Working Hours</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newCenter.workingHours}
                      onChange={(e) => setNewCenter({ ...newCenter, workingHours: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Services (comma separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newCenter.services}
                    onChange={(e) => setNewCenter({ ...newCenter, services: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                  <span>Save Center</span>
                </button>
              </form>
            </div>
          )}

          <div className="grid-2">
            {centers.map((c) => (
              <div key={c._id} className="card">
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{c.name}</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {c.village}, {c.district} ({c.state})
                </p>
                <div style={{ margin: '0.5rem 0', fontSize: '0.85rem', color: '#475569' }}>
                  <strong>Contact:</strong> {c.contact} • <strong>Hours:</strong> {c.workingHours}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                  {c.services.map((s) => (
                    <span key={s} style={{ background: '#eff6ff', color: '#2563eb', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Manage Regions */}
      {activeTab === 'regions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
              Modular Regional Architecture
            </h3>
            <button
              type="button"
              onClick={() => setShowAddRegion(!showAddRegion)}
              className="btn btn-primary btn-sm"
            >
              <PlusCircle size={16} />
              <span>{showAddRegion ? 'Cancel' : 'Add Regional Deployment'}</span>
            </button>
          </div>

          {showAddRegion && (
            <div className="card" style={{ marginBottom: '2rem', background: '#f8fafc' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                Add New Regional Deployment
              </h4>
              <form onSubmit={handleCreateRegion}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Region Name *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. Andhra Pradesh"
                      value={newRegion.name}
                      onChange={(e) => setNewRegion({ ...newRegion, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Default Language Code *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="e.g. te (or en, hi, ta)"
                      value={newRegion.defaultLanguage}
                      onChange={(e) => setNewRegion({ ...newRegion, defaultLanguage: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Supported Languages (comma separated)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="te, en"
                      value={newRegion.supportedLanguages}
                      onChange={(e) => setNewRegion({ ...newRegion, supportedLanguages: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Districts (comma separated)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Guntur, Krishna, Chittoor"
                      value={newRegion.districts}
                      onChange={(e) => setNewRegion({ ...newRegion, districts: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Regional Services (comma separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newRegion.services}
                    onChange={(e) => setNewRegion({ ...newRegion, services: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Mission Details</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Deployment characteristics and primary clinical focus"
                    value={newRegion.description}
                    onChange={(e) => setNewRegion({ ...newRegion, description: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  <span>Deploy Region</span>
                </button>
              </form>
            </div>
          )}

          <div className="grid-3">
            {regions.map((reg) => (
              <div key={reg.name} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>{reg.name}</h4>
                  <span className="badge badge-confirmed">Active</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', margin: '0.5rem 0' }}>
                  Default Lang: <strong>{reg.defaultLanguage}</strong> • Supported: {reg.supportedLanguages?.join(', ')}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  <strong>Services:</strong> {reg.services?.slice(0, 4).join(', ')}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Manage Health Articles */}
      {activeTab === 'articles' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
              Health Educational Articles ({articles.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowAddArticle(!showAddArticle)}
              className="btn btn-primary btn-sm"
            >
              <PlusCircle size={16} />
              <span>{showAddArticle ? 'Cancel' : 'Publish Article'}</span>
            </button>
          </div>

          {showAddArticle && (
            <div className="card" style={{ marginBottom: '2rem', background: '#f8fafc' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                Publish Health Educational Guide
              </h4>
              <form onSubmit={handleCreateArticle}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Article Title *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={newArticle.title}
                      onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      value={newArticle.category}
                      onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                    >
                      {[
                        'Maternal Health',
                        'Child Health',
                        'Nutrition',
                        'Hygiene',
                        'Diabetes',
                        'Blood Pressure',
                        'Vaccination',
                        'Common Diseases',
                      ].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Language</label>
                    <select
                      className="form-select"
                      value={newArticle.language}
                      onChange={(e) => setNewArticle({ ...newArticle, language: e.target.value })}
                    >
                      <option value="en">English</option>
                      <option value="ta">Tamil</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Region</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newArticle.region}
                      onChange={(e) => setNewArticle({ ...newArticle, region: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Educational Content *</label>
                  <textarea
                    required
                    rows="3"
                    className="form-textarea"
                    value={newArticle.content}
                    onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Symptoms (optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newArticle.symptoms}
                      onChange={(e) => setNewArticle({ ...newArticle, symptoms: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Prevention Tips (optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newArticle.prevention}
                      onChange={(e) => setNewArticle({ ...newArticle, prevention: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary">
                  <span>Publish Article</span>
                </button>
              </form>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {articles.map((art) => (
              <div key={art._id} className="card" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{art.title}</h4>
                  <span className="badge badge-confirmed">{art.category}</span>
                </div>
                <p style={{ color: '#475569', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {art.content.slice(0, 140)}...
                </p>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
                  Language: {art.language} • Region: {art.region}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Synchronization Status */}
      {activeTab === 'sync' && (
        <div className="card">
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            Offline Synchronization Registry Status
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            Health workers operating in remote villages store consultations in their device’s offline queue. When network connectivity is established, records are pushed to the central registry.
          </p>

          <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              Total Synced Offline Records: {syncStatus?.totalOfflineRecords ?? 0}
            </div>
          </div>

          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Recent Synchronized Consultations
          </h4>

          {syncStatus?.recentSyncs && syncStatus.recentSyncs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {syncStatus.recentSyncs.map((s) => (
                <div
                  key={s._id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      Patient: {s.patientId?.name || 'Field Patient'}
                    </span>
                    <span className="badge badge-completed">Synced</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.2rem' }}>
                    Diagnosis: {s.diagnosis} • Worker: {s.healthcareWorkerId?.name}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b' }}>
              No offline synchronization activity logged yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
