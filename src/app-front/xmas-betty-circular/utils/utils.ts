import { AppReportAnswers } from "ai-worker-common/dist/type/app-report/AppReport";

export const getQueryParamAsNumber = (paramName: string, defaultValue: number): number => {
    if (typeof window === 'undefined') return defaultValue;
    const params = new URLSearchParams(window.location.search);
    const value = params.get(paramName);
    return value ? parseInt(value, 10) : defaultValue;
  };

  export const getQueryParam = (paramName: string, defaultValue: string|null) :any=> {
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

  export async function getShortUrl(originalUrl: string) {
    try{
      const url = 'https://api.short.io/links';
const options = {
  method: 'POST',
  headers: {
    accept: 'application/json',
    'content-type': 'application/json',
    Authorization: __SHORT_IO_KEY__
  },
  body: JSON.stringify({
    skipQS: false,
    archived: false,
    allowDuplicates: false,
    originalURL: originalUrl,
    domain: __SHORT_IO_DOMAIN__
  })
};

return await fetch(url, options)
  .then(res => res.json())
  .then(json => {
    return json.shortURL
  })
  .catch(err =>{
    throw new Error(err);
  });
    }catch(error){
      return `https://ai-workforce.intelligage.net/access-point-1731431369995-8101bbef-c774-4422-9e62-01f2c0c1ea12?user.summary=${null}`
    }
  }