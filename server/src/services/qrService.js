const QRCode = require('qrcode');
const logger = require('../utils/logger');

const generateQRCodeDataURL = async (text) => {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (error) {
    logger.error('Failed to generate QR Code Data URL:', { error: error.message });
    throw error;
  }
};

module.exports = {
  generateQRCodeDataURL
};
