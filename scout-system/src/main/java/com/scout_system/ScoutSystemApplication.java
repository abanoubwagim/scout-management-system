package com.scout_system;

import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ScoutSystemApplication {

	public static void main(String[] args) {
		System.setProperty("webdriver.chrome.driver", "C:\\chromedriver\\chromedriver.exe");

		SpringApplication app = new SpringApplication(ScoutSystemApplication.class);
		app.setBannerMode(Banner.Mode.OFF);

		app.run(args);
	}
}