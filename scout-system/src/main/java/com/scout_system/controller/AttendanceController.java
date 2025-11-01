package com.scout_system.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.scout_system.ScoutSystemApplication;
import com.scout_system.model.Attendance;
import com.scout_system.model.Member;
import com.scout_system.model.Tax;
import com.scout_system.service.AttendanceService;
import com.scout_system.service.MemberService;

@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

	private final ScoutSystemApplication scoutSystemApplication;

	@Autowired
	private AttendanceService attendanceService;

	@Autowired
	private MemberService memberService;

	AttendanceController(ScoutSystemApplication scoutSystemApplication) {
		this.scoutSystemApplication = scoutSystemApplication;
	}

	@GetMapping("/allAttendancePerToday")
	public ResponseEntity<List<Map<String, Object>>> getAllAttendancePerToday() {
		List<Map<String, Object>> attendances = attendanceService.getAllAttendancesPerToday();
		return ResponseEntity.ok(attendances);
	}

	@GetMapping("/absentToday")
	public ResponseEntity<Long> getAllAbsentAttendance() {
		Long count = attendanceService.getCountAbsentToday();
		return ResponseEntity.ok(count);
	}

	@GetMapping("/presentToday")
	public ResponseEntity<Long> getAllPresentAttendance() {
		Long count = attendanceService.getCountPresentToday();
		return ResponseEntity.ok(count);
	}

	@PostMapping("/attend")
	public ResponseEntity<?> attendMember(@RequestBody Map<String, Object> attendanceData) {
		try {
			String code = (String) attendanceData.get("code");
			String category = (String) attendanceData.get("category");

			if (!memberService.checkCode(code)) {
				return ResponseEntity.status(404).body("Member not found");
			}

			if (attendanceService.hasAlreadyAttendedToday(code, category)) {
				return ResponseEntity.status(400).body("Member has already attended today for category: " + category);
			}

			Member member = memberService.findById(code);

			// Time of Egypt
			ZoneId cairoZone = ZoneId.of("Africa/Cairo");
			LocalTime now = LocalTime.now(cairoZone);

			LocalTime cutoffTime;
			switch (category) {
			case "Scouts and Guides":
				cutoffTime = LocalTime.of(12, 10); // Tax after 12:10 PM
				break;
			case "Cubs and Blossoms":
				cutoffTime = LocalTime.of(12, 10); // Tax after 12:10 PM
				break;
			case "Buds":
				cutoffTime = LocalTime.of(11, 40); // Tax after 11:40 AM
				break;
			default:
				return ResponseEntity.badRequest().body("Invalid category");
			}

			Attendance attendance = new Attendance();
			attendance.setMember(member);
			attendance.setCategory(category);
			attendance.setCheckInTime(now.format(DateTimeFormatter.ofPattern("hh:mm:ss a"))); // 12-hour format
			attendance.setDateOfDay(LocalDate.now(cairoZone).format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
			attendance.setStatus("Present");

			boolean isScoutLeader = "Scout Leader".equalsIgnoreCase(member.getTitle());

			if (now.isAfter(cutoffTime) && !isScoutLeader) {
				Tax tax = new Tax(attendance, -1);
				attendance.setTaxes(List.of(tax));
			}

			Attendance saved = attendanceService.addAttendance(attendance);

			return ResponseEntity.ok(Map.of("id", saved.getId(), "memberCode", code, "category", saved.getCategory(),
					"checkInTime", saved.getCheckInTime(), "dateOfDay", saved.getDateOfDay(), "status",
					saved.getStatus(), "amount",
					saved.getTaxes() != null ? saved.getTaxes().stream().mapToInt(Tax::getAmount).sum() : 0));

		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(500).body("Error marking attendance: " + e.getMessage());
		}
	}

	@GetMapping("/checkAttendance/{code}/{category}")
	public ResponseEntity<?> checkAttendance(@PathVariable String code, @PathVariable String category) {
		try {
			boolean hasAttended = attendanceService.hasAlreadyAttendedToday(code, category);
			return ResponseEntity.ok(Map.of("hasAttended", hasAttended));
		} catch (Exception e) {
			return ResponseEntity.status(500).body("Error checking attendance");
		}
	}

	@GetMapping("/lateToday")
	public ResponseEntity<?> getLateMembersToday() {
		List<Map<String, Object>> result = attendanceService.findLateMembersByDate();
		return ResponseEntity.ok(result);
	}

	@GetMapping("/lastCheckIn")
	public ResponseEntity<?> getLastCheckInTime() {
		try {
			String today = LocalDate.now(ZoneId.of("Africa/Cairo")).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

			String lastTime = attendanceService.getLastCheckInTimeByDate(today);

			return ResponseEntity.ok(Map.of("lastCheckInTime", lastTime));
		} catch (Exception e) {
			return ResponseEntity.status(500)
					.body(Map.of("error", "Failed to fetch last check-in time", "message", e.getMessage()));
		}
	}

	@GetMapping("/scouts-and-guides")
	public ResponseEntity<List<Map<String, Object>>> getScoutsAndGuides() {
	    List<Map<String, Object>> result = attendanceService.getScoutsAndGuidesAttendanceByDate();
	    return result.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(result);
	}

	@GetMapping("/cubs-and-blossoms")
	public ResponseEntity<List<Map<String, Object>>> getCubsAndBlossoms() {
	    List<Map<String, Object>> result = attendanceService.getCubsAndBlossomsAttendanceByDate();
	    return result.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(result);
	}

	@GetMapping("/buds")
	public ResponseEntity<List<Map<String, Object>>> getBuds() {
	    List<Map<String, Object>> result = attendanceService.getBudsAttendanceByDate();
	    return result.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(result);
	}

}
