// Consolidated FullUserInfoDto declaration
export interface FullUserInfoDto {
  username: string;
  displayName: string;
  email?: string | null;
  photoUrl?: string | null;
}