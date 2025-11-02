# 🎯 Scout Management System

<div align="center">

![Scout Management System](https://img.shields.io/badge/Scout-Management-blue?style=for-the-badge)
![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?style=for-the-badge&logo=spring)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A complete web-based system for managing scout organizations - members, attendance, activities, and WhatsApp communications.**

[Features](#-features) • [Quick Start](#-quick-start) • [API Documentation](#-api-documentation) • [Tech Stack](#-technology-stack)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
  - [Member Management](#-member-management)
  - [Attendance System](#-attendance-management)
  - [Financial Tracking](#-tax-management)
  - [Activity Management](#-activity-management)
  - [WhatsApp Integration](#-whatsapp-integration)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## ✨ Features

### 👥 Member Management
- ✅ Add, edit, delete, and search scout members
- ✅ Auto-generated member codes (YYMMDD format)
- ✅ Categorization by age groups
- ✅ Phone and address validation
- ✅ Export member lists to PDF

### 📸 QR Attendance System
- ✅ Scan QR codes to mark attendance
- ✅ Automatic late detection with configurable time windows
- ✅ Real-time attendance tracking
- ✅ Daily attendance reports
- ✅ Category-based attendance filtering

### 💰 Financial Tracking
- ✅ Automatic late fee calculation
- ✅ Daily and monthly revenue reports
- ✅ Tax amount customization
- ✅ Financial export to PDF
- ✅ Revenue analytics

### 🎯 Activity Management
- ✅ Create and manage scout activities and events
- ✅ Activity status tracking (upcoming/completed)
- ✅ Location and description details
- ✅ Activity statistics dashboard

### 📱 WhatsApp Integration
- ✅ Automated message sending to members
- ✅ Bulk messaging capabilities
- ✅ Message tracking and status
- ✅ Selenium-based WhatsApp Web automation

### 📄 Reporting & Export
- ✅ PDF generation for all reports
- ✅ Member lists with filters
- ✅ Attendance summaries
- ✅ Financial statements

### 🔒 Additional Features
- ✅ Admin authentication system
- ✅ Database backup functionality
- ✅ Offline operation support
- ✅ Mobile hotspot compatibility
- ✅ RESTful API architecture

---

## 🛠 Technology Stack

| Category | Technology |
|----------|-----------|
| **Backend** | Java 17, Spring Boot 3.x |
| **Database** | SQLite |
| **Frontend** | Bootstrap 5.3, HTML5, CSS3, JavaScript |
| **Automation** | Selenium WebDriver |
| **PDF Generation** | jsPDF |
| **Build Tool** | Maven |

---

## 📂 Project Structure

```
📦 scout-system
│
├── 📂 src/main/java/com/scout_system/
│   ├── 📂 controller/         # REST API Controllers (6 files)
│   │   ├── MemberController.java
│   │   ├── AttendanceController.java
│   │   ├── TaxController.java
│   │   ├── ActivityController.java
│   │   ├── WhatsAppController.java
│   │   └── AuthController.java
│   │
│   ├── 📂 service/            # Business Logic (7 services)
│   │   ├── MemberService.java
│   │   ├── AttendanceService.java
│   │   ├── TaxService.java
│   │   ├── ActivityService.java
│   │   ├── WhatsAppService.java
│   │   ├── BackupService.java
│   │   └── AuthService.java
│   │
│   ├── 📂 repository/         # JPA Repositories (5 files)
│   │   ├── MemberRepository.java
│   │   ├── AttendanceRepository.java
│   │   ├── TaxRepository.java
│   │   ├── ActivityRepository.java
│   │   └── AdminRepository.java
│   │
│   ├── 📂 model/              # Entity Models (5 entities)
│   │   ├── Member.java
│   │   ├── Attendance.java
│   │   ├── Tax.java
│   │   ├── Activity.java
│   │   └── Admin.java
│   │
│   ├── 📂 config/             # Configuration
│   │   ├── SecurityConfig.java
│   │   └── WebConfig.java
│   │
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
│           ├── signIn.html
│           ├── register.html
│           ├── dashboard.html
│           ├── members.html
│           ├── attendance.html
│           ├── activities.html
│           ├── reports.html
│           └── settings.html
│
├── 📂 database/
│   └── 📄 scout_system.db     # SQLite database
│
├── 📂 whatsapp-session/       # Chrome profile data
│
├── 📄 pom.xml                 # Maven dependencies
├── 📄 .gitignore
└── 📄 README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Java 17** or higher
- **Maven 3.6+**
- **Google Chrome** (for WhatsApp integration)
- **ChromeDriver** (compatible with your Chrome version)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/abanoubwagim/scout-management-system.git
cd scout-management-system
```

2. **Build the project**
```bash
mvn clean package
```

3. **Run the application**
```bash
java -jar target/scout-management-system-1.0.0.jar
```

4. **Access the application**

Open your browser and navigate to:
```
http://localhost:9090/signIn.html
```

5. **Login with default credentials**
```
Username: admin
Password: admin123
```

### First-Time Setup

1. Register a new admin account at `http://localhost:9090/register.html`
2. Login with your new credentials
3. Start adding scout members
4. Configure WhatsApp session (first-time QR scan required)

---

## ⚙️ Configuration

Edit `src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=9090

# Database Configuration
spring.datasource.url=jdbc:sqlite:database/scout_system.db
spring.datasource.driver-class-name=org.sqlite.JDBC
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# WhatsApp Configuration
whatsapp.session.path=C:/whatsapp-session
whatsapp.chrome.driver.path=chromedriver.exe
```

### Time Windows for Late Detection

Configure in `AttendanceService.java`:

```java
// Scouts and Guides: 12:10 PM
// Cubs and Blossoms: 12:10 PM
// Buds: 11:40 AM
```

---

## 📚 API Documentation

Base URL: `http://localhost:9090`

### 👥 Member Management

#### Add New Member
```http
POST /members/addMember
Content-Type: application/json

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

#### Get All Members
```http
GET /members/allMembers
```

#### Get Member by Code
```http
GET /members/member/{code}
```

#### Update Member
```http
PUT /members/update/{code}
Content-Type: application/json

{
  "fullName": "Abanoub Wagim",
  "title": "Scout Leader",
  "dateOfBirth": "01/12/2025",
  "phone": "01111111111",
  "address": "New Address",
  "category": "Scouts and Guides"
}
```

#### Delete Member
```http
DELETE /members/delete/{code}
```

#### Get Member Count
```http
GET /members/getCountAllMember
```

#### Backup Database
```http
GET /members/backup
```

---

### ✅ Attendance Management

#### Record Attendance (QR Scan)
```http
POST /attendance/attend
Content-Type: application/json

{
  "code": "251201",
  "category": "Scouts and Guides"
}
```

**Response:**
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

#### Get Today's Attendance
```http
GET /attendance/allAttendancePerToday
```

#### Get Present Count
```http
GET /attendance/presentToday
```

#### Get Absent Count
```http
GET /attendance/absentToday
```

#### Get Late Members Today
```http
GET /attendance/lateToday
```

#### Get Category Attendance
```http
GET /attendance/scouts-and-guides
GET /attendance/cubs-and-blossoms
GET /attendance/buds
```

---

### 💰 Tax Management

#### Get Daily Totals
```http
GET /taxes/dailyTotal
```

**Response:**
```json
[
  {
    "date": "01-11-2025",
    "totalAmount": 150.0,
    "day": "Friday"
  }
]
```

#### Get Monthly Totals
```http
GET /taxes/monthlyTotal
```

#### Get Total Revenue
```http
GET /taxes/totalRevenue
```

#### Update Tax Amount
```http
POST /taxes/updateAmount
Content-Type: application/json

{
  "taxId": 15,
  "amount": 10
}
```

#### Get Category Taxes
```http
GET /taxes/today/scoutsAndGuides
GET /taxes/today/cubsAndBlossoms
GET /taxes/today/buds
```

---

### 🎯 Activity Management

#### Add Activity
```http
POST /activities/addActivity
Content-Type: application/json

{
  "name": "Annual Camp 2025",
  "date": "25-12-2025",
  "location": "Sinai Desert",
  "description": "Week-long camping trip",
  "status": "upcoming"
}
```

#### Get All Activities
```http
GET /activities/allActivities
```

#### Delete Activity
```http
DELETE /activities/delete/{id}
```

#### Mark as Completed
```http
POST /activities/completed/{id}
```

#### Get Statistics
```http
GET /activities/totalActivity
GET /activities/upComingActivity
GET /activities/completedActivity
```

---

### 📱 WhatsApp Integration

#### Send Message to Member
```http
POST /whatsapp/send/{code}
```

#### Send to All Pending
```http
POST /whatsapp/send-all
```

#### Get Pending Members
```http
GET /whatsapp/pending
```

#### Get Pending Count
```http
GET /whatsapp/pending/count
```

#### Reset Sent Status
```http
PUT /whatsapp/reset/{code}
```

#### Get Total Sent
```http
GET /whatsapp/totalMessageSent
```

---

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

### Common Error Responses

**Member Not Found**
```json
{
  "error": "The Member doesn't exist."
}
```

**Duplicate Attendance**
```json
{
  "error": "Member has already attended today for category: Scouts and Guides"
}
```

**Duplicate Member Code**
```json
{
  "error": "The code already exists"
}
```

---

## 📸 Screenshots

> *Coming soon - Add screenshots of your application here*

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 💬 Support

For issues, questions, or feature requests:

- 📧 Email: abanoubwagim@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/abanoubwagim/scout-management-system/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/abanoubwagim/scout-management-system/discussions)

---

## 🙏 Acknowledgments

- Built with ❤️ for **Mar-Mina Scouts** in Egypt
- Thanks to all contributors and the scout community
- Special thanks to the Spring Boot and Bootstrap communities

---

## 🌟 Star History

If this project helped you, please consider giving it a ⭐!

---

<div align="center">

### 🎯 This project is open source and available for any scout organization to use and customize.

**Made with ❤️ for Scout Organizations Worldwide**

[⬆ Back to Top](#-scout-management-system)

</div>
