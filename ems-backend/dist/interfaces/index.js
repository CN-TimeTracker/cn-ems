"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileUpdateRequestStatus = exports.LeaveStatus = exports.TaskStatus = exports.ProjectStatus = exports.Gender = exports.UserRole = void 0;
// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────
var UserRole;
(function (UserRole) {
    UserRole["Admin"] = "Admin";
    UserRole["Dev"] = "Dev";
    UserRole["Designer"] = "Designer";
    UserRole["SEO"] = "SEO";
    UserRole["QA"] = "QA";
    UserRole["BA"] = "BA";
})(UserRole || (exports.UserRole = UserRole = {}));
var Gender;
(function (Gender) {
    Gender["Male"] = "Male";
    Gender["Female"] = "Female";
    Gender["Other"] = "Other";
    Gender["PreferNotToSay"] = "Prefer not to say";
})(Gender || (exports.Gender = Gender = {}));
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["Active"] = "Active";
    ProjectStatus["Completed"] = "Completed";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["ToDo"] = "To Do";
    TaskStatus["InProgress"] = "In Progress";
    TaskStatus["Done"] = "Done";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var LeaveStatus;
(function (LeaveStatus) {
    LeaveStatus["Pending"] = "Pending";
    LeaveStatus["Approved"] = "Approved";
    LeaveStatus["Rejected"] = "Rejected";
})(LeaveStatus || (exports.LeaveStatus = LeaveStatus = {}));
var ProfileUpdateRequestStatus;
(function (ProfileUpdateRequestStatus) {
    ProfileUpdateRequestStatus["Pending"] = "Pending";
    ProfileUpdateRequestStatus["Approved"] = "Approved";
    ProfileUpdateRequestStatus["Rejected"] = "Rejected";
})(ProfileUpdateRequestStatus || (exports.ProfileUpdateRequestStatus = ProfileUpdateRequestStatus = {}));
//# sourceMappingURL=index.js.map