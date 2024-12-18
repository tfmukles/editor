import { getProject } from "@/actions/project";
import type { Metadata } from "next";
import EditProject from "./_components/project-from";

export async function generateMetadata(
  props: {
    params: Promise<{ projectId: string; orgId: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const project = await getProject({
    projectId: params.projectId,
    orgId: params.orgId.slice(4),
  });

  return {
    title: project?.project_name,
  };
}

export default async function ProjectSetting(
  props: {
    params: Promise<{ projectId: string; orgId: string }>;
  }
) {
  const params = await props.params;
  const project = await getProject({
    projectId: params.projectId,
    orgId: params.orgId.slice(4),
  });

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="py-12 grid 2xl:grid-cols-2 gap-6 ">
      <EditProject {...project} />
    </div>
  );
}
