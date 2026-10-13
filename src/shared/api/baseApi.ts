import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_URL;

if (!baseUrl) {
  throw new Error("VITE_API_URL is not set");
}

const DEV_DELAY_MS = 500;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const baseQuery = fetchBaseQuery({ baseUrl });

export const baseApi = createApi({
  reducerPath: "storeApi",

  baseQuery: async (args, api, extraOptions) => {
    /**
     * Delay ustawiony jest celowo na 1 sekundę, aby zasymulować opóźnienie w odpowiedzi API i pokazać ze loading overlay działa
     */
    if (import.meta.env.DEV) {
      await delay(DEV_DELAY_MS);
    }

    return baseQuery(args, api, extraOptions);
  },

  endpoints: () => ({}),
});
