// Configuration for all logging types in the app
export interface LoggingTypeConfig {
  id: string;
  label: string;
  icon: string;
  category: 'baby' | 'moeder';
  fields: LoggingField[];
}

export interface LoggingField {
  id: string;
  type: 'text' | 'number' | 'select' | 'radio' | 'time' | 'duration' | 'checkbox';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export const LOGGING_TYPES: LoggingTypeConfig[] = [
  // Baby logging types
  {
    id: 'temperature',
    label: 'Temperatuur',
    icon: '🌡️',
    category: 'baby',
    fields: [
      {
        id: 'value',
        type: 'number',
        label: 'Temperatuur',
        placeholder: '36.5',
        required: true,
        min: 30,
        max: 45,
        step: 0.1,
        unit: '°C'
      },
      {
        id: 'notes',
        type: 'text',
        label: 'Notities',
        placeholder: 'Eventuele opmerkingen...'
      }
    ]
  },
  {
    id: 'feeding',
    label: 'Voeding',
    icon: '🍼',
    category: 'baby',
    fields: [
      {
        id: 'feedingType',
        type: 'radio',
        label: 'Type voeding',
        required: true,
        options: [
          { value: 'bottle', label: 'Fles' },
          { value: 'breast_left', label: 'Linker borst' },
          { value: 'breast_right', label: 'Rechter borst' },
          { value: 'breast_both', label: 'Beide borsten' }
        ]
      },
      {
        id: 'amount',
        type: 'number',
        label: 'Hoeveelheid (ml)',
        placeholder: '120',
        min: 1,
        max: 500,
        unit: 'ml'
      },
      {
        id: 'notes',
        type: 'text',
        label: 'Notities',
        placeholder: 'Eventuele opmerkingen...'
      }
    ]
  },
  {
    id: 'sleep',
    label: 'Slaap',
    icon: '😴',
    category: 'baby',
    fields: [
      {
        id: 'duration',
        type: 'duration',
        label: 'Duur',
        required: true,
        placeholder: 'Uren en minuten'
      },
      {
        id: 'notes',
        type: 'text',
        label: 'Notities',
        placeholder: 'Eventuele opmerkingen...'
      }
    ]
  },
  {
    id: 'diaper',
    label: 'Luier',
    icon: '👶',
    category: 'baby',
    fields: [
      {
        id: 'diaperType',
        type: 'radio',
        label: 'Type',
        required: true,
        options: [
          { value: 'wet', label: 'Nat' },
          { value: 'dirty', label: 'Vies' },
          { value: 'both', label: 'Nat en vies' }
        ]
      },
      {
        id: 'diaperAmount',
        type: 'radio',
        label: 'Hoeveelheid',
        required: true,
        options: [
          { value: 'little', label: 'Weinig' },
          { value: 'medium', label: 'Normaal' },
          { value: 'much', label: 'Veel' }
        ]
      },
      {
        id: 'notes',
        type: 'text',
        label: 'Notities',
        placeholder: 'Eventuele opmerkingen...'
      }
    ]
  },
  {
    id: 'weight',
    label: 'Gewicht',
    icon: '⚖️',
    category: 'baby',
    fields: [
      {
        id: 'weight',
        type: 'number',
        label: 'Gewicht',
        placeholder: '3500',
        required: true,
        min: 500,
        max: 8000,
        step: 1,
        unit: 'gram'
      },
      {
        id: 'notes',
        type: 'text',
        label: 'Notities',
        placeholder: 'Eventuele opmerkingen...'
      }
    ]
  },
  {
    id: 'jaundice',
    label: 'Geelzucht',
    icon: '💛',
    category: 'baby',
    fields: [
      {
        id: 'jaundiceLevel',
        type: 'radio',
        label: 'Niveau',
        required: true,
        options: [
          { value: '1', label: '1 - Licht' },
          { value: '2', label: '2 - Matig' },
          { value: '3', label: '3 - Duidelijk' },
          { value: '4', label: '4 - Ernstig' },
          { value: '5', label: '5 - Zeer ernstig' }
        ]
      },
      {
        id: 'notes',
        type: 'text',
        label: 'Notities',
        placeholder: 'Eventuele opmerkingen...'
      }
    ]
  },
  {
    id: 'pumping',
    label: 'Kolven',
    icon: '🤱',
    category: 'baby',
    fields: [
      {
        id: 'breastSide',
        type: 'radio',
        label: 'Borst',
        required: true,
        options: [
          { value: 'left', label: 'Links' },
          { value: 'right', label: 'Rechts' },
          { value: 'both', label: 'Beide' }
        ]
      },
      {
        id: 'amount',
        type: 'number',
        label: 'Hoeveelheid (ml)',
        placeholder: '80',
        min: 1,
        max: 500,
        unit: 'ml'
      },
      {
        id: 'notes',
        type: 'text',
        label: 'Notities',
        placeholder: 'Eventuele opmerkingen...'
      }
    ]
  },
  {
    id: 'note',
    label: 'Notitie',
    icon: '📝',
    category: 'baby',
    fields: [
      {
        id: 'noteCategory',
        type: 'radio',
        label: 'Categorie',
        required: true,
        options: [
          { value: 'general', label: 'Algemeen' },
          { value: 'question', label: 'Vraag' },
          { value: 'todo', label: 'Te doen' }
        ]
      },
      {
        id: 'notes',
        type: 'text',
        label: 'Notitie',
        placeholder: 'Typ hier uw notitie...',
        required: true
      }
    ]
  },

  // Mother logging types
  {
    id: 'mother_temperature',
    label: 'Temperatuur',
    icon: '🌡️',
    category: 'moeder',
    fields: [
      {
        id: 'value',
        type: 'number',
        label: 'Temperatuur',
        placeholder: '36.5',
        required: true,
        min: 30,
        max: 45,
        step: 0.1,
        unit: '°C'
      },
      {
        id: 'notes',
        type: 'text',
        label: 'Notities',
        placeholder: 'Eventuele opmerkingen...'
      }
    ]
  },
  {
    id: 'blood_pressure',
    label: 'Bloeddruk',
    icon: '💗',
    category: 'moeder',
    fields: [
      {
        id: 'systolic',
        type: 'number',
        label: 'Systolisch',
        placeholder: '120',
        required: true,
        min: 60,
        max: 250,
        unit: 'mmHg'
      },
      {
        id: 'diastolic',
        type: 'number',
        label: 'Diastolisch',
        placeholder: '80',
        required: true,
        min: 40,
        max: 150,
        unit: 'mmHg'
      },
      {
        id: 'notes',
        type: 'text',
        label: 'Notities',
        placeholder: 'Eventuele opmerkingen...'
      }
    ]
  },
  {
    id: 'mood',
    label: 'Stemming',
    icon: '😊',
    category: 'moeder',
    fields: [
      {
        id: 'mood',
        type: 'radio',
        label: 'Stemming',
        required: true,
        options: [
          { value: 'excellent', label: 'Uitstekend' },
          { value: 'good', label: 'Goed' },
          { value: 'okay', label: 'Oké' },
          { value: 'low', label: 'Laag' },
          { value: 'very_low', label: 'Zeer laag' }
        ]
      },
      {
        id: 'notes',
        type: 'text',
        label: 'Notities',
        placeholder: 'Eventuele opmerkingen...'
      }
    ]
  },
  {
    id: 'pain',
    label: 'Pijn',
    icon: '😣',
    category: 'moeder',
    fields: [
      {
        id: 'painLevel',
        type: 'radio',
        label: 'Pijnniveau (1-10)',
        required: true,
        options: [
          { value: '1', label: '1 - Geen pijn' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4', label: '4' },
          { value: '5', label: '5' },
          { value: '6', label: '6' },
          { value: '7', label: '7' },
          { value: '8', label: '8' },
          { value: '9', label: '9' },
          { value: '10', label: '10 - Ondraaglijke pijn' }
        ]
      },
      {
        id: 'notes',
        type: 'text',
        label: 'Notities',
        placeholder: 'Eventuele opmerkingen...'
      }
    ]
  },
  {
    id: 'mother_note',
    label: 'Notitie',
    icon: '📝',
    category: 'moeder',
    fields: [
      {
        id: 'notes',
        type: 'text',
        label: 'Notitie',
        placeholder: 'Typ hier uw notitie...',
        required: true
      }
    ]
  }
];

// Helper functions
export const getBabyLoggingTypes = () => LOGGING_TYPES.filter(type => type.category === 'baby');
export const getMotherLoggingTypes = () => LOGGING_TYPES.filter(type => type.category === 'moeder');
export const getLoggingTypeById = (id: string) => LOGGING_TYPES.find(type => type.id === id);