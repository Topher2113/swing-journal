export type AuthUser = {
  id: string;
  email: string;
};

export type UserProfile = {
  id: string;
  name: string;
  dancePreference: 'swing' | 'line_dancing' | 'both';
  level: 'beginner' | 'intermediate' | 'advanced';
  createdAt: string;
};

export type PartnerLink = {
  id: string;
  userIdA: string;
  userIdB: string | null;
  userEmailA: string;
  userEmailB: string | null;
  userNameA: string | null;
  userNameB: string | null;
  inviteCode: string;
  status: 'pending' | 'linked';
  createdAt: string;
};
