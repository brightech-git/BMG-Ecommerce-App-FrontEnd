// app/api/hooks/useCompany.ts
// Fetches company info from GET /company/all
// Response: array of company objects (we use the first with ACTIVE === 'Y')
import { useQuery } from '@tanstack/react-query';
import { callApi } from '../apiClient';
import { COMPANY } from '../endpoints';

export interface CompanyInfo {
  COMPANYID: string;
  COMPANYNAME: string;
  ADDRESS1: string;
  ADDRESS2: string;
  ADDRESS3?: string;
  ADDRESS4?: string;
  AREACODE: string;
  PHONE: string;
  EMAIL: string;
  PANNO?: string;
  GSTNO?: string;
  BASEURL?: string;
  LOGO?: string;
  WHATSAPPLINK?: string;
  FACEBOOKLINK?: string;
  INSTALINK?: string;
  TWITTERLINK?: string;
  YOUTUBELINK?: string;
  GOOGLEBUSINESSLINK?: string;
  ANDROIDLINK?: string;
  APPSTORELINK?: string;
  ACTIVE?: string;
}

const getCompanyInfo = async (): Promise<CompanyInfo | null> => {
  const res = await callApi<null, any>({ method: 'get', url: COMPANY.ALL });
  const list: CompanyInfo[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
  return list.find(c => c.ACTIVE === 'Y') ?? list[0] ?? null;
};

export const useCompany = () =>
  useQuery({
    queryKey: ['companyInfo'],
    queryFn: getCompanyInfo,
    staleTime: 1000 * 60 * 60, // 1 hour — company info rarely changes
  });
