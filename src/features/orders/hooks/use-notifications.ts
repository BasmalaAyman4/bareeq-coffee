import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/services/api';

export function useNotifications(allowed: boolean, userId?: string) {
  const audio = useRef<AudioContext | null>(null);
  const [sound, setSound] = useState(false);
  const [pushReady, setPushReady] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(
    'Tap Enable alerts to allow notifications and test sound.',
  );
  const enableLock = useRef(false);
  const supported = () =>
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  const ring = useCallback(() => {
    const context = audio.current;
    if (!context || context.state !== 'running') return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.frequency.value = 740;
    gain.gain.setValueAtTime(0.18, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.6);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
    oscillator.start();
    oscillator.stop(context.currentTime + 0.6);
  }, []);

  const unlockAudio = useCallback(async () => {
    try {
      if (!audio.current || audio.current.state === 'closed') {
        audio.current = new AudioContext();
        audio.current.onstatechange = () =>
          setSound(audio.current?.state === 'running');
      }
      await audio.current.resume();
      setSound(audio.current.state === 'running');
    } catch {
      setSound(false);
    }
  }, []);

  const subscribe = useCallback(async () => {
    const { publicKey } = await api('push_config');
    if (!publicKey)
      throw new Error(
        'Background notifications are not configured. The live order queue still works.',
      );
    const base = location.pathname.startsWith('/bareeq-coffee/')
      ? '/bareeq-coffee'
      : '';
    await navigator.serviceWorker.register(base + '/sw.js', {
      scope: base + '/',
    });
    const registration = await navigator.serviceWorker.ready;
    const encoded = publicKey.replace(/-/g, '+').replace(/_/g, '/');
    const key = Uint8Array.from(
      atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')),
      (c) => c.charCodeAt(0),
    );
    let subscription = await registration.pushManager.getSubscription();
    const existingKey = subscription?.options.applicationServerKey;
    if (
      subscription &&
      existingKey &&
      Array.from(new Uint8Array(existingKey)).join() !== Array.from(key).join()
    ) {
      await subscription.unsubscribe();
      subscription = null;
    }
    subscription ??= await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: key,
    });
    await api('subscribe', { subscription: subscription.toJSON() });
    setPushReady(true);
    setNotificationMessage(
      'Notifications enabled. Sound plays while this dashboard is open; background alerts follow your device notification and Focus settings.',
    );
  }, []);

  async function enableAlerts() {
    if (!allowed || enableLock.current) return;
    enableLock.current = true;
    setEnabling(true);
    // Both permission and audio unlock start directly within the tap gesture.
    const audioReady = unlockAudio().then(ring);
    try {
      if (!supported()) {
        setNotificationMessage(
          'On iPhone or iPad, add this site to the Home Screen, open that app, then tap Enable alerts (iOS 16.4 or later). Live alerts work while this page is open.',
        );
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPushReady(false);
        setNotificationMessage(
          permission === 'denied'
            ? 'Notifications are blocked. Allow them for Bareeq in your device or browser notification settings, then try again.'
            : 'Notifications were not enabled. Tap Enable alerts and choose Allow.',
        );
        return;
      }
      await subscribe();
    } catch (error) {
      setPushReady(false);
      setNotificationMessage(
        error instanceof Error
          ? error.message
          : 'Unable to enable notifications. Please try again.',
      );
    } finally {
      await audioReady;
      setEnabling(false);
      enableLock.current = false;
    }
  }

  useEffect(() => {
    if (!allowed) return;
    const resume = () => {
      void unlockAudio();
    };
    window.addEventListener('pointerdown', resume);
    window.addEventListener('keydown', resume);
    return () => {
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('keydown', resume);
    };
  }, [allowed, unlockAudio]);

  useEffect(() => {
    setPushReady(false);
    if (!allowed || !supported() || Notification.permission !== 'granted')
      return;
    void subscribe().catch(() =>
      setNotificationMessage(
        'Notification connection needs attention. Tap Enable alerts to reconnect.',
      ),
    );
  }, [allowed, userId, subscribe]);

  useEffect(
    () => () => {
      const context = audio.current;
      audio.current = null;
      if (context) {
        context.onstatechange = null;
        void context.close();
      }
    },
    [],
  );
  return {
    sound,
    pushReady,
    enabling,
    notificationMessage,
    enableAlerts,
    ring,
  };
}
