import { HomePage } from "@/views/home";
import { getHomePageData } from "@/views/home/server";

export const revalidate = 30;

export default async function Home() {
  const data = await getHomePageData();

  return <HomePage data={data} />;
}
