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
    
    // Fonction pour récupérer les paramètres d'organisation (similaire à MeetingQRPDF)
    const fetchOrganizationSettings = async (): Promise<{
      name: string;
      website: string;
      logo: string;
      allowedEmailDomains?: string[];
    } | null> => {
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

    // Récupérer les paramètres d'organisation
    const orgSettings = await fetchOrganizationSettings();
    
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
    const colWidths = [10, 25, 25, 40, 35, 25, 25, 25, 35]; // Largeurs des colonnes ajustées pour le paysage
    let xPos = 15;
    
    // Dessiner l'en-tête du tableau
    doc.setFillColor(...lightGray);
    doc.rect(10, yPos - 5, pageWidth - 20, 10, 'F');
    doc.setFontSize(6); // Taille de police réduite pour plus d'espace
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...secondaryColor);
    
    tableHeaders.forEach((header, index) => {
      doc.text(header, xPos + 2, yPos, { maxWidth: colWidths[index] - 4 });
      xPos += colWidths[index];
    });
    
    // Ligne de séparation
    doc.setDrawColor(...secondaryColor);
    doc.line(10, yPos + 2, pageWidth - 10, yPos + 2);
    
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
      
      xPos = 15;
      const rowHeight = 12;
      
      // Alternance de couleur pour les lignes
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(10, yPos - 4, pageWidth - 20, rowHeight, 'F');
      }
      
      // Numéro
      doc.text((index + 1).toString(), xPos + 2, yPos);
      xPos += colWidths[0];
      
      // Nom (en majuscules)
      doc.text(sanitizeValue(participant.lastName).toUpperCase(), xPos + 2, yPos, { maxWidth: colWidths[1] - 4 });
      xPos += colWidths[1];
      
      // Prénoms (d'abord comme dans l'interface utilisateur)
      doc.text(sanitizeValue(participant.firstName), xPos + 2, yPos, { maxWidth: colWidths[2] - 4 });
      xPos += colWidths[2];
      
      // Email
      doc.text(sanitizeValue(participant.email), xPos + 2, yPos, { maxWidth: colWidths[3] - 4 });
      xPos += colWidths[3];
      
      // Structure/Organisation
      doc.text(sanitizeValue(participant.organization), xPos + 2, yPos, { maxWidth: colWidths[4] - 4 });
      xPos += colWidths[4];
      
      // Fonction
      doc.text(sanitizeValue(participant.function), xPos + 2, yPos, { maxWidth: colWidths[5] - 4 });
      xPos += colWidths[5];
      
      // Contact
      doc.text(sanitizeValue(participant.phone), xPos + 2, yPos, { maxWidth: colWidths[6] - 4 });
      xPos += colWidths[6];
      
      // Date de signature (avec date et heure)
      doc.setFontSize(6);
      const signatureDate = participant.submittedAt ?
        new Date(participant.submittedAt).toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Non signé';
      doc.text(sanitizeValue(signatureDate), xPos + 2, yPos, { maxWidth: colWidths[7] - 4 });
      xPos += colWidths[7];
      
      // Case signature - afficher la signature si elle existe
      doc.rect(xPos, yPos - 4, colWidths[8], rowHeight);
      
      // Ajouter la signature si elle existe (format data URL)
      if (participant.signature) {
        try {
          // Réduire la taille de la signature pour qu'elle tienne dans la case
          const signatureWidth = colWidths[8] - 4;
          const signatureHeight = rowHeight - 4;
          doc.addImage(
            participant.signature,
            'PNG',
            xPos + 2,
            yPos - 2,
            signatureWidth,
            signatureHeight
          );
        } catch (error) {
          console.warn('Erreur chargement signature:', error);
          // En cas d'erreur, on laisse la case vide
        }
      }
      
      xPos += colWidths[8];
      
      // Ligne de séparation
      doc.setDrawColor(200, 200, 200);
      doc.line(10, yPos + 8, pageWidth - 10, yPos + 8);
      
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
      
      // Logo ou signature en bas à droite (optionnel)
      doc.setFont('helvetica', 'italic');
      doc.text(companyInfo.name, pageWidth - 15, pageHeight - 10, { align: 'right' });
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
