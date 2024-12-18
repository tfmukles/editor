import { gitFetch } from "@/actions/utils/gitFetch";
import Modal from "@/components/Modal";
import { useFetch } from "@/hooks/useFetch";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { useSlate } from "slate-react";

const Embedded = () => {
  const [isExpand, setExpand] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { data } = useFetch(
    () =>
      gitFetch("GET /repos/{owner}/{repo}/contents/{path}", {
        owner: "",
        token: "",
        repo: "",
        path: ".sitepins/snippets",
      }),
    {
      skip: true,
    },
    [],
  );

  const toggleExpand = () => {
    setExpand(!isExpand);
  };

  return (
    <div className="relative !ml-auto">
      <button
        ref={buttonRef}
        onClick={toggleExpand}
        type="button"
        className="btn btn-primary"
      >
        Embedded
        <Plus className="inline-block ml-3" />
      </button>
      {isExpand && (
        <div>
          <Modal
            className="absolute bg-white z-10 shadow right-0 rounded min-w-[180px] w-full p-3 top-[calc(100%_+_8px)]"
            buttonRef={buttonRef}
            toggle={toggleExpand}
          >
            <ul className="space-y-3">
              {(data as any)?.map((item: any, index: number) => (
                <li className="border-b border-b-gray-300 pb-1" key={index}>
                  {/* <TestEmbedded data={item} /> */}
                </li>
              ))}
            </ul>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default Embedded;

function TestEmbedded({ data }: { data: any }) {
  const editor = useSlate();
  const { data: content } = useFetch<any>(async () => {
    const content = await fetch(data.download_url);
    return await content.text();
  });
  const onClick = () => {
    editor.insertNode({
      type: "paragraph",
      children: [{ text: content }],
    } as any);
  };

  return (
    <div>
      <button onClick={onClick} type="button">
        {data.name}
      </button>
    </div>
  );
}
