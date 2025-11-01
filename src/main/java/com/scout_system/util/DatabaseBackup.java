package com.scout_system.util;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.channels.FileChannel;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DatabaseBackup {

	private static final String DB_PATH = "scout-system.db"; 
    private static final String BACKUP_DIR = "backups/"; 

    public static void backupDatabase() {
        try {
            Files.createDirectories(Paths.get(BACKUP_DIR));

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String backupFileName = BACKUP_DIR + "scout_backup_" + timestamp + ".db";

            try (FileChannel source = new FileInputStream(DB_PATH).getChannel();
                 FileChannel dest = new FileOutputStream(backupFileName).getChannel()) {
                dest.transferFrom(source, 0, source.size());
            }

            System.out.println("Backup created successfully: " + backupFileName);
        } catch (IOException e) {
            System.err.println("Backup failed: " + e.getMessage());
        }
    }
}
