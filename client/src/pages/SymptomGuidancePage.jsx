import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  Calendar,
  ArrowRight,
  Info,
} from 'lucide-react';

const SYMPTOMS_LIST = [
  { id: 'breathing', key: 'symptom_breathing', emergency: true },
  { id: 'fever', key: 'symptom_fever', emergency: false },
  { id: 'cough', key: 'symptom_cough', emergency: false },
  { id: 'headache', key: 'symptom_headache', emergency: false },
  { id: 'stomach', key: 'symptom_stomach', emergency: false },
  { id: 'vomiting', key: 'symptom_vomiting', emergency: false },
  { id: 'diarrhea', key: 'symptom_diarrhea', emergency: false },
];

export default function SymptomGuidancePage() {
  const { t } = useLanguage();

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [duration, setDuration] = useState('less_2_days');
  const [evaluation, setEvaluation] = useState(null);

  const toggleSymptom = (id) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
    setEvaluation(null);
  };

  const evaluateSymptoms = (e) => {
    e.preventDefault();
    if (selectedSymptoms.length === 0) {
      return;
    }

    // Safety-Conscious Rule Engine:
    // 1. Emergency Trigger: Difficulty breathing or multiple severe combination
    const hasBreathingDifficulty = selectedSymptoms.includes('breathing');
    const isProlonged = duration === 'more_5_days';
    const isMultiple = selectedSymptoms.length >= 3;

    if (hasBreathingDifficulty) {
      setEvaluation({
        level: 'emergency',
        title: 'URGENT: Emergency Medical Attention Required',
        message:
          'Difficulty breathing is a critical warning sign that requires immediate, in-person clinical assessment. Do not delay.',
        action:
          'Immediately visit the nearest Community Health Center, Emergency Room, or dial emergency medical transport (108).',
        isEmergency: true,
      });
    } else if (isProlonged || (isMultiple && (selectedSymptoms.includes('vomiting') || selectedSymptoms.includes('diarrhea')))) {
      setEvaluation({
        level: 'moderate',
        title: 'Priority Health Center Visit Advised',
        message:
          'Your selected symptoms or their duration indicate a need for professional clinical examination and possible lab diagnostics to avoid dehydration or complications.',
        action:
          'Book an appointment or visit your nearest Primary Health Center within the next 24 hours. Ensure hydration with clean boiled water or ORS.',
        isEmergency: false,
      });
    } else {
      setEvaluation({
        level: 'mild',
        title: 'Home Care & Symptom Monitoring',
        message:
          'Your reported symptoms appear mild. Rest adequately, maintain good fluid intake, and practice good hygiene.',
        action:
          'Monitor your body temperature and symptoms closely. If fever rises above 102°F or symptoms persist beyond 48 hours, consult a healthcare worker.',
        isEmergency: false,
      });
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1rem 4rem', maxWidth: '780px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
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
          <ShieldAlert size={24} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
          {t('symptom_tool_title')}
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.35rem' }}>
          Safety-conscious assessment to help you decide when to seek professional care.
        </p>

        {/* Mandatory Clinical Disclaimer */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '0.85rem 1.25rem',
            marginTop: '1.25rem',
            fontSize: '0.875rem',
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textAlign: 'left',
          }}
        >
          <Info size={18} color="#2563eb" style={{ flexShrink: 0 }} />
          <span>{t('symptom_disclaimer')}</span>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <form onSubmit={evaluateSymptoms}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
            {t('select_symptoms')}
          </h3>

          {/* Symptom Checkbox Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
            {SYMPTOMS_LIST.map((sym) => {
              const isChecked = selectedSymptoms.includes(sym.id);
              return (
                <label
                  key={sym.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '10px',
                    border: isChecked
                      ? sym.emergency
                        ? '2px solid #ef4444'
                        : '2px solid #2563eb'
                      : '1px solid #cbd5e1',
                    background: isChecked
                      ? sym.emergency
                        ? '#fef2f2'
                        : '#eff6ff'
                      : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSymptom(sym.id)}
                      style={{ width: '18px', height: '18px', accentColor: sym.emergency ? '#ef4444' : '#2563eb' }}
                    />
                    <span style={{ fontSize: '0.95rem', fontWeight: isChecked ? 700 : 500, color: '#0f172a' }}>
                      {t(sym.key)}
                    </span>
                  </div>

                  {sym.emergency && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#b91c1c',
                        background: '#fee2e2',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                      }}
                    >
                      Emergency Warning Sign
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {/* Duration Selector */}
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">How long have you had these symptoms?</label>
            <select
              className="form-select"
              value={duration}
              onChange={(e) => {
                setDuration(e.target.value);
                setEvaluation(null);
              }}
            >
              <option value="less_2_days">Less than 2 days (Recent onset)</option>
              <option value="2_to_5_days">2 to 5 days</option>
              <option value="more_5_days">More than 5 days (Prolonged symptoms)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            disabled={selectedSymptoms.length === 0}
          >
            <span>{t('get_guidance')}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Guidance Result Card */}
        {evaluation && (
          <div
            style={{
              marginTop: '2rem',
              padding: '1.75rem',
              borderRadius: '12px',
              border:
                evaluation.level === 'emergency'
                  ? '2px solid #ef4444'
                  : evaluation.level === 'moderate'
                  ? '2px solid #f59e0b'
                  : '2px solid #10b981',
              background:
                evaluation.level === 'emergency'
                  ? '#fef2f2'
                  : evaluation.level === 'moderate'
                  ? '#fffbeb'
                  : '#ecfdf5',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              {evaluation.level === 'emergency' && <AlertTriangle size={26} color="#dc2626" />}
              {evaluation.level === 'moderate' && <AlertCircle size={26} color="#d97706" />}
              {evaluation.level === 'mild' && <CheckCircle2 size={26} color="#059669" />}

              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color:
                    evaluation.level === 'emergency'
                      ? '#991b1b'
                      : evaluation.level === 'moderate'
                      ? '#92400e'
                      : '#065f46',
                }}
              >
                {evaluation.title}
              </h3>
            </div>

            <p style={{ color: '#1e293b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              {evaluation.message}
            </p>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Recommended Action
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                {evaluation.action}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/book-appointment" className="btn btn-primary btn-sm">
                <Calendar size={15} />
                <span>Book Primary Health Center Visit</span>
              </Link>
              <Link to="/centers" className="btn btn-secondary btn-sm">
                <span>Find Nearby Clinic</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
