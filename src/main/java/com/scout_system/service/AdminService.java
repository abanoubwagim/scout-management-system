package com.scout_system.service;


import java.util.List;

import com.scout_system.model.Admin;

public interface AdminService {
	

	Admin addAdmin(Admin admin);
	List<Admin> getAllAdmins();
	Admin getAdminByUserName(String userName);  // get all data from admin by his username
	boolean checkPassword(String userName, String rawPassword); // check his password true or false
	boolean existsByUserName(String userName);
	

}
