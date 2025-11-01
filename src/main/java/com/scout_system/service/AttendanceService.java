package com.scout_system.service;

import java.util.List;
import java.util.Map;

import org.springframework.data.repository.query.Param;

import com.scout_system.model.Attendance;

public interface AttendanceService {

	Attendance addAttendance(Attendance attendance);

	boolean hasAlreadyAttendedToday(String memberCode, String category);

	List<Map<String, Object>> getAllAttendancesPerToday();

	Long getCountPresentToday();

	Long getCountAbsentToday();

	List<Map<String, Object>> findLateMembersByDate();

	String getLastCheckInTimeByDate(@Param("today") String today);

	void markAbsentBuds();

	void markAbsentCubsAndBlossoms();

	void markAbsentScoutsAndGuides();

	List<Map<String, Object>> getScoutsAndGuidesAttendanceByDate();

	public List<Map<String, Object>> getCubsAndBlossomsAttendanceByDate();

	public List<Map<String, Object>> getBudsAttendanceByDate();
}
