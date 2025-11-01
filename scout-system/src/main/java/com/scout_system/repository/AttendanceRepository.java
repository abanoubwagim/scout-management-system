package com.scout_system.repository;

import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.scout_system.model.Attendance;

import jakarta.transaction.Transactional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

	@Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END " + "FROM Attendance a "
			+ "WHERE a.member.code = :memberCode " + "AND a.dateOfDay = :dateOfDay " + "AND a.category = :category")
	boolean hasAlreadyAttendedToday(@Param("memberCode") String memberCode, @Param("dateOfDay") String dateOfDay,
			@Param("category") String category);

	@Query("""
			SELECT a.id, a.memberCode, m.fullName, a.category, a.status, a.checkInTime, a.dateOfDay
			FROM Attendance a
			JOIN Member m ON a.memberCode = m.code
			WHERE a.dateOfDay = :dateOfDay
			  AND m.title <> 'Scout Leader'
			ORDER BY a.checkInTime DESC
			""")
	List<Object[]> findAllWithNamesByDateOfDay(@Param("dateOfDay") String dateOfDay);

	@Query("""
			    SELECT COUNT(DISTINCT a.member.code)
			    FROM Attendance a
			    JOIN a.member m
			    WHERE a.dateOfDay = :today
			      AND a.status = 'Present'
			      AND LOWER(m.title) <> 'scout leader'
			""")
	Long getCountPresentToday(@Param("today") String today);

	@Query("""
			    SELECT COUNT(DISTINCT a.member.code)
			    FROM Attendance a
			    JOIN a.member m
			    WHERE a.dateOfDay = :today
			      AND a.status = 'Absent'
			      AND LOWER(m.title) <> 'scout leader'
			""")
	Long getCountAbsentToday(@Param("today") String today);

	@Query("""
			SELECT new map(
			t.id as id,
			m.code as code,
			m.fullName as fullName,
			a.category as category,
			a.dateOfDay as dateOfDay,
			a.checkInTime as checkInTime
			)
			FROM Tax t
			JOIN t.attendance a
			JOIN a.member m
			WHERE t.amount = -1
			AND a.dateOfDay = :today
			ORDER BY a.checkInTime DESC
			""")
	List<Map<String, Object>> findLateMembersByDate(@Param("today") String today);

	@Query("""
			    SELECT MAX(a.checkInTime)
			    FROM Attendance a
			    JOIN a.member m
			    WHERE a.dateOfDay = :today
			      AND LOWER(m.title) <> 'scout leader'
			      AND a.status <> 'Absent'
			""")
	String getLastCheckInTimeByDate(@Param("today") String today);

	boolean existsByMemberCodeAndDateOfDayAndCategory(String memberCode, String dateOfDay, String category);

	@Query(value = """
		    SELECT
		        a.date_of_day as date,
		        a.member_code as code,
		        m.full_name as name,
		        a.category as category,
		        a.status as status
		    FROM attendance a
		    INNER JOIN members m ON m.code = a.member_code
		    WHERE a.date_of_day = :today
		        AND a.category = :category
		    ORDER BY a.check_in_time DESC
		    """, nativeQuery = true)
		List<Object[]> findAttendanceByCategory(@Param("category") String category, @Param("today") String today);
		
	@Modifying
	@Query("DELETE FROM Attendance a WHERE a.dateOfDay < :cutoffDate")
	int deleteOldRecords(@Param("cutoffDate") String cutoffDate);

}
