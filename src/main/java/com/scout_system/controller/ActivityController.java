package com.scout_system.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.scout_system.model.Activity;
import com.scout_system.service.ActivityService;

@RestController
@RequestMapping("/activities")
@CrossOrigin(origins = "*")
public class ActivityController {
	
	@Autowired
	private ActivityService activityService;
	
	@PostMapping("/addActivity")
	public ResponseEntity<?> addActivity(@RequestBody Activity activity) {
		try {
			Activity savedActivity = activityService.addActivity(activity);
			return ResponseEntity.ok(savedActivity);
		} catch (Exception e) {
			return ResponseEntity.badRequest()
				.body(Map.of("error", "Failed to add activity: " + e.getMessage()));
		}
	}
	
	@GetMapping("/allActivities")
	public ResponseEntity<List<Activity>> AllActivity() {
		List<Activity> activities = activityService.getAllActivity();
		return ResponseEntity.ok().body(activities);
	}
	
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<?> deleteActivity(@PathVariable Long id) {
		try {
			activityService.deleteActivity(id);
			
			return ResponseEntity.ok(Map.of(
				"message", "Activity deleted successfully",
				"id", id
			));
			
		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(Map.of("error", e.getMessage()));
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(Map.of("error", "Failed to delete activity: " + e.getMessage()));
		}
	}
	
	@PostMapping("/completed/{id}")
	public ResponseEntity<?> completedActivity(@PathVariable Long id) {
		if (!activityService.checkActivity(id)) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(Map.of("error", "Activity with ID " + id + " not found"));
		}
		
		activityService.markCompletedActiviy(id);
		return ResponseEntity.ok(Map.of(
			"message", "Activity marked as completed successfully",
			"id", id
		));
	}
	
	@GetMapping("/totalActivity")
	public ResponseEntity<Long> totalActivity() {
		Long total = activityService.getCountForAllActivitry();
		return ResponseEntity.ok(total);
	}
	
	@GetMapping("/upComingActivity")
	public ResponseEntity<Long> upComingActivity() {
		Long total = activityService.getCountUpcomingActivity();
		return ResponseEntity.ok(total);
	}
	
	@GetMapping("/completedActivity")
	public ResponseEntity<Long> completedActivity() {
		Long total = activityService.getCountCompletedActivity();
		return ResponseEntity.ok(total);
	}
}