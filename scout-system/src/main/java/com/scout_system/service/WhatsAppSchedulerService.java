package com.scout_system.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;

import com.scout_system.model.Member;

import java.time.Duration;
import java.util.List;

@Service
public class WhatsAppSchedulerService {

    @Autowired
    private MemberService memberService;

    private WebDriver driver;
    private boolean isDriverActive = false;
    private static final Logger log = LoggerFactory.getLogger(WhatsAppSchedulerService.class);
    
    // Constants
    private static final int MESSAGE_DELAY_MS = 5000;  
    private static final int WHATSAPP_LOAD_TIMEOUT_SEC = 60;  
    private static final int MAX_SEND_ATTEMPTS = 5;
    private static final String WHATSAPP_WEB_URL = "https://web.whatsapp.com";
    private static final String EGYPT_COUNTRY_CODE = "+20";

    public void sendPendingMessages() {
        List<Member> notSentMembers = memberService.getAllNotSentMembers();

        if (notSentMembers.isEmpty()) {
            log.info("No pending messages to send");
            return;
        }

        log.info("Found {} members to send messages", notSentMembers.size());

        try {
            initializeDriver();

            for (Member member : notSentMembers) {
                try {
                    sendWhatsAppMessage(member);
                    Thread.sleep(MESSAGE_DELAY_MS);
                } catch (InterruptedException e) {
                    log.warn("⚠️ Interrupted while waiting between messages", e);
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    log.error("❌ Failed to send to {}: {}", member.getFullName(), e.getMessage(), e);
                }
            }
        } catch (Exception e) {
            log.error("❌ Scheduler error", e);
        } finally {
            closeDriver();
        }
    }

    
    public String sendMessageToMember(String code) {
        Member member = memberService.findById(code);
        if (member == null) {
            return "❌ Member not found with code: " + code;
        }

        if (member.isSent()) {
            return "⚠️ Message already sent to " + member.getFullName();
        }

        try {
            initializeDriver();
            sendWhatsAppMessage(member);
            return "✅ Message sent successfully to " + member.getFullName();
        } catch (Exception e) {
            log.error("Failed to send message to member {}", code, e);
            return "❌ Error: " + e.getMessage();
        } finally {
            closeDriver();
        }
    }

   
    private void initializeDriver() {
        if (isDriverActive && driver != null) {
            log.info("Driver already active, skipping initialization");
            return;
        }

        ChromeOptions options = new ChromeOptions();
        
        String userHome = System.getProperty("user.home");
        String sessionPath = userHome + File.separator + "whatsapp-session";
        
        log.info("Using session path: {}", sessionPath);
        
        File sessionDir = new File(sessionPath);
        if (!sessionDir.exists()) {
            sessionDir.mkdirs();
            log.info("Created session directory: {}", sessionPath);
        }
        
        options.addArguments("--remote-allow-origins=*");
        options.addArguments("--disable-extensions");
        options.addArguments("--lang=ar");
        options.addArguments("--no-first-run");
        options.addArguments("--no-default-browser-check");
        options.addArguments("--disable-blink-features=AutomationControlled");
        
        options.addArguments("--window-size=1920,1080");  
        
        options.addArguments("user-data-dir=" + sessionPath);
        options.addArguments("profile-directory=Default");
        
        options.setExperimentalOption("excludeSwitches", new String[]{"enable-automation"});
        options.setExperimentalOption("useAutomationExtension", false);
        
        options.addArguments("--disable-gpu");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--disable-notifications");
        options.addArguments("--no-sandbox");  
        options.addArguments("--disable-software-rasterizer");
        
        options.addArguments("--disable-background-timer-throttling");
        options.addArguments("--disable-backgrounding-occluded-windows");
        options.addArguments("--disable-renderer-backgrounding");

        try {
            
            log.info("Initializing ChromeDriver...");
            driver = new ChromeDriver(options);
            isDriverActive = true;

            log.info("Navigating to WhatsApp Web...");
            driver.get(WHATSAPP_WEB_URL);
            
            log.info("⏳ Waiting for WhatsApp Web to load...");
            waitForWhatsAppToLoad();
            
            log.info("✅ WhatsApp Web initialized successfully");
            
        } catch (Exception e) {
            log.error("❌ Failed to initialize Chrome Driver: {}", e.getMessage(), e);
            closeDriver();
            throw new RuntimeException("Failed to initialize WhatsApp session: " + e.getMessage(), e);
        }
    }

    
    private void waitForWhatsAppToLoad() {
        try {
            log.info("⏳ Waiting for WhatsApp Web to load...");
            
            Thread.sleep(8000); 
            
            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(WHATSAPP_LOAD_TIMEOUT_SEC));
            
            try {
                WebElement qrCode = driver.findElement(By.cssSelector("canvas"));
                if (qrCode.isDisplayed()) {
                    log.warn("⚠️ QR Code detected! Please scan it to continue.");
                    log.warn("⚠️ Waiting 60 seconds for QR code scan...");
                    Thread.sleep(60000);
                }
            } catch (NoSuchElementException e) {
                log.info("No QR code found - session may be active");
            }
            
            boolean loaded = wait.until(driver -> {
                try {
                    String checkScript = """
                        return document.readyState === 'complete' && 
                               (document.querySelector('div[id="app"]') !== null ||
                                document.querySelector('div[data-testid]') !== null ||
                                document.querySelector('div[role="textbox"]') !== null ||
                                document.querySelector('div[contenteditable="true"]') !== null);
                    """;
                    
                    Object result = ((JavascriptExecutor) driver).executeScript(checkScript);
                    boolean pageLoaded = result instanceof Boolean && (Boolean) result;
                    
                    if (pageLoaded) {
                        log.info("✅ WhatsApp Web basic structure detected");
                        return true;
                    }
                    
                    return false;
                } catch (Exception e) {
                    log.debug("Still waiting for WhatsApp to load... {}", e.getMessage());
                    return false;
                }
            });
            
            if (loaded) {
                log.info("✅ WhatsApp Web loaded successfully");
                Thread.sleep(5000);  
            } else {
                throw new TimeoutException("WhatsApp Web structure not detected");
            }
            
        } catch (TimeoutException e) {
            log.error("❌ Timeout waiting for WhatsApp Web to load", e);
            takeScreenshotForDebug();
            throw new RuntimeException("WhatsApp Web did not load in time - Please scan QR code if needed", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted while waiting for WhatsApp", e);
        } catch (Exception e) {
            log.error("❌ Unexpected error while waiting for WhatsApp: {}", e.getMessage(), e);
            takeScreenshotForDebug();
            throw new RuntimeException("Failed to verify WhatsApp Web loading: " + e.getMessage(), e);
        }
    }
    
    
    private void takeScreenshotForDebug() {
        try {
            if (driver instanceof TakesScreenshot) {
                File screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
                String screenshotPath = System.getProperty("user.home") + File.separator + "whatsapp-debug-" + System.currentTimeMillis() + ".png";
                screenshot.renameTo(new File(screenshotPath));
                log.info("📸 Screenshot saved for debugging at: {}", screenshotPath);
            }
        } catch (Exception e) {
            log.debug("Could not take screenshot: {}", e.getMessage());
        }
    }

  
    private void sendWhatsAppMessage(Member member) throws Exception {
        String phone = normalizePhoneNumber(member.getPhone());
        String whatsappUrl = String.format("%s/send?phone=%s%s", WHATSAPP_WEB_URL, EGYPT_COUNTRY_CODE, phone);
        
        log.info("Opening chat with: {} (+20{})", member.getFullName(), phone);
        driver.get(whatsappUrl);
        
        Thread.sleep(3000);  

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(WHATSAPP_LOAD_TIMEOUT_SEC));

