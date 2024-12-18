import { getOrgs } from "@/actions/org";
import { getProjects } from "@/actions/project";
import BaseLayout from "@/partials/BaseLayout";
import { cookies } from "next/headers";
import { dashboardMenu } from "./_components/data";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const orgs = await getOrgs();
  const defaultOrg = orgs.find((org) => org.default);
  const projects = await getProjects(defaultOrg?.org_id!);
  const isSkip = JSON.parse(cookieStore.get("skip")?.value || "false");

  if (!isSkip && projects.length === 0) {
    return (
      <div className="h-svh space-y-8 flex flex-col items-center lg:justify-center overflow-y-auto justify-start ">
        {children}
      </div>
    );
  }

  return (
    <BaseLayout orgs={orgs} dashboardMenu={dashboardMenu}>
      {children}
    </BaseLayout>
  );
}
