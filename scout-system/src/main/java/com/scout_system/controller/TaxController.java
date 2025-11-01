package com.scout_system.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.scout_system.service.TaxService;

@RestController
@RequestMapping("/taxes")
@CrossOrigin(origins = "*")
public class TaxController {

	@Autowired
	private TaxService taxService;

	@GetMapping("/dailyTotal")
	public List<Map<String, Object>> getDailyTotal() {
		return taxService.getTotalTaxPerDay();
	}

	@GetMapping("/monthlyTotal")
	public List<Map<String, Object>> getTotalTaxPerMonth() {
		return taxService.getTotalTaxPerMonthWithMonthName();
	}

	@GetMapping("/totalRevenue")
	public ResponseEntity<Long> allAmount() {
		Long total = taxService.getAllAmount();
		return ResponseEntity.ok(total);
	}

	@GetMapping("/currentMonthTotal")
	public ResponseEntity<Long> getCurrentMonthTotal() {
		Long totalAmount = taxService.getTotalTaxCurrentMonth();
		return ResponseEntity.ok(totalAmount != null ? totalAmount : 0);
	}

	@GetMapping("/totalTransactions")
	public ResponseEntity<Long> getTotalTransactionDays() {
		Long total = taxService.getTotalTransactionDays();
		return ResponseEntity.ok(total);
	}

	@GetMapping("/today/scoutsAndGuides")
	public List<Map<String, Object>> getTodaysScoutsAndGuidesAttendance() {
		return taxService.getTodaysScoutsAndGuidesAttendanceWithTax();
	}

	@GetMapping("/today/cubsAndBlossoms")
	public List<Map<String, Object>> getTodaysCubsAndBlossomsAttendance() {
		return taxService.getTodaysCubsAndBlossomsAttendanceWithTax();
	}

	@GetMapping("/today/buds")
	public List<Map<String, Object>> getTodaysBudsAttendance() {
		return taxService.getTodaysBudsAttendanceWithTax();
	}

	@PostMapping("/updateAmount")
	public ResponseEntity<?> updateTaxAmount(@RequestBody Map<String, Object> data) {
	    try {
	        Long taxId = ((Number) data.get("taxId")).longValue();
	        int amount = ((Number) data.get("amount")).intValue(); 
	        
	        taxService.updateTaxAmount(taxId, amount);
	        
	        return ResponseEntity.ok(Map.of(
	            "message", "Tax updated successfully", 
	            "taxId", taxId, 
	            "newAmount", amount
	        ));
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .body(Map.of("error", "Error updating tax: " + e.getMessage()));
	    }
	}
	
	
	
	@GetMapping("/updatedTaxMembers")
	public ResponseEntity<List<Map<String, Object>>> getMembersWithUpdatedTax() {
	    return ResponseEntity.ok(taxService.getMembersWithUpdatedTax());
	}


}
