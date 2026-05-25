import { Customer } from '../../domain/entity/customer.entity';

export interface ProfileResponse {
  id: string;
  fullName: string;
  dateOfBirth?: Date;
  mothersMaidenName?: string;
  demographicSegment?: string;
  monthlyIncome: number;
  savingsGoal: number;
  basePersona?: string;
  isDynamic: boolean;
  currentWantsRatio: number;
  currentNeedsRatio: number;
  createdAt: Date;
  updatedAt: Date;
}

export class UserMapper {
  static toProfileResponse(customer: Customer): ProfileResponse {
    return {
      id: customer.id,
      fullName: customer.fullName,
      dateOfBirth: customer.dateOfBirth,
      mothersMaidenName: customer.mothersMaidenName,
      demographicSegment: customer.demographicSegment,
      monthlyIncome: Number(customer.monthlyIncome),
      savingsGoal: Number(customer.savingsGoal),
      basePersona: customer.basePersona,
      isDynamic: customer.isDynamic,
      currentWantsRatio: Number(customer.currentWantsRatio),
      currentNeedsRatio: Number(customer.currentNeedsRatio),
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
