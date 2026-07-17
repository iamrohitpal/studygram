import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { categoryRepository } from '../repositories/CategoryRepository';

export class CategoryController {
  async getCategories(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const categories = await categoryRepository.findActiveCategories();
      res.status(200).json({
        status: 'success',
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
