package com.scout_system.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.scout_system.model.Activity;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
	
	@Query("SELECT a FROM Activity a WHERE a.status = 'upcoming'")
	List<Activity> findUpcomingActivities();
	
	@Modifying
	@Query("UPDATE Activity a SET a.status = 'completed' WHERE a.id = :id")
	void markCompletedActivity(@Param("id") Long id);
	
	@Query("SELECT COUNT(a) FROM Activity a")
	Long getCountForAllActivitry();
	
	@Query("SELECT COUNT(a) FROM Activity a WHERE a.status = 'completed'")
	Long getCountCompletedActivity();
	
	@Query("SELECT COUNT(a) FROM Activity a WHERE a.status = 'upcoming'")
	Long getCountUpcomingActivity();
	
	@Modifying
	@Query("DELETE FROM Activity a WHERE a.id = :id AND a.status = 'upcoming'")
	int deleteUpcomingById(@Param("id") Long id);
}