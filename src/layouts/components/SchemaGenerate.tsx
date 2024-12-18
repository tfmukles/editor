import { checkMedia } from "@/lib/utils/checkMediaFile";

const folder = ".sitepins/schema";

interface FieldSchema {
  label: string;
  name: string;
  type: string;
  fields?: FieldSchema[];
}

const mapToInitialValue = {
  Array: [] as any[],
  object: {} as Record<string, any>,
  string: "" as string,
  boolean: true as boolean,
  Date: "",
  media: "",
};

export const convertToFormData = (
  data: FieldSchema[],
  val?: string,
): Record<string, any> => {
  return data?.reduce((obj, currentObj) => {
    return {
      ...obj,
      [currentObj.name]:
        currentObj.fields && currentObj.fields?.length > 0
          ? [convertToFormData(currentObj.fields)]
          : currentObj.name === "title"
            ? val
            : (mapToInitialValue as any)[currentObj.type],
    };
  }, {});
};

function typeofValue(value: any) {
  return typeof value === "object"
    ? Array.isArray(value)
      ? "Array"
      : "object"
    : typeof value;
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
    return {
      label,
      name: label,
      type,
      ...(next && { fields: convertSchema(val) }),
    };
  } else if (type === "object" && value) {
    const hasNext = Object.keys(value).length > 0;
    return {
      label,
      name: label,
      type: !value ? "string" : type,
      ...(hasNext && { fields: convertSchema(value) }),
    };
  } else {
    return {
      label,
      name: label,
      type: checkMedia(value) ? "media" : type,
    };
  }
}

//generating schema
function convertSchema(docs: Record<string, any>): FieldSchema[] {
  return Object.entries(docs).map(([key, value]) => {
    return generateFieldSchema({ label: key, value });
  });
}
