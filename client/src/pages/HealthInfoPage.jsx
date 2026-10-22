import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRegion } from '../context/RegionContext';
import API from '../services/api';
import { offlineStorage } from '../services/offlineStorage';
import {
  BookOpen,
  Search,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Tag,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Maternal Health',
  'Child Health',
  'Nutrition',
  'Hygiene',
  'Diabetes',
  'Blood Pressure',
  'Vaccination',
  'Common Diseases',
];

export default function HealthInfoPage() {
  const { t, lang } = useLanguage();
  const { activeRegion } = useRegion();

  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        let url = `/articles?language=${lang}`;
        if (selectedCategory !== 'All') {
          url += `&category=${encodeURIComponent(selectedCategory)}`;
        }
        if (searchQuery) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }

        const res = await API.get(url);
        if (res.data?.data) {
          setArticles(res.data.data);
          offlineStorage.cacheArticles(res.data.data);
        }
      } catch (err) {
        console.log('[HealthInfoPage] Reading articles from offline cache...');
        let cached = offlineStorage.getCachedArticles();
        if (selectedCategory !== 'All') {
          cached = cached.filter((a) => a.category === selectedCategory);
        }
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          cached = cached.filter(
            (a) =>
              a.title.toLowerCase().includes(q) ||
              a.content.toLowerCase().includes(q) ||
              a.symptoms.toLowerCase().includes(q)
          );
        }
        setArticles(cached);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [lang, selectedCategory, searchQuery]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 4rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 2.5rem' }}>
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
          <BookOpen size={24} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
          {t('health_info_title')}
        </h1>
        <p style={{ color: '#475569', fontSize: '1rem', marginTop: '0.4rem' }}>
          Verified public health education in your regional language.
        </p>

        {/* Clinical Disclaimer Banner */}
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            color: '#92400e',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            fontSize: '0.875rem',
            marginTop: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textAlign: 'left',
          }}
        >
          <ShieldCheck size={20} color="#d97706" style={{ flexShrink: 0 }} />
          <span>{t('health_disclaimer')}</span>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder={t('search_articles')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search
              size={18}
              color="#94a3b8"
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className="btn btn-sm"
              style={{
                background: selectedCategory === cat ? '#2563eb' : '#ffffff',
                color: selectedCategory === cat ? '#ffffff' : '#334155',
                border: selectedCategory === cat ? 'none' : '1px solid #cbd5e1',
                borderRadius: '9999px',
                whiteSpace: 'nowrap',
                fontWeight: selectedCategory === cat ? 700 : 500,
              }}
            >
              {cat === 'All' ? t('category_all') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          Loading educational guides...
        </div>
      ) : articles.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          <BookOpen size={40} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
          <p>No health guides match your current search and language selection.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {articles.map((art) => {
            const isExpanded = expandedId === art._id;
            return (
              <div key={art._id} className="card" style={{ padding: '1.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleExpand(art._id)}
                >
                  <div style={{ paddingRight: '1rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                      <span className="badge badge-confirmed" style={{ fontSize: '0.75rem' }}>
                        {art.category}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                      {art.title}
                    </h3>
                    <p style={{ color: '#475569', fontSize: '0.95rem', marginTop: '0.35rem', lineHeight: 1.5 }}>
                      {isExpanded ? art.content : `${art.content.slice(0, 160)}...`}
                    </p>
                  </div>

                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                  >
                    {isExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                  </button>
                </div>

                {/* Expanded Details: Symptoms, Prevention, When to Seek Help */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: '1.25rem',
                      paddingTop: '1.25rem',
                      borderTop: '1px solid #f1f5f9',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.9rem',
                    }}
                  >
                    {art.symptoms && (
                      <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                          Recognizable Symptoms
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: '#0f172a', marginTop: '0.2rem' }}>
                          {art.symptoms}
                        </p>
                      </div>
                    )}

                    {art.prevention && (
                      <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                          {t('prevention_tips')}
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: '#0f172a', marginTop: '0.2rem' }}>
                          {art.prevention}
                        </p>
                      </div>
                    )}

                    {art.whenToSeekHelp && (
                      <div
                        style={{
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '8px',
                          padding: '0.75rem 1rem',
                        }}
                      >
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <AlertTriangle size={15} />
                          {t('when_to_seek_help')}
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: '#991b1b', marginTop: '0.2rem' }}>
                          {art.whenToSeekHelp}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
