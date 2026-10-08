import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect } from 'react';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

/** Move the actual intro/hero cup, then scrub all four chapters on one timeline. */
export function useMenuStory() {
  useLayoutEffect(() => {
    const content = document.getElementById('site-content');
    if (!content) return;
    const media = gsap.matchMedia();
    let started = false;
    const start = () => {
      if (started || !document.querySelector('.intro-complete')) return;
      started = true;
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const menu = document.querySelector<HTMLElement>('.menu-story')!;
        const scene = document.querySelector<HTMLElement>('.hero-cup-scene')!;
        const cup = document.querySelector<HTMLElement>('.hero-traveller')!;
        const image = cup.querySelector<HTMLElement>('.hero-cup')!;
        const cards = gsap.utils.toArray<HTMLElement>(
          '.menu-story .category-card',
        );
        const stage = document.querySelector<HTMLElement>(
          '.menu-story .category-grid',
        )!;
        const marker = document.createComment('persistent cup home');
        cup.before(marker);
        const overlay = document.createElement('div');
        overlay.className = 'cup-story-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        document.body.append(overlay);
        overlay.append(cup);
        menu.classList.add('is-story');
        let timeline: gsap.core.Timeline | undefined;
        let pin: ScrollTrigger | undefined;
        let frame = 0;
        let lastWidth = 0;
        let lastHeight = 0;
        const build = () => {
          timeline?.scrollTrigger?.kill();
          timeline?.kill();
          pin?.kill();
          gsap.set(cup, { clearProps: 'all' });
          const compact = window.innerWidth < 1024;
          const isRtl = document.documentElement.dir === 'rtl';
          // svh keeps the scene stable while a phone's browser toolbar retracts.
          const sceneHeight = menu.clientHeight;
          const rect = scene.getBoundingClientRect();
          Object.assign(cup.style, {
            position: 'absolute',
            left: `${rect.left}px`,
            top: `${rect.top + window.scrollY}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
          });
          const cupRect = image.getBoundingClientRect();
          const sx = cupRect.left + cupRect.width / 2;
          const sy = cupRect.top + cupRect.height / 2;
          cup.style.transformOrigin = `${sx - rect.left}px ${sy - (rect.top + window.scrollY)}px`;
          const menuTop = menu.getBoundingClientRect().top + window.scrollY;
          const stageRect = stage.getBoundingClientRect();
          const dx = stageRect.left + stageRect.width / 2 - sx;
          const labelHeight = cards[0]
            .querySelector('span')!
            .getBoundingClientRect().height;
          const dy =
            stageRect.top -
            menu.getBoundingClientRect().top +
            (stageRect.height - labelHeight) / 2 -
            sy +
            (compact ? 18 : 30);
          const distance = window.innerWidth * 0.9;
          const cardInX = isRtl ? -distance : distance;
          const cardOutX = isRtl ? distance : -distance;
          const flight = menuTop / sceneHeight;
          const scale = compact
            ? Math.min(
                1,
                (stageRect.height - labelHeight - 24) / image.offsetHeight,
                (stageRect.width * 0.88) / cupRect.width,
              )
            : Math.min(1, (stageRect.height - 96) / 550);
          const leftArc = compact
            ? Math.min(window.innerWidth * 0.2, Math.max(0, cupRect.left - 18))
            : window.innerWidth * 0.27;
          const arcSign = isRtl ? 1 : -1;
          const drop = compact
            ? Math.min(72, Math.max(0, sceneHeight - cupRect.bottom - 20))
            : Math.min(130, sceneHeight * 0.12);
          gsap.set(cards, { x: cardInX, rotation: isRtl ? -5 : 5, scale: 0.94 });
          gsap.set(cards[0], { x: 0, rotation: 0, scale: 1 });
          cards.forEach((card, i) => {
            card.inert = i !== 0;
            card.setAttribute('aria-hidden', String(i !== 0));
          });
          menu.dataset.chapter = '0';
          pin = ScrollTrigger.create({
            trigger: menu,
            start: 'top top',
            end: () => '+=' + sceneHeight * 4,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
          });
          timeline = gsap.timeline({
            defaults: { ease: 'none' },
            onUpdate: () => {
              const t = (timeline?.time() ?? 0) - flight;
              const active = t < 0.8 ? 0 : t < 2 ? 1 : t < 3.2 ? 2 : 3;
              menu.dataset.chapter = String(active);
              cards.forEach((card, i) => {
                card.inert = i !== active;
                card.setAttribute('aria-hidden', String(i !== active));
              });
            },
            scrollTrigger: {
              trigger: document.body,
              start: 0,
              end: menuTop + sceneHeight * 4,
              scrub: compact ? 0.3 : 0.55,
            },
          });
          timeline.to(
            cup,
            {
              duration: flight,
              motionPath: {
                path: [
                  { x: 0, y: 0 },
                  {
                    x: arcSign * (compact ? leftArc * 0.7 : window.innerWidth * 0.2),
                    y: compact ? dy * 0.2 + drop : drop,
                  },
                  {
                    x: arcSign * leftArc,
                    y: compact ? dy * 0.55 + drop : Math.max(dy + 110, 120),
                  },
                  { x: dx, y: dy },
                ],
                curviness: 1.15,
              },
              scale,
              rotation: isRtl ? 10 : -10,
            },
            0,
          );
          timeline.to({}, { duration: 0.4 });
          for (let i = 0; i < 3; i++) {
            const at = flight + 0.4 + i * 1.2;
            timeline.to(
              cards[i],
              {
                x: cardOutX,
                rotation: isRtl ? 5 : -5,
                scale: 0.94,
                duration: 0.8,
                ease: 'power2.inOut',
              },
              at,
            );
            timeline.to(
              cards[i + 1],
              {
                x: 0,
                rotation: 0,
                scale: 1,
                duration: 0.8,
                ease: 'power2.inOut',
              },
              at,
            );
            if (i === 0)
              timeline.to(
                cup,
                {
                  x: dx + cardOutX,
                  y: dy + (compact ? 12 : 35),
                  rotation: isRtl ? 18 : -18,
                  scale: scale * 0.94,
                  duration: 0.8,
                  ease: 'power2.inOut',
                },
                at,
              );
            timeline.to({}, { duration: 0.4 }, at + 0.8);
          }
          ScrollTrigger.refresh();
          timeline.progress(
            Math.min(1, window.scrollY / (menuTop + sceneHeight * 4)),
          );
          lastWidth = window.innerWidth;
          lastHeight = menu.clientHeight;
        };
        build();
        const resize = () => {
          if (
            window.innerWidth === lastWidth &&
            menu.clientHeight === lastHeight
          )
            return;
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(build);
        };
        window.addEventListener('resize', resize);
        return () => {
          cancelAnimationFrame(frame);
          window.removeEventListener('resize', resize);
          timeline?.scrollTrigger?.kill();
          timeline?.kill();
          pin?.kill();
          gsap.set(cup, { clearProps: 'all' });
          gsap.set(cards, { clearProps: 'all' });
          cards.forEach((card) => {
            card.inert = false;
            card.removeAttribute('aria-hidden');
          });
          marker.replaceWith(cup);
          overlay.remove();
          menu.classList.remove('is-story');
          delete menu.dataset.chapter;
        };
      });
    };
    const observer = new MutationObserver(start);
    observer.observe(content, {
      attributes: true,
      attributeFilter: ['class'],
    });
    start();
    return () => {
      observer.disconnect();
      media.revert();
    };
  }, []);
}
