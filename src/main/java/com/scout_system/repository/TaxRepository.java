package com.scout_system.repository;

import java.util.List;
import java.util.Map;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.scout_system.model.Tax;

import jakarta.transaction.Transactional;

public interface TaxRepository extends JpaRepository<Tax, Long> {

	@Query(value = """
			    SELECT
			        strftime('%d-%m-%Y', a.date_of_day) AS date,
			        SUM(t.amount) AS totalAmount,
			        CASE strftime('%w', a.date_of_day)
			            WHEN '0' THEN 'Sunday'
			            WHEN '1' THEN 'Monday'
			            WHEN '2' THEN 'Tuesday'
			            WHEN '3' THEN 'Wednesday'
			            WHEN '4' THEN 'Thursday'
			            WHEN '5' THEN 'Friday'
			            WHEN '6' THEN 'Saturday'
			        END AS day
			    FROM taxes t
			    JOIN attendance a ON t.attendance_id = a.id
			    WHERE t.amount > 0
			    GROUP BY strftime('%d-%m-%Y', a.date_of_day)
			    ORDER BY strftime('%Y-%m-%d', a.date_of_day) DESC
			""", nativeQuery = true)
	List<Map<String, Object>> getTotalTaxPerDay();

	@Query(value = """
			    SELECT
			        strftime('%Y-%m', a.date_of_day) AS date,
			        CASE CAST(strftime('%m', a.date_of_day) AS INTEGER)
			            WHEN 1 THEN 'January'
			            WHEN 2 THEN 'February'
			            WHEN 3 THEN 'March'
			            WHEN 4 THEN 'April'
			            WHEN 5 THEN 'May'
			            WHEN 6 THEN 'June'
			            WHEN 7 THEN 'July'
			            WHEN 8 THEN 'August'
			            WHEN 9 THEN 'September'
			            WHEN 10 THEN 'October'
			            WHEN 11 THEN 'November'
			            WHEN 12 THEN 'December'
			        END AS monthName,
			        SUM(t.amount) AS amount
			    FROM taxes t
			    JOIN attendance a ON t.attendance_id = a.id
			    WHERE t.amount > 0
			    GROUP BY strftime('%Y-%m', a.date_of_day)
			    ORDER BY date DESC
			""", nativeQuery = true)
	List<Map<String, Object>> getTotalTaxPerMonth();

	@Query("SELECT SUM(t.amount) FROM Tax t WHERE t.amount > 0")
	Long getAllAmount();

	@Query("""
			    SELECT SUM(t.amount)
			    FROM Tax t
			    JOIN t.attendance a
			    WHERE t.amount > 0
			    AND FUNCTION('strftime', '%Y-%m', a.dateOfDay) = FUNCTION('strftime', '%Y-%m', CURRENT_DATE)
			""")
	Long getTotalTaxCurrentMonth();

	@Query(value = """
			    SELECT COUNT(*)
			    FROM (
			        SELECT strftime('%d-%m-%Y', a.date_of_day) AS date
			        FROM taxes t
			        JOIN attendance a ON t.attendance_id = a.id
			        GROUP BY strftime('%d-%m-%Y', a.date_of_day)
			    ) AS daily
			""", nativeQuery = true)
	Long getTotalTransactionDays();

	@Query(value = """
			    SELECT
			        m.code AS memberCode,
			        m.full_name AS memberName,
			        a.date_of_day AS date,
			        CASE strftime('%w', a.date_of_day)
			            WHEN '0' THEN 'Sunday'
			            WHEN '1' THEN 'Monday'
			            WHEN '2' THEN 'Tuesday'
			            WHEN '3' THEN 'Wednesday'
			            WHEN '4' THEN 'Thursday'
			            WHEN '5' THEN 'Friday'
			            WHEN '6' THEN 'Saturday'
			        END AS day,
			        t.amount AS amount
			    FROM attendance a
			    JOIN members m ON a.member_code = m.code
			    JOIN taxes t ON t.attendance_id = a.id
			    WHERE a.date_of_day = :today
			      AND a.category = 'Scouts and Guides'
			      AND a.status = 'Present'
			      AND t.amount > 0
			    ORDER BY m.code
			""", nativeQuery = true)
	List<Map<String, Object>> getTodaysScoutsAndGuidesAttendanceWithTax(@Param("today") String today);

	@Query(value = """
			    SELECT
			        m.code AS memberCode,
			        m.full_name AS memberName,
			        a.date_of_day AS date,
			        CASE strftime('%w', a.date_of_day)
			            WHEN '0' THEN 'Sunday'
			            WHEN '1' THEN 'Monday'
			            WHEN '2' THEN 'Tuesday'
			            WHEN '3' THEN 'Wednesday'
			            WHEN '4' THEN 'Thursday'
			            WHEN '5' THEN 'Friday'
			            WHEN '6' THEN 'Saturday'
			        END AS day,
			        t.amount AS amount
			    FROM attendance a
			    JOIN members m ON a.member_code = m.code
			    JOIN taxes t ON t.attendance_id = a.id
			    WHERE a.date_of_day = :today
			      AND a.category = 'Cubs and Blossoms'
			      AND a.status = 'Present'
			      AND t.amount > 0
			    ORDER BY m.code
			""", nativeQuery = true)
	List<Map<String, Object>> getTodaysCubsAndBlossomsAttendanceWithTax(@Param("today") String today);

	@Query(value = """
			    SELECT
			        m.code AS memberCode,
			        m.full_name AS memberName,
			        a.date_of_day AS date,
			        CASE strftime('%w', a.date_of_day)
			            WHEN '0' THEN 'Sunday'
			            WHEN '1' THEN 'Monday'
			            WHEN '2' THEN 'Tuesday'
			            WHEN '3' THEN 'Wednesday'
			            WHEN '4' THEN 'Thursday'
			            WHEN '5' THEN 'Friday'
			            WHEN '6' THEN 'Saturday'
			        END AS day,
			        t.amount AS amount
			    FROM attendance a
			    JOIN members m ON a.member_code = m.code
			    JOIN taxes t ON t.attendance_id = a.id
			    WHERE a.date_of_day = :today
			      AND a.category = 'Buds'
			      AND a.status = 'Present'
			      AND t.amount > 0
			    ORDER BY m.code
			""", nativeQuery = true)
	List<Map<String, Object>> getTodaysBudsAttendanceWithTax(@Param("today") String today);

	@Modifying
	@Transactional
	@Query("UPDATE Tax t SET t.amount = :amount WHERE t.id = :id")
	int updateTaxAmount(@Param("id") Long id, @Param("amount") int amount);

	@Query("""
			SELECT new map(
			    m.code as code,
			    m.fullName as fullName,
			    a.category as category,
			    a.dateOfDay as dateOfDay,
			    a.checkInTime as checkInTime,
			    t.amount as amount
			)
			FROM Tax t
			JOIN t.attendance a
			JOIN a.member m
			WHERE t.amount <> -1
			AND a.dateOfDay = :today
			ORDER BY a.checkInTime DESC
			""")
	List<Map<String, Object>> findMembersWithUpdatedTax(@Param("today") String today);
	
	
	@Modifying
	@Query("DELETE FROM Tax t WHERE t.attendance.dateOfDay < :cutoffDate")
	int deleteOldRecords(@Param("cutoffDate") String cutoffDate);

}