        WebElement messageBox = waitForMessageBox(wait);

        log.info("✅ Message box found, typing message...");

        String message = buildMessage(member);
        typeMessage(messageBox, message);
        
        log.info("📝 Message typed, attempting to send...");
        Thread.sleep(2000);

        if (attemptToSendMessage(messageBox)) {
            log.info("✅ Message successfully sent to {}", member.getFullName());
            memberService.markAsSent(member.getCode());
        } else {
            throw new Exception("Failed to send message after " + MAX_SEND_ATTEMPTS + " attempts");
        }
    }
    
   
    private WebElement waitForMessageBox(WebDriverWait wait) {
        log.info("🔍 Searching for message box...");
        
        String[] possibleSelectors = {
            "div[contenteditable='true'][data-tab='10']",
            "div[contenteditable='true'][role='textbox']",
            "div[contenteditable='true'][data-testid='conversation-compose-box-input']",
            "div[contenteditable='true']",
            "footer div[contenteditable='true']"
        };
        
        for (String selector : possibleSelectors) {
            try {
                log.debug("Trying selector: {}", selector);
                WebElement element = wait.until(
                    ExpectedConditions.elementToBeClickable(By.cssSelector(selector))
                );
                log.info("✅ Message box found using: {}", selector);
                return element;
            } catch (TimeoutException e) {
                log.debug("Selector not found: {}", selector);
            }
        }
        
        try {
            log.info("Attempting to find message box using JavaScript...");
            WebElement jsElement = (WebElement) ((JavascriptExecutor) driver).executeScript(
                """
                const editableDiv = document.querySelector('div[contenteditable="true"]') ||
                                   document.querySelector('[role="textbox"]') ||
                                   document.querySelector('footer div[contenteditable]');
                return editableDiv;
                """
            );
            
            if (jsElement != null) {
                log.info("✅ Message box found using JavaScript");
                return jsElement;
            }
        } catch (Exception e) {
            log.warn("JavaScript method failed: {}", e.getMessage());
        }
        
        takeScreenshotForDebug();
        throw new RuntimeException("❌ Could not find message box - Check screenshot for debugging");
    }

    
    private String normalizePhoneNumber(String phone) {
        if (phone != null && phone.startsWith("0")) {
            return phone.substring(1);
        }
        return phone;
    }

  
    private void typeMessage(WebElement messageBox, String message) throws InterruptedException {
        messageBox.click();
        Thread.sleep(1000);

        String[] lines = message.split("\n");
        for (int i = 0; i < lines.length; i++) {
            messageBox.sendKeys(lines[i]);
            if (i < lines.length - 1) {
                messageBox.sendKeys(Keys.SHIFT, Keys.ENTER);
            }
            Thread.sleep(100);
        }
    }

 
    private boolean attemptToSendMessage(WebElement messageBox) {
        for (int attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt++) {
            log.info("🔄 Send attempt {} of {}", attempt, MAX_SEND_ATTEMPTS);

            try {
                boolean sent = switch (attempt) {
                    case 1 -> sendUsingEnterKey(messageBox);
                    case 2 -> sendUsingCssSelector();
                    case 3 -> sendUsingJavaScript();
                    case 4 -> sendByScanningButtons();
                    default -> sendUsingEnterKeyFinal(messageBox);
                };

                if (sent) {
                    return true;
                }

                Thread.sleep(2000);
            } catch (Exception e) {
                log.warn("⚠️ Attempt {} failed: {}", attempt, e.getMessage());
            }
        }
        return false;
    }


    private boolean sendUsingEnterKey(WebElement messageBox) throws InterruptedException {
        messageBox.sendKeys(Keys.ENTER);
        Thread.sleep(2000);
        if (checkIfMessageSent()) {
            log.info("✅ Sent using Enter key");
            return true;
        }
        return false;
    }


    private boolean sendUsingCssSelector() throws InterruptedException {
        try {
            WebElement sendBtn = driver.findElement(By.cssSelector("button[aria-label='Send']"));
            sendBtn.click();
            Thread.sleep(2000);
            if (checkIfMessageSent()) {
                log.info("✅ Sent using Send button");
                return true;
            }
        } catch (NoSuchElementException e) {
            log.debug("Send button not found with CSS selector");
        }
        return false;
    }

    
    private boolean sendUsingJavaScript() throws InterruptedException {
        String jsClick = """
            const sendBtn = document.querySelector("button[aria-label='Send']") ||
                           document.querySelector("span[data-icon='send']")?.closest('button');
            if (sendBtn) {
                sendBtn.click();
                return true;
            }
            return false;
        """;
        
        Boolean clicked = (Boolean) ((JavascriptExecutor) driver).executeScript(jsClick);
        Thread.sleep(2000);
        
        if (Boolean.TRUE.equals(clicked) && checkIfMessageSent()) {
            log.info("✅ Sent using JavaScript");
            return true;
        }
        return false;
    }


    private boolean sendByScanningButtons() throws InterruptedException {
        try {
            List<WebElement> buttons = driver.findElements(By.tagName("button"));
            for (WebElement button : buttons) {
                try {
                    WebElement icon = button.findElement(By.cssSelector("span[data-icon='send']"));
                    button.click();
                    Thread.sleep(2000);
                    if (checkIfMessageSent()) {
                        log.info("✅ Sent by finding send icon");
                        return true;
                    }
                } catch (NoSuchElementException ignored) {
                }
            }
        } catch (Exception e) {
            log.debug("Could not find send button by scanning: {}", e.getMessage());
        }
        return false;
    }


    private boolean sendUsingEnterKeyFinal(WebElement messageBox) throws InterruptedException {
        messageBox.click();
        Thread.sleep(500);
        messageBox.sendKeys(Keys.ENTER);
        Thread.sleep(3000);
        if (checkIfMessageSent()) {
            log.info("✅ Sent using final Enter attempt");
            return true;
        }
        return false;
    }

    
    private boolean checkIfMessageSent() {
        try {
            String checkScript = """
                const msgBox = document.querySelector("div[contenteditable='true'][data-tab='10']") ||
                              document.querySelector("div[contenteditable='true'][role='textbox']") ||
                              document.querySelector("div[contenteditable='true']");
                if (msgBox) {
                    const text = msgBox.textContent || msgBox.innerText || '';
                    return text.trim().length === 0;
                }
                return false;
            """;
            Boolean isEmpty = (Boolean) ((JavascriptExecutor) driver).executeScript(checkScript);
            
            if (Boolean.TRUE.equals(isEmpty)) {
                log.debug("✓ Message box is empty - message sent");
                return true;
            }
            
            try {
                String deliveryCheckScript = """
                    const checkmarks = document.querySelectorAll('span[data-icon="msg-check"], span[data-icon="msg-dblcheck"]');
                    return checkmarks.length > 0;
                """;
                Boolean hasCheckmarks = (Boolean) ((JavascriptExecutor) driver).executeScript(deliveryCheckScript);
                
                if (Boolean.TRUE.equals(hasCheckmarks)) {
                    log.debug("✓ Delivery checkmarks found - message sent");
                    return true;
                }
            } catch (Exception e) {
                log.debug("Could not check for delivery marks");
            }
            
            return false;
        } catch (Exception e) {
            log.debug("Error checking if message sent: {}", e.getMessage());
            return false;
        }
    }


    private void closeDriver() {
        if (driver != null && isDriverActive) {
            try {
                driver.quit();
                log.info("✅ Browser closed");
            } catch (Exception e) {
                log.error("❌ Error closing driver: {}", e.getMessage());
            } finally {
                isDriverActive = false;
                driver = null;
            }
        }
    }


    private String buildMessage(Member member) {
        String name = member.getFullName();
        String code = member.getCode();
        String title = member.getTitle();

        return switch (title) {
            case "Scout Leader" -> String.format(
                "سلام يا قائد %s\n" +
                "فخورين بانضمامك لأسرة *مجموعة العجايبي الكشفية*.\n" +
                "وجودك كقائد مش بس شرف لينا، لكنه مصدر إلهام لكل الكشافة.\n" +
                "ثقتنا فيك كبيرة إنك هتكون قدوة في الانضباط، الروح، والمغامرة.\n\n" +
                "كودك الخاص هو:\n" +
                "--------------------\n%s\n--------------------\n" +
                "احفظ الكود ده، لأنك هتحتاجه لاحقًا في أنشطة الفريق.\n" +
                "ابدأ رحلتك القيادية بخطوة قوية، وخلّي أثر يبقى في كل نشاط تشارك فيه.\n" +
                "نورت الصفوف القيادية، وبنتمنالك رحلة كشفية مليانة إنجاز وفخر!\n\n" +
                "تحياتنا من مجموعة العجايبي الكشفية.",
                name, code
            );

            case "Scout Assistant" -> String.format(
                "أهلاً يا مساعد %s\n" +
                "انضمامك لأسرة *مجموعة العجايبي الكشفية* إضافة قوية لينا.\n" +
                "دورك كمساعد مش بسيط، أنت حلقة الوصل بين القادة والأعضاء، وصوت الدعم والتشجيع في كل مغامرة.\n" +
                "نؤمن إنك هتكون سبب في نجاح كتير من الأنشطة والرحلات.\n\n" +
                "كودك الخاص هو:\n" +
                "--------------------\n%s\n--------------------\n" +
                "احفظ الكود ده، لأنك هتحتاجه لاحقًا في أنشطة الفريق.\n" +
                "خليك دايمًا قدوة في الالتزام والتعاون، وجهّز نفسك لمغامرات مش هتتنسي!\n" +
                "سعيدين بانضمامك، وبنتمنالك رحلة مليانة تحديات وإنجازات!\n\n" +
                "تحياتنا من مجموعة العجايبي الكشفية.",
                name, code
            );

            default -> String.format(
                "مرحباً يا %s\n" +
                "سعداء جدًا بانضمامك إلى *مجموعة العجايبي الكشفية*.\n" +
                "من النهارده، أنت جزء من أسرة هدفها المغامرة، التعاون، والتطور.\n" +
                "كل خطوة هتخطيها معانا هتضيفلك خبرة جديدة، وكل نشاط فرصة إنك تثبت نفسك.\n" +
                "خليك مستعد دايمًا، لأن الكشفية مش مجرد أنشطة… دي أسلوب حياة!\n\n" +
                "كودك الخاص هو:\n" +
                "--------------------\n%s\n--------------------\n" +
                "احفظ الكود ده، لأنك هتحتاجه لاحقًا في فعالياتنا.\n" +
                "استعد لمغامرتك الكشفية الجديدة، وبداية مشوار مليان اكتشاف وتحدي وحماس!\n\n" +
                "تحياتنا من مجموعة العجايبي الكشفية.",
                name, code
            );
        };
    }
}






