export type Role = "EMPLOYEE" | "MANAGER";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}
