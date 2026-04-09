"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileUpdateRequestStatus = exports.HalfDayType = exports.LeaveDuration = exports.LeaveType = exports.LeaveStatus = exports.TaskStatus = exports.ProjectStatus = exports.Gender = exports.UserRole = void 0;
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
    TaskStatus["CurrentlyWorking"] = "Currently Working";
    TaskStatus["DevelopmentCompNeedTesting"] = "Development Comp [Need Testing]";
    TaskStatus["DesignCompleted"] = "Design Completed";
    TaskStatus["ClientFeedback"] = "Client Feedback";
    TaskStatus["BugFixing"] = "Bug Fixing";
    TaskStatus["TestingStarted"] = "Testing Started";
    TaskStatus["IssueReportedNeedTesting"] = "Issue Reported [Need Testing]";
    TaskStatus["TestingVerified"] = "Testing Verified";
    TaskStatus["ProjectCompleted"] = "Project Completed";
    TaskStatus["MockupWorking"] = "Mockup Working";
    TaskStatus["MockupApproved"] = "Mockup Approved";
    TaskStatus["DevelopmentCompOnlyTesting"] = "Development Comp [Only Testing, No Designer]";
    TaskStatus["DevelopmentCompNeedDesigner"] = "Development Comp [Need Designer, No Testing]";
    TaskStatus["DesignCompNeedTesting"] = "Design Comp [Need Testing]";
    TaskStatus["WebsiteMovedToLiveNeedTesting"] = "Website Moved to live [Need Testing]";
    TaskStatus["WebsiteMovedToLiveVerified"] = "Website Moved to live [Verified Testing]";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var LeaveStatus;
(function (LeaveStatus) {
    LeaveStatus["Pending"] = "Pending";
    LeaveStatus["Approved"] = "Approved";
    LeaveStatus["Rejected"] = "Rejected";
})(LeaveStatus || (exports.LeaveStatus = LeaveStatus = {}));
var LeaveType;
(function (LeaveType) {
    LeaveType["Casual"] = "Casual";
    LeaveType["Sick"] = "Sick";
    LeaveType["Emergency"] = "Emergency";
})(LeaveType || (exports.LeaveType = LeaveType = {}));
var LeaveDuration;
(function (LeaveDuration) {
    LeaveDuration["FullDay"] = "Full Day";
    LeaveDuration["HalfDay"] = "Half Day";
})(LeaveDuration || (exports.LeaveDuration = LeaveDuration = {}));
var HalfDayType;
(function (HalfDayType) {
    HalfDayType["FirstHalf"] = "First Half";
    HalfDayType["SecondHalf"] = "Second Half";
})(HalfDayType || (exports.HalfDayType = HalfDayType = {}));
var ProfileUpdateRequestStatus;
(function (ProfileUpdateRequestStatus) {
    ProfileUpdateRequestStatus["Pending"] = "Pending";
    ProfileUpdateRequestStatus["Approved"] = "Approved";
    ProfileUpdateRequestStatus["Rejected"] = "Rejected";
    ProfileUpdateRequestStatus["Revoked"] = "Revoked";
})(ProfileUpdateRequestStatus || (exports.ProfileUpdateRequestStatus = ProfileUpdateRequestStatus = {}));
//# sourceMappingURL=index.js.map