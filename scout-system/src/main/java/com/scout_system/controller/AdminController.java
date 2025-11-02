package com.scout_system.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.scout_system.model.Admin;
import com.scout_system.service.AdminService;
import com.scout_system.service.DataCleanupScheduler;
import java.util.Base64;

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

	@GetMapping("/admin/profile/{username}")
	public ResponseEntity<?> getAdminProfile(@PathVariable String username) {
	    try {
	        Admin admin = adminService.getAdminByUserName(username);
	        
	        if (admin == null) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                .body(Map.of("error", "User not found"));
	        }
	        
	        Map<String, Object> response = new HashMap<>();
	        response.put("username", admin.getUserName());
	        response.put("fullName", admin.getFullName());
	        
	        // Convert byte[] to Base64 string for profile image
	        if (admin.getProfileImage() != null && admin.getProfileImage().length > 0) {
	            String base64Image = Base64.getEncoder().encodeToString(admin.getProfileImage());
	            response.put("profileImage", base64Image);
	        } else {
	            response.put("profileImage", null);
	        }
	        
	        return ResponseEntity.ok(response);
	        
	    } catch (Exception e) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	            .body(Map.of("error", "Failed to fetch profile: " + e.getMessage()));
	    }
	}

	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, HttpSession session) {
		try {
			String userName = credentials.get("userName");
			String password = credentials.get("password");

			if (userName == null || password == null) {
				Map<String, Object> errorResponse = new HashMap<>();
				errorResponse.put("success", false);
				errorResponse.put("error", "Username and password are required");
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
			}

			boolean isValid = adminService.checkPassword(userName, password);

			if (isValid) {
				session.setAttribute("loggedInUser", userName);

				Admin userDetails = adminService.getAdminByUserName(userName);

				Map<String, Object> response = new HashMap<>();
				response.put("success", true);
				response.put("message", "Login successful");
				response.put("user", Map.of("username", userName, "name", userDetails.getFullName()));

				return ResponseEntity.ok(response);

			} else {
				Map<String, Object> errorResponse = new HashMap<>();
				errorResponse.put("success", false);
				errorResponse.put("error", "Invalid username or password");
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
			}
		} catch (Exception e) {
			Map<String, Object> errorResponse = new HashMap<>();
			errorResponse.put("success", false);
			errorResponse.put("error", "Login failed: " + e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
		}
	}

	@PostMapping("/register")
	public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
		try {
			String fullName = request.get("fullName");
			String userName = request.get("userName");
			String password = request.get("password");
			String profileImageBase64 = request.get("profileImage");

			// Validate required fields
			if (fullName == null || userName == null || password == null) {
				return ResponseEntity.badRequest()
					.body(Map.of("error", "Full name, username, and password are required"));
			}

			// Check if username already exists
			if (adminService.existsByUserName(userName)) {
				return ResponseEntity.badRequest().body(Map.of("error", "The user already exists"));
			}

			// Create new Admin object
			Admin admin = new Admin();
			admin.setFullName(fullName);
			admin.setUserName(userName);
			admin.setPassword(passwordEncoder.encode(password));

			// Convert Base64 string to byte array if profile image exists
			if (profileImageBase64 != null && !profileImageBase64.isEmpty()) {
				try {
					byte[] imageBytes = Base64.getDecoder().decode(profileImageBase64);
					admin.setProfileImage(imageBytes);
				} catch (IllegalArgumentException e) {
					return ResponseEntity.badRequest()
						.body(Map.of("error", "Invalid profile image format"));
				}
			}

			// Save the admin
			Admin saved = adminService.addAdmin(admin);

			return ResponseEntity.ok(Map.of(
				"message", "The user registered successfully", 
				"userName", saved.getUserName(),
				"id", saved.getId()
			));

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

	

	@PostMapping("/cleanup-old-data")
	public ResponseEntity<String> manualCleanup() {
	    cleanupScheduler.forceCleanup();
	    return ResponseEntity.ok("Cleanup completed successfully");
	}
}