import React from 'react';
import { createRoot } from 'react-dom/client';
import HomePage from './pages/HomePage.jsx';
import BlogPage from './pages/BlogPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import WorkPage from './pages/WorkPage.jsx';
import './navigation-loader.css';

const pageForPath = (pathname) => {
  if (/\/blog(?:\.html)?\/?$/i.test(pathname)) return 'blog';
  if (/\/contact(?:\.html)?\/?$/i.test(pathname)) return 'contact';
  if (/\/work(?:\.html)?\/?$/i.test(pathname)) return 'work';
  return 'home';
};

function App() {
  const [page, setPage] = React.useState(() => pageForPath(window.location.pathname));
  const [loader, setLoader] = React.useState({ visible: true, leaving: false, progress: 0 });
  const timers = React.useRef({ progress: null, exit: null, hide: null });

  const startLoading = React.useCallback((destination = null, historyMode = 'push') => {
    window.clearInterval(timers.current.progress);
    window.clearTimeout(timers.current.exit);
    window.clearTimeout(timers.current.hide);
    setLoader({ visible: true, leaving: false, progress: 0 });

    const startedAt = window.performance.now();
    const duration = 1100;
    timers.current.progress = window.setInterval(() => {
      const elapsed = window.performance.now() - startedAt;
      const progress = Math.min(99, Math.floor((elapsed / duration) * 100));
      setLoader((current) => ({ ...current, progress }));

      if (elapsed < duration) return;
      window.clearInterval(timers.current.progress);
      timers.current.progress = null;

      if (destination) {
        const nextUrl = new URL(destination, window.location.href);
        if (historyMode === 'push') window.history.pushState({}, '', nextUrl);
        setPage(pageForPath(nextUrl.pathname));
        window.scrollTo(0, 0);
      }

      setLoader((current) => ({ ...current, progress: 100 }));
      timers.current.exit = window.setTimeout(() => {
        setLoader((current) => ({ ...current, leaving: true }));
        timers.current.hide = window.setTimeout(() => {
          setLoader((current) => ({ ...current, visible: false }));
        }, 280);
      }, destination ? 100 : 0);
    }, 30);
  }, []);

  React.useEffect(() => {
    startLoading();
    const update = () => startLoading(window.location.href, 'pop');
    const navigate = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest?.('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (!/^\/(?:index\.html|work(?:\.html)?|blog(?:\.html)?|contact(?:\.html)?)?\/?$/i.test(destination.pathname)) return;
      if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;

      event.preventDefault();
      startLoading(destination.href);
    };

    window.addEventListener('popstate', update);
    document.addEventListener('click', navigate, true);
    return () => {
      window.removeEventListener('popstate', update);
      document.removeEventListener('click', navigate, true);
      window.clearInterval(timers.current.progress);
      window.clearTimeout(timers.current.exit);
      window.clearTimeout(timers.current.hide);
    };
  }, [startLoading]);

  React.useEffect(() => {
    document.body.classList.toggle('route-loading', loader.visible);
    return () => document.body.classList.remove('route-loading');
  }, [loader.visible]);

  let currentPage;
  if (page === 'blog') currentPage = <BlogPage />;
  else if (page === 'contact') currentPage = <ContactPage />;
  else if (page === 'work') currentPage = <WorkPage />;
  else currentPage = <HomePage />;

  return <>
    {currentPage}
    {loader.visible && <div className={`route-loader${loader.leaving ? ' is-leaving' : ''}`} role="status" aria-live="polite" aria-label={`Loading page, ${loader.progress}%`}>
      <div className="route-loader-top"><span>INITIALIZING_ENGINE</span><span>AV SOFTWARE</span></div>
      <div className="route-loader-center">
        <div className="route-loader-value"><span>{String(loader.progress).padStart(2, '0')}</span><small>%</small></div>
        <div className="route-loader-track"><span style={{ width: `${loader.progress}%` }} /></div>
        <p>{loader.progress < 100 ? 'PREPARING PAGE' : 'SYSTEM READY'}</p>
      </div>
    </div>}
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
