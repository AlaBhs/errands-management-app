import { useQuery } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import { profileKeys } from "./profileKeys";

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: () => profileApi.getProfile(),
    select: (res) => res.data,
  });
}