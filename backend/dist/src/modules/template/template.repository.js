"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateRepository = void 0;
class TemplateRepository {
    async findMany(params) {
        // Repository method implementation template
        return [];
    }
    async findById(id) {
        return null;
    }
    async create(data) {
        return { id: 'temp-id', name: 'temp-name', createdAt: new Date() };
    }
    async update(id, data) {
        return { id, name: 'temp-name', createdAt: new Date() };
    }
    async delete(id) {
        return { id, name: 'temp-name', createdAt: new Date() };
    }
    async count(where) {
        return 0;
    }
}
exports.TemplateRepository = TemplateRepository;
exports.default = TemplateRepository;
