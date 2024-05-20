import crypto from "crypto"

export function publicKey2Pem(publicKey: string) {
  const publicKeyBuffer = Buffer.from(publicKey.slice(2), 'hex');
  return `-----BEGIN PUBLIC KEY-----\n${publicKeyBuffer.toString('base64')}\n-----END PUBLIC KEY-----`
}

export function privateKey2Pem (privateKey: string) {
  const privateKeyBuffer = Buffer.from(privateKey.slice(2), 'hex');
  return  `-----BEGIN PRIVATE KEY-----\n${privateKeyBuffer.toString('base64')}\n-----END PRIVATE KEY-----`;
}

export function encryptWithPublicKey(publicKeyPem: string, message: string) {
  const buffer = Buffer.from(message, 'utf8');
  const encrypted = crypto.publicEncrypt(publicKeyPem, buffer);
  return encrypted.toString('base64');
}

export function decryptWithPrivateKey(privateKeyPem: string, encryptedMessage: string) {
  const buffer = Buffer.from(encryptedMessage, 'base64');
  const decrypted = crypto.privateDecrypt(privateKeyPem, buffer);
  return decrypted.toString('utf8');
}