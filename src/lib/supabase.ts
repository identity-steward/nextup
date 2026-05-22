import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const missingConfigError = new Error(
  'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in a local .env file.'
);

type MockQueryResult = {
  data: null;
  error: Error;
  count: null;
  status: number;
  statusText: string;
};

const createMockQueryBuilder = (): Record<string, unknown> => {
  const proxy = new Proxy(
    {},
    {
      get: (_target, prop: string | symbol) => {
        if (prop === 'then') {
          return (resolve: (value: MockQueryResult) => void) =>
            resolve({
              data: null,
              error: missingConfigError,
              count: null,
              status: 503,
              statusText: 'Supabase not configured',
            });
        }

        return () => proxy;
      },
    }
  );

  return proxy;
};

const createMockSupabaseClient = (): SupabaseClient => {
  const queryBuilder = () => createMockQueryBuilder();

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: missingConfigError }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe: () => undefined,
          },
        },
      }),
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: missingConfigError,
      }),
      resetPasswordForEmail: async () => ({ data: {}, error: missingConfigError }),
      updateUser: async () => ({ data: { user: null }, error: missingConfigError }),
      signOut: async () => ({ error: null }),
    },
    from: queryBuilder,
    rpc: queryBuilder,
    channel: () => ({
      on: () => ({
        subscribe: () => ({
          unsubscribe: () => undefined,
        }),
      }),
      subscribe: () => ({
        unsubscribe: () => undefined,
      }),
    }),
    removeChannel: () => undefined,
  } as unknown as SupabaseClient;
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : createMockSupabaseClient();
