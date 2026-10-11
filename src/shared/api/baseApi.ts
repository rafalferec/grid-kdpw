import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.VITE_API_URL;

if (!baseUrl) {
  throw new Error('VITE_API_URL is not set');
}

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
});

/**
 * Delay ustawiony jest celowo na 1 sekundę, aby zasymulować opóźnienie w odpowiedzi API i pokazać ze loading overlay działa
 */

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const baseApi = createApi({
  reducerPath: 'storeApi',

  baseQuery: async (args, api, extraOptions) => {
    if (import.meta.env.DEV) {
      await delay(1000);
    }

    return baseQuery(args, api, extraOptions);
  },

  endpoints: () => ({}),
});