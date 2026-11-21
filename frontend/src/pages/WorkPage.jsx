import React from 'react';
import './WorkPage.css';
import TechTicker from '../components/TechTicker.jsx';

const fallbackProjects = [
  {
    category: 'erp',
    tag: 'FRAPPE / ERPNEXT CUSTOM APP',
    name: 'Interior Design Studio ERP',
    summary: 'End-to-end BOQ estimator, room-wise budget vs actual cost tracking, contractor measurement sheets, and 3D client approval portal.',
    tech_stack: 'Frappe · Python · Redis · MariaDB',
    metrics: '100+ Projects Tracked · 40% Faster Invoicing'
  },
  {
    category: 'webgl',
    tag: 'INTERACTIVE MOTION / CANVAS',
    name: 'Halftone Particle Engine',
    summary: 'High-DPI procedural renderer with particle physics, spring recovery, and real-time luminance sampling.',
    tech_stack: 'Three.js · GLSL · Canvas API · Web Audio',
    metrics: '60 FPS · 22,000 Particles'
  },
  {
    category: 'cloud',
    tag: 'CLOUD INFRASTRUCTURE / AWS',
    name: 'Multi-Tenant ERP Deployment',
    summary: 'Production deployment architecture with automated database snapshots, Redis tuning, and zero-downtime migrations.',
    tech_stack: 'Ubuntu · Nginx · AWS EC2 · Docker',
    metrics: '99.98% Uptime · Automated Failover'
  },
  {
    category: 'fintech',
    tag: 'FINTECH / AUTOMATION',
    name: 'Automated GST & E-Way Sync',
    summary: 'Webhook reconciliation connecting ERP sales invoices with e-invoicing APIs and automated ledger audits.',
    tech_stack: 'Python · FastAPI · Webhooks · Cryptography',
    metrics: '50,000+ Invoices · Audit-Ready'
  }
];

const filters = [
  { id: 'all', label: 'All work' },
  { id: 'erp', label: 'Frappe / ERPNext' },
  { id: 'webgl', label: 'WebGL & 3D' },
  { id: 'cloud', label: 'Cloud & DevOps' },
  { id: 'fintech', label: 'Fintech automation' }
];

const themes = [
  { name: 'MONO', accent: '#38bdf8' },
  { name: 'CYBER', accent: '#86efac' },
  { name: 'NEON', accent: '#a855f7' },
  { name: 'SOLAR', accent: '#fbbf24' }
];

function WorkCard({ project, index }) {
  return (
    <article className="work-card" style={{ '--card-order': index }}>
      <div className="work-card-topline">
        <span className="work-card-index">{String(index + 1).padStart(2, '0')}</span>
        <span className="work-card-category">{project.tag || 'SYSTEM ARCHITECTURE'}</span>
        <span className="work-card-mark" aria-hidden="true">↗</span>
      </div>
      <div className="work-card-body">
        <h2>{project.name}</h2>
        <p>{project.summary}</p>
      </div>
      <div className="work-card-footer">
        <p className="work-card-stack">{project.tech_stack}</p>
        {project.metrics && <p className="work-card-metric"><span aria-hidden="true">✓</span> {project.metrics}</p>}
      </div>
    </article>
  );
}

