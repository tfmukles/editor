export const generateDeployUrl = (repoName: string, repoOwner: string) => {
  if (!repoName || !repoOwner) {
    return null;
  }

  return `https://vercel.com/new/import?s=https%3A%2F%2Fgithub.com%2F${repoOwner}%2F${repoName}&showOptionalTeamCreation=false&project-name=${repoName}&framework=other`;
};
