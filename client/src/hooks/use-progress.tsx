import { useQuery } from '@tanstack/react-query';
import { UserProgress } from '@/types';
import { getAuthHeaders } from '@/lib/security';

export function useProgress(certificationId: string) {
  return useQuery<UserProgress[]>({
    queryKey: ['/api/progress', certificationId],
    queryFn: async () => {
      const response = await fetch(`/api/progress/${certificationId}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      
      return response.json();
    },
    enabled: !!certificationId,
  });
}

export function useCertifications() {
  return useQuery({
    queryKey: ['/api/certifications'],
  });
}

export function useTopics(certificationId: string) {
  return useQuery({
    queryKey: ['/api/certifications', certificationId, 'topics'],
    enabled: !!certificationId,
  });
}