export default function WorkPage() {
  const [projects, setProjects] = React.useState(fallbackProjects);
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [source, setSource] = React.useState('sample');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [fxEnabled, setFxEnabled] = React.useState(true);
  const [themeIndex, setThemeIndex] = React.useState(() => {
    const saved = Number.parseInt(window.localStorage.getItem('studio-theme-index') || '0', 10);
    return Number.isInteger(saved) && saved >= 0 && saved < themes.length ? saved : 0;
  });

  React.useEffect(() => {
    document.title = 'SELECTED WORK — AV SOFTWARE';
  }, []);

  React.useEffect(() => {
    const accent = themes[themeIndex].accent;
    document.documentElement.style.setProperty('--accent-cyan', accent);
    document.documentElement.style.setProperty('--hero-outline-color', accent);
    document.querySelector('.work-page')?.style.setProperty('--work-cyan', accent);
  }, [themeIndex]);

  React.useEffect(() => {
    let active = true;
    fetch('/api/projects')
      .then((response) => {
        if (!response.ok) throw new Error('Project service unavailable');
        return response.json();
      })
      .then((data) => {
        if (!active || !Array.isArray(data?.projects)) return;
        setProjects(data.projects);
        setSource('live');
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const visibleProjects = React.useMemo(() => activeFilter === 'all'
    ? projects
    : projects.filter((project) => String(project.category || '').toLowerCase() === activeFilter), [activeFilter, projects]);
  const applyPhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const photoUrl = URL.createObjectURL(file);
    document.body.style.backgroundImage = `linear-gradient(rgba(7, 7, 9, .84), rgba(7, 7, 9, .84)), url("${photoUrl}")`;
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundSize = 'cover';
  };

  const changeTheme = () => {
    const next = (themeIndex + 1) % themes.length;
    setThemeIndex(next);
    window.localStorage.setItem('studio-theme-index', String(next));
  };

  return (
    <div className="work-page">
      <header className="work-header">
        <a className="work-brand" href="/" aria-label="AV Software home">AV <span>SOFTWARE</span></a>
        <div className="work-header-controls">
          <button className={`work-control${fxEnabled ? ' is-active' : ''}`} type="button" onClick={() => setFxEnabled((enabled) => !enabled)} aria-pressed={fxEnabled}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
            FX: {fxEnabled ? 'ON' : 'OFF'}
          </button>
          <button className="work-control" type="button" onClick={changeTheme}>THEME: {themes[themeIndex].name}</button>
          <label className="work-control work-upload" htmlFor="work-photo-upload">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            UPLOAD PHOTO
          </label>
          <input id="work-photo-upload" className="work-file-input" type="file" accept="image/*" onChange={applyPhoto} />
          <button className={`work-menu-toggle${menuOpen ? ' is-open' : ''}`} type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="work-page-navigation" onClick={() => setMenuOpen((open) => !open)}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="2" y="2" width="4.5" height="4.5" rx="1" /><rect x="9.5" y="2" width="4.5" height="4.5" rx="1" /><rect x="2" y="9.5" width="4.5" height="4.5" rx="1" /><rect x="9.5" y="9.5" width="4.5" height="4.5" rx="1" /></svg>
          </button>
        </div>
        <nav id="work-page-navigation" className={`work-navigation${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
          <a href="/">[1] HOME</a>
          <a className="is-current" href="/work" aria-current="page">[2] WORK</a>
          <a href="/blog">[3] BLOG</a>
          <a href="/contact">[4] CONTACT</a>
        </nav>
      </header>

      <main className="work-main">
        <div className="work-eyebrow"><span /> PORTFOLIO / SELECTED BUILDS</div>
        <section className="work-intro">
          <div>
            <h1>Selected <span>work.</span></h1>
            <p>Digital systems, ERP platforms, and interactive experiences built to solve real problems.</p>
          </div>
          <div className="work-total"><strong>{String(projects.length).padStart(2, '0')}</strong><span>PROJECTS<br />{source === 'live' ? 'LIVE CATALOGUE' : 'FEATURED BUILDS'}</span></div>
        </section>

        <section className="work-projects" aria-label="Projects">
          <div className="work-project-toolbar">
            <div className="work-filters" role="group" aria-label="Filter projects">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={activeFilter === filter.id ? 'is-active' : ''}
                  aria-pressed={activeFilter === filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <span className="work-result-count">{String(visibleProjects.length).padStart(2, '0')} SHOWN</span>
          </div>

          {visibleProjects.length > 0 ? (
            <div className="work-grid">
              {visibleProjects.map((project, index) => <WorkCard key={`${project.name}-${index}`} project={project} index={index} />)}
            </div>
          ) : (
            <div className="work-empty">No projects in this category yet.</div>
          )}
        </section>

        <footer className="work-footer">
          <span>HAVE A COMPLEX SYSTEM TO BUILD?</span>
          <a href="/contact">START A PROJECT <span aria-hidden="true">↗</span></a>
        </footer>
      </main>
      <TechTicker />
    </div>
  );
}
