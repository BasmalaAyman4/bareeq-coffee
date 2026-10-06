import { supabase } from '@/lib/supabase';
import { api } from '@/services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
export function useStaffSession(
  expectedFounder: boolean | null,
  setSelected: Dispatch<SetStateAction<any>>,
  setReceipt: Dispatch<SetStateAction<string>>,
) {
  const client = useQueryClient();
  const [session, setSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
      setCheckingSession(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(!!s);
      client.removeQueries({ queryKey: ['staff'] });
      client.removeQueries({ queryKey: ['orders'] });
      setSelected(null);
      setReceipt('');
    });
    return () => data.subscription.unsubscribe();
  }, []);
  const identity = useQuery({
    queryKey: ['staff', session],
    enabled: session,
    queryFn: () => api('me'),
    retry: false,
    refetchInterval: 30000,
  });
  const allowed = Boolean(
    identity.data &&
    !identity.data.changeRequired &&
    (expectedFounder === null ||
      identity.data.role === (expectedFounder ? 'founder' : 'cashier')),
  );

  return {
    session,
    identity,
    allowed,
    loading: checkingSession || (session && identity.isPending),
  };
}
