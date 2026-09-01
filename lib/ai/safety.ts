export function sanitizePrompt(prompt: string): string {
  if (!prompt || typeof prompt !== 'string') return '';
  return prompt.trim();
}

export function validateDateRange(startDate?: string, endDate?: string) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  const isStartValid = startDate ? dateRegex.test(startDate) : false;
  const isEndValid = endDate ? dateRegex.test(endDate) : false;

  // Jika tidak ada tanggal yang diberikan, gunakan default atau izinkan validasi fleksibel
  const today = new Date().toISOString().split('T')[0];

  return {
    valid: true,
    startDate: isStartValid ? startDate : today,
    endDate: isEndValid ? endDate : today,
  };
}