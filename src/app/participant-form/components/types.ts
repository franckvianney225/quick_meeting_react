export interface LegalStepProps {
  onAgree: () => void;
  onDisagree: () => void;
}

export interface ExistingParticipant {
  email: string;
  name: string;
  prenom: string;
  phone: string;
  fonction: string;
  organisation: string;
  signature: string;
}

export interface EmailStepProps {
  email: string;
  onChange: (email: string) => void;
  onNext: (existingParticipant?: ExistingParticipant, isAlreadyRegistered?: boolean) => void;
  onBack: () => void;
}

export interface FormStepProps {
  formData: Pick<FormData, 'firstName' | 'lastName' | 'company' | 'position'>;
  onChange: (data: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export interface SignatureStepProps {
  signature: FormData['signature'];
  onChange: (value: FormData['signature']) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export interface ValidationStepProps {
  firstName: string;
  lastName: string;
  onBack: () => void;
}

export interface BaseFormData {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  position: string;
  phone: string;
  signature: string;
  agreedToTerms: boolean;
  location?: string;
}

export interface FormData extends BaseFormData {
  meetingId?: string;
  code?: string;
}