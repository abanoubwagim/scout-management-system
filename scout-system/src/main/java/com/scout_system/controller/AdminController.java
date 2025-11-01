package com.scout_system.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.scout_system.model.Admin;
import com.scout_system.service.AdminService;
import com.scout_system.service.DataCleanupScheduler;

import jakarta.servlet.http.HttpSession;

@RestController
@CrossOrigin(origins = "*")
public class AdminController {

	@Autowired
	private AdminService adminService;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private DataCleanupScheduler cleanupScheduler;

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody Admin admin, HttpSession session) {

		boolean isVaild = adminService.checkPassword(admin.getUserName(), admin.getPassword());

		if (isVaild) {
			session.setAttribute("loggedInUser", admin.getUserName());

			Admin userDetails = adminService.getAdminByUserName(admin.getUserName());

			Map<String, Object> response = new HashMap<>();
			response.put("success", true);
			response.put("message", "Login successful");
			response.put("user", Map.of("username", admin.getUserName(), "name", userDetails.getFullName()));

			return ResponseEntity.ok(response);

		} else {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("success", false);
			errorResponse.put("error", "Invalid username or password ");
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
		}

	}

	@PostMapping("/register")
	public ResponseEntity<?> register(@RequestBody Admin admin) {
		if (adminService.existsByUserName(admin.getUserName())) {
			return ResponseEntity.badRequest().body(Map.of("error", "The user already exists"));
		}

		admin.setPassword(passwordEncoder.encode(admin.getPassword()));
		Admin saved = adminService.addAdmin(admin);

		return ResponseEntity.ok(Map.of("message", "The user registered successfully", "userName", saved.getUserName(),
				"id", saved.getId()));
	}

	@GetMapping("/register")
	public ResponseEntity<?> registerViaLink(@RequestParam String fullName, @RequestParam String userName,
			@RequestParam String password) {

		try {
			// Check if username already exists
			if (adminService.existsByUserName(userName)) {
				return ResponseEntity.badRequest()
						.body(Map.of("error", "The user already exists", "userName", userName));
			}

			// Create new Admin object
			Admin admin = new Admin();
			admin.setFullName(fullName);
			admin.setUserName(userName);
			admin.setPassword(passwordEncoder.encode(password));

			// Save the admin
			Admin saved = adminService.addAdmin(admin);

			// Return success response
			return ResponseEntity.ok(Map.of("message", "The user registered successfully", "fullName",
					saved.getFullName(), "userName", saved.getUserName(), "id", saved.getId()));

		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("error", "Registration failed: " + e.getMessage()));
		}
	}

	@PostMapping("/logout")
	public ResponseEntity<?> logout(HttpSession session) {
		try {
			// Get username before invalidating session
			String username = (String) session.getAttribute("loggedInUser");

			// Invalidate the session
			session.invalidate();

			Map<String, Object> response = new HashMap<>();
			response.put("success", true);
			response.put("message", "Logged out successfully");
			if (username != null) {
				response.put("user", username);
			}

			return ResponseEntity.ok(response);

		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("success", false);
			errorResponse.put("error", "Error during logout");
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	@GetMapping("/allAdmins")
	public ResponseEntity<List<Admin>> getAllAdmins() {
		try {
			List<Admin> admins = adminService.getAllAdmins();

			if (admins.isEmpty()) {
				return ResponseEntity.noContent().build();
			}

			return ResponseEntity.ok(admins);

		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}

	@PostMapping("/cleanup-old-data")
	public ResponseEntity<String> manualCleanup() {
	    cleanupScheduler.forceCleanup();
	    return ResponseEntity.ok("Cleanup completed successfully");
	}
}
