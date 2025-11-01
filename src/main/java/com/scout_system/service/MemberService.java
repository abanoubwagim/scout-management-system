package com.scout_system.service;

import java.util.List;

import com.scout_system.model.Member;

public interface MemberService {

	Member addMember(Member member); // addMember

	boolean checkCode(String code); // check code

	List<Member> getAllMembers(); // all members

	void deleteByCode(String code);

	Member findById(String code);

	Long getCountAllMember();

	public List<Member> getAllNotSentMembers();

	public void markAsSent(String code);

	public Long totalMessageSent();

}
