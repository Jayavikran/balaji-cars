import { useQuery } from '@tanstack/react-query';
import { fetchPublicSettings } from '@/api/enquiries';

/**
 * Company/contact/social settings rarely change, so this is cached far
 * longer than the default 30s (see main.tsx) to avoid an unnecessary
 * refetch on every page navigation.
 */
export function useSiteSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchPublicSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
