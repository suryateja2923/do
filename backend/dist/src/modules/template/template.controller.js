"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateController = void 0;
const template_service_1 = require("./template.service");
const response_formatter_1 = require("../../utils/response.formatter");
class TemplateController {
    service = new template_service_1.TemplateService();
    getTemplates = async (req, res, next) => {
        try {
            const results = await this.service.findAll(req.query);
            response_formatter_1.ApiResponse.success(res, results.data, 'Templates retrieved successfully', 200, {
                total: results.total,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getTemplateById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const result = await this.service.findById(id);
            response_formatter_1.ApiResponse.success(res, result, 'Template retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    };
    createTemplate = async (req, res, next) => {
        try {
            const result = await this.service.create(req.body);
            response_formatter_1.ApiResponse.success(res, result, 'Template created successfully', 201);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.TemplateController = TemplateController;
exports.default = TemplateController;
