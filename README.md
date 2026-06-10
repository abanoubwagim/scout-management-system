# Scout System

Backend API for managing the scout group at Mar Mena Church. It covers member registration, attendance tracking, late-fee calculations, activity scheduling, and WhatsApp notifications.

The frontend was built by a colleague based on the languages and requirements the frontend team specified. 

---

## Tech Stack

- Java 17 / Spring Boot
- SQLite (WAL mode enabled)
- Spring Security with BCrypt
- Selenium WebDriver (WhatsApp Web automation)
- Spring Scheduling

---

## Features

### Members

Each member has a unique 6-character code and belongs to one of three categories: Scouts and Guides, Cubs and Blossoms, or Buds. Members with the title "Scout Leader" are excluded from late fees and do not appear in daily attendance counts.

### Attendance

Members check in per category and session. The system records the check-in time and compares it against the cutoff for that category:

| Category          | Cutoff   |
|-------------------|----------|
| Scouts and Guides | 12:10 PM |
| Cubs and Blossoms | 12:10 PM |
| Buds              | 11:40 AM |

If a member checks in after the cutoff, a tax record is created automatically. Scout Leaders are always exempt.

### Taxes (Late Fees)

Each late check-in creates a tax entry linked to that attendance record. Amounts can be adjusted manually after the fact. The system tracks daily totals, monthly totals, and total revenue over time.

### Activities

Activities have a name, date, location, description, and status (upcoming or completed). Status is updated manually via the API.

### WhatsApp Notifications

Uses Selenium WebDriver to automate WhatsApp Web and send messages to members who have not been notified yet. An `is_sent` flag on each member record prevents duplicate sends. You can trigger sends per member or run a bulk send for all pending members.

### Admin Authentication

Session-based login with BCrypt password hashing. Admins can upload a profile image (stored as a blob in the database).

### Scheduled Cleanup

Attendance and tax records older than 6 months are deleted automatically every Friday at 11 AM Cairo time. The same check also runs on application startup. A manual trigger endpoint is available if needed.

### Database Backup

A single API call creates a timestamped copy of the SQLite file under `backups/`.

---

## Prerequisites

- Java 17+
- Maven
- Google Chrome + ChromeDriver
  - The driver path is currently set to `C:\chromedriver\chromedriver.exe` in `ScoutSystemApplication.java`. Update this if your setup differs.

---

## Getting Started

```bash
git clone https://github.com/abanoubwagim/scout-management-system.git
cd scout-management-system
./mvnw spring-boot:run
```

The app starts on port 9090. SQLite creates `scout-system.db` automatically on first run.

---

## API Reference

A Postman collection is available at `docs/Scout System API.postman.json`.

### Members

| Method | Endpoint                                     | Description                                     |
|--------|----------------------------------------------|-------------------------------------------------|
| POST   | `/members/addMember`                         | Register a new member                           |
| GET    | `/members/allMembers`                        | List all members                                |
| GET    | `/members/member/{code}`                     | Get member by code                              |
| PUT    | `/members/update/{code}`                     | Update member                                   |
| DELETE | `/members/delete/{code}`                     | Delete member                                   |
| GET    | `/members/getCountAllMember`                 | Total member count                              |
| POST   | `/members/attend`                            | Mark attendance with optional manual tax amount |
| GET    | `/members/checkAttendance/{code}/{category}` | Check if member attended today                  |
| GET    | `/members/not-sent`                          | Members with unsent WhatsApp messages           |
| PUT    | `/members/{code}/mark-sent`                  | Mark member as notified                         |
| GET    | `/members/backup`                            | Trigger a database backup                       |

### Attendance

