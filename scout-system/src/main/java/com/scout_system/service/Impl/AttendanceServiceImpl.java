package com.scout_system.service.Impl;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.scout_system.model.Attendance;
import com.scout_system.model.Member;
import com.scout_system.repository.AttendanceRepository;
import com.scout_system.repository.MemberRepository;
import com.scout_system.service.AttendanceService;

import jakarta.transaction.Transactional;

@Service
public class AttendanceServiceImpl implements AttendanceService {

	private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

	@Autowired
	private AttendanceRepository attendanceRepository;

	@Autowired
	private MemberRepository memberRepository;
	
	

	@Override
	@Transactional
	public Attendance addAttendance(Attendance attendance) {
		return attendanceRepository.save(attendance);
	}

	@Override
	@Transactional
	public boolean hasAlreadyAttendedToday(String memberCode, String category) {
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
		return attendanceRepository.hasAlreadyAttendedToday(memberCode, today, category);
	}

	@Override
	@Transactional
	public List<Map<String, Object>> getAllAttendancesPerToday() {
		String today = LocalDate.now().toString();
		List<Object[]> rows = attendanceRepository.findAllWithNamesByDateOfDay(today);

		List<Map<String, Object>> result = new ArrayList<>();

		for (Object[] row : rows) {
			Map<String, Object> map = new HashMap<>();
			map.put("id", row[0]);
			map.put("memberCode", row[1]);
			map.put("fullName", row[2]);
			map.put("category", row[3]);
			map.put("status", row[4]);
			map.put("checkInTime", row[5]);
			map.put("dateOfDay", row[6]);
			result.add(map);
		}
		return result;

	}

	@Override
	@Transactional
	public Long getCountAbsentToday() {
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
		return attendanceRepository.getCountAbsentToday(today);
	}

	@Override
	@Transactional
	public Long getCountPresentToday() {
		String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
		return attendanceRepository.getCountPresentToday(today);
	}

	@Override
	@Transactional
	public List<Map<String, Object>> findLateMembersByDate() {
		String today = LocalDate.now(ZoneId.of("Africa/Cairo")).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
		return attendanceRepository.findLateMembersByDate(today);
	}

	@Override
	@Transactional
	public String getLastCheckInTimeByDate(String today) {
		String lastTime = attendanceRepository.getLastCheckInTimeByDate(today);
		return lastTime != null ? lastTime : "No attendance found for today";
	}

	// Buds → after 11:50 AM (starts 11:51)
	@Override
	@Scheduled(cron = "0 51 11 * * *", zone = "Africa/Cairo")
	@Transactional
	public void markAbsentBuds() {
		markAbsentByCategory("Buds");
	}

	// Cubs and Blossoms → after 12:30 PM (starts 12:31)
	@Override
	@Scheduled(cron = "0 31 12 * * *", zone = "Africa/Cairo")
	@Transactional
	public void markAbsentCubsAndBlossoms() {
		markAbsentByCategory("Cubs and Blossoms");
	}

	// Scouts and Guides → after 12:30 PM (starts 12:33)
	@Override
	@Scheduled(cron = "0 32 12 * * *", zone = "Africa/Cairo")
	@Transactional
	public void markAbsentScoutsAndGuides() {
		markAbsentByCategory("Scouts and Guides");
	}

	private void markAbsentByCategory(String category) {
		String today = LocalDate.now(ZoneId.of("Africa/Cairo")).format(DATE_FORMAT);
		List<Member> members = memberRepository.findByCategory(category);

		for (Member member : members) {

			if ("Scout Leader".equalsIgnoreCase(member.getTitle())) {
				continue;
			}

			boolean hasAttended = attendanceRepository.existsByMemberCodeAndDateOfDayAndCategory(member.getCode(),
					today, category);

			if (!hasAttended) {
				Attendance attendance = new Attendance();
				attendance.setMember(member);
				attendance.setCategory(category);
				attendance.setDateOfDay(today);
				attendance.setCheckInTime("—");
				attendance.setStatus("Absent");
				attendanceRepository.save(attendance);
			}
		}
	}

	@Override
	public List<Map<String, Object>> getScoutsAndGuidesAttendanceByDate() {
		String today = LocalDate.now(ZoneId.of("Africa/Cairo")).format(DATE_FORMAT);
	    return convertToMap(attendanceRepository.findAttendanceByCategory("Scouts and Guides", today));
	}

	@Override
	public List<Map<String, Object>> getCubsAndBlossomsAttendanceByDate() {
		String today = LocalDate.now(ZoneId.of("Africa/Cairo")).format(DATE_FORMAT);
	    return convertToMap(attendanceRepository.findAttendanceByCategory("Cubs and Blossoms", today));
	}

	@Override
	public List<Map<String, Object>> getBudsAttendanceByDate() {
		String today = LocalDate.now(ZoneId.of("Africa/Cairo")).format(DATE_FORMAT);
	    return convertToMap(attendanceRepository.findAttendanceByCategory("Buds", today));
	}

	private List<Map<String, Object>> convertToMap(List<Object[]> rawData) {
	    List<Map<String, Object>> result = new ArrayList<>();
	    
	    for (Object[] row : rawData) {
	        Map<String, Object> map = new HashMap<>();
	        map.put("date", row[0]);
	        map.put("code", row[1]);
	        map.put("name", row[2]);
	        map.put("category", row[3]);
	        map.put("status", row[4]);
	        result.add(map);
	    }
	    
	    return result;
	}

}
