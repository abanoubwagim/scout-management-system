package com.scout_system.service.Impl;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.scout_system.repository.TaxRepository;
import com.scout_system.service.TaxService;

import jakarta.transaction.Transactional;

@Service
public class TaxServiceImpl implements TaxService {

	@Autowired
	private TaxRepository taxRepository;

	@Override
	@Transactional
	public List<Map<String, Object>> getTotalTaxPerDay() {
		return taxRepository.getTotalTaxPerDay();
	}

	@Override
	@Transactional
	public List<Map<String, Object>> getTotalTaxPerMonthWithMonthName() {

		List<Map<String, Object>> monthlyData = taxRepository.getTotalTaxPerMonth();

		return monthlyData.stream().map(record -> {
			String date = (String) record.get("date"); // YYYY-MM format
			Object amount = record.get("Amount");  

			String monthName = getMonthName(date); 

			return Map.of("date", date, "day", monthName, "Amount", amount != null ? amount : 0L);
		}).collect(Collectors.toList());
	}

	private String getMonthName(String yearMonthStr) {
		java.time.YearMonth ym = java.time.YearMonth.parse(yearMonthStr);
		return ym.getMonth().getDisplayName(java.time.format.TextStyle.FULL, java.util.Locale.ENGLISH);
	}

	@Override
	@Transactional
	public Long getAllAmount() {
		Long total = taxRepository.getAllAmount();
		return total != null ? total : 0L;
	}

	@Override
	@Transactional
	public Long getTotalTaxCurrentMonth() {
		Long total = taxRepository.getTotalTaxCurrentMonth();
		return total != null ? total : 0L;
	}

	@Override
	@Transactional
	public Long getTotalTransactionDays() {
		Long total = taxRepository.getTotalTransactionDays();
		return total != null ? total : 0L;
	}

	@Override
	@Transactional
	public List<Map<String, Object>> getTodaysScoutsAndGuidesAttendanceWithTax() {
		String today = java.time.LocalDate.now().toString();
		return taxRepository.getTodaysScoutsAndGuidesAttendanceWithTax(today);
	}

	@Override
	@Transactional
	public List<Map<String, Object>> getTodaysCubsAndBlossomsAttendanceWithTax() {
		String today = java.time.LocalDate.now().toString();
		return taxRepository.getTodaysCubsAndBlossomsAttendanceWithTax(today);
	}

	@Override
	@Transactional
	public List<Map<String, Object>> getTodaysBudsAttendanceWithTax() {
		String today = java.time.LocalDate.now().toString();
		return taxRepository.getTodaysBudsAttendanceWithTax(today);
	}

	@Override
	@Transactional
	public void updateTaxAmount(Long id, int amount) {
		int rowsAffected = taxRepository.updateTaxAmount(id, amount);
		if (rowsAffected == 0) {
			throw new RuntimeException("Tax record not found with id: " + id);
		}
	}

	@Override
	@Transactional
	public List<Map<String, Object>> getMembersWithUpdatedTax() {
		String today = LocalDate.now(ZoneId.of("Africa/Cairo")).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
		return taxRepository.findMembersWithUpdatedTax(today);
	}

}