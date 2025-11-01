# Scout Management System

A complete web-based system for managing scout organizations - members, attendance, activities, and WhatsApp communications.

## Features

- **Member Management** - Add, edit, delete, and search scout members with auto-generated codes
- **QR Attendance** - Scan QR codes to mark attendance with automatic late detection
- **Financial Tracking** - Track late fees and generate revenue reports
- **Activity Management** - Create and manage scout activities and events
- **WhatsApp Integration** - Send automated messages to members
- **PDF Reports** - Export member lists, attendance, and financial reports
- **Offline Operation** - Works completely offline with mobile hotspot support

## Technology Stack

- Java 17
- Spring Boot 3.x
- SQLite Database
- Bootstrap 5.3
- Selenium WebDriver
- jsPDF


## 📂 **Folder Structure Diagram:**
```
📦 scout-system
│
├── 📂 src/main/java/com/scout_system/
│   ├── 📂 controller/         # REST API Controllers (6 files)
│   ├── 📂 service/            # Business Logic (7 services)
│   ├── 📂 repository/         # JPA Repositories (5 files)
│   ├── 📂 model/              # Entity Models (5 entities)
│   ├── 📂 config/             # Security & App Config
│   └── 📄 ScoutSystemApplication.java
│
├── 📂 src/main/resources/
│   ├── 📄 application.properties
│   └── 📂 static/
│       ├── 📂 assets/
│       │   ├── 📂 css/        # Stylesheets
│       │   ├── 📂 img/        # Images & logos
│       │   └── 📂 js/         # JavaScript modules (9 files)
│       └── 📂 pages/          # HTML pages (8 pages)
│
└── 📄 scout_system.db     # SQLite database
│
├── 📂 whatsapp-session/       # Chrome profile data In C Partition 
│
├── 📄 pom.xml                 # Maven dependencies
└── 📄 .gitignore


  
```
## Quick Start

1. Clone the repository
```bash
git clone https://github.com/abanoubwagim/scout-management-system.git
cd scout-management-system
```

2. Build the project
```bash
mvn clean package
```

3. Run the application
```bash
java -jar target/scout-management-system-1.0.0.jar
```

4. Open your browser
```
http://localhost:9090/signIn.html
```

5. Login with default credentials
- Username: `admin`
- Password: `admin123`

## 👤 Admin Management

### Register Admin (POST)
Create new admin account.

