'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function isInternalLink(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
  if (!anchor) return false;
  if (anchor.target === '_blank' || anchor.hasAttribute('download')) return false;
  const href = anchor.getAttribute('href') || '';
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
  return href.startsWith('/') || href.startsWith(window.location.origin);
}

export default function GlobalLoadingOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams?.toString() || ''}`;
  const [visible, setVisible] = useState(true);
  const initializedRef = useRef(false);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const clearHideTimer = () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    clearHideTimer();

    if (!initializedRef.current) {
      initializedRef.current = true;
      hideTimerRef.current = window.setTimeout(() => setVisible(false), 850);
      return clearHideTimer;
    }

    hideTimerRef.current = window.setTimeout(() => setVisible(false), 420);
    return clearHideTimer;
  }, [routeKey]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!isInternalLink(event.target)) return;
      setVisible(true);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return (
    <div className={`global-loader-overlay ${visible ? 'visible' : ''}`} aria-hidden={!visible}>
      <div className="page-loader-card">
        <div className="page-loader-kicker">LOADING</div>
        <div className="page-loader-title">POLABS ADMIN</div>
        <div className="page-loader-copy">병원 컨설팅의 새로운 시작, POLABS</div>
        <div className="page-loader-bar"><span /></div>
      </div>
    </div>
  );
}
