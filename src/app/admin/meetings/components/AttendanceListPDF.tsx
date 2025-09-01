'use client';
import { jsPDF } from 'jspdf';
import { useEffect, forwardRef, useImperativeHandle } from 'react';
import { createRoot } from 'react-dom/client';

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
    name: "Ministère de l'a Transition Numérique et de la digitalisation",
    address: "Plateau, Abidjan, Côte d'Ivoire",
    phone: "+225 XX XX XX XX",
    email: "contact@ministere.gouv.ci",
    website: "www.ministere.gouv.ci"
  },
  onClose
}: AttendanceListPDFProps, ref) => {
  const generatePDF = () => {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Couleurs
    const primaryColor: [number, number, number] = [41, 128, 185]; // Bleu
    const secondaryColor: [number, number, number] = [52, 73, 94]; // Gris foncé
    const lightGray: [number, number, number] = [236, 240, 241]; // Gris clair
    
    // En-tête de l'entreprise
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 25, 'F');
    
    // Logo (remplacé par texte temporairement)
    doc.setFontSize(12);
    doc.text(companyInfo.name, 15, 12);
    
    // Nom de l'entreprise (en blanc)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(companyInfo.name, 50, 12);
    
    // Informations de contact (en blanc, plus petit)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(companyInfo.address, 15, 18);
    doc.text(`${companyInfo.phone} | ${companyInfo.email} | ${companyInfo.website}`, 15, 22);
    
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
    const tableHeaders = ['N°', 'NOM', 'PRÉNOMS', 'EMAIL', 'STRUCTURE', 'FONCTION', 'CONTACT', 'SIGNATURE', 'DATE DE SIGNATURE'];
    const colWidths = [10, 25, 25, 40, 35, 25, 25, 35, 25]; // Largeurs des colonnes ajustées pour le paysage
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
    
    // Données du tableau
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7); // Taille de police réduite pour les données
    
    participants.forEach((participant, index) => {
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
      
      // Prénoms (d'abord comme dans l'interface utilisateur)
      doc.text(participant.firstName, xPos + 2, yPos, { maxWidth: colWidths[1] - 4 });
      xPos += colWidths[1];
      
      // Nom (en majuscules)
      doc.text(participant.lastName.toUpperCase(), xPos + 2, yPos, { maxWidth: colWidths[2] - 4 });
      xPos += colWidths[2];
      
      // Email
      doc.text(participant.email, xPos + 2, yPos, { maxWidth: colWidths[3] - 4 });
      xPos += colWidths[3];
      
      // Structure/Organisation
      doc.text(participant.organization, xPos + 2, yPos, { maxWidth: colWidths[4] - 4 });
      xPos += colWidths[4];
      
      // Fonction
      doc.text(participant.function, xPos + 2, yPos, { maxWidth: colWidths[5] - 4 });
      xPos += colWidths[5];
      
      // Contact
      doc.text(participant.phone, xPos + 2, yPos, { maxWidth: colWidths[6] - 4 });
      xPos += colWidths[6];
      
      // Case signature - afficher la signature si elle existe
      doc.rect(xPos, yPos - 4, colWidths[7], rowHeight);
      
      // Ajouter la signature si elle existe (format data URL)
      if (participant.signature) {
        try {
          // Réduire la taille de la signature pour qu'elle tienne dans la case
          const signatureWidth = colWidths[7] - 4;
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
      
      xPos += colWidths[7];
      
      // Date de signature
      doc.setFontSize(6);
      const signatureDate = participant.submittedAt ? new Date(participant.submittedAt).toLocaleDateString('fr-FR') : 'Non signé';
      doc.text(signatureDate, xPos + 2, yPos, { maxWidth: colWidths[8] - 4 });
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
    try {
      generatePDF();
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      onClose();
    }
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
