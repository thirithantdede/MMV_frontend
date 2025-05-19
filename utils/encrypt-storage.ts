import { AES } from "crypto-js";
import CryptoJS from "crypto-js";

export class EncryptStorage {
  secretKey: string | undefined;
  constructor(secretKey: string | undefined) {
    this.secretKey = secretKey;
  }
  set(key: string, value: string, expires: number | undefined = undefined) {
    const encryptedValue = AES.encrypt(value, this.secretKey as string).toString();
    window.localStorage.setItem(key, encryptedValue);
    if (expires) {
      const expirationTimestamp = Date.now() + expires * 60 * 1000;
      window.localStorage.setItem(`expiresAt`, expirationTimestamp.toString());
    }
  }
  get(key: string) {
    const value = window.localStorage.getItem(key);
    const expirationTimestamp = window.localStorage.getItem(`expiresAt`);
    if (!value) return null;
    if (expirationTimestamp && Date.now() > parseInt(expirationTimestamp, 10)) {
      window.localStorage.removeItem(key);
      window.localStorage.removeItem(`expiresAt`);
      return null;
    }
    const decryptedValue = AES.decrypt(value, this.secretKey as string).toString(
      CryptoJS.enc.Utf8
    );
    return decryptedValue;
  }
  remove(key: string) {
    window.localStorage.removeItem(key);
  }
}
