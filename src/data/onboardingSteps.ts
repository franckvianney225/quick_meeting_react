import { TourStep } from '@/components/ui/OnboardingTour';

export const tasksOnboardingSteps: TourStep[] = [
  {
    target: '.user-profile-container',
    title: 'Bienvenue dans Quick Meeting !',
    content: 'Découvrez comment gérer vos réunions efficacement. Ce guide vous présentera les fonctionnalités principales.',
    position: 'bottom'
  },
  {
    target: '.stats-total-meetings',
    title: 'Vue d\'ensemble',
    content: 'Ici vous voyez le nombre total de vos réunions, celles en cours et celles terminées.',
    position: 'bottom'
  },
  {
    target: '.search-input',
    title: 'Recherche rapide',
    content: 'Trouvez facilement vos réunions par titre, description ou lieu grâce à la recherche.',
    position: 'bottom'
  },
  {
    target: '.status-filter',
    title: 'Filtrage par statut',
    content: 'Filtrez vos réunions par statut : toutes, en cours ou terminées.',
    position: 'bottom'
  },
  {
    target: '.new-meeting-btn',
    title: 'Créer une réunion',
    content: 'Cliquez ici pour créer une nouvelle réunion. Vous pourrez définir le titre, la date, le lieu et les participants.',
    position: 'left'
  },
  {
    target: '.meeting-list-container',
    title: 'Liste des réunions',
    content: 'Vos réunions s\'affichent ici. Vous pouvez les visualiser, les modifier ou les supprimer.',
    position: 'top'
  },
  {
    target: '.view-mode-toggle',
    title: 'Changer la vue',
    content: 'Basculer entre la vue grille et la vue liste selon vos préférences.',
    position: 'bottom'
  },
  {
    target: '.pagination-controls',
    title: 'Navigation',
    content: 'Parcourez vos réunions page par page lorsque vous en avez beaucoup.',
    position: 'top'
  }
];

export const meetingFormOnboardingSteps: TourStep[] = [
  {
    target: '.meeting-title-input',
    title: 'Titre de la réunion',
    content: 'Donnez un titre clair et descriptif à votre réunion.',
    position: 'right'
  },
  {
    target: '.meeting-description-input',
    title: 'Description',
    content: 'Ajoutez des détails importants sur l\'objectif de la réunion.',
    position: 'right'
  },
  {
    target: '.meeting-date-input',
    title: 'Date et heure',
    content: 'Définissez la date et l\'heure de votre réunion.',
    position: 'right'
  },
  {
    target: '.meeting-location-input',
    title: 'Lieu',
    content: 'Indiquez où se déroulera la réunion (salle, adresse, lien visio).',
    position: 'right'
  },
  {
    target: '.meeting-participants-input',
    title: 'Participants',
    content: 'Définissez le nombre maximum de participants attendus.',
    position: 'right'
  },
  {
    target: '.qr-code-tab',
    title: 'QR Code personnalisé',
    content: 'Personnalisez le QR Code pour votre réunion avec différentes couleurs et options.',
    position: 'bottom'
  },
  {
    target: '.save-meeting-btn',
    title: 'Sauvegarder',
    content: 'Enregistrez votre réunion une fois tous les détails saisis.',
    position: 'top'
  }
];

export const getOnboardingSteps = (page: string): TourStep[] => {
  switch (page) {
    case 'tasks':
      return tasksOnboardingSteps;
    case 'meeting-form':
      return meetingFormOnboardingSteps;
    default:
      return [];
  }
};