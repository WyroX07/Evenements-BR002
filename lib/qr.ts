import QRCode from 'qrcode'

/**
 * Génère un code QR au format Data URL (PNG base64)
 * @param text Texte à encoder dans le QR
 * @returns Data URL du QR code
 */
export async function generateQRCode(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
    return dataUrl
  } catch (error) {
    console.error('Erreur lors de la génération du QR code:', error)
    throw new Error('Impossible de générer le QR code')
  }
}

/**
 * Génère un QR code au format buffer PNG
 * @param text Texte à encoder
 * @returns Buffer du PNG
 */
export async function generateQRBuffer(text: string): Promise<Buffer> {
  try {
    const buffer = await QRCode.toBuffer(text, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 300,
    })
    return buffer
  } catch (error) {
    console.error('Erreur lors de la génération du QR buffer:', error)
    throw new Error('Impossible de générer le QR code')
  }
}
