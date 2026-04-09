# Code Neptune EMS — API Reference

Base URL: `http://localhost:5000/api/v1`

All protected routes require: `Authorization: Bearer <token>`

---

## AUTH

| Method | Endpoint         | Access | Description       |
|--------|-----------------|--------|-------------------|
| POST   | /auth/login     | Public | Login, get JWT    |
| GET    | /auth/me        | Any    | Get own profile   |
| POST   | /auth/logout    | Any    | Logout (client clears token) |

### POST /auth/login
```json
{ "email": "admin@codeneptune.com", "password": "admin123" }
```

---

## USERS

| Method | Endpoint          | Access | Description          |
|--------|------------------|--------|----------------------|
| POST   | /users           | Admin  | Create employee      |
| GET    | /users           | Admin  | List all users       |
| GET    | /users/active    | Any    | Active users (dropdown) |
| GET    | /users/:id       | Admin  | Get user by ID       |
| PATCH  | /users/:id       | Admin  | Update user          |
| DELETE | /users/:id       | Admin  | Deactivate user      |

---

## PROJECTS

| Method | Endpoint             | Access | Description        |
|--------|---------------------|--------|--------------------|
| POST   | /projects           | Admin  | Create project     |
| GET    | /projects           | Any    | All projects       |
| GET    | /projects/active    | Any    | Active projects    |
| GET    | /projects/:id       | Any    | Project detail     |
| PATCH  | /projects/:id       | Admin  | Update project     |
| DELETE | /projects/:id       | Admin  | Delete project     |

---

## TASKS

| Method | Endpoint           | Access         | Description              |
|--------|-------------------|----------------|--------------------------|
| POST   | /tasks            | Admin          | Create & assign task     |
| GET    | /tasks            | Admin=all, Emp=own | Filter tasks        |
| GET    | /tasks/my         | Any            | Own tasks                |
| GET    | /tasks/overdue    | Admin          | Overdue tasks            |
| GET    | /tasks/:id        | Any (own only) | Task detail              |
| PATCH  | /tasks/:id        | Admin=all, Emp=status only | Update task |
| DELETE | /tasks/:id        | Admin          | Delete task              |

Query params for GET /tasks: `?projectId=&assignedTo=&status=`

---

## WORK LOGS

| Method | Endpoint                   | Access | Description            |
|--------|---------------------------|--------|------------------------|
| POST   | /logs                     | Any    | Log work hours         |
| GET    | /logs/my                  | Any    | Own logs               |
| GET    | /logs/today               | Any    | Today's hours + remaining |
| GET    | /logs                     | Admin  | All logs               |
| GET    | /logs/projects/summary    | Admin  | Hours per project      |

Query params: `?projectId=&startDate=&endDate=&userId=`

### POST /logs
```json
{
  "projectId": "...",
  "taskId": "...",
  "hours": 4,
  "notes": "Completed login module",
  "date": "2025-03-30"
}
```

---

## LEAVES

| Method | Endpoint               | Access    | Description            |
|--------|----------------------|-----------|------------------------|
| POST   | /leaves              | Any       | Apply for leave        |
| GET    | /leaves              | Admin=all, Emp=own | List leaves  |
| GET    | /leaves/pending      | Admin     | Pending approval queue |
| PATCH  | /leaves/:id/review   | Admin     | Approve or reject      |
| DELETE | /leaves/:id          | Any (own) | Cancel pending leave   |

### PATCH /leaves/:id/review
```json
{ "status": "Approved" }   // or "Rejected"
```

---

## DASHBOARD

| Method | Endpoint               | Access | Description                    |
|--------|----------------------|--------|--------------------------------|
| GET    | /dashboard/admin     | Admin  | Full accountability snapshot   |
| GET    | /dashboard/employee  | Any    | Personal dashboard             |

### Admin Dashboard Response
```json
{
  "totalUsersLogged": 5,
  "usersNotLoggedToday": [...],
  "usersUnder4Hours": [{ "user": {...}, "totalHours": 2.5 }],
  "overdueTasks": [...],
  "projectHours": [{ "project": "Neptune CRM", "totalHours": 48 }],
  "totalHoursToday": 32,
  "usersWithNoTasks": [...]
}
```

---

## ERROR RESPONSES

All errors follow this shape:
```json
{
  "success": false,
  "message": "What went wrong",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

| Code | Meaning                         |
|------|---------------------------------|
| 400  | Validation failed               |
| 401  | No token / expired token        |
| 403  | Forbidden (wrong role)          |
| 404  | Resource not found              |
| 409  | Conflict (duplicate email etc.) |
| 500  | Internal server error           |
