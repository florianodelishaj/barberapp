import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Service } from '@/types';

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setServices(data as Service[]);
        setLoading(false);
      });
  }, []);

  return { services, loading, error };
}
