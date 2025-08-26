'use client';
import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { apiUrl } from '@/lib/api';
import { AuthService } from '@/lib/auth';

// Interface pour les paramètres d'organisation
interface OrganizationSettings {
  name: string;
  website: string;
  logo: string;
  allowedEmailDomains?: string[];
}

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

// Fonction pour récupérer les paramètres d'organisation
const fetchOrganizationSettings = async (): Promise<OrganizationSettings | null> => {
  try {
    const response = await fetch(apiUrl('/organization'), {
      headers: AuthService.getAuthHeaders()
    });
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Erreur récupération paramètres organisation:', error);
    return null;
  }
};

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
    
    // Récupérer les paramètres d'organisation
    const orgSettings = await fetchOrganizationSettings();
    
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

    // Header - Logo à gauche et texte République de Côte d'Ivoire à droite
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    
    // Logo de l'organisation à gauche (si disponible) - taille libre
    if (orgSettings?.logo) {
      try {
        // Charger l'image pour obtenir ses dimensions naturelles
        const img = new Image();
        img.src = orgSettings.logo;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // Continuer même en cas d'erreur
        });
        
        if (img.width && img.height) {
          // Calculer la hauteur proportionnelle pour une largeur max de 40px
          const maxWidth = 40;
          const ratio = img.width / img.height;
          const displayWidth = Math.min(maxWidth, img.width);
          const displayHeight = displayWidth / ratio;
          
          doc.addImage(orgSettings.logo, 'PNG', 15, 10, displayWidth, displayHeight);
        } else {
          // Fallback si impossible de détecter les dimensions
          doc.addImage(orgSettings.logo, 'PNG', 15, 10, 30, 30);
        }
      } catch (error) {
        console.warn('Erreur chargement logo organisation:', error);
        // Fallback en cas d'erreur
        if (orgSettings.logo) {
          doc.addImage(orgSettings.logo, 'PNG', 15, 10, 30, 30);
        }
      }
    }
    
    // Texte République de Côte d'Ivoire à l'extrême droite
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('RÉPUBLIQUE DE CÔTE D\'IVOIRE', 195, 15, { align: 'right' });
    doc.setFontSize(10);
    
    // Calculer la largeur du texte "RÉPUBLIQUE DE CÔTE D'IVOIRE" pour centrer le texte du dessous
    doc.setFontSize(12);
    const republicTextWidth = doc.getTextWidth('RÉPUBLIQUE DE CÔTE D\'IVOIRE');
    const centerX = 195 - (republicTextWidth / 2);
    
    doc.setFontSize(10);
    doc.text('UNION - DISCIPLINE - TRAVAIL', centerX, 22, { align: 'center' });
    
    // Titre de la réunion - affichage complet sur plusieurs lignes si nécessaire, en orange et souligné
    doc.setFontSize(20);
    doc.setTextColor(255, 102, 0); // Couleur orange (#FF6600)
    
    // Découper le titre en lignes pour qu'il tienne dans la largeur du PDF
    const maxWidth = 180; // Largeur maximale pour le titre
    const titleLines = doc.splitTextToSize(meetingTitle, maxWidth);
    
    // Position Y de départ pour le titre
    let titleY = 50;
    
    // Afficher chaque ligne du titre
    titleLines.forEach((line: string, index: number) => {
      const currentY = titleY + (index * 8); // Espacement de 8 unités entre les lignes
      doc.text(line, 105, currentY, { align: 'center' });
      
      // Souligner chaque ligne en orange
      const lineWidth = doc.getTextWidth(line);
      doc.setDrawColor(255, 102, 0); // Couleur orange pour la ligne
      doc.line(105 - (lineWidth / 2), currentY + 1, 105 + (lineWidth / 2), currentY + 1);
    });
    
    doc.setDrawColor(0, 0, 0); // Réinitialiser la couleur de dessin
    
    // Ajuster la position du QR code selon le nombre de lignes du titre
    const qrYPosition = titleY + (titleLines.length * 8) + 15;
    
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
    
    // Options pour la génération du QR Code - générer directement à la taille d'affichage finale
    const qrOptions = {
      width: displaySize, // Générer à la taille d'affichage finale pour meilleure netteté
      margin: config.includeMargin ? 2 : 0,
      color: {
        dark: config.foregroundColor,
        light: config.backgroundColor
      },
      errorCorrectionLevel: config.errorCorrectionLevel
    };
    
    // Generate QR code as data URL avec les options de configuration
    const qrDataUrl = await QRCode.toDataURL(qrValue, qrOptions);
    
    // Centrer le QR code horizontalement
    const xPosition = 105 - (displaySize / 2);
    
    // Add QR code to PDF - utiliser la même taille que la génération pour éviter le redimensionnement
    doc.addImage(qrDataUrl, 'PNG', xPosition, qrYPosition, displaySize, displaySize);
    
    // Add instruction text
    doc.setFontSize(12);
    doc.text('Scannez ce code pour accéder à la réunion', 105, qrYPosition + displaySize + 20, { align: 'center' });
    
    // Ajouter le texte personnalisé si configuré

    
    // Footer - Ligne horizontale et nom de l'organisation centré
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 270, 195, 270);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    if (orgSettings?.name) {
      doc.text(orgSettings.name, 105, 280, { align: 'center' });
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