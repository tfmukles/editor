import { useSearchParams } from "next/navigation";

const pagination = 10;
export const usePaginate = ({ data }: { data: any[] }) => {
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const totalPages = Math.ceil(data.length / pagination);
  const currentPage = page && !isNaN(Number(page)) ? Number(page) : 1;
  const indexOfLastPost = currentPage * pagination;
  const indexOfFirstPost = indexOfLastPost - pagination;
  let result = data.slice(indexOfFirstPost, indexOfLastPost);

  return {
    currentPage,
    pageSize: totalPages,
    result,
  };
};
