import React, { createContext, useContext, ReactNode } from 'react';
import { useGetSession, getGetSessionQueryKey } from '@workspace/api-client-react';
import { User } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

interface SessionContextType {
  user: User | null | undefined;
  isLoading: boolean;
  refetch: () => void;
}

const SessionContext = createContext<SessionContextType>({
  user: undefined,
  isLoading: true,
  refetch: () => {},
});

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const { data, isLoading, refetch } = useGetSession();
  const queryClient = useQueryClient();

  const handleRefetch = () => {
    queryClient.invalidateQueries({ queryKey: getGetSessionQueryKey() });
    refetch();
  };

  return (
    <SessionContext.Provider value={{ user: data?.user, isLoading, refetch: handleRefetch }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
