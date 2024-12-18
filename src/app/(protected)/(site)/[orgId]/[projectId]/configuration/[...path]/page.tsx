import { getContent } from "@/actions/project-config";
import { SCHEMA_FOLDER } from "@/lib/constant";
import { format } from "@/lib/utils/contentFormatter";
import { convertSchema } from "@/lib/utils/generateSchema";
import path from "path";
import EditorWrapper from "../../files/[...file]/_components/editor-wrapper";

export default async function Configuration(
  props: {
    params: Promise<{
      orgId: string;
      projectId: string;
      path: string[];
    }>;
  }
) {
  const params = await props.params;
  const filePathString = decodeURIComponent(params.path.join("/"));
  const dir = path.basename(path.dirname(filePathString));

  const { data, content, fmType } = (await getContent({
    path: filePathString,
    parser: true,
    orgId: params.orgId,
    projectId: params.projectId,
    fallback: () => {
      return {};
    },
  })) as { data: any; content: string; fmType: format };

  const schema = await getContent({
    path: SCHEMA_FOLDER + "/" + dir + ".json",

    fallback: () => {
      return convertSchema(data);
    },
    orgId: params.orgId,
    projectId: params.projectId,
  });

  return (
    <>
      <EditorWrapper
        filePath={filePathString}
        content={content}
        schema={schema}
        fmType={fmType}
        data={data}
        shouldShowEditor={false}
      />
    </>
  );
}
