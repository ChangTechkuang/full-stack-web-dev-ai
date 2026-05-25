const baseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!baseUrl) {
  // Surface at boot rather than silently default — production builds must set this.
  // eslint-disable-next-line no-console
  console.warn("NEXT_PUBLIC_API_URL is not set; falling back to http://localhost:8080");
}

export const env = {
  apiBaseUrl: baseUrl ?? "http://localhost:8080",
} as const;
