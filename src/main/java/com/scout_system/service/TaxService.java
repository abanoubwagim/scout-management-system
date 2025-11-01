package com.scout_system.service;

import java.util.List;
import java.util.Map;


public interface TaxService{
	
	List<Map<String, Object>> getTotalTaxPerDay();
	List<Map<String, Object>> getTotalTaxPerMonthWithMonthName();
	Long getTotalTaxCurrentMonth();
	Long getAllAmount();
	Long getTotalTransactionDays();
	List<Map<String, Object>> getTodaysScoutsAndGuidesAttendanceWithTax();
	List<Map<String, Object>> getTodaysCubsAndBlossomsAttendanceWithTax();
	List<Map<String, Object>> getTodaysBudsAttendanceWithTax();
	void updateTaxAmount(Long id, int amount);
	public List<Map<String, Object>> getMembersWithUpdatedTax();
}
