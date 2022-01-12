import UserPublicProfile from "./user.public.profile.class";
import UserPublicSearchFields from "./user.public.searchFields.class";

export abstract class UserPublic {
  abstract profile: UserPublicProfile;
  abstract searchFields: UserPublicSearchFields;
}
export default UserPublic;
