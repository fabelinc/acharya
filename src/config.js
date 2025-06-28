REACT_APP_BACKEND_URL=https://acharya.onrender.com

const config = {
  api: {
    baseUrl: process.env.REACT_APP_BACKEND_URL || 'https://acharya.onrender.com',
    timeout: 30000,
  }
};

export default config;
