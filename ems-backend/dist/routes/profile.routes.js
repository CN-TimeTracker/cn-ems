"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_controller_1 = require("../controllers/profile.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const multer_middleware_1 = require("../middleware/multer.middleware");
const router = (0, express_1.Router)();
// Protect all profile routes
router.use(auth_middleware_1.protect);
// Profile Picture
router.patch('/picture', multer_middleware_1.uploadProfilePictureMiddleware.single('image'), profile_controller_1.updateProfilePicture);
router.delete('/picture', profile_controller_1.deleteProfilePicture);
// Employee routes
router.post('/request-update', profile_controller_1.requestUpdate);
router.get('/my-pending', profile_controller_1.getMyPendingRequest);
// Admin routes
router.get('/requests', auth_middleware_1.adminOnly, profile_controller_1.getPendingRequests);
router.post('/requests/:id/approve', auth_middleware_1.adminOnly, profile_controller_1.approveRequest);
router.post('/requests/:id/reject', auth_middleware_1.adminOnly, profile_controller_1.rejectRequest);
router.post('/requests/:id/revoke', auth_middleware_1.adminOnly, profile_controller_1.revokeRequest);
router.get('/review-history', auth_middleware_1.adminOnly, profile_controller_1.getReviewHistory);
exports.default = router;
//# sourceMappingURL=profile.routes.js.map