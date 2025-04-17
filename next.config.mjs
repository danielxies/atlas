/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['assets.aceternity.com', 'img.freepik.com', 'img.clerk.com'], // Add your image domain here
    },
    webpack: (config) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
      return config;
    },
  };
  
  export default nextConfig;
  