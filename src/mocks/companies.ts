import { arrayOf } from "@/lib/api/client";
import { CompanySchema, type Company } from "@/lib/schemas/company";
import companiesSeed from "./data/companies.json";
import { mockResult, notFound } from "./_shared";

const companies: Company[] = arrayOf(CompanySchema).parse(companiesSeed);

export const companiesMock = {
  list: (): Promise<Company[]> => mockResult(companies),

  byId: (id: string): Promise<Company> =>
    mockResult(companies.find((item) => item.id === id) ?? notFound("Company", id)),
};
