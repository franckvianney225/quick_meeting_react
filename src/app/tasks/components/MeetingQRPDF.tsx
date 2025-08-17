'use client';
import { useEffect } from 'react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

interface MeetingQRPDFProps {
  meetingId: number;
  meetingTitle: string;
  qrValue: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  fileName?: string;
}

export const generateMeetingQRPDF = async ({
  meetingId,
  meetingTitle,
  qrValue,
  onSuccess,
  onError,
  fileName
}: MeetingQRPDFProps) => {
  try {
    const doc = new jsPDF();
    
    // Add meeting title
    doc.setFontSize(20);
    doc.text(meetingTitle, 105, 30, { align: 'center' });
    
    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(qrValue, {
      width: 200,
      margin: 2
    });
    
    // Add QR code to PDF
    doc.addImage(qrDataUrl, 'PNG', 55, 50, 100, 100);
    
    // Add instruction text
    doc.setFontSize(12);
    doc.text('Scannez ce code pour accéder à la réunion', 105, 160, { align: 'center' });
    
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
  onSuccess,
  onError,
  fileName
}: MeetingQRPDFProps) => {
  useEffect(() => {
    generateMeetingQRPDF({
      meetingId,
      meetingTitle,
      qrValue,
      onSuccess,
      onError,
      fileName
    });
  }, []);

  return null;
};