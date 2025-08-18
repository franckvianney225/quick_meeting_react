export interface LegalStepProps {
  onAgree: () => void;
  onDisagree: () => void;
}

export interface EmailStepProps {
  email: string;
  onChange: (email: string) => void;
  onNext: () => void;
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

export interface BaseFormData {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  position: string;
  signature: string;
  agreedToTerms: boolean;
}

export interface FormData extends BaseFormData {
  meetingId?: string;
  code?: string;
}