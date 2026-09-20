/**
 * Published Scripture media is delivered from Supabase Storage signed URLs, so the
 * project host has to be an allowed image source. Local patterns stay off in
 * production builds.
 */
const supabaseHostname = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  } catch {
    return null;
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      ...(supabaseHostname ? [{ protocol: "https", hostname: supabaseHostname }] : []),
      ...(process.env.NODE_ENV === "production"
        ? []
        : [
            { protocol: "http", hostname: "localhost" },
            { protocol: "http", hostname: "127.0.0.1" }
          ])
    ]
  }
};

export default nextConfig;
