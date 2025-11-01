package com.scout_system.service;

import java.util.List;

import com.scout_system.model.Activity;

public interface ActivityService {

	Activity addActivity(Activity activity);

	boolean checkActivity(Long id);

	void deleteActivity(Long id);

	List<Activity> getAllActivity();

	void markCompletedActiviy(Long id);

	Long getCountForAllActivitry();

	Long getCountCompletedActivity();

	Long getCountUpcomingActivity();
}

