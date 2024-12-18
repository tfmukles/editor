"use client";

import { SCHEMA_FOLDER } from "@/lib/constant";
import { convertSchema } from "@/lib/utils/generateSchema";
import { slugify } from "@/lib/utils/textConverter";
import { selectConfig } from "@/redux/features/config/slice";
import { useGetContentQuery } from "@/redux/features/git/contentApi";
import { Arrangement } from "@/types";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import path from "path";
import { useSelector } from "react-redux";
import EditorWrapper from "./editor-wrapper";

export default function Single() {
  const { file } = useParams() as { file: string[] };
  const config = useSelector(selectConfig);
  const { branch } = config;
  const arrangements = config.arrangement ?? [];
  const filePathString = decodeURIComponent(file.join("/"));
  const groupName = path.basename(path.dirname(filePathString));

  const possibilityTarget = [
    `${filePathString.replace(`/${slugify(groupName)}`, "")}`,
    path.dirname(`${filePathString.replace(`/${slugify(groupName)}`, "")}`),
  ];

  let matchedArrangement: Arrangement | undefined;
  matchedArrangement = arrangements.find(
    (arrangement) =>
      slugify(arrangement.groupName) === groupName &&
      possibilityTarget.includes(arrangement.targetPath),
  );

  const filepath = matchedArrangement?.targetPath
    ? matchedArrangement.type === "folder"
      ? filePathString.replace(`/${groupName}`, "")
      : `${matchedArrangement?.targetPath}`
    : file.join("/").replace("files/", "");

  const {
    data: response,
    isFetching,
    isSuccess,
  } = useGetContentQuery({
    ref: branch,
    owner: config.userName,
    repo: config.repo,
    path: filepath,
    parser: true,
  });

  const { data, content, fmType } = response || {};

  const {
    data: schema,
    isFetching: isSchemaFetching,
    isError: isSchemaError,
  } = useGetContentQuery({
    ref: branch,
    owner: config.userName,
    repo: config.repo,
    path: `${SCHEMA_FOLDER}/${groupName}.json`,
    parser: true,
  });

  if (isFetching || !isSuccess || isSchemaFetching) {
    return (
      <div className="text-center w-full h-screen flex">
        <Loader2 className="m-auto animate-spin size-7" />
      </div>
    );
  }

  const template = isSchemaError ? convertSchema(data) : schema?.data?.template;

  return (
    <EditorWrapper
      filePath={filepath}
      content={content ?? ""}
      data={data}
      schema={template}
      fmType={fmType}
    />
  );
}
