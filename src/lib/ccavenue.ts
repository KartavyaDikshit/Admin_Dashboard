import crypto from 'crypto';

// Configuration (Should be in env vars, but using constants as requested/implied)
export const CCAVENUE_CONFIG = {
  merchant_id: '797866',
  access_code: 'AVKP67JA65BR25PKRB',
  working_key: '9E3AA152D67E1D92AA4AC9938F4AB6AC',
  url: 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction', // Prod
  // url: 'https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction', // Test
};

export const encrypt = (plainText: string): string => {
  const key = Buffer.from(CCAVENUE_CONFIG.working_key, 'hex'); // 16 bytes
  const iv = Buffer.from(CCAVENUE_CONFIG.working_key, 'hex'); // Use key as IV (common in CCAvenue legacy, or might be random)
  // Note: CCAvenue Node.js kit usually uses md5 of key. 
  // But if key is already 32 hex chars (16 bytes), it might be direct.
  // Standard CCAvenue Node implementation:
  // var m = crypto.createHash('md5');
  // m.update(workingKey);
  // var key = m.digest();
  // var iv = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';
  
  // Let's try the standard method often found in their kit:
  const m = crypto.createHash('md5');
  m.update(CCAVENUE_CONFIG.working_key);
  const keyBuffer = m.digest();
  const ivBuffer = Buffer.from('\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f', 'binary');
  
  const cipher = crypto.createCipheriv('aes-128-cbc', keyBuffer, ivBuffer);
  let encoded = cipher.update(plainText, 'utf8', 'hex');
  encoded += cipher.final('hex');
  return encoded;
};

export const decrypt = (encText: string): string => {
  const m = crypto.createHash('md5');
  m.update(CCAVENUE_CONFIG.working_key);
  const keyBuffer = m.digest();
  const ivBuffer = Buffer.from('\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f', 'binary');

  const decipher = crypto.createDecipheriv('aes-128-cbc', keyBuffer, ivBuffer);
  let decoded = decipher.update(encText, 'hex', 'utf8');
  decoded += decipher.final('utf8');
  return decoded;
};
