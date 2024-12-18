import matter from "gray-matter";
import { checkMedia } from "./checkMediaFile";
import { verifyColor } from "./common";

type Type =
  | "media"
  | "object"
  | "list"
  | "string"
  | "number"
  | "boolean"
  | "textarea"
  | "bigint"
  | any;

interface Frontmatter {
  [key: string]: any;
}

export interface FieldSchema {
  type: Type;
  name: string;
  label: string;
  fields?: FieldSchema[];
  value?: any;
}

export type IJsonSchema =
  | {
      path: string;
      frontmatter: FieldSchema[];
      content: FieldSchema;
    }
  | undefined;

const convertToCamelCase = (input: string = ""): string => {
  const fileName = input?.replace(/\.[^/.]+$/, ""); // Remove file extension
  const words = fileName.split(/[-_]/).filter((word) => word !== ""); // Split by hyphen and underscore, then filter out empty strings
  const capitalizedWords = words.map((word, index) => {
    if (index === 0) {
      if (/^\d/.test(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  return capitalizedWords.join(" ");
};

const reShapeJsonToFieldSchema = (data: {
  name?: string;
  content: string;
}): IJsonSchema => {
  if (!data?.name) return undefined;

  const filePath = data.name;
  const repoFileContent = decodeBase64(data.content);
  const ext = filePath.substring(filePath.lastIndexOf("."));

  // convert data to json
  const jsonData =
    ext === ".json"
      ? { data: JSON.parse(repoFileContent), content: null }
      : [".md", ".mdx"].includes(ext)
        ? matter(repoFileContent)
        : {};
  const schema = generateSchema(jsonData.data || {});
  const content: FieldSchema = {
    type: "textarea",
    name: "content",
    label: "Content",
    value: jsonData.content || "",
  };

  return {
    path: filePath,
    frontmatter: schema,
    content: content,
  };
};

export default reShapeJsonToFieldSchema;

// compare with schema
export function generateSchema(
  jsonData: Frontmatter,
  parentPath = "",
): FieldSchema[] {
  return Object.entries(jsonData).map(([key, value]) => {
    const path = parentPath ? `${parentPath}.${key}` : key;

    if (typeof value === "object" && value !== null) {
      return {
        type: Array.isArray(value) ? "list" : "object",
        name: path,
        label: convertToCamelCase(
          value?.title || value?.name || value?.label || key,
        ),
        fields: generateSchema(value, path),
      };
    } else if (typeof value === "string") {
      return {
        type: "media",
        name: path,
        label: convertToCamelCase(key),
        value: value,
      };
    } else {
      const name = (path: string): string => {
        const name = path.split(".");
        return name[name.length - 1];
      };

      return {
        type:
          name(path) !== "content" && name(path) !== "description"
            ? !value
              ? "string"
              : typeof value
            : "textarea",
        name: path,
        label: convertToCamelCase(key),
        value: value,
      };
    }
  });
}

export function decodeBase64(data: string): string {
  if (!data) return "";
  return Buffer.from(data, "base64").toString("utf-8");
}

export function extractFolderName(path: string): string {
  const parts = path.split("/");
  const lastPart = parts[parts.length - 1];
  return lastPart.includes(".") ? parts[parts.length - 2] : lastPart;
}

function typeofValue(value: any) {
  return typeof value === "object"
    ? Array.isArray(value)
      ? "Array"
      : value instanceof Date
        ? "Date"
        : "object"
    : typeof value;
}

export function convertSchema(docs: Record<string, any>): FieldSchema[] {
  if (!docs) return [];

  return Object?.entries(docs).map(([key, value]) => {
    return generateFieldSchema({ label: key, value });
  });
}

function generateFieldSchema({
  label,
  value,
}: {
  label: string;
  value: any;
}): FieldSchema {
  const type = typeofValue(value);

  if (type === "Array" && value) {
    const val = value[0];
    const next = typeof val === "object";
    const isMediaList = checkMedia(val);
    if (isMediaList) {
      return {
        label: convertToCamelCase(label),
        name: label,
        type: isMediaList ? "gallery" : type,
        ...(next && { fields: convertSchema(val) }),
      };
    } else {
      // @ts-ignore
      const combinedObject = value?.reduce((acc, item) => {
        const filteredItem = Object.fromEntries(
          Object.entries(item).filter(
            ([key, val]) => val !== "" && val !== null && val !== undefined,
          ),
        );
        return { ...acc, ...filteredItem };
      }, {});
      return {
        label: convertToCamelCase(label),
        name: label,
        type: type,
        ...(next && { fields: convertSchema(combinedObject) }),
      };
    }
  } else if (type === "object" && value) {
    const hasNext = Object.keys(value).length > 0;
    const values = Object.values(value);
    const val =
      typeof values[0] !== "object" && typeof values[0] !== "boolean"
        ? values[0] || label
        : label;
    const fieldLabel = value?.title || value?.name || value?.label || val;

    return {
      label: convertToCamelCase(fieldLabel),
      name: label,
      type: !value ? "string" : type,
      ...(hasNext && { fields: convertSchema(value) }),
    };
  } else if (verifyColor(value) && isNaN(value)) {
    return {
      label: convertToCamelCase(label),
      name: label,
      type: "color",
      value: value,
    };
  } else {
    return {
      label: convertToCamelCase(label),
      name: label,
      type: checkMedia(value) ? "media" : type === "object" ? "string" : type,
      value: type === "number" ? 0 : "",
    };
  }
}
