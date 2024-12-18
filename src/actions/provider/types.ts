export type Provider = {
  _id?: string;
  access_token: string;
  installation_access_token: string;
  expires_in: number;
  provider: "Github" | "GitLab";
  token_type: string;
  refresh_token_expires_in: number;
  userId: string;
};
