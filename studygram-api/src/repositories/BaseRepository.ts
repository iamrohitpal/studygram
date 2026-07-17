import { Model } from 'sequelize-typescript';

export class BaseRepository<T extends Model> {
  protected model: any;

  constructor(model: any) {
    this.model = model;
  }

  async findAll(options?: any): Promise<T[]> {
    return this.model.findAll(options);
  }

  async findById(id: number | string, options?: any): Promise<T | null> {
    return this.model.findByPk(id, options);
  }

  async findOne(options?: any): Promise<T | null> {
    return this.model.findOne(options);
  }

  async create(data: any, options?: any): Promise<T> {
    return this.model.create(data, options);
  }

  async update(id: number | string, data: any, options?: any): Promise<[number, T[]]> {
    return this.model.update(data, {
      where: { id },
      ...options
    });
  }

  async delete(id: number | string, options?: any): Promise<number> {
    return this.model.destroy({
      where: { id },
      ...options
    });
  }
}
