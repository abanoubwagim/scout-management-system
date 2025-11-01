package com.scout_system.service.Impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.scout_system.model.Member;
import com.scout_system.repository.MemberRepository;
import com.scout_system.service.MemberService;

import jakarta.transaction.Transactional;

@Service
public class MemberServiceImpl implements MemberService {

	@Autowired
	private MemberRepository memberRepository;

	@Override
	@Transactional
	public Member addMember(Member member) {
		return memberRepository.save(member);
	}

	@Override
	@Transactional
	public boolean checkCode(String code) {
		return memberRepository.existsById(code); // true exist
	}

	@Override
	@Transactional
	public List<Member> getAllMembers() {
		return memberRepository.findAll();
	}

	@Override
	@Transactional
	public void deleteByCode(String code) {
		if (memberRepository.existsById(code)) {
			memberRepository.deleteByCode(code);
		} else {
			throw new RuntimeException("Member not found with code: " + code);
		}

	}

	@Override
	@Transactional
	public Member findById(String code) {
		return memberRepository.findByCode(code);
	}

	@Override
	@Transactional
	public Long getCountAllMember() {
		return memberRepository.getCountAllMember();
	}

	
	
	@Override
	@Transactional
	public List<Member> getAllNotSentMembers() {
		return memberRepository.findAllNotSent();
	}

	@Override
	@Transactional
	public void markAsSent(String code) {
		Member member = memberRepository.findById(code).orElse(null);
		if (member != null) {
			member.setSent(true);
			memberRepository.save(member);
		}
	}

	@Override
	@Transactional
	public Long totalMessageSent() {
		return memberRepository.totalMessageSent();
	}

}
