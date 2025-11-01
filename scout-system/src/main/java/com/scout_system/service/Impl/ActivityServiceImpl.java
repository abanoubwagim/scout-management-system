package com.scout_system.service.Impl;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.scout_system.model.Activity;
import com.scout_system.repository.ActivityRepository;
import com.scout_system.service.ActivityService;
import jakarta.transaction.Transactional;

@Service
public class ActivityServiceImpl implements ActivityService {
	
	@Autowired
	private ActivityRepository activityRepository;
	
	@Override
	@Transactional
	public Activity addActivity(Activity activity) {
		return activityRepository.save(activity);
	}
	
	@Override
	@Transactional
	public boolean checkActivity(Long id) {
		return activityRepository.existsById(id);
	}
	
	@Override
	@Transactional
	public void deleteActivity(Long id) {
		int deleted = activityRepository.deleteUpcomingById(id);
		if (deleted == 0) {
			throw new RuntimeException("Activity not found or not in 'upcoming' status with id: " + id);
		}
	}
	
	@Override
	@Transactional
	public List<Activity> getAllActivity() {
		return activityRepository.findAll();
	}
	
	@Override
	@Transactional
	public void markCompletedActiviy(Long id) {
		activityRepository.markCompletedActivity(id);
	}
	
	@Override
	@Transactional
	public Long getCountForAllActivitry() {
		return activityRepository.getCountForAllActivitry();
	}
	
	@Override
	@Transactional
	public Long getCountCompletedActivity() {
		return activityRepository.getCountCompletedActivity();
	}
	
	@Override
	@Transactional
	public Long getCountUpcomingActivity() {
		return activityRepository.getCountUpcomingActivity();
	}
}