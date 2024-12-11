import { AppReportAnswers } from "ai-worker-common/dist/type/app-report/AppReport";

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
  export function getValuesFromVariable(reports:AppReportAnswers[], reportName:string, fieldName:string) {
    // Find the report with the matching name
    const report = reports.find(report => report.name === reportName);
    
    // If no report is found, return undefined
    if (!report) return undefined;
    
    // Find the field with the matching name
    const field = report.fields.find(field => field.name === fieldName);
    
    // If no field is found, return undefined
    if (!field) return undefined;
    
    // Return the answer for the found field
    return field.answer;
  }