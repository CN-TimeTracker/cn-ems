"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRoutes = exports.leaveRoutes = exports.worklogRoutes = exports.taskRoutes = exports.projectRoutes = exports.userRoutes = exports.authRoutes = void 0;
var auth_routes_1 = require("./auth.routes");
Object.defineProperty(exports, "authRoutes", { enumerable: true, get: function () { return __importDefault(auth_routes_1).default; } });
var user_routes_1 = require("./user.routes");
Object.defineProperty(exports, "userRoutes", { enumerable: true, get: function () { return __importDefault(user_routes_1).default; } });
var project_routes_1 = require("./project.routes");
Object.defineProperty(exports, "projectRoutes", { enumerable: true, get: function () { return __importDefault(project_routes_1).default; } });
var task_routes_1 = require("./task.routes");
Object.defineProperty(exports, "taskRoutes", { enumerable: true, get: function () { return __importDefault(task_routes_1).default; } });
var worklog_routes_1 = require("./worklog.routes");
Object.defineProperty(exports, "worklogRoutes", { enumerable: true, get: function () { return __importDefault(worklog_routes_1).default; } });
var leave_routes_1 = require("./leave.routes");
Object.defineProperty(exports, "leaveRoutes", { enumerable: true, get: function () { return __importDefault(leave_routes_1).default; } });
var dashboard_routes_1 = require("./dashboard.routes");
Object.defineProperty(exports, "dashboardRoutes", { enumerable: true, get: function () { return __importDefault(dashboard_routes_1).default; } });
//# sourceMappingURL=index.js.map