| Method | Endpoint                                        | Description                                |
|--------|-------------------------------------------------|--------------------------------------------|
| POST   | `/attendance/attend`                            | Mark attendance (automatic late-fee logic) |
| GET    | `/attendance/allAttendancePerToday`             | All attendance records for today           |
| GET    | `/attendance/presentToday`                      | Present count today                        |
| GET    | `/attendance/absentToday`                       | Absent count today                         |
| GET    | `/attendance/lateToday`                         | Late members today                         |
| GET    | `/attendance/lastCheckIn`                       | Last check-in time today                   |
| GET    | `/attendance/checkAttendance/{code}/{category}` | Check attendance status for a member       |
| GET    | `/attendance/scouts-and-guides`                 | Today's Scouts and Guides records          |
| GET    | `/attendance/cubs-and-blossoms`                 | Today's Cubs and Blossoms records          |
| GET    | `/attendance/buds`                              | Today's Buds records                       |

### Activities

| Method | Endpoint                        | Description                |
|--------|---------------------------------|----------------------------|
| POST   | `/activities/addActivity`       | Create an activity         |
| GET    | `/activities/allActivities`     | List all activities        |
| DELETE | `/activities/delete/{id}`       | Delete an activity         |
| POST   | `/activities/completed/{id}`    | Mark activity as completed |
| GET    | `/activities/totalActivity`     | Total activity count       |
| GET    | `/activities/upComingActivity`  | Upcoming activity count    |
| GET    | `/activities/completedActivity` | Completed activity count   |

### Taxes

| Method | Endpoint                       | Description                                    |
|--------|--------------------------------|------------------------------------------------|
| GET    | `/taxes/totalRevenue`          | All-time total collected                       |
| GET    | `/taxes/currentMonthTotal`     | Current month total                            |
| GET    | `/taxes/dailyTotal`            | Daily breakdown                                |
| GET    | `/taxes/monthlyTotal`          | Monthly breakdown with month names             |
| GET    | `/taxes/totalTransactions`     | Total number of days with transactions         |
| GET    | `/taxes/today/scoutsAndGuides` | Today's late-fee records for Scouts and Guides |
| GET    | `/taxes/today/cubsAndBlossoms` | Today's late-fee records for Cubs and Blossoms |
| GET    | `/taxes/today/buds`            | Today's late-fee records for Buds              |
| POST   | `/taxes/updateAmount`          | Update a tax record's amount                   |
| GET    | `/taxes/updatedTaxMembers`     | Members whose tax was manually adjusted today  |

### Admin

| Method | Endpoint                    | Description                                  |
|--------|-----------------------------|----------------------------------------------|
| POST   | `/login`                    | Login                                        |
| POST   | `/logout`                   | Logout                                       |
| POST   | `/register`                 | Register a new admin                         |
| GET    | `/admin/profile/{username}` | Get admin profile (image returned as Base64) |
| POST   | `/cleanup-old-data`         | Trigger manual data cleanup                  |

### WhatsApp

| Method | Endpoint                     | Description                          |
|--------|------------------------------|--------------------------------------|
| POST   | `/whatsapp/send/{code}`      | Send a message to a specific member  |
| POST   | `/whatsapp/send-all`         | Send messages to all pending members |
| GET    | `/whatsapp/pending`          | List members with unsent messages    |
| GET    | `/whatsapp/pending/count`    | Count of pending messages            |
| PUT    | `/whatsapp/reset/{code}`     | Reset sent status for a member       |
| GET    | `/whatsapp/totalMessageSent` | Total messages sent                  |

---

## Notes

**Authentication** — Session-based, not token-based. CSRF protection is disabled. This is intentional for an intranet deployment where the frontend and backend run on the same network.

**WhatsApp automation** — Requires Chrome and ChromeDriver. The driver path is hardcoded for Windows. On first use, you will need to scan the WhatsApp Web QR code; the session is reused across calls as long as the driver stays active.

**Database** — SQLite runs in WAL mode with `busy_timeout=5000`. The database file is `scout-system.db` in the project root. Timestamped backups go to `backups/`.

---

## Project

Built as a volunteer project for the scout group at Mar Mena Church.
Backend: Abanoub Wagim - Frontend: Ramy Ayman