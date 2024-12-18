"use client";

import { selectConfig } from "@/redux/features/config/slice";
import { useGetTreesQuery } from "@/redux/features/git/contentApi";
import { useSelector } from "react-redux";
import ConfigForm from "./config-form";
import { Dialog, DialogContent } from "./ui/dialog";

const ConfigModal = () => {
  const config = useSelector(selectConfig);

  const {
    data,
    isLoading: isTreesLoading,
    isSuccess: isTreesLoaded,
  } = useGetTreesQuery({
    owner: config.userName,
    repo: config.repo,
    tree_sha: config.branch,
    recursive: "1",
  });

  const tree = data?.files || [];

  return (
    <div>
      <Dialog open={!config?.content?.root}>
        <DialogContent className="[&_[aria-label='close']]:hidden">
          <ConfigForm trees={tree} config={config} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConfigModal;
