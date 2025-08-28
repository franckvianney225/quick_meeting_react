'use client';
import { jsPDF } from 'jspdf';
import { useEffect, forwardRef, useImperativeHandle } from 'react';
import { createRoot } from 'react-dom/client';
import { apiUrl } from '@/lib/api';
import { AuthService } from '@/lib/auth';

interface Participant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  function: string;
  organization: string;
  submittedAt?: string | null;
  signatureDate?: string | null;
  createdAt?: string | null;
  registeredAt?: string | null;
  location?: string | null;
  signature?: string;
}

interface AttendanceListPDFProps {
  meetingTitle: string;
  meetingDate?: string;
  meetingLocation?: string;
  participants: Participant[];
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
  onClose: () => void;
}

const AttendanceListPDF = forwardRef(({
  meetingTitle,
  meetingDate,
  meetingLocation,
  participants,
  companyInfo = {
    name: "Ministère de l'Intérieur",
    address: "Plateau, Abidjan, Côte d'Ivoire",
    phone: "+225 XX XX XX XX",
    email: "contact@ministere.gouv.ci",
    website: "www.ministere.gouv.ci"
  },
  onClose
}: AttendanceListPDFProps, ref) => {
  const generatePDF = async () => {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Couleurs
    const primaryColor: [number, number, number] = [41, 128, 185]; // Bleu
    const secondaryColor: [number, number, number] = [52, 73, 94]; // Gris foncé
    const lightGray: [number, number, number] = [236, 240, 241]; // Gris clair
    
    // Fonction pour récupérer les paramètres complets de l'organisation
    const fetchOrganizationSettings = async (): Promise<{
      name: string;
      address: string;
      phone: string;
      email: string;
      website: string;
      logo: string;
      allowedEmailDomains?: string[];
    } | null> => {
      try {
        const response = await fetch(apiUrl('/organization'), {
          headers: AuthService.getAuthHeaders()
        });
        if (response.ok) {
          const data = await response.json();
          return {
            name: data.name || "Ministère de l'Intérieur",
            address: data.address || "Plateau, Abidjan, Côte d'Ivoire",
            phone: data.phone || "+225 XX XX XX XX",
            email: data.email || "contact@ministere.gouv.ci",
            website: data.website || "www.ministere.gouv.ci",
            logo: data.logo,
            allowedEmailDomains: data.allowedEmailDomains
          };
        }
        return null;
      } catch (error) {
        console.error('Erreur récupération paramètres organisation:', error);
        return null;
      }
    };

    // Récupérer les paramètres d'organisation
    const orgSettings = await fetchOrganizationSettings();
    
    // Utiliser les informations de l'organisation si disponibles, sinon utiliser les props ou valeurs par défaut
    const organizationInfo = orgSettings ? {
      name: orgSettings.name,
      address: orgSettings.address,
      phone: orgSettings.phone,
      email: orgSettings.email,
      website: orgSettings.website
    } : companyInfo;
    
    // Header - Logo à gauche et texte République de Côte d'Ivoire à droite
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    
    // Logo de l'organisation à gauche (si disponible)
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
    doc.text('RÉPUBLIQUE DE CÔTE D\'IVOIRE', pageWidth - 15, 15, { align: 'right' });
    doc.setFontSize(10);
    
    // Calculer la largeur du texte "RÉPUBLIQUE DE CÔTE D'IVOIRE" pour centrer le texte du dessous
    doc.setFontSize(12);
    const republicTextWidth = doc.getTextWidth('RÉPUBLIQUE DE CÔTE D\'IVOIRE');
    const centerX = pageWidth - 15 - (republicTextWidth / 2);
    
    doc.setFontSize(10);
    doc.text('UNION - DISCIPLINE - TRAVAIL', centerX, 22, { align: 'center' });
    
    // Retour au noir pour le reste
    doc.setTextColor(0, 0, 0);
    
    // Titre principal
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('LISTE DE PRÉSENCE', pageWidth / 2, 40, { align: 'center' });
    
    // Nom de la réunion
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(meetingTitle, pageWidth / 2, 50, { align: 'center' });
    
    // Informations de la réunion
    let yPos = 65;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Date
    if (meetingDate) {
      doc.setFont('helvetica', 'bold');
      doc.text('DATE :', 15, yPos);
      doc.setFont('helvetica', 'normal');
      const date = meetingDate ? new Date(meetingDate) : new Date();
      doc.text(date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }), 35, yPos);
      yPos += 8;
    }
    
    // Localisation
    if (meetingLocation) {
      doc.setFont('helvetica', 'bold');
      doc.text('LOCALISATION :', 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(meetingLocation, 50, yPos);
      yPos += 8;
    }
    
    // Nombre de participants
    doc.setFont('helvetica', 'bold');
    doc.text('Nombre de participants :', 15, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(participants.length.toString(), 70, yPos);
    yPos += 15;
    
    // En-tête du tableau (ordre modifié pour correspondre à l'affichage)
    const tableHeaders = ['N°', 'NOM', 'PRÉNOMS', 'EMAIL', 'STRUCTURE', 'FONCTION', 'CONTACT', 'DATE DE SIGNATURE', 'SIGNATURE'];
    
    // Calculer la largeur totale disponible (pageWidth - 10 de marge de chaque côté)
    const totalAvailableWidth = pageWidth - 20;
    
    // Largeurs des colonnes proportionnelles pour utiliser tout l'espace
    const colWidths = [15, 30, 30, 45, 40, 30, 30, 40, 40];
    
    // Ajuster pour utiliser exactement toute la largeur disponible
    const totalColWidth = colWidths.reduce((sum, width) => sum + width, 0);
    const scaleFactor = totalAvailableWidth / totalColWidth;
    const adjustedColWidths = colWidths.map(width => Math.floor(width * scaleFactor));
    
    let xPos = 10; // Commencer à la marge gauche
    
    // Dessiner l'en-tête du tableau - utiliser toute la largeur de la page
    doc.setFillColor(...lightGray);
    doc.rect(5, yPos - 5, pageWidth - 10, 10, 'F'); // Étendre sur toute la largeur
    doc.setFontSize(7); // Taille de police légèrement augmentée
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    
    tableHeaders.forEach((header, index) => {
      doc.text(header, xPos + 3, yPos, { maxWidth: adjustedColWidths[index] - 6 });
      xPos += adjustedColWidths[index];
    });
    
    // Ligne de séparation - utiliser toute la largeur
    doc.setDrawColor(...secondaryColor);
    doc.line(5, yPos + 2, pageWidth - 5, yPos + 2);
    
    yPos += 12;
    
    // Fonction utilitaire pour assainir les valeurs (éviter null/undefined)
    const sanitizeValue = (value: string | number | null | undefined): string => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return value;
      return String(value);
    };

    // Log des données pour débogage
    console.log('Participants data:', participants);
    
    // Données du tableau
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7); // Taille de police réduite pour les données
    
    participants.forEach((participant, index) => {
      console.log(`Participant ${index + 1} debug:`, {
        firstName: participant.firstName,
        lastName: participant.lastName,
        email: participant.email,
        phone: participant.phone,
        function: participant.function,
        organization: participant.organization,
        signature: participant.signature,
        submittedAt: participant.submittedAt
      });
      // Vérifier si on a besoin d'une nouvelle page
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }
      
      xPos = 10; // Commencer plus à gauche
      const rowHeight = 14; // Hauteur de ligne augmentée pour meilleure lisibilité
      
      // Alternance de couleur pour les lignes - utiliser toute la largeur
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(5, yPos - 4, pageWidth - 10, rowHeight, 'F'); // Étendre sur toute la largeur
      }
      
      // Numéro
      doc.text((index + 1).toString(), xPos + 3, yPos);
      xPos += adjustedColWidths[0];
      
      // Prénoms (d'abord comme dans l'interface utilisateur)
      doc.text(sanitizeValue(participant.firstName).toUpperCase(), xPos + 3, yPos, { maxWidth: adjustedColWidths[1] - 6 });
      xPos += adjustedColWidths[1];
      
      // Nom (en majuscules)
      doc.text(sanitizeValue(participant.lastName), xPos + 3, yPos, { maxWidth: adjustedColWidths[2] - 6 });
      xPos += adjustedColWidths[2];
      
      // Email
      doc.text(sanitizeValue(participant.email), xPos + 3, yPos, { maxWidth: adjustedColWidths[3] - 6 });
      xPos += adjustedColWidths[3];
      
      // Structure/Organisation
      doc.text(sanitizeValue(participant.organization), xPos + 3, yPos, { maxWidth: adjustedColWidths[4] - 6 });
      xPos += adjustedColWidths[4];
      
      // Fonction
      doc.text(sanitizeValue(participant.function), xPos + 3, yPos, { maxWidth: adjustedColWidths[5] - 6 });
      xPos += adjustedColWidths[5];
      
      // Contact
      doc.text(sanitizeValue(participant.phone), xPos + 3, yPos, { maxWidth: adjustedColWidths[6] - 6 });
      xPos += adjustedColWidths[6];
      
      // Date de signature (avec date et heure)
      doc.setFontSize(7); // Police légèrement plus grande
      const signatureDate = participant.submittedAt ?
        new Date(participant.submittedAt).toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Non signé';
      doc.text(sanitizeValue(signatureDate), xPos + 3, yPos, { maxWidth: adjustedColWidths[7] - 6 });
      xPos += adjustedColWidths[7];
      
      // Case signature - afficher la signature si elle existe
      doc.rect(xPos + 1, yPos - 4, adjustedColWidths[8] - 2, rowHeight);
      
      // Ajouter la signature si elle existe (format data URL)
      if (participant.signature) {
        try {
          // Meilleur placement de la signature dans la case
          const signatureWidth = adjustedColWidths[8] - 6;
          const signatureHeight = rowHeight - 6;
          doc.addImage(
            participant.signature,
            'PNG',
            xPos + 3,
            yPos - 1,
            signatureWidth,
            signatureHeight
          );
        } catch (error) {
          console.warn('Erreur chargement signature:', error);
          // En cas d'erreur, on laisse la case vide
        }
      }
      
      xPos += adjustedColWidths[8];
      
      // Ligne de séparation - utiliser toute la largeur
      doc.setDrawColor(200, 200, 200);
      doc.line(5, yPos + 10, pageWidth - 5, yPos + 10);
      
      yPos += rowHeight;
    });
    
    // Pied de page
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const totalPages = doc.internal.pages.length - 1;
    
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Ligne de séparation du pied de page
      doc.setDrawColor(...primaryColor);
      doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
      
      // Informations du pied de page
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...secondaryColor);
      
      doc.text(`Généré le ${currentDate}`, 15, pageHeight - 15);
      doc.text(`Page ${i} / ${totalPages}`, pageWidth - 15, pageHeight - 15, { align: 'right' });
      
      // Informations de l'organisation en bas à droite
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.text(organizationInfo.name, pageWidth - 15, pageHeight - 15, { align: 'right' });
      doc.text(organizationInfo.address, pageWidth - 15, pageHeight - 12, { align: 'right' });
      doc.text(`${organizationInfo.phone} • ${organizationInfo.email}`, pageWidth - 15, pageHeight - 9, { align: 'right' });
      doc.text(organizationInfo.website, pageWidth - 15, pageHeight - 6, { align: 'right' });
    }
    
    // Sauvegarder le PDF
    const fileName = `Liste_de_presence_${meetingTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    doc.save(fileName);
    onClose();
  };

  // Utilisation de useEffect pour générer le PDF après le rendu
  useEffect(() => {
    const generatePDFAsync = async () => {
      try {
        await generatePDF();
      } catch (error) {
        console.error('Erreur génération PDF:', error);
        onClose();
      }
    };
    
    generatePDFAsync();
  }, []);

  return null;
});

AttendanceListPDF.displayName = 'AttendanceListPDF';

export default AttendanceListPDF;

export function generateAttendancePDF(props: AttendanceListPDFProps) {
  const pdfContainer = document.createElement('div');
  pdfContainer.style.display = 'none';
  document.body.appendChild(pdfContainer);
  
  const root = createRoot(pdfContainer);
  root.render(
    <AttendanceListPDF
      {...props}
      onClose={() => {
        setTimeout(() => {
          root.unmount();
          document.body.removeChild(pdfContainer);
        }, 0);
      }}
    />
  );
}
