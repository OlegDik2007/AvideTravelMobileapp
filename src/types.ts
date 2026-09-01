export type Service = {
  id: number;
  title: string;
  description?: string;
  short_description?: string;
  category?: string;
  my_price?: number | string | null;
  effective_price?: number | string | null;
  other_agency_price?: number | string | null;
  price_note?: string | null;
  currency?: string;
  location?: string;
  duration?: string;
  image_url?: unknown;
  images?: unknown;
  agent_id?: number;
  slug?: string;
  start_date?: string;
  end_date?: string;
  flight_included?: boolean;
  transfer_included?: boolean;
  all_inclusive?: boolean;
  adults_only?: boolean;
  family_friendly?: boolean;
  beach_access?: boolean;
  wifi?: boolean;
  pool?: boolean;
};

export type Agent = {
  id: number;
  company_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
};

export type TabKey = 'home' | 'deals' | 'explore' | 'contact';
