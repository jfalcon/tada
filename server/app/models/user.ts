export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export type NewUser
  = Omit<User, 'id' | 'created_at' | 'updated_at' | 'password_hash'>
  & { password: string };

export type UpdateUser = Partial<NewUser>;
