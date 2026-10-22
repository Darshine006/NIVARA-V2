import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRegion } from '../context/RegionContext';
import { User, Mail, Lock, Phone, MapPin, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t, lang } = useLanguage();
  const { activeRegion } = useRegion();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    gender: 'Female',
    village: '',
    district: '',
    state: activeRegion?.name || 'Tamil Nadu',
    preferredLanguage: lang || 'en',
    emergencyContact: '',
    bloodGroup: 'Unknown',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setSubmitting(true);

    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        age: Number(formData.age),
        gender: formData.gender,
        village: formData.village,
        district: formData.district,
        state: formData.state,
        preferredLanguage: formData.preferredLanguage,
        emergencyContact: formData.emergencyContact || formData.phone,
        bloodGroup: formData.bloodGroup,
      });

      if (res.success) {
        navigate('/patient', { replace: true });
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to server. Please verify MongoDB Atlas connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem 5rem', maxWidth: '680px' }}>
      <div className="card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            {t('register_btn')}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Join NIVARA for community healthcare access, appointment scheduling, and personal records.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                className="form-input"
                placeholder="e.g. Ramesh Kumar"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label">{t('email_label')} *</label>
              <input
                type="email"
                name="email"
                required
                className="form-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-label">{t('phone_label')} *</label>
              <input
                type="tel"
                name="phone"
                required
                className="form-input"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* Emergency Contact */}
            <div className="form-group">
              <label className="form-label">{t('emergency_contact')} *</label>
              <input
                type="tel"
                name="emergencyContact"
                required
                className="form-input"
                placeholder="Family / emergency phone"
                value={formData.emergencyContact}
                onChange={handleChange}
              />
            </div>

            {/* Age */}
            <div className="form-group">
              <label className="form-label">{t('age_label')} *</label>
              <input
                type="number"
                name="age"
                required
                min="0"
                max="125"
                className="form-input"
                placeholder="e.g. 35"
                value={formData.age}
                onChange={handleChange}
              />
            </div>

            {/* Gender */}
            <div className="form-group">
              <label className="form-label">{t('gender_label')} *</label>
              <select
                name="gender"
                required
                className="form-select"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Village / Town */}
            <div className="form-group">
              <label className="form-label">{t('village_label')} *</label>
              <input
                type="text"
                name="village"
                required
                className="form-input"
                placeholder="e.g. Alanganallur"
                value={formData.village}
                onChange={handleChange}
              />
            </div>

            {/* District */}
            <div className="form-group">
              <label className="form-label">{t('district_label')} *</label>
              <input
                type="text"
                name="district"
                required
                className="form-input"
                placeholder="e.g. Madurai"
                value={formData.district}
                onChange={handleChange}
              />
            </div>

            {/* State / Region */}
            <div className="form-group">
              <label className="form-label">{t('state_label')} *</label>
              <input
                type="text"
                name="state"
                required
                className="form-input"
                placeholder="e.g. Tamil Nadu"
                value={formData.state}
                onChange={handleChange}
              />
            </div>

            {/* Preferred Language */}
            <div className="form-group">
              <label className="form-label">{t('preferred_lang')}</label>
              <select
                name="preferredLanguage"
                className="form-select"
                value={formData.preferredLanguage}
                onChange={handleChange}
              >
                <option value="en">English</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">{t('password_label')} (min 6 chars) *</label>
              <input
                type="password"
                name="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                required
                className="form-input"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={submitting}
          >
            <span>{submitting ? 'Registering...' : 'Complete Patient Registration'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div
          style={{
            marginTop: '2rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#64748b',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '1.25rem',
          }}
        >
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: 700 }}>
            {t('login_btn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
