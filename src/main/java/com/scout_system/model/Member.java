package com.scout_system.model;


import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "members")
public class Member {

	@Id
	@Column(unique = true, nullable = false, length = 6)
	private String code;

	@Column(nullable = false)
	private String fullName;

	@Column(nullable = false)
	private String title;

	@Column(nullable = false)
	private String dateOfBirth; // yyyy-MM-dd

	@Column(nullable = false)
	private String phone;

	@Column(nullable = false)
	private String address;

	@Column(nullable = false)
	private String category;

	@Column(name = "is_sent", nullable = false)
	private boolean isSent = false;
	
	@OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Attendance> attendances;

	public Member() {
		super();
	}

	

	public Member(String code, String fullName, String title, String dateOfBirth, String phone, String address,
			String category, boolean isSent, List<Attendance> attendances) {
		super();
		this.code = code;
		this.fullName = fullName;
		this.title = title;
		this.dateOfBirth = dateOfBirth;
		this.phone = phone;
		this.address = address;
		this.category = category;
		this.isSent = isSent;
		this.attendances = attendances;
	}



	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDateOfBirth() {
		return dateOfBirth;
	}

	public void setDateOfBirth(String dateOfBirth) {
		this.dateOfBirth = dateOfBirth;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public boolean isSent() {
		return isSent;
	}

	public void setSent(boolean isSent) {
		this.isSent = isSent;
	}

	public List<Attendance> getAttendances() {
		return attendances;
	}

	public void setAttendances(List<Attendance> attendances) {
		this.attendances = attendances;
	}

	
	
	
	
	
	

}
