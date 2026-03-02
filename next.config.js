/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // PWA 설정은 Phase 7에서 next-pwa 추가 시 활성화
  // const withPWA = require('next-pwa')({ dest: 'public', disable: process.env.NODE_ENV === 'development' });
  // module.exports = withPWA(nextConfig);
};

module.exports = nextConfig;
