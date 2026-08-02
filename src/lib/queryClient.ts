import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de cache em memória sem refetch desnecessário
      gcTime: 1000 * 60 * 60, // Mantém dados na lixeira da memória por 1 hora
      refetchOnWindowFocus: false, // Evita refetches excessivos ao alternar abas
      retry: 1,
    },
  },
});
