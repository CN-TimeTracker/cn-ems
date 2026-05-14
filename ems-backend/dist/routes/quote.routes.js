"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quote_controller_1 = require("../controllers/quote.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const interfaces_1 = require("../interfaces");
const router = (0, express_1.Router)();
// Public / Authenticated - Get the daily quote for dashboard
router.get('/daily', auth_middleware_1.protect, quote_controller_1.QuoteController.getDaily);
// Admin Only - Manage quotes
router.use(auth_middleware_1.protect, (0, auth_middleware_1.roleGuard)(interfaces_1.UserRole.Admin));
router.route('/')
    .get(quote_controller_1.QuoteController.getAll)
    .post(quote_controller_1.QuoteController.create);
router.route('/:id')
    .delete(quote_controller_1.QuoteController.delete);
exports.default = router;
//# sourceMappingURL=quote.routes.js.map