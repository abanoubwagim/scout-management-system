package com.scout_system.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.scout_system.model.Member;
import com.scout_system.service.MemberService;
import com.scout_system.service.WhatsAppSchedulerService;

import java.util.List;

@RestController
@RequestMapping("/whatsapp")
@CrossOrigin("*")
public class WhatsAppController {

    @Autowired
    private MemberService memberService;

    @Autowired
    private WhatsAppSchedulerService whatsAppScheduler;

    @PostMapping("/send/{code}")
    public String sendMessage(@PathVariable String code) {
        return whatsAppScheduler.sendMessageToMember(code);
    }

    @PostMapping("/send-all")
    public String sendAllPendingMessages() {
        try {
            whatsAppScheduler.sendPendingMessages();
            return "Messages sending process completed";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    @GetMapping("/pending")
    public List<Member> getPendingMembers() {
        return memberService.getAllNotSentMembers();
    }

    @GetMapping("/pending/count")
    public int getPendingCount() {
        return memberService.getAllNotSentMembers().size();
    }

    @PutMapping("/reset/{code}")
    public String resetSentStatus(@PathVariable String code) {
        Member member = memberService.findById(code);
        if (member == null) {
            return "Member not found";
        }
        member.setSent(false);
        memberService.addMember(member);
        return "Reset successful for " + member.getFullName();
    }
    
    @GetMapping("/totalMessageSent")
	public ResponseEntity<Long> totalMessageSent(){
		Long count = memberService.totalMessageSent();
		return ResponseEntity.ok(count);
	}
}