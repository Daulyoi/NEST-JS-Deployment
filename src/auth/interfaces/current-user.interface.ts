import { AuthRoleEnum } from '../enums/auth.enum';

export interface ICurrentUser {
  id: string;
  customerId: string;
  email: string;
  roles: AuthRoleEnum[];
  uniqueKey?: string;
}
