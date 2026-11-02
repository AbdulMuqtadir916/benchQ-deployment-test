import type { Company } from "@/lib/schemas/company";

const mock = () => import("@/mocks/companies").then((m) => m.companiesMock);

export const companiesApi = {
  list: async (): Promise<Company[]> => (await mock()).list(),

  byId: async (id: string): Promise<Company> => (await mock()).byId(id),
};
