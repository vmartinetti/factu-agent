import { Company } from "../models/company";

export async function getCompany(companyId: string) {
  const company = await Company.findOne({ where: { id: companyId } });
  if (!company) {
    return null;
  }
  return company;
}

export async function getCompanyByRuc(ruc: string) {
  const company = await Company.findOne({ where: { ruc } });
  if (!company) {
    return null;
  }
  return company;
}