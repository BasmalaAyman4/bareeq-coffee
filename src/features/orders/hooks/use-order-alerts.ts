import { config } from '@/lib/supabase';
import { api } from '@/services/api';
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { cashierActionableOrder } from '../order-display';
import type { useOrders } from './use-orders';
export function useOrderAlerts({
  founder,
  allowed,
  orders,
  selected,
  setSelected,
}: {
  founder: boolean;
  allowed: boolean;
  orders: ReturnType<typeof useOrders>['orders'];
  selected: any;
  setSelected: Dispatch<SetStateAction<any>>;
}) {
  const [sound, setSound] = useState(false),
    [alert, setAlert] = useState('');
  const audio = useRef<AudioContext | null>(null),
    seen = useRef(new Set<string>()),
    initialized = useRef(false);
  useEffect(() => {
    // Browsers require a real user gesture before they release audio. The
    // first normal dashboard interaction unlocks it; no settings button is
    // needed and visual live alerts remain active in every case.
    const prepareAudio = () => {
      audio.current ??= new AudioContext();
      void audio.current.resume().then(
        () => setSound(audio.current?.state === 'running'),
        () => setSound(false),
      );
    };
    window.addEventListener('pointerdown', prepareAudio, { once: true });
    window.addEventListener('keydown', prepareAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', prepareAudio);
      window.removeEventListener('keydown', prepareAudio);
    };
  }, []);
  useEffect(() => {
    if (
      !allowed ||
      !config.vapid ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !('Notification' in window) ||
      Notification.permission !== 'granted'
    )
      return;
    void (async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const key = Uint8Array.from(
          atob(config.vapid.replace(/-/g, '+').replace(/_/g, '/')),
          (character) => character.charCodeAt(0),
        );
        const subscription =
          (await registration.pushManager.getSubscription()) ??
          (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: key,
          }));
        await api('subscribe', { subscription: subscription.toJSON() });
      } catch {
        // The authoritative live queue remains active if this browser cannot
        // maintain a background push subscription.
      }
    })();
  }, [allowed]);
  useEffect(() => {
    if (!orders.data) return;
    const actionable = orders.data.filter((o) =>
      founder
        ? o.status === 'awaiting_payment_verification'
        : cashierActionableOrder(o),
    );
    const fresh = actionable.filter((o) => !seen.current.has(o.id));
    for (const o of actionable) seen.current.add(o.id);
    if (fresh.length) {
      setAlert(
        `${fresh.length} ${founder ? 'payment verification request(s)' : 'new online order(s)'}`,
      );
      if (initialized.current && sound && audio.current?.state === 'running') {
        const oscillator = audio.current.createOscillator(),
          gain = audio.current.createGain();
        oscillator.connect(gain);
        gain.connect(audio.current.destination);
        oscillator.frequency.value = 740;
        gain.gain.setValueAtTime(0.18, audio.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          audio.current.currentTime + 0.6,
        );
        oscillator.start();
        oscillator.stop(audio.current.currentTime + 0.6);
      }
    }
    initialized.current = true;
    const deep = new URLSearchParams(location.search).get('order');
    if (deep && !selected) setSelected(orders.data.find((o) => o.id === deep));
  }, [orders.data, sound, founder]);

  return { alert, setAlert };
}
