import { BaseRepository } from './BaseRepository';
import { Category } from '../database/models/Category';

export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super(Category);
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.findOne({ where: { slug } });
  }

  async findActiveCategories(): Promise<Category[]> {
    return this.findAll({ where: { status: 'active' } });
  }
}
export const categoryRepository = new CategoryRepository();
