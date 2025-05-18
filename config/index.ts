const config = {
    baseUrl: import.meta.env.VITE_API_URL_PREFIX || "http://127.0.0.1:8050/api/v1",
    expireIn: 10080,
    secretKey : import.meta.env.VITE_SECURE_KEY,
    adminExpireIn:  3 * 24 * 60 * 60 * 1000,
    userExpireIn:  1 * 24 * 60 * 60 * 1000,
  };
  
  export default config;