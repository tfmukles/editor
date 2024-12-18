import { getOrgs } from "@/actions/org";
import { getProjects } from "@/actions/project";
import { auth } from "@/auth";
import AddSite from "@/components/add-site";
import { cookies } from "next/headers";
import Sites from "../(project)/[orgId]/projects/_components/sites";
import WelcomePage from "./_components/welcome-page";

export default async function Orgs() {
  const { user } = (await auth()) || {};
  const cookieStore = await cookies();
  const orgs = await getOrgs();
  const defaultOrgs = orgs.find((org) => org.default && org.owner === user?.id);
  const isSkip = JSON.parse(cookieStore.get("skip")?.value || "false");
  const projects = defaultOrgs ? await getProjects(defaultOrgs?.org_id!) : [];

  return (
    <>
      {!isSkip && projects.length === 0 ? (
        <WelcomePage>
          <AddSite
            orgId={`org-${defaultOrgs?.org_id}`}
            size={"lg"}
            className="block w-full"
          >
            Start with my existing Repository
          </AddSite>
        </WelcomePage>
      ) : (
        <Sites
          sites={projects}
          orgId={`org-${defaultOrgs?.org_id}`}
          orgs={orgs.filter((org) => org.owner === user?.id && !org.default)}
        />
      )}
    </>
  );
}
