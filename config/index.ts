const config = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL_PREFIX || "http://127.0.0.1:8050/api/v1",
  expireIn: 10080,
  secretKey: process.env.NEXT_PUBLIC_APP_SECURE_KEY,
  adminExpireIn: 3 * 24 * 60 * 60 * 1000,
  userExpireIn: 1 * 24 * 60 * 60 * 1000,
  domain: process.env.NEXT_PUBLIC_APP_DOMAIN,
};

export default config;
