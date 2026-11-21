import React from 'react';
import { createElement } from 'react';
import pageMeta from './page-meta.js';
import homeScript from './home-scripts.js';
import blogScript from './blog-scripts.js';
import contactScript from './contact-scripts.js';
import TechTicker from '../components/TechTicker.jsx';

const scripts = { home: homeScript, blog: blogScript, contact: contactScript };

function renderNode(node, key, page) {
  if (typeof node === 'string') return node;
  if (page === 'home' && node.tag === 'h1' && node.props?.className === 'hero-title') {
    return <StopwatchHeroTitle key={key} node={node} page={page} />;
  }
  const props = { ...node.props, key };
  for (const [name, source] of Object.entries(node.events || {})) {
    props[name] = (event) => {
      const nativeEvent = event.nativeEvent || event;
      const result = new Function('event', source).call(event.currentTarget, nativeEvent);
      if (result === false) event.preventDefault();
    };
  }
  const children = (node.children || []).map((child, index) => renderNode(child, `${key}.${index}`, page));
  return children.length ? createElement(node.tag, props, ...children) : createElement(node.tag, props);
}

function StopwatchHeroTitle({ node, page }) {
  const [phase, setPhase] = React.useState('idle');
  const [elapsed, setElapsed] = React.useState(0);
  const interval = React.useRef(null);
  const hideTimer = React.useRef(null);

  const startStopwatch = () => {
    window.clearInterval(interval.current);
    window.clearTimeout(hideTimer.current);
    const startedAt = window.performance.now();
    const duration = 1800;
    setElapsed(0);
    setPhase('running');
    interval.current = window.setInterval(() => {
      const nextElapsed = Math.min(window.performance.now() - startedAt, duration);
      setElapsed(nextElapsed);
      if (nextElapsed >= duration) {
        window.clearInterval(interval.current);
        interval.current = null;
        setPhase('stopped');
        hideTimer.current = window.setTimeout(() => setPhase('idle'), 650);
      }
    }, 40);
  };

  React.useEffect(() => () => {
    window.clearInterval(interval.current);
    window.clearTimeout(hideTimer.current);
  }, []);

  const totalCentiseconds = Math.floor(elapsed / 10);
  const seconds = String(Math.floor(totalCentiseconds / 100)).padStart(2, '0');
  const centiseconds = String(totalCentiseconds % 100).padStart(2, '0');
  const children = (node.children || []).map((child, index) => {
    const rendered = renderNode(child, `hero-${index}`, page);
    if (child && typeof child === 'object' && ['outline-word', 'solid-word'].includes(child.props?.className)) {
      return React.cloneElement(rendered, { onPointerEnter: startStopwatch });
    }
    return rendered;
  });

  return createElement('h1', {
    ...node.props,
    'aria-label': 'Immersive Interfaces',
    className: `${node.props.className}${phase !== 'idle' ? ` is-timing is-${phase}` : ''}`,
    onFocus: startStopwatch,
    tabIndex: 0
  }, ...children,
  createElement('span', { className: 'hero-stopwatch', 'aria-hidden': true }, `00:${seconds}.${centiseconds}`));
}

function requestWithAdminKey(input, init, nativeFetch) {
  const url = typeof input === 'string' ? input : input?.url || '';
  const method = String(init.method || (typeof input === 'object' && input?.method) || 'GET').toUpperCase();
  const path = new URL(url, window.location.href).pathname;
  const protectedRoute = (path === '/api/contact' && method !== 'POST')
    || path.startsWith('/api/contact/')
    || path === '/api/upload' && method !== 'GET'
    || ['/api/projects', '/api/blogs', '/api/stats'].includes(path) && !['GET', 'HEAD'].includes(method);
  if (!protectedRoute) return nativeFetch(input, init);

  let key = sessionStorage.getItem('studio-admin-key');
  if (!key) {
    key = window.prompt('Enter the ADMIN_API_KEY configured by the site owner:');
    if (!key) return Promise.resolve(new Response(JSON.stringify({ success: false, error: 'Admin key required.' }), { status: 401, headers: { 'Content-Type': 'application/json' } }));
    sessionStorage.setItem('studio-admin-key', key);
  }
  const headers = new Headers(init.headers || (typeof input === 'object' ? input.headers : undefined));
  headers.set('X-Admin-Key', key);
  return nativeFetch(input, { ...init, headers });
}

export default function PageRuntime({ page, tree }) {
  React.useEffect(() => {
    const meta = pageMeta[page];
    document.title = meta.title;
    const isLoadingRoute = document.querySelector('.route-loader') !== null;
    document.body.className = `${meta.bodyClass} page-${page}${isLoadingRoute ? ' route-loading' : ''}`.trim();

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = `/styles/${page}.css`;
    document.head.appendChild(stylesheet);

    const nativeFetch = window.fetch.bind(window);
    window.fetch = (input, init = {}) => requestWithAdminKey(input, init, nativeFetch);

    try {
      for (const source of scripts[page] || []) new Function(source).call(window);
    } catch (error) {
      console.error(`Unable to initialize the ${page} page.`, error);
    }

    return () => {
      window.fetch = nativeFetch;
      stylesheet.remove();
      document.body.className = '';
      document.title = 'STUDIO.DEV — Portfolio';
    };
  }, [page]);

  return (
    <div className="legacy-page-root">
      {tree.map((node, index) => renderNode(node, `${page}-${index}`, page))}
      {page !== 'home' && <TechTicker />}
    </div>
  );
}
