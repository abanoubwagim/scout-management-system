package com.scout_system.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.apache.catalina.connector.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.scout_system.model.Attendance;
import com.scout_system.model.Member;
import com.scout_system.model.Tax;
import com.scout_system.service.AttendanceService;
import com.scout_system.service.MemberService;

@RestController
@RequestMapping("/members")
@CrossOrigin(origins = "*")
public class MemberController {


	@Autowired
	private MemberService memberService;

	@Autowired
	private AttendanceService attendanceService;

	// Add Member
	@PostMapping("/addMember")
	public ResponseEntity<?> addMember(@RequestBody Member member) {

		if (memberService.checkCode(member.getCode())) {
			return ResponseEntity.badRequest().body("The code already exists");
		} else {
			Member savedMember = memberService.addMember(member);
			return ResponseEntity.ok(savedMember);
		}

	}

	// Get All Member
	@GetMapping("/allMembers")
	public ResponseEntity<List<Member>> getAllMembers() {
		List<Member> members = memberService.getAllMembers();
		return ResponseEntity.ok(members);
	}

	// Update Member
	@PutMapping("/update/{code}")
	public ResponseEntity<?> updateMember(@PathVariable String code, @RequestBody Member member) {
		if (!memberService.checkCode(code)) {
			return ResponseEntity.status(404).body("Member not found with code: " + code);
		}

		member.setCode(code);
		memberService.addMember(member);
		return ResponseEntity.ok("Member updated successfully");
	}

	// get specific member
	@GetMapping("/member/{code}")
	private ResponseEntity<?> getMember(@PathVariable String code) {
		if (memberService.checkCode(code)) {
			Member member = memberService.findById(code);
			return ResponseEntity.ok(member);

		} else {
			return ResponseEntity.status(404).body("The Member doesn't exist.");
		}
	}

	// delete Member
	@DeleteMapping("/delete/{code}")
	public ResponseEntity<?> deleteMember(@PathVariable String code) {
		try {
			memberService.deleteByCode(code);
			return ResponseEntity.ok("Member Deleted Successfully");
		} catch (RuntimeException e) {
			return ResponseEntity.status(404).body(e.getMessage());
		}
	}

	// Mark Attendance
	@PostMapping("/attend")
	public ResponseEntity<?> attendMember(@RequestBody Map<String, Object> attendanceData) {
		try {
			String code = (String) attendanceData.get("code");
			String category = (String) attendanceData.get("category");
			int amount = attendanceData.get("amount") != null ? ((Number) attendanceData.get("amount")).intValue() : 0;

			if (!memberService.checkCode(code)) {
				return ResponseEntity.status(404).body("Member not found");
			}

			if (attendanceService.hasAlreadyAttendedToday(code, category)) {
				return ResponseEntity.status(400).body("Member has already attended today for category: " + category);
			}

			Member member = memberService.findById(code);

			Attendance attendance = new Attendance();
			attendance.setMember(member);
			attendance.setCategory(category);
			attendance.setCheckInTime(LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm:ss a")));
			attendance.setDateOfDay(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
			attendance.setStatus("Present");

			// Create tax if amount > 0 AND member is NOT a Scout Leader
			if (amount > 0 && !"Scout Leader".equalsIgnoreCase(member.getTitle())) {
				Tax tax = new Tax(attendance, amount);
				attendance.setTaxes(List.of(tax));
			}

			Attendance saved = attendanceService.addAttendance(attendance);

			return ResponseEntity.ok(Map.of("id", saved.getId(), "memberCode", code, "category", saved.getCategory(),
					"checkInTime", saved.getCheckInTime(), "dateOfDay", saved.getDateOfDay(), "status",
					saved.getStatus(), "amount",
					saved.getTaxes() != null ? saved.getTaxes().stream().mapToInt(Tax::getAmount).sum() : 0));

		} catch (Exception e) {
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

	@GetMapping("/getCountAllMember")
	public ResponseEntity<?> countMember() {
		return ResponseEntity.ok(memberService.getCountAllMember());
	}
	
	
	
	@GetMapping("/not-sent")
    public List<Member> getAllNotSentMembers() {
        return memberService.getAllNotSentMembers();
    }

    @PutMapping("/{code}/mark-sent")
    public void markMemberAsSent(@PathVariable String code) {
        memberService.markAsSent(code);
    }

	@GetMapping("/backup")
	public ResponseEntity<String> backupDatabase() {
		com.scout_system.util.DatabaseBackup.backupDatabase();
		return ResponseEntity.ok("Backup created successfully!");
	}
	
	
	

	
	
	
	
}
