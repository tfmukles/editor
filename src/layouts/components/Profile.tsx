import { ChevronDown, CircleUserRound } from "lucide-react";

const Profile = ({
  avatarUrl,
  userName,
}: {
  avatarUrl?: string;
  userName?: string;
}) => {
  return (
    <div className="cursor-pointer">
      {avatarUrl ? (
        <img
          width={36}
          height={36}
          className="rounded-full inline-block"
          src={avatarUrl}
          alt={userName || "Anonymous"}
        />
      ) : (
        <CircleUserRound className="inline-block w-5 h-5" />
      )}
      <p className="inline-block ml-1">{userName ? userName : "Anonymous"}</p>
      <ChevronDown className="inline-block" />
    </div>
  );
};

export default Profile;
