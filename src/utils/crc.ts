/**
 * Calculate CRC-16 CCITT checksum
 * Polynomial: 0x1021
 */
export function crc16(init: number, data: Uint8Array, len: number): number {
  let crc = init;

  for (let i = 0; i < len; i++) {
    crc ^= data[i] << 8;

    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc <<= 1;
      }
    }
  }

  return crc & 0xffff;
}

/**
 * Convert ArrayBuffer to string using TextDecoder
 */
export function arrayBufferToString(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
}