**Endpoint:** `POST /register`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "userName": "johndoe",
  "password": "securePassword123"
}
```

**Success Response:** `200 OK`
```json
{
  "message": "The user registered successfully",
  "userName": "johndoe",
  "id": 1
}
```

**Error Response:** `400 Bad Request`
```json
{
  "error": "The user already exists"
}
```

### Register Admin (GET)
Create admin via URL parameters (for quick setup).

**Endpoint:** `GET /register`

**Query Parameters:**
- `fullName` (string, required) - Full name
- `userName` (string, required) - Username
- `password` (string, required) - Password

**Example:**
```
GET /register?fullName=Admin&userName=admin&password=admin123
```

**Success Response:** `200 OK`
```json
{
  "message": "The user registered successfully",
  "fullName": "Admin",
  "userName": "admin",
  "id": 1
}
```

### Get All Admins
Retrieve list of all admin accounts.

**Endpoint:** `GET /allAdmins`

**Success Response:** `200 OK`
```json
[
  {
    "id": 1,
    "fullName": "Admin User",
    "userName": "admin",
    "password": "$2a$10$..." // Hash Password
  }
]
```

## 👥 Member Management

### Add Member
Create a new scout member.

**Endpoint:** `POST /members/addMember`

**Request Body:**
```json
{
  "code": "251201",
  "fullName": "Abanoub Wagim",
  "title": "Scout Member",
  "dateOfBirth": "01/12/2025",
  "phone": "01111111111",
  "address": "Cairo, Egypt",
  "category": "Scouts and Guides"
}
```

**Field Validations:**
- `code`: Exactly 6 digits (YYMMDD format)
- `phone`: 11 digits starting with "01"
- `category`: "Scouts and Guides" | "Cubs and Blossoms" | "Buds"
- `title`: "Scout Leader" | "Scout Assistant" | "Scout Member"

**Success Response:** `200 OK`
```json
{
  "code": "251201",
  "fullName": "Abanoub Wagim",
  "title": "Scout Member",
  "dateOfBirth": "01/12/2025",
  "phone": "011111111111",
  "address": "Cairo, Egypt",
  "category": "Scouts and Guides",
  "sent": false
}
```

### Get All Members
Retrieve all scout members.

**Endpoint:** `GET /members/allMembers`

**Success Response:** `200 OK`
```json
[
  {
    "code": "251201",
    "fullName": "Abanoub Wagim",
    "title": "Scout Member",
    "dateOfBirth": "01/12/2025",
    "phone": "011111111111",
    "address": "Cairo, Egypt",
    "category": "Scouts and Guides",
    "sent": false
  }
]
```

### Get Member by Code
Retrieve specific member details.

**Endpoint:** `GET /members/member/{code}`

**Example:**
```
GET /members/member/251201
```

**Success Response:** `200 OK`
```json
{
  "code": "251201",
  "fullName": "Abanoub Wagim",
  "title": "Scout Member",
  "dateOfBirth": "01/12/2025",
  "phone": "011111111111",
  "address": "Cairo, Egypt",
  "category": "Scouts and Guides",
  "sent": false
}
```

### Update Member
Update existing member information.

**Endpoint:** `PUT /members/update/{code}`

**Request Body:**
```json
{
  "fullName": "Abanoub Wagim",
  "title": "Scout Leader",
  "dateOfBirth": "01/12/2025",
  "phone": "011111111111",
  "address": "New Cairo, Egypt",
  "category": "Scouts and Guides"
}
```

**Success Response:** `200 OK`
```json
"Member updated successfully"
```

### Delete Member
Remove member from system.

**Endpoint:** `DELETE /members/delete/{code}`

**Success Response:** `200 OK`
```json
"Member Deleted Successfully"
```

**Notes:**
- Cascading delete: removes all associated attendance and tax records

### Get Total Member Count
**Endpoint:** `GET /members/getCountAllMember`

**Success Response:** `200 OK`
```json
125
```

### Database Backup
Trigger manual database backup.

**Endpoint:** `GET /members/backup`

**Success Response:** `200 OK`
```json
"Backup created successfully!"
```

## ✅ Attendance Management

### Get Today's Attendance
Retrieve all attendance records for today.

**Endpoint:** `GET /attendance/allAttendancePerToday`

**Success Response:** `200 OK`
```json
[
  {
    "id": 1,
    "memberCode": "251201",
    "fullName": "Abanoub Wagim",
    "category": "Scouts and Guides",
    "status": "Present",
    "checkInTime": "11:45:30 AM",
    "dateOfDay": "2025-11-01"
  }
]
```

### Get Present Count Today
**Endpoint:** `GET /attendance/presentToday`

**Success Response:** `200 OK`
```json
45
```

### Get Absent Count Today
**Endpoint:** `GET /attendance/absentToday`

**Success Response:** `200 OK`
```json
12
```

### Record Attendance (QR System)
Mark attendance with automatic late tax calculation.

**Endpoint:** `POST /attendance/attend`

**Request Body:**
```json
{
  "code": "251201",
  "category": "Scouts and Guides"
}
```

**Success Response:** `200 OK`
```json
{
  "id": 123,
  "memberCode": "251201",
  "category": "Scouts and Guides",
  "checkInTime": "12:15:30 PM",
  "dateOfDay": "2025-11-01",
  "status": "Present",
  "amount": -1
}
```

**Time Windows:**
- Scouts and Guides: Before 12:10 PM = No tax, After = Tax
- Cubs and Blossoms: Before 12:10 PM = No tax, After = Tax
- Buds: Before 11:40 AM = No tax, After = Tax

### Get Late Members Today
**Endpoint:** `GET /attendance/lateToday`

**Success Response:** `200 OK`
```json
[
  {
    "id": 15,
    "code": "251201",
    "fullName": "Abanoub Wagim",
    "category": "Scouts and Guides",
    "dateOfDay": "2025-11-01",
    "checkInTime": "12:15:30 PM"
  }
]
```

### Get Category Attendance
- `GET /attendance/scouts-and-guides`
- `GET /attendance/cubs-and-blossoms`
- `GET /attendance/buds`

## 💰 Tax Management

### Get Daily Total Taxes
**Endpoint:** `GET /taxes/dailyTotal`

**Success Response:** `200 OK`
```json
[
  {
    "date": "01-11-2025",
    "totalAmount": 150.0,
    "day": "Friday"
  }
]
```

### Get Monthly Total Taxes
**Endpoint:** `GET /taxes/monthlyTotal`

**Success Response:** `200 OK`
```json
[
  {
    "date": "2025-11",
    "monthName": "November",
    "amount": 450.0
  }
]
```

### Get Total Revenue
**Endpoint:** `GET /taxes/totalRevenue`

**Success Response:** `200 OK`
```json
5420
```

### Update Tax Amount
**Endpoint:** `POST /taxes/updateAmount`

**Request Body:**
```json
{
  "taxId": 15,
  "amount": 10
}
```

**Success Response:** `200 OK`
```json
{
  "message": "Tax updated successfully",
  "taxId": 15,
  "newAmount": 10
}
```

### Get Today's Category Taxes
- `GET /taxes/today/scoutsAndGuides`
- `GET /taxes/today/cubsAndBlossoms`
- `GET /taxes/today/buds`

## 🎯 Activity Management

### Add Activity
**Endpoint:** `POST /activities/addActivity`

**Request Body:**
```json
{
  "name": "Annual Camp 2025",
  "date": "25-12-2025",
  "location": "Sinai Desert",
  "description": "Week-long camping trip",
  "status": "upcoming"
}
```

### Get All Activities
**Endpoint:** `GET /activities/allActivities`

### Delete Activity
**Endpoint:** `DELETE /activities/delete/{id}`

### Mark Activity as Completed
**Endpoint:** `POST /activities/completed/{id}`

### Get Activity Statistics
- `GET /activities/totalActivity` - Total count
- `GET /activities/upComingActivity` - Upcoming count
- `GET /activities/completedActivity` - Completed count

## 📱 WhatsApp Integration

### Send Message to Single Member
**Endpoint:** `POST /whatsapp/send/{code}`

**Success Response:** `200 OK`
```json
"✅ Message sent successfully to Abanoub Wagim"
```

### Send Messages to All Pending Members
**Endpoint:** `POST /whatsapp/send-all`

**Success Response:** `200 OK`
```json
"Messages sending process completed"
```

### Get Pending Members
**Endpoint:** `GET /whatsapp/pending`

### Get Pending Count
**Endpoint:** `GET /whatsapp/pending/count`

### Reset Sent Status
**Endpoint:** `PUT /whatsapp/reset/{code}`

### Get Total Messages Sent
**Endpoint:** `GET /whatsapp/totalMessageSent`

## ⚠️ Error Handling

### HTTP Status Codes
| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful request |
| 204 | No Content | Successful but no data |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Authentication failed |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server error |

### Common Errors

**Member Not Found (404)**
```json
{
  "error": "The Member doesn't exist."
}
```

**Already Attended (400)**
```json
{
  "error": "Member has already attended today for category: Scouts and Guides"
}
```

**Duplicate Code (400)**
```json
{
  "error": "The code already exists"
}
```

## Configuration

Edit `application.properties`:
```properties
server.port=9090
spring.datasource.url=jdbc:sqlite:database/scout_system.db
```

## Requirements

- Java 17 or higher
- Maven 3.6+
- Google Chrome (for WhatsApp)
- ChromeDriver

## Support

For issues or questions, open an issue on GitHub.

<div align="center">

### Made with ❤️ for Mar-Mina Scouts In Egypt.

**This project is open source and available for any scout organization to use and customize.**

**If this project helped you, please consider giving it a ⭐!**

[⬆ Back to Top](#scout-management-system)

</div>
