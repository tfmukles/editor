import { checkMedia } from "@/lib/utils/checkMediaFile";
import { generatePath, sanitizedPath } from "@/lib/utils/common";
import LoadImage from "@/partials/LoadImage";
import { selectConfig } from "@/redux/features/config/slice";
import { IFiles } from "@/types";
import { useSelector } from "react-redux";
import BlurImage from "./BlurImage";
import { AspectRatio } from "./ui/aspect-ratio";

const RenderImages = ({
  files,
  name,
  onChangeHandler,
  onClose,
  path,
}: {
  files: IFiles[];
  name: string;
  onChangeHandler?: any;
  path: string;
  onClose: (open: boolean) => void;
}) => {
  const config = useSelector(selectConfig);
  const configPath = config.media.public;
  return files.map((item) => {
    return item.children?.length ? (
      <RenderImages
        path={path}
        onClose={onClose}
        onChangeHandler={onChangeHandler}
        name={name}
        key={item.path}
        files={item.children}
      />
    ) : (
      checkMedia(item.path) && (
        <div key={item.path}>
          <AspectRatio ratio={16 / 10} className="border rounded-lg">
            <div className="absolute inset-0 opacity-50 bg-stripes-gray" />
            <LoadImage
              lazy
              path={sanitizedPath(configPath, item.path.replace("media", ""))}
            >
              {({ src, ref, isLoading }) => (
                <>
                  <BlurImage ref={ref} src={src} alt={item.name} />
                  <input
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onClose(false);
                      onChangeHandler(e);
                    }}
                    name={name}
                    type="text"
                    value={
                      "/" +
                      generatePath(configPath, item.path.replace("media", ""))
                    }
                    className="absolute inset-0 z-50 opacity-0 cursor-pointer"
                    readOnly
                  />
                </>
              )}
            </LoadImage>
          </AspectRatio>
          <p className="mt-1 text-xs line-clamp-1 text-wrap">
            {item.name.length >= 30
              ? `${item.name.slice(0, 30)}...`
              : item.name}
          </p>
        </div>
      )
    );
  });
};

export default RenderImages;
