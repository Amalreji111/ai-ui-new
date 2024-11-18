export const getQueryParamAsNumber = (paramName: string, defaultValue: number): number => {
    if (typeof window === 'undefined') return defaultValue;
    const params = new URLSearchParams(window.location.search);
    const value = params.get(paramName);
    return value ? parseInt(value, 10) : defaultValue;
  };