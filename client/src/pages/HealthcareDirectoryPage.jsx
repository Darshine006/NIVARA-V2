import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRegion } from '../context/RegionContext';
import API from '../services/api';
import { offlineStorage } from '../services/offlineStorage';
import {
  MapPin,
  Search,
  Phone,
  Clock,
  Building2,
  Stethoscope,
  Filter,
} from 'lucide-react';

export default function HealthcareDirectoryPage() {
  const { t } = useLanguage();
  const { activeRegion } = useRegion();

  const [centers, setCenters] = useState([]);
  const [selectedState, setSelectedState] = useState(activeRegion?.name || 'All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedService, setSelectedService] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Derive districts and services from current active region
  const availableDistricts = ['All', ...(activeRegion?.districts || [])];
  const availableServices = ['All', ...(activeRegion?.services || [])];

  useEffect(() => {
    const fetchCenters = async () => {
      setLoading(true);
      try {
        let url = `/centers?state=${encodeURIComponent(selectedState)}`;
        if (selectedDistrict !== 'All') {
          url += `&district=${encodeURIComponent(selectedDistrict)}`;
        }
        if (selectedService !== 'All') {
          url += `&service=${encodeURIComponent(selectedService)}`;
        }
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }

        const res = await API.get(url);
        if (res.data?.data) {
          setCenters(res.data.data);
          offlineStorage.cacheCenters(res.data.data);
        }
      } catch (err) {
        console.log('[Directory] Reading centers from offline cache...');
        let cached = offlineStorage.getCachedCenters();
        if (selectedState !== 'All') {
          cached = cached.filter((c) => c.state.toLowerCase() === selectedState.toLowerCase());
        }
        if (selectedDistrict !== 'All') {
          cached = cached.filter((c) => c.district.toLowerCase() === selectedDistrict.toLowerCase());
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          cached = cached.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.village.toLowerCase().includes(q) ||
              c.district.toLowerCase().includes(q)
          );
        }
        setCenters(cached);
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, [selectedState, selectedDistrict, selectedService, searchQuery]);

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 4rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#eff6ff',
            color: '#2563eb',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
          }}
        >
          <MapPin size={24} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
          {t('center_directory_title')}
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.35rem' }}>
          Locate Primary Health Centers (PHCs) and Community Health Centers (CHCs) in your taluk.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div className="grid-4" style={{ gap: '1rem' }}>
          {/* Search Query */}
          <div>
            <label className="form-label">Search Center / Village</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Alanganallur"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.3rem' }}
              />
              <Search
                size={16}
                color="#94a3b8"
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* Filter State */}
          <div>
            <label className="form-label">{t('filter_state')}</label>
            <select
              className="form-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="All">All States / Regions</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Karnataka">Karnataka</option>
            </select>
          </div>

          {/* Filter District */}
          <div>
            <label className="form-label">{t('filter_district')}</label>
            <select
              className="form-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Service */}
          <div>
            <label className="form-label">{t('filter_service')}</label>
            <select
              className="form-select"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
            >
              {availableServices.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Centers Directory Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          Locating health centers...
        </div>
      ) : centers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
          <MapPin size={40} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            No healthcare centers found
          </h3>
          <p style={{ fontSize: '0.9rem' }}>
            Try expanding your district or service search filters.
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {centers.map((center) => (
            <div key={center._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                  <span className="badge badge-confirmed">
                    {center.state}
                  </span>
                  <span className="badge badge-outline">
                    {center.district} District
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                  {center.name}
                </h3>
                <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                  Locality: <strong>{center.village}</strong>
                </p>
              </div>

              {/* Working Hours & Contact */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={15} color="#2563eb" />
                  <span>{t('working_hours')}: {center.workingHours}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Phone size={15} color="#16a34a" />
                  <span>{t('contact_number')}: <strong>{center.contact}</strong></span>
                </div>
              </div>

              {/* Services Badges */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Available Services
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {center.services.map((srv) => (
                    <span
                      key={srv}
                      style={{
                        background: '#f1f5f9',
                        color: '#334155',
                        borderRadius: '6px',
                        padding: '0.2rem 0.55rem',
                        fontSize: '0.8rem',
                      }}
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Associated Healthcare Workers */}
              {center.healthcareWorkers && center.healthcareWorkers.length > 0 && (
                <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9', fontSize: '0.85rem', color: '#64748b' }}>
                  <strong>Duty Personnel:</strong> {center.healthcareWorkers.map((w) => w.name).join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
