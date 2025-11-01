package com.scout_system.service;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;
import com.scout_system.repository.AttendanceRepository;
import com.scout_system.repository.TaxRepository;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class DataCleanupScheduler {

    private final AttendanceRepository attendanceRepository;
    private final TaxRepository taxRepository;
    private final TransactionTemplate transactionTemplate;
    private LocalDate lastCleanupCheck = null;

    public DataCleanupScheduler(AttendanceRepository attendanceRepository,
                                TaxRepository taxRepository,
                                PlatformTransactionManager transactionManager) {
        this.attendanceRepository = attendanceRepository;
        this.taxRepository = taxRepository;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    // Run cleanup check on application startup (after database is ready)
    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        System.out.println("=".repeat(60));
        System.out.println("Checking for old data cleanup...");
        checkAndCleanupIfNeeded();
    }

    // Also run cleanup every Friday at 11 AM (when server is typically running)
    @Scheduled(cron = "0 0 11 * * FRI")
    public void scheduledCleanup() {
        System.out.println("=".repeat(60));
        System.out.println("Weekly cleanup check triggered...");
        checkAndCleanupIfNeeded();
    }

    public void checkAndCleanupIfNeeded() {
        try {
            LocalDate today = LocalDate.now();
            LocalDate sixMonthsAgo = today.minusMonths(6);

            // Check if we've already cleaned up in the last 7 days
            if (lastCleanupCheck != null &&
                lastCleanupCheck.isAfter(today.minusDays(7))) {
                System.out.println("Cleanup already performed recently on " +
                                 lastCleanupCheck + ". Skipping...");
                System.out.println("=".repeat(60));
                return;
            }

            String cutoffDate = sixMonthsAgo.format(DateTimeFormatter.ISO_LOCAL_DATE);

            System.out.println("Current Date: " + today);
            System.out.println("Deleting records older than: " + cutoffDate);

            // Execute cleanup in a programmatic transaction
            transactionTemplate.execute(new TransactionCallbackWithoutResult() {
                @Override
                protected void doInTransactionWithoutResult(TransactionStatus status) {
                    try {
                        // Delete old tax records first (due to foreign key relationship)
                        int deletedTaxCount = taxRepository.deleteOldRecords(cutoffDate);
                        System.out.println("Tax Records Deleted: " + deletedTaxCount);

                        // Then delete old attendance records
                        int deletedAttendanceCount = attendanceRepository.deleteOldRecords(cutoffDate);
                        System.out.println("Attendance Records Deleted: " + deletedAttendanceCount);

                        int totalDeleted = deletedTaxCount + deletedAttendanceCount;

                        if (totalDeleted > 0) {
                            System.out.println("CLEANUP COMPLETE: Removed " + totalDeleted + " old records");
                        } else {
                            System.out.println("No old records found. Database is clean!");
                        }
                    } catch (Exception e) {
                        System.err.println("Error during cleanup transaction: " + e.getMessage());
                        status.setRollbackOnly();
                        throw e;
                    }
                }
            });

            lastCleanupCheck = today;
            System.out.println("=".repeat(60));

        } catch (Exception e) {
            System.err.println("=".repeat(60));
            System.err.println("CLEANUP ERROR: " + e.getMessage());
            e.printStackTrace();
            System.err.println("=".repeat(60));
        }
    }

    // Manual cleanup method (can be called from controller)
    public void forceCleanup() {
        lastCleanupCheck = null; // Reset to force cleanup
        checkAndCleanupIfNeeded();
    }
}