import { IBaseService } from '../../interfaces';
import { TemplateRepository } from './template.repository';
import { ITemplate } from './interfaces';
import { CreateTemplateDto } from './dto/create-template.dto';

export class TemplateService implements IBaseService<ITemplate> {
  private repository = new TemplateRepository();

  async findAll(query: any): Promise<{ data: ITemplate[]; total: number }> {
    const data = await this.repository.findMany({});
    const total = await this.repository.count({});
    return { data, total };
  }

  async findById(id: string): Promise<ITemplate> {
    const record = await this.repository.findById(id);
    if (!record) throw new Error('Record not found');
    return record;
  }

  async create(dto: CreateTemplateDto): Promise<ITemplate> {
    return this.repository.create(dto);
  }

  async update(id: string, dto: any): Promise<ITemplate> {
    return this.repository.update(id, dto);
  }

  async delete(id: string): Promise<ITemplate> {
    return this.repository.delete(id);
  }
}
export default TemplateService;
