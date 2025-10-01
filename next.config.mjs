/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `pg` module
    if (isServer) {
      config.externals.push('pg-native');
    }
    
    // Ignore pg-native module warnings
    config.ignoreWarnings = [
      { module: /node_modules\/pg\/lib\/native\/client\.js/ },
      { module: /node_modules\/pg\/lib\/native\/index\.js/ },
    ];
    
    return config;
  },
};

export default nextConfig;
