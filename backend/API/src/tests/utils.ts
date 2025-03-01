import { CreationAttributes } from 'sequelize/types/model';
import sequelize from '../config/database';
import { ModelCtor } from 'sequelize-typescript';

export const setupTestDB = async () => {
  await sequelize.sync({ force: true });
};

export const clearTestDB = async () => {
  await sequelize.drop();
};
export const createTestData = async <T extends ModelCtor>(model: T, data: CreationAttributes<InstanceType<T>>) => {
  return model.create(data);
};