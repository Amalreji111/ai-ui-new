export const getQueryParamAsNumber = (paramName: string, defaultValue: number): number => {
    if (typeof window === 'undefined') return defaultValue;
    const params = new URLSearchParams(window.location.search);
    const value = params.get(paramName);
    return value ? parseInt(value, 10) : defaultValue;
  };

  export const getQueryParam = (paramName: string, defaultValue: string): string => {
    if (typeof window === 'undefined') return defaultValue;
    const params = new URLSearchParams(window.location.search);
    const value = params.get(paramName);
    return value ? value: defaultValue;
  };

  export const convertToBoolean = (value: string): boolean => {
    if(typeof value === 'boolean') return value;
    return value.toLowerCase() === 'true';
  }