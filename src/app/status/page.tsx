import { StatusPageView } from "@/views/status";
import { getStatusPageData } from "@/views/status/server";

export default async function StatusPage() {
  const data = await getStatusPageData();

  return <StatusPageView data={data} />;
}
