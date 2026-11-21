import React from 'react';
import './TechTicker.css';

function TickerSegment() {
  return (
    <div className="site-ticker-segment" aria-hidden="true">
      <span>AVAILABILITY</span>
      <span className="site-ticker-badge">OPEN</span>
      <span>·</span>
      <span>RENDERING</span>
      <strong>WEBGL / THREE.JS</strong>
      <span>·</span>
      <span>CORE_TECH</span>
      <strong>FRAPPE / ERPNEXT</strong>
      <span>·</span>
      <span>BACKEND</span>
      <strong>NODE.JS / SQLITE</strong>
      <span>·</span>
    </div>
  );
}

export default function TechTicker() {
  return (
    <footer className="site-ticker" aria-label="Studio capabilities">
      <div className="site-ticker-track" aria-hidden="true">
        <TickerSegment />
        <TickerSegment />
      </div>
      <span className="site-ticker-accessible">
        Availability open. Rendering WebGL and Three.js. Core technology Frappe and ERPNext. Backend Node.js and SQLite.
      </span>
    </footer>
  );
}
