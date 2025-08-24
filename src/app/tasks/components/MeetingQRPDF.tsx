'use client';
import { useEffect } from 'react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

// Interface pour la configuration QR Code (doit correspondre à celle de MeetingForm.tsx)
interface QRConfig {
  backgroundColor?: string;
  foregroundColor?: string;
  size?: number;
  includeMargin?: boolean;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  includeText?: boolean;
  customText?: string;
  logoUrl?: string;
}

interface MeetingQRPDFProps {
  meetingId: number;
  meetingTitle: string;
  qrValue: string;
  qrConfig?: QRConfig;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  fileName?: string;
}

export const generateMeetingQRPDF = async ({
  meetingId,
  meetingTitle,
  qrValue,
  qrConfig,
  onSuccess,
  onError,
  fileName
}: MeetingQRPDFProps) => {
  try {
    const doc = new jsPDF();
    
    // Configuration par défaut si non fournie
    const config: QRConfig = {
      backgroundColor: qrConfig?.backgroundColor || '#FFFFFF',
      foregroundColor: qrConfig?.foregroundColor || '#000000',
      size: qrConfig?.size || 256,
      includeMargin: qrConfig?.includeMargin !== undefined ? qrConfig.includeMargin : true,
      errorCorrectionLevel: qrConfig?.errorCorrectionLevel || 'M',
      includeText: qrConfig?.includeText !== undefined ? qrConfig.includeText : true,
      customText: qrConfig?.customText || '',
      logoUrl: qrConfig?.logoUrl || ''
    };

    // Add meeting title
    doc.setFontSize(20);
    doc.text(meetingTitle, 105, 30, { align: 'center' });
    
    // Options pour la génération du QR Code basées sur la configuration
    const qrOptions = {
      width: config.size,
      margin: config.includeMargin ? 2 : 0,
      color: {
        dark: config.foregroundColor,
        light: config.backgroundColor
      },
      errorCorrectionLevel: config.errorCorrectionLevel
    };
    
    // Generate QR code as data URL avec les options de configuration
    const qrDataUrl = await QRCode.toDataURL(qrValue, qrOptions);
    
    // Calculer la taille d'affichage dans le PDF avec échelle progressive
    const actualSize = config.size || 256; // Valeur par défaut si undefined
    let displaySize;
    if (actualSize <= 128) {
      displaySize = actualSize; // Taille normale pour les petits QR codes
    } else if (actualSize <= 256) {
      displaySize = 150; // Légèrement réduit pour 256px
    } else if (actualSize <= 512) {
      displaySize = 180; // Réduit pour 512px
    } else {
      displaySize = 250; // Taille maximale pour les très grands QR codes (1024px)
    }
    
    // Centrer le QR code horizontalement
    const xPosition = 105 - (displaySize / 2);
    
    // Add QR code to PDF
    doc.addImage(qrDataUrl, 'PNG', xPosition, 50, displaySize, displaySize);
    
    // Add instruction text
    doc.setFontSize(12);
    doc.text('Scannez ce code pour accéder à la réunion', 105, 50 + displaySize + 20, { align: 'center' });
    
    // Ajouter le texte personnalisé si configuré
    if (config.includeText) {
      const displayText = config.customText || meetingTitle;
      doc.setFontSize(10);
      doc.text(displayText, 105, 50 + displaySize + 35, { align: 'center', maxWidth: 180 });
    }
    
    // Save PDF
    doc.save(fileName || `${meetingTitle}_Code_QR.pdf`);
    onSuccess?.();
  } catch (error) {
    console.error('Erreur génération PDF:', error);
    onError?.(error instanceof Error ? error : new Error('Échec de la génération du PDF'));
  }
};

export const MeetingQRPDF = ({
  meetingId,
  meetingTitle,
  qrValue,
  qrConfig,
  onSuccess,
  onError,
  fileName
}: MeetingQRPDFProps) => {
  useEffect(() => {
    generateMeetingQRPDF({
      meetingId,
      meetingTitle,
      qrValue,
      qrConfig,
      onSuccess,
      onError,
      fileName
    });
  }, []);

  return null;
};