//		 To run bottom remove above the same actions but can't open brpwser 
//package com.scout_system.service;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.openqa.selenium.*;
//import org.openqa.selenium.chrome.ChromeDriver;
//import org.openqa.selenium.chrome.ChromeOptions;
//import org.openqa.selenium.support.ui.WebDriverWait;
//import org.openqa.selenium.support.ui.ExpectedConditions;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//
//import java.io.File;
//
//import com.scout_system.model.Member;
//
//import java.time.Duration;
//import java.util.List;
//
//@Service
//public class WhatsAppSchedulerService {
//
//    @Autowired
//    private MemberService memberService;
//
//    private WebDriver driver;
//    private boolean isDriverActive = false;
//    private static final Logger log = LoggerFactory.getLogger(WhatsAppSchedulerService.class);
//    
//    // Constants
//    private static final int MESSAGE_DELAY_MS = 4000;
//    private static final int WHATSAPP_LOAD_TIMEOUT_SEC = 40;
//    private static final int MAX_SEND_ATTEMPTS = 5;
//    private static final String WHATSAPP_WEB_URL = "https://web.whatsapp.com";
//    private static final String EGYPT_COUNTRY_CODE = "+20";
//
//    public void sendPendingMessages() {
//        List<Member> notSentMembers = memberService.getAllNotSentMembers();
//
//        if (notSentMembers.isEmpty()) {
//            log.info("No pending messages to send");
//            return;
//        }
//
//        log.info("Found {} members to send messages", notSentMembers.size());
//
//        try {
//            initializeDriver();
//
//            for (Member member : notSentMembers) {
//                try {
//                    sendWhatsAppMessage(member);
//                    Thread.sleep(MESSAGE_DELAY_MS);
//                } catch (InterruptedException e) {
//                    log.warn("⚠️ Interrupted while waiting between messages", e);
//                    Thread.currentThread().interrupt();
//                    break;
//                } catch (Exception e) {
//                    log.error("❌ Failed to send to {}: {}", member.getFullName(), e.getMessage(), e);
//                }
//            }
//        } catch (Exception e) {
//            log.error("❌ Scheduler error", e);
//        } finally {
//            closeDriver();
//        }
//    }
//
//    
//    public String sendMessageToMember(String code) {
//        Member member = memberService.findById(code);
//        if (member == null) {
//            return "❌ Member not found with code: " + code;
//        }
//
//        if (member.isSent()) {
//            return "⚠️ Message already sent to " + member.getFullName();
//        }
//
//        try {
//            initializeDriver();
//            sendWhatsAppMessage(member);
//            return "✅ Message sent successfully to " + member.getFullName();
//        } catch (Exception e) {
//            log.error("Failed to send message to member {}", code, e);
//            return "❌ Error: " + e.getMessage();
//        } finally {
//            closeDriver();
//        }
//    }
//
//   
//    private void initializeDriver() {
//        if (isDriverActive && driver != null) {
//            log.info("Driver already active, skipping initialization");
//            return;
//        }
//
//        ChromeOptions options = new ChromeOptions();
//        
//        options.addArguments("--remote-allow-origins=*");
//        options.addArguments("--disable-extensions");
//        options.addArguments("--lang=ar");
//        options.addArguments("--no-first-run");
//        options.addArguments("--no-default-browser-check");
//        options.addArguments("--disable-blink-features=AutomationControlled");
//        
//        options.addArguments("--headless=new");  
//        options.addArguments("--window-size=1920,1080");  
//        
//        options.addArguments("user-data-dir=C:/whatsapp-session");
//        options.addArguments("profile-directory=Default");
//        
//        options.setExperimentalOption("excludeSwitches", new String[]{"enable-automation"});
//        options.setExperimentalOption("useAutomationExtension", false);
//        
//        options.addArguments("--disable-gpu");
//        options.addArguments("--disable-dev-shm-usage");
//        options.addArguments("--disable-notifications");
//        options.addArguments("--no-sandbox");  
//        options.addArguments("--disable-software-rasterizer");
//        
//        options.addArguments("--disable-background-timer-throttling");
//        options.addArguments("--disable-backgrounding-occluded-windows");
//        options.addArguments("--disable-renderer-backgrounding");
//
//        try {
//            driver = new ChromeDriver(options);
//            isDriverActive = true;
//
//            driver.get(WHATSAPP_WEB_URL);
//            log.info("⏳ Waiting for WhatsApp Web to load...");
//            
//            waitForWhatsAppToLoad();
//            
//        } catch (Exception e) {
//            log.error("Failed to initialize Chrome Driver", e);
//            closeDriver();
//            throw new RuntimeException("Failed to initialize WhatsApp session", e);
//        }
//    }
//
//    
//    private void waitForWhatsAppToLoad() {
//        try {
//            log.info("⏳ Waiting for WhatsApp Web to load...");
//            
//            Thread.sleep(5000);
//            
//            WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(40));
//            
//            boolean loaded = wait.until(driver -> {
//                try {
//                    String checkScript = """
//                        return document.readyState === 'complete' && 
//                               (document.querySelector('div[id="app"]') !== null ||
//                                document.querySelector('div[data-testid]') !== null ||
//                                document.querySelector('canvas') !== null ||
//                                document.querySelector('div[role="textbox"]') !== null);
//                    """;
//                    
//                    Object result = ((JavascriptExecutor) driver).executeScript(checkScript);
//                    boolean pageLoaded = result instanceof Boolean && (Boolean) result;
//                    
//                    if (pageLoaded) {
//                        log.info("✅ WhatsApp Web basic structure detected");
//                        return true;
//                    }
//                    
//                    return false;
//                } catch (Exception e) {
//                    log.debug("Still waiting for WhatsApp to load...");
//                    return false;
//                }
//            });
//            
//            if (loaded) {
//                log.info("✅ WhatsApp Web loaded successfully");
//                Thread.sleep(3000); 
//            } else {
//                throw new TimeoutException("WhatsApp Web structure not detected");
//            }
//            
//        } catch (TimeoutException e) {
//            log.error("Timeout waiting for WhatsApp Web to load", e);
//            takeScreenshotForDebug();
//            throw new RuntimeException("WhatsApp Web did not load in time - Please scan QR code if needed", e);
//        } catch (InterruptedException e) {
//            Thread.currentThread().interrupt();
//            throw new RuntimeException("Interrupted while waiting for WhatsApp", e);
//        } catch (Exception e) {
//            log.error("Unexpected error while waiting for WhatsApp", e);
//            throw new RuntimeException("Failed to verify WhatsApp Web loading", e);
//        }
//    }
//    
//    
//    private void takeScreenshotForDebug() {
//        try {
//            if (driver instanceof TakesScreenshot) {
//                File screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
//                log.info("📸 Screenshot saved for debugging at: {}", screenshot.getAbsolutePath());
//            }
//        } catch (Exception e) {
//            log.debug("Could not take screenshot", e);
//        }
//    }
//
//  
//    private void sendWhatsAppMessage(Member member) throws Exception {
//        String phone = normalizePhoneNumber(member.getPhone());
//        String whatsappUrl = String.format("%s/send?phone=%s%s", WHATSAPP_WEB_URL, EGYPT_COUNTRY_CODE, phone);
//        
//        driver.get(whatsappUrl);
//        log.info("Opening chat with: {} (+20{})", member.getFullName(), phone);
//
//        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(WHATSAPP_LOAD_TIMEOUT_SEC));
//
//        WebElement messageBox = waitForMessageBox(wait);
//
//        log.info("Message box found, typing message...");
//
//        String message = buildMessage(member);
//        typeMessage(messageBox, message);
//        
//        log.info("Message typed, attempting to send...");
//        Thread.sleep(1000);
//
//        if (attemptToSendMessage(messageBox)) {
//            log.info("Message successfully sent to {}", member.getFullName());
//            memberService.markAsSent(member.getCode());
//        } else {
//            throw new Exception("Failed to send message after " + MAX_SEND_ATTEMPTS + " attempts");
//        }
//    }
//    
//   
//    private WebElement waitForMessageBox(WebDriverWait wait) {
//        log.info("🔍 Searching for message box...");
//        
//        String[] possibleSelectors = {
//            "div[contenteditable='true'][data-tab='10']",  
//            "div[contenteditable='true'][role='textbox']", 
//            "div[contenteditable='true'][data-testid='conversation-compose-box-input']",
//            "div[contenteditable='true']", 
//            "footer div[contenteditable='true']"  
//        };
//        
//        for (String selector : possibleSelectors) {
//            try {
//                log.debug("Trying selector: {}", selector);
//                WebElement element = wait.until(
//                    ExpectedConditions.elementToBeClickable(By.cssSelector(selector))
//                );
//                log.info("Message box found using: {}", selector);
//                return element;
//            } catch (TimeoutException e) {
//                log.debug("Selector not found: {}", selector);
//            }
//        }
//        
//        try {
//            log.info("Attempting to find message box using JavaScript...");
//            WebElement jsElement = (WebElement) ((JavascriptExecutor) driver).executeScript(
//                """
//                const editableDiv = document.querySelector('div[contenteditable="true"]') ||
//                                   document.querySelector('[role="textbox"]') ||
//                                   document.querySelector('footer div[contenteditable]');
//                return editableDiv;
//                """
//            );
//            
//            if (jsElement != null) {
//                log.info("Message box found using JavaScript");
//                return jsElement;
//            }
//        } catch (Exception e) {
//            log.warn("JavaScript method failed", e);
//        }
//        
//        throw new RuntimeException("Could not find message box - Please check if WhatsApp Web is properly loaded or if QR code needs scanning");
//    }
//
//    
//    private String normalizePhoneNumber(String phone) {
//        if (phone != null && phone.startsWith("0")) {
//            return phone.substring(1);
//        }
//        return phone;
//    }
//
//  
//    private void typeMessage(WebElement messageBox, String message) throws InterruptedException {
//        messageBox.click();
//        Thread.sleep(500);
//
//        String[] lines = message.split("\n");
//        for (int i = 0; i < lines.length; i++) {
//            messageBox.sendKeys(lines[i]);
//            if (i < lines.length - 1) {
//                messageBox.sendKeys(Keys.SHIFT, Keys.ENTER);
//            }
//        }
//    }
//
// 
//    private boolean attemptToSendMessage(WebElement messageBox) {
//        for (int attempt = 1; attempt <= MAX_SEND_ATTEMPTS; attempt++) {
//            log.info("🔄 Send attempt {} of {}", attempt, MAX_SEND_ATTEMPTS);
//
//            try {
//                boolean sent = switch (attempt) {
//                    case 1 -> sendUsingEnterKey(messageBox);
//                    case 2 -> sendUsingCssSelector();
//                    case 3 -> sendUsingJavaScript();
//                    case 4 -> sendByScanningButtons();
//                    default -> sendUsingEnterKeyFinal(messageBox);
//                };
//
//                if (sent) {
//                    return true;
//                }
//
//                Thread.sleep(1500);
//            } catch (Exception e) {
//                log.warn("Attempt {} failed: {}", attempt, e.getMessage());
//            }
//        }
//        return false;
//    }
//
//
//    private boolean sendUsingEnterKey(WebElement messageBox) throws InterruptedException {
//        messageBox.sendKeys(Keys.ENTER);
//        Thread.sleep(1500);
//        if (checkIfMessageSent()) {
//            log.info("Sent using Enter key");
//            return true;
//        }
//        return false;
//    }
//
//
//    private boolean sendUsingCssSelector() throws InterruptedException {
//        try {
//            WebElement sendBtn = driver.findElement(By.cssSelector("button[aria-label='Send']"));
//            sendBtn.click();
//            Thread.sleep(1500);
//            if (checkIfMessageSent()) {
//                log.info("Sent using Send button");
//                return true;
//            }
//        } catch (NoSuchElementException e) {
//            log.debug("Send button not found with CSS selector");
//        }
//        return false;
//    }
//
//    
//    private boolean sendUsingJavaScript() throws InterruptedException {
//        String jsClick = """
//            const sendBtn = document.querySelector("button[aria-label='Send']") ||
//                           document.querySelector("span[data-icon='send']")?.closest('button');
//            if (sendBtn) {
//                sendBtn.click();
//                return true;
//            }
//            return false;
//        """;
//        
//        Boolean clicked = (Boolean) ((JavascriptExecutor) driver).executeScript(jsClick);
//        Thread.sleep(1500);
//        
//        if (Boolean.TRUE.equals(clicked) && checkIfMessageSent()) {
//            log.info("Sent using JavaScript");
//            return true;
//        }
//        return false;
//    }
//
//
//    private boolean sendByScanningButtons() throws InterruptedException {
//        try {
//            List<WebElement> buttons = driver.findElements(By.tagName("button"));
//            for (WebElement button : buttons) {
//                try {
//                    WebElement icon = button.findElement(By.cssSelector("span[data-icon='send']"));
//                    button.click();
//                    Thread.sleep(1500);
//                    if (checkIfMessageSent()) {
//                        log.info("Sent by finding send icon");
//                        return true;
//                    }
//                } catch (NoSuchElementException ignored) {
//                    // Continue searching
//                }
//            }
//        } catch (Exception e) {
//            log.debug("Could not find send button by scanning", e);
//        }
//        return false;
//    }
//
//
//    private boolean sendUsingEnterKeyFinal(WebElement messageBox) throws InterruptedException {
//        messageBox.click();
//        Thread.sleep(300);
//        messageBox.sendKeys(Keys.ENTER);
//        Thread.sleep(2000);
//        if (checkIfMessageSent()) {
//            log.info("Sent using final Enter attempt");
//            return true;
//        }
//        return false;
//    }
//
//    
//    private boolean checkIfMessageSent() {
//        try {
//            String checkScript = """
//                const msgBox = document.querySelector("div[contenteditable='true'][data-tab='10']") ||
//                              document.querySelector("div[contenteditable='true'][role='textbox']") ||
//                              document.querySelector("div[contenteditable='true']");
//                if (msgBox) {
//                    const text = msgBox.textContent || msgBox.innerText || '';
//                    return text.trim().length === 0;
//                }
//                return false;
//            """;
//            Boolean isEmpty = (Boolean) ((JavascriptExecutor) driver).executeScript(checkScript);
//            
//            if (Boolean.TRUE.equals(isEmpty)) {
//                log.debug("✓ Message box is empty - message likely sent");
//                return true;
//            }
//            
//            try {
//                String deliveryCheckScript = """
//                    const checkmarks = document.querySelectorAll('span[data-icon="msg-check"]') ||
//                                      document.querySelectorAll('span[data-icon="msg-dblcheck"]');
//                    return checkmarks.length > 0;
//                """;
//                Boolean hasCheckmarks = (Boolean) ((JavascriptExecutor) driver).executeScript(deliveryCheckScript);
//                
//                if (Boolean.TRUE.equals(hasCheckmarks)) {
//                    log.debug("Delivery checkmarks found - message sent");
//                    return true;
//                }
//            } catch (Exception e) {
//                log.debug("Could not check for delivery marks", e);
//            }
//            
//            return false;
//        } catch (Exception e) {
//            log.debug("Error checking if message sent", e);
//            return false;
//        }
//    }
//
//
//    private void closeDriver() {
//        if (driver != null && isDriverActive) {
//            try {
//                driver.quit();
//                log.info("Browser closed");
//            } catch (Exception e) {
//                log.error("Error closing driver", e);
//            } finally {
//                isDriverActive = false;
//                driver = null;
//            }
//        }
//    }
//
//
//    private String buildMessage(Member member) {
//        String name = member.getFullName();
//        String code = member.getCode();
//        String title = member.getTitle();
//
//        return switch (title) {
//            case "Scout Leader" -> String.format(
//                "سلام يا قائد %s\n" +
//                "فخورين بانضمامك لأسرة *مجموعة العجايبي الكشفية*.\n" +
//                "وجودك كقائد مش بس شرف لينا، لكنه مصدر إلهام لكل الكشافة.\n" +
//                "ثقتنا فيك كبيرة إنك هتكون قدوة في الانضباط، الروح، والمغامرة.\n\n" +
//                "كودك الخاص هو:\n" +
//                "--------------------\n%s\n--------------------\n" +
//                "احفظ الكود ده، لأنك هتحتاجه لاحقًا في أنشطة الفريق.\n" +
//                "ابدأ رحلتك القيادية بخطوة قوية، وخلّي أثر يبقى في كل نشاط تشارك فيه.\n" +
//                "نورت الصفوف القيادية، وبنتمنالك رحلة كشفية مليانة إنجاز وفخر!\n\n" +
//                "تحياتنا من مجموعة العجايبي الكشفية.",
//                name, code
//            );
//
//            case "Scout Assistant" -> String.format(
//                "أهلاً يا مساعد %s\n" +
//                "انضمامك لأسرة *مجموعة العجايبي الكشفية* إضافة قوية لينا.\n" +
//                "دورك كمساعد مش بسيط، أنت حلقة الوصل بين القادة والأعضاء، وصوت الدعم والتشجيع في كل مغامرة.\n" +
//                "نؤمن إنك هتكون سبب في نجاح كتير من الأنشطة والرحلات.\n\n" +
//                "كودك الخاص هو:\n" +
//                "--------------------\n%s\n--------------------\n" +
//                "احفظ الكود ده، لأنك هتحتاجه لاحقًا في أنشطة الفريق.\n" +
//                "خليك دايمًا قدوة في الالتزام والتعاون، وجهّز نفسك لمغامرات مش هتتنسي!\n" +
//                "سعيدين بانضمامك، وبنتمنالك رحلة مليانة تحديات وإنجازات!\n\n" +
//                "تحياتنا من مجموعة العجايبي الكشفية.",
//                name, code
//            );
//
//            default -> String.format(
//                "مرحباً يا %s\n" +
//                "سعداء جدًا بانضمامك إلى *مجموعة العجايبي الكشفية*.\n" +
//                "من النهارده، أنت جزء من أسرة هدفها المغامرة، التعاون، والتطور.\n" +
//                "كل خطوة هتخطيها معانا هتضيفلك خبرة جديدة، وكل نشاط فرصة إنك تثبت نفسك.\n" +
//                "خليك مستعد دايمًا، لأن الكشفية مش مجرد أنشطة… دي أسلوب حياة!\n\n" +
//                "كودك الخاص هو:\n" +
//                "--------------------\n%s\n--------------------\n" +
//                "احفظ الكود ده، لأنك هتحتاجه لاحقًا في فعالياتنا.\n" +
//                "استعد لمغامرتك الكشفية الجديدة، وبداية مشوار مليان اكتشاف وتحدي وحماس!\n\n" +
//                "تحياتنا من مجموعة العجايبي الكشفية.",
//                name, code
//            );
//        };
//    }
//}