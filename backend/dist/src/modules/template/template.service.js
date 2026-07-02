"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
const template_repository_1 = require("./template.repository");
class TemplateService {
    repository = new template_repository_1.TemplateRepository();
    async findAll(query) {
        const data = await this.repository.findMany({});
        const total = await this.repository.count({});
        return { data, total };
    }
    async findById(id) {
        const record = await this.repository.findById(id);
        if (!record)
            throw new Error('Record not found');
        return record;
    }
    async create(dto) {
        return this.repository.create(dto);
    }
    async update(id, dto) {
        return this.repository.update(id, dto);
    }
    async delete(id) {
        return this.repository.delete(id);
    }
}
exports.TemplateService = TemplateService;
exports.default = TemplateService;
