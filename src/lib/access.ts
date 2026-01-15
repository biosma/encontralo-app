import type { User } from '@/payload-types';

// Reemplazar isAdmin con isAdmin más simple
export const isAdmin = (user?: User | null): boolean => {
  return Boolean(user?.roles?.includes('admin'));
};

// Para casos donde necesites verificar si es usuario autenticado
export const isAuthenticated = (user?: User | null): boolean => {
  return Boolean(user?.id);
};

// Para casos específicos donde necesites verificar roles específicos
export const hasRole = (user: User | null | undefined, role: string): boolean => {
  return Boolean(user?.roles?.includes(role as any));
};
