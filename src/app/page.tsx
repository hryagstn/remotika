import React from "react";
import Dashboard from "./components/Dashboard";
import { getCompanies } from "./actions";

// Use Incremental Static Regeneration (ISR) to cache page results for up to 1 hour,
// as recommended in the brief: "Quarterly update (per 3 months) / caching via Supabase + Next.js ISR".
export const revalidate = 3600; 

export default async function Home() {
  const initialCompanies = await getCompanies();

  return <Dashboard initialCompanies={initialCompanies} />;
}
