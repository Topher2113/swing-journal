export type AuthUser = {
  id: string;
  email: string;
};

export type PartnerLink = {
  id: string;
  userIdA: string;
  userIdB: string | null;
  userEmailA: string;
  userEmailB: string | null;
  inviteCode: string;
  status: 'pending' | 'linked';
  createdAt: string;
};
