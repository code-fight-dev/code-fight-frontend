import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentViewerServer } from "@/entities/viewer/server";
import { AccountRolesPanel } from "@/features/account-roles";
import { Container } from "@/shared/ui/Container";

export const metadata: Metadata = {
  title: "Account roles | CodeFight",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const viewer = await getCurrentViewerServer();
  if (!viewer) redirect("/signin");
  if (viewer.role !== "admin") notFound();
  return (
    <section className="py-16">
      <Container>
        <h1 className="mb-4 text-3xl font-semibold text-(--app-text-strong)">
          Account roles
        </h1>
        <p className="mb-8 text-(--app-text-soft)">
          Grant or revoke permission to organize tournaments. Every change is recorded.
        </p>
        <AccountRolesPanel />
      </Container>
    </section>
  );
}
