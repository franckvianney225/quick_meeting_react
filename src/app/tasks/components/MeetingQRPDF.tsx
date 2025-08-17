'use client';
import { useEffect } from 'react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

interface MeetingQRPDFProps {
  meetingTitle: string;
  qrValue: string;
  onClose: () => void;
  fileName?: string;
}

export const MeetingQRPDF = ({ meetingTitle, qrValue, onClose, fileName }: MeetingQRPDFProps) => {
  useEffect(() => {
    const generatePDF = async () => {
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
      onClose();
    };

    generatePDF();
  }, []);

  return null;
};