import { UserRole } from "./role";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
