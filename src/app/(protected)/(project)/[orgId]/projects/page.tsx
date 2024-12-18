import { getOrg, getOrgs } from "@/actions/org";
import { getProjects } from "@/actions/project";
import { Metadata } from "next";
import Sites from "./_components/sites";

export async function generateMetadata(
  props: {
    params: Promise<{ orgId: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const org = await getOrg(params.orgId.slice(4));
  return {
    title: org?.org_name,
  };
}

export default async function Projects(
  props: {
    params: Promise<{ orgId: string }>;
  }
) {
  const params = await props.params;
  const projects = await getProjects(params.orgId.slice(4));
  const orgs = await getOrgs();

  return (
    <Sites
      sites={projects}
      orgId={params.orgId}
      orgs={orgs.filter((org) => org.org_id !== params.orgId.slice(4))}
    />
  );
}
