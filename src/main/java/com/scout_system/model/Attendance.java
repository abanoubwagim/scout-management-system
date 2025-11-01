package com.scout_system.model;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;


import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "attendance")
public class Attendance {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "member_code", referencedColumnName = "code", nullable = false)
	@JsonIgnore
	private Member member;

	@Column(name = "member_code", insertable = false, updatable = false)
	private String memberCode;

	@Column(nullable = false)
	private String dateOfDay = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));

	@Column(nullable = false)
	private String checkInTime = LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm:ss a"));

	@Column(nullable = false)
	private String status = "Absent"; // attend or absent

	@OneToMany(mappedBy = "attendance", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Tax> taxes;

	@Column(nullable = false)
	private String category;

	public Attendance() {
	}

	public Attendance(Long id, Member member, String dateOfDay, String checkInTime, String status, List<Tax> taxes,
			String category) {
		super();
		this.id = id;
		this.member = member;
		this.dateOfDay = dateOfDay;
		this.checkInTime = checkInTime;
		this.status = status;
		this.taxes = taxes;
		this.category = category;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Member getMember() {
		return member;
	}

	public void setMember(Member member) {
		this.member = member;
		if (member != null) {
			this.memberCode = member.getCode();
		}
	}

	public String getDateOfDay() {
		return dateOfDay;
	}

	public void setDateOfDay(String dateOfDay) {
		this.dateOfDay = dateOfDay;
	}

	public String getCheckInTime() {
		return checkInTime;
	}

	public void setCheckInTime(String checkInTime) {
		this.checkInTime = checkInTime;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public List<Tax> getTaxes() {
		return taxes;
	}

	public void setTaxes(List<Tax> taxes) {
		this.taxes = taxes;
		
		if(taxes != null) {
			for(Tax tax : taxes) {
				tax.setAttendance(this);
			}
		}
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

}
