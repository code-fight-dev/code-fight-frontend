import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getCityOptions,
  getCountryOptions,
  getStateProvinceOptions,
} from "@/features/profile-settings/model/locationCatalog";

function createResponse(items: string[]) {
  return NextResponse.json(
    { items },
    {
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    },
  );
}

export async function GET(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope");
  const country = request.nextUrl.searchParams.get("country")?.trim() ?? "";
  const stateProvince = request.nextUrl.searchParams.get("stateProvince")?.trim() ?? "";

  if (scope === "countries") {
    return createResponse(getCountryOptions());
  }

  if (scope === "states") {
    return createResponse(getStateProvinceOptions(country));
  }

  if (scope === "cities") {
    return createResponse(getCityOptions(country, stateProvince));
  }

  return NextResponse.json(
    { error: { message: "Invalid location scope" } },
    { status: 400 },
  );
}
