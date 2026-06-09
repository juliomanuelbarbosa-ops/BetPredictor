export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AppError {
  code: string;
  message: string;
  severity: Severity;
  recoverable: boolean;
  suggestedAction: string;
  context: Record<string, any>;
}

export const handleError = (error: unknown, severity: Severity = 'MEDIUM', context: Record<string, any> = {}): AppError => {
  const appError: AppError = {
    code: 'UNKNOWN_ERROR',
    message: error instanceof Error ? error.message : String(error),
    severity,
    recoverable: severity !== 'CRITICAL',
    suggestedAction: 'Please try again or contact support if the issue persists.',
    context,
  };

  console.error('App Error:', appError);
  // In a real app, log to Firestore or an error tracking service here
  return appError;
};
