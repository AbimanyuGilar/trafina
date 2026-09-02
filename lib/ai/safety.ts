export function sanitizePrompt(prompt: string): string {
  if (!prompt || typeof prompt !== 'string') return '';
  return prompt.trim();
}

export function validateDateRange(startDate?: string, endDate?: string) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  const isStartValid = startDate ? dateRegex.test(startDate) : false;
  const isEndValid = endDate ? dateRegex.test(endDate) : false;

  const valid = (!startDate || isStartValid) && (!endDate || isEndValid);

  return {
    valid,
    startDate: isStartValid ? startDate : undefined,
    endDate: isEndValid ? endDate : undefined,
  };
}