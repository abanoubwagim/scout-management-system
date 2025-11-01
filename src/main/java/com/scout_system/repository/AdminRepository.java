package com.scout_system.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.scout_system.model.Admin;

public interface AdminRepository extends JpaRepository<Admin, Long>{
	
	
	boolean existsByUserName(String userName); // check
	Admin findByUserName(String userName); // get admin by his user name 
	

}
