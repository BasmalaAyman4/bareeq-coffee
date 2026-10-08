import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
export function useOrders(allowed: boolean, userId: string | undefined) {
  const client = useQueryClient();
  const [connection, setConnection] = useState('Connecting');
  const orders = useQuery({
    queryKey: ['orders', userId],
    enabled: !!allowed,
    queryFn: async () => {
      const r = await supabase
        .from('orders')
        .select('*,order_items(*,order_item_modifiers(*)),payments(*)')
        .order('created_at', { ascending: false })
        .limit(500);
      if (r.error) throw r.error;
      return r.data;
    },
    refetchInterval: 15000,
  });
  useEffect(() => {
    if (!allowed) return;
    const channel = supabase
      .channel('bareeq-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => client.invalidateQueries({ queryKey: ['orders'] }),
      )
      .subscribe((s) => {
        setConnection(
          s === 'SUBSCRIBED'
            ? 'Live updates connected'
            : 'Reconnecting · queue checked every 15 seconds',
        );
        if (s === 'SUBSCRIBED')
          client.invalidateQueries({ queryKey: ['orders'] });
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, [!!allowed, userId, client]);

  return { orders, connection };
}
