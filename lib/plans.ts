export interface Plan {
  id: string;
  name: string;
  hours: number;
  price: number; // BRL cents
  description: string;
  highlight?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "session",
    name: "Sessão avulsa",
    hours: 1,
    price: 1200,
    description: "1 hora sem expiração",
  },
  {
    id: "essential",
    name: "Pacote Essencial",
    hours: 5,
    price: 5000,
    description: "5 horas sem expiração",
    highlight: true,
  },
  {
    id: "regular",
    name: "Pacote Regular",
    hours: 10,
    price: 9000,
    description: "10 horas sem expiração",
  },
];

export const FREE_TRIAL_SECONDS = 3600; // 1 hora
export const WARNING_SECONDS = 600;     // aviso aos 10 min restantes
export const URGENT_SECONDS = 120;      // urgente aos 2 min restantes
