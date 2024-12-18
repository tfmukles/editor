import { Arrangement, IFiles } from "@/types";
import path from "path";
import { cache } from "react";

export function sanitizedPath(root: string, ...paths: string[]): string {
  const sanitizedRoot = root.replace(/^\/|\/$/g, ""); // Remove leading and trailing slashes
  const sanitizedPaths = paths.map((p) => p.replace(/^\/|\/$/g, "")); // Remove leading and trailing slashes from each path
  return path.join(sanitizedRoot, ...sanitizedPaths);
}

export function verifyColor(colorCode: string) {
  let regColorCode = /^(#)?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  return regColorCode.test(colorCode);
}

export const generatePath = (relativePath: string, basePath: string) => {
  const hasLeadingSlash = relativePath.startsWith("/");
  const sanitizedBasePath = basePath.replace(/^\/|\/$/g, ""); // Remove leading and trailing slashes
  const sanitizedRelativePath = relativePath.replace(/^\/|\/$/g, ""); // Remove leading and trailing slashes
  const [, ...remainingSegments] = sanitizedBasePath.split(
    sanitizedRelativePath,
  );

  const finalPath = `${hasLeadingSlash ? "/" : ""}${sanitizedPath(
    remainingSegments.join("/"),
  )}`;

  return finalPath;
};

export const getFileNameAndExtension = (filename: string) => {
  const { name, ext: extension } = path.parse(filename);
  return [name, extension.replace(".", "") || "txt"];
};

export const findFileByPath = cache(
  (files: IFiles[], targetPath: string): IFiles | undefined => {
    for (const file of files) {
      if (file.path === targetPath) {
        return file;
      }
      if (file.children) {
        const found = findFileByPath(file.children, targetPath);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  },
);

export const mergePatterns = ({
  include,
  exclude,
}: {
  include?: string;
  exclude?: string;
}): { patterns: string[]; includes: string[]; excludes: string[] } => {
  const includes = (include || "").split(",").reduce<string[]>((acc, curr) => {
    if (curr.trim()) return [...acc, curr.trim()];
    return acc;
  }, []);

  const excludes = (exclude || "").split(",").reduce<string[]>((acc, curr) => {
    const trimValue = curr.trim();
    if (trimValue) {
      return trimValue.includes("!")
        ? [...acc, curr.replace("!", "")]
        : [...acc, `${curr}`];
    }
    return acc;
  }, []);

  return { patterns: includes.concat(excludes), includes, excludes };
};

export const excludeFile = (trees: IFiles[], path: string) => {
  return trees.filter((tree) => {
    if (tree.path === path) {
      return false;
    }

    if (tree.children) {
      excludeFile(tree.children, path);
    }
    return true;
  });
};

export function searchByPath(files: IFiles[], searchText: string): IFiles[] {
  let matchedFiles: IFiles[] = [];

  // Convert searchText to lowercase for case-insensitive comparison
  const lowerSearchText = searchText.toLowerCase();

  for (const file of files) {
    // Check if the path contains the searchText (case-insensitive)
    if (file.path.toLowerCase().includes(lowerSearchText)) {
      matchedFiles.push(file);
    }

    // If the file has children, search recursively within them
    if (file.children) {
      matchedFiles = matchedFiles.concat(
        searchByPath(file.children, searchText),
      );
    }
  }

  return matchedFiles;
}

type InputArrangement = {
  [key: string]: {
    [groupName: string]: {
      weight?: number;
      include?: string;
      exclude?: string;
      type?: string;
    };
  };
};

export function convertArrangement(
  input: InputArrangement,
): Array<Omit<Arrangement, "id">> {
  return Object.entries(input).map(
    ([path_, config]): Omit<Arrangement, "id"> => {
      const [groupName, settings] = Object.entries(config)[0];
      // Determine if the groupName has an extension
      const hasExtension = path.parse(path_).ext !== "";

      // For headings, ensure targetPath is empty and use original path as groupName
      //@ts-ignore
      if (settings === "heading") {
        return {
          type: "heading",
          targetPath: "",
          groupName: path_,
        };
      }

      // For files
      if (hasExtension) {
        return {
          type: "file",
          targetPath: path_,
          groupName,
        };
      }

      // For folders
      return {
        type: "folder",
        targetPath: path_,
        groupName,
        // @ts-ignore
        include: settings.include ?? "",
        exclude: settings.exclude ?? "",
      };
    },
  );
}
