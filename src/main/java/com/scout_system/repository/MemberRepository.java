package com.scout_system.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.scout_system.model.Member;

public interface MemberRepository extends JpaRepository<Member, String>{
	
	
	boolean existsById(String code);
	void deleteByCode(String code);
	Member findByCode(String code);
	
	@Query("SELECT COUNT(m) FROM Member m")
	Long getCountAllMember();

	@Query("SELECT m FROM Member m WHERE LOWER(m.category) LIKE LOWER(CONCAT('%', :category, '%'))")
	List<Member> findByCategory(@Param("category") String category);

	@Query("SELECT m FROM Member m WHERE m.isSent = false")
    List<Member> findAllNotSent();

	@Query("SELECT COUNT(m) FROM Member m WHERE m.isSent = true")
	Long totalMessageSent();
	


}
