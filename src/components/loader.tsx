'use client';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

const RELEASE = 350;
const PLAYBACK_RATE = 1.65;
// Let every bean settle before removing the overlay; speed up the clock, not the cutoff.
const END = 4650;
const smooth = (p: number) => p * p * (3 - 2 * p);
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const ease = (p: number) => 1 - Math.pow(1 - p, 3);

export function Loader() {
  const [active, setActive] = useState(false);
  const skip = useRef<HTMLButtonElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const star = useRef<HTMLElement>(null);
  const background = useRef<HTMLDivElement>(null);
  const wordmark = useRef<HTMLDivElement>(null);
  const finish = useCallback(() => {
    document.documentElement.removeAttribute('data-intro-pending');
    setActive(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) {
      document.documentElement.removeAttribute('data-intro-pending');
      return;
    }
    const onChange = () => {
      if (media.matches) finish();
    };
    media.addEventListener('change', onChange);
    const assets = [
      'bareeq-logo.png',
      'bareeq-iced-cup-hero.png',
      'coffee-bean-cutout.webp',
      'coffee-splash-cutout.webp',
    ];
    Promise.all(
      assets.map((src) => {
        const img = new Image();
        img.src = (location.pathname.startsWith('/bareeq-coffee') ? '/bareeq-coffee' : '') + '/assets/' + src;
        return img.decode().catch(() => {});
      }),
    ).then(() => {
      if (!cancelled) {
        setActive(true);
        document.documentElement.removeAttribute('data-intro-pending');
      }
    });
    return () => {
      cancelled = true;
      media.removeEventListener('change', onChange);
    };
  }, [finish]);

  useLayoutEffect(() => {
    if (!active || !layer.current || !star.current) return;
    const content = document.getElementById('site-content');
    const cup = document.querySelector<HTMLElement>('.hero-cup');
    const splash = document.querySelector<HTMLElement>('.hero-cup-splash');
    if (!cup || !splash) {
      finish();
      return;
    }
    const contentStyle = content?.getAttribute('style') ?? null;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    content?.classList.add('intro-running');
    if (content) content.inert = true;
    skip.current?.focus({ preventScroll: true });

    // Read the original composition before moving its actual bean nodes into the
    // foreground. These same nodes return to their original parents at the end.
    const originRect = star.current.getBoundingClientRect();
    const origin = {
      x: originRect.x + originRect.width / 2,
      y: originRect.y + originRect.height / 2,
    };
    const center = window.innerWidth / 2;
    // Measure the unchanged hero first, then raise it beneath the falling stream.
    const lift = () => Math.max(0, origin.y + 230 - impact.y);
    const heroLift = (t: number) =>
      lift() * (1 - smooth(clamp((t - 2650) / 1900)));
    const cupAngle = matchMedia('(max-width:767px)').matches ? 10 : 12;
    const angle = (cupAngle * Math.PI) / 180;
    const cw = cup.offsetWidth,
      ch = cup.offsetHeight;
    const cupRect = cup.getBoundingClientRect();
    const image = cup as HTMLImageElement;
    const imageHeight = Math.min(
      ch,
      (cw * image.naturalHeight) / image.naturalWidth,
    );
    // The liquid surface is 18% down the original transparent cup artwork.
    const localY = (ch - imageHeight) / 2 + imageHeight * 0.18 - ch / 2;
    const impact = {
      x: cupRect.x + cupRect.width / 2 - Math.sin(angle) * localY,
      y: cupRect.y + cupRect.height / 2 + Math.cos(angle) * localY,
    };

    const splashStyle = splash.getAttribute('style');
    const splashTransform = getComputedStyle(splash).transform;
    const scene = splash.offsetParent as HTMLElement;
    const sceneRect = scene.getBoundingClientRect();
    // Choose a transform origin whose rotated position is the coffee surface.
    const theta = (cupAngle * Math.PI) / 180;
    const bottom = { x: splash.offsetWidth / 2, y: splash.offsetHeight };
    const vx = impact.x - sceneRect.x - splash.offsetLeft - bottom.x;
    const vy = impact.y - sceneRect.y - splash.offsetTop - bottom.y;
    const anchor = {
      x: bottom.x + Math.cos(theta) * vx + Math.sin(theta) * vy,
      y: bottom.y - Math.sin(theta) * vx + Math.cos(theta) * vy,
    };
    const renderSplash = (growth: number) => {
      splash.style.opacity = '1';
      splash.style.transformOrigin = 'center bottom';
      splash.style.transform = `${splashTransform} translate(${anchor.x - bottom.x}px,${anchor.y - bottom.y}px) scale(${growth},${growth}) translate(${bottom.x - anchor.x}px,${bottom.y - anchor.y}px)`;
      splash.style.clipPath =
        growth === 1
          ? 'none'
          : `circle(${Math.max(splash.offsetWidth, splash.offsetHeight) * 1.5 * growth}px at ${anchor.x}px ${anchor.y}px)`;
    };
    renderSplash(0);
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>('.hero-bean'),
    ).filter((n) => getComputedStyle(n).display !== 'none');
    const beans = nodes.map((node, i) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      const target = {
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
      };
      node.id = `bareeq-bean-${i}`;
      node.dataset.beanId = node.id;
      const width = node.offsetWidth,
        height = node.offsetHeight,
        rotation = style.transform;
      const original = node.getAttribute('style');
      const marker = document.createComment('persistent hero bean');
      node.parentNode!.insertBefore(marker, node);
      layer.current!.appendChild(node);
      node.style.cssText = `position:absolute;left:0;top:0;right:auto;bottom:auto;width:${width}px;height:${height}px;max-width:none;opacity:0;animation:none;will-change:transform;`;
      return {
        node,
        marker,
        original,
        target,
        width,
        height,
        rotation,
        index: i,
        delay: RELEASE + i * 125,
      };
    });
    const impacts = Array.from(
      layer.current.querySelectorAll<HTMLElement>('.impact-bean'),
    );
    const sparks = Array.from(
      layer.current.querySelectorAll<HTMLElement>('.journey-spark'),
    );
    const impactsAt: number[] = [];
    let raf = 0;
    const started = performance.now();
    const paint = (
      node: HTMLElement,
      x: number,
      y: number,
      w: number,
      h: number,
      rotation: string,
      scale: number,
    ) => {
      node.style.transform = `translate3d(${x - w / 2}px,${y - h / 2}px,0) ${rotation} scale(${scale})`;
    };
    function tick(now: number) {
      const t = (now - started) * PLAYBACK_RATE;
      const offset = heroLift(t);
      if (content) content.style.transform = `translate3d(0,${offset}px,0)`;
      if (background.current)
        background.current.style.opacity = String(
          1 - smooth(clamp((t - 1650) / 1050)),
        );
      if (wordmark.current)
        wordmark.current.style.opacity = String(
          1 - smooth(clamp((t - 1200) / 850)),
        );
      layer.current!.dataset.timeline = String(Math.round(t));
      layer.current!.dataset.phase =
        t < 1200
          ? 'emission'
          : t < 2000
            ? 'fall'
            : t < 2750
              ? 'reveal'
              : t < 3100
                ? 'impact'
                : t < 4550
                  ? 'settling'
                  : 'settled';
      for (const b of beans) {
        const age = t - b.delay;
        // Emitted settling beans never fade and are never replaced.
        b.node.style.opacity = age >= 0 ? '1' : '0';
        const fall = clamp(age / 1500);
        const spread = (b.index % 2 ? 1 : -1) * (12 + b.index * 5);
        const branchY = origin.y + 210;
        let x = mix(origin.x, center + spread, smooth(fall)),
          y = mix(origin.y, branchY, fall * fall);
        let scale = mix(0.55 + b.index * 0.035, 0.85, fall),
          rotation = `rotate(${b.index * 39 + fall * 135}deg)`;
        if (age > 1500) {
          const p = smooth(clamp((age - 1500) / (1600 + b.index * 55)));
          x = mix(center + spread, b.target.x, p);
          y = mix(branchY, b.target.y + offset, p);
          scale = mix(0.85, 1, p);
          const finalAngle =
            (Math.atan2(
              new DOMMatrix(b.rotation).b,
              new DOMMatrix(b.rotation).a,
            ) *
              180) /
            Math.PI;
          rotation = `rotate(${mix(b.index * 39 + 135, finalAngle, p)}deg)`;
        }
        paint(b.node, x, y, b.width, b.height, rotation, scale);
      }
      impacts.forEach((node, i) => {
        const release = RELEASE + i * 175,
          arrival = 2750 + i * 170,
          age = t - release;
        const p = clamp(age / (arrival - release)),
          turn = smooth(clamp((p - 0.48) / 0.52));
        const x = mix(
          mix(origin.x, center + (i - 1.5) * 10, smooth(clamp(p / 0.48))),
          impact.x,
          turn,
        );
        const y = mix(origin.y, impact.y + offset, p * p);
        const gone = clamp((t - arrival) / (110 * PLAYBACK_RATE));
        node.style.opacity = age < 0 ? '0' : String(1 - gone);
        paint(
          node,
          x,
          y + gone * 12,
          42,
          42,
          `rotate(${i * 57 + p * (110 + i * 35)}deg)`,
          mix(0.65, 0.95, p) * (1 - gone),
        );
        if (t >= arrival && impactsAt[i] === undefined) impactsAt[i] = arrival;
      });
      let growth = 0;
      for (const hit of impactsAt) {
        if (hit !== undefined) growth += 0.25 * ease(clamp((t - hit) / 650));
      }
      renderSplash(Math.min(1, growth));
      sparks.forEach((node, i) => {
        const p = clamp((t - RELEASE - i * 150) / 1900);
        node.style.opacity =
          t < RELEASE + i * 150 ? '0' : String(Math.sin(p * Math.PI) * 0.8);
        paint(
          node,
          mix(origin.x, center, ease(clamp(p * 4))) + (i ? 8 : -8) * p,
          mix(origin.y, window.innerHeight * 0.95, p * p),
          4,
          4,
          `rotate(${p * 180}deg)`,
          1,
        );
      });
      if (t >= END) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    const onResize = () => finish();
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      for (const b of beans) {
        b.marker.replaceWith(b.node);
        if (b.original === null) b.node.removeAttribute('style');
        else b.node.setAttribute('style', b.original);
      }
      if (splashStyle === null) splash.removeAttribute('style');
      else splash.setAttribute('style', splashStyle);
      if (content) {
        if (contentStyle === null) content.removeAttribute('style');
        else content.setAttribute('style', contentStyle);
      }
      content?.classList.add('intro-complete');
      content?.classList.remove('intro-running');
      if (content) content.inert = false;
      document.body.style.overflow = overflow;
      if (previous && previous !== document.body && previous.isConnected)
        previous.focus({ preventScroll: true });
      else document.getElementById('main')?.focus({ preventScroll: true });
    };
  }, [active, finish]);

  if (!active) return null;
  return (
    <div
      className="bareeq-loader"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Bareeq"
      onKeyDown={(e) => {
        if (e.key === 'Escape') finish();
        if (e.key === 'Tab') {
          e.preventDefault();
          skip.current?.focus();
        }
      }}
    >
      <div ref={background} className="loader-bg-overlay" aria-hidden="true" />
      <div ref={wordmark} className="loader-wordmark" aria-hidden="true">
        <img src="/assets/bareeq-logo.png" alt="" width="591" height="591" />
        <i ref={star} className="loader-star" />
      </div>
      <div ref={layer} className="journey-particles" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <img
            key={i}
            id={`bareeq-impact-${i}`}
            data-bean-id={`bareeq-impact-${i}`}
            className="impact-bean"
            src="/assets/coffee-bean-cutout.webp"
            alt=""
            width="42"
            height="42"
          />
        ))}
        {[0, 1].map((i) => (
          <i key={i} className="journey-spark" />
        ))}
      </div>
      {/*   <Button ref={skip} className="loader-skip" variant="ghost" onClick={finish}>Skip intro →</Button>
       */}{' '}
    </div>
  );
}
