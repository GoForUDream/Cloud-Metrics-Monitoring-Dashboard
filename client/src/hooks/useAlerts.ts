import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../services/api';

export function useAlerts(limit = 50, includeAcknowledged = false) {
  return useQuery({
    queryKey: ['alerts', limit, includeAcknowledged],
    queryFn: () => api.getAlerts(limit, includeAcknowledged),
    refetchInterval: 30000,
  });
}

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.acknowledgeAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}
