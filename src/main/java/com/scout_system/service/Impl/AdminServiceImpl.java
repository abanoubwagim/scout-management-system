package com.scout_system.service.Impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.scout_system.model.Admin;
import com.scout_system.repository.AdminRepository;
import com.scout_system.service.AdminService;

import jakarta.transaction.Transactional;

@Service
public class AdminServiceImpl implements AdminService {

	@Autowired
	private AdminRepository adminRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Override
	@Transactional
	public Admin getAdminByUserName(String userName) {
		return adminRepository.findByUserName(userName);
	}

	@Override
	@Transactional
	public boolean checkPassword(String userName, String rawPassword) { // true correct , false incorrect
		Admin admin = adminRepository.findByUserName(userName);
		if (admin == null)
			return false;

		return passwordEncoder.matches(rawPassword, admin.getPassword());
	}

	@Override
	@Transactional
	public Admin addAdmin(Admin admin) {
		return adminRepository.save(admin);
	}

	@Override
	@Transactional
	public boolean existsByUserName(String userName) {
		return adminRepository.existsByUserName(userName);
	}

	@Override
	@Transactional
	public List<Admin> getAllAdmins() {
		return adminRepository.findAll();
	}

}
