import { Request, Response, NextFunction } from 'express';
import { TemplateService } from './template.service';
import { ApiResponse } from '../../utils/response.formatter';

export class TemplateController {
  private service = new TemplateService();

  public getTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const results = await this.service.findAll(req.query);
      ApiResponse.success(res, results.data, 'Templates retrieved successfully', 200, {
        total: results.total,
      });
    } catch (error) {
      next(error);
    }
  };

  public getTemplateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const result = await this.service.findById(id);
      ApiResponse.success(res, result, 'Template retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public createTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.create(req.body);
      ApiResponse.success(res, result, 'Template created successfully', 201);
    } catch (error) {
      next(error);
    }
  };
}
export default TemplateController;
