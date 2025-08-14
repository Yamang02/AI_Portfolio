package com.aiportfolio.backend.shared.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public class DateUtils {
    
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    public static String formatDate(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "";
        }
        return dateTime.format(FORMATTER);
    }
    
    public static String getTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "";
        }
        
        LocalDateTime now = LocalDateTime.now();
        long days = ChronoUnit.DAYS.between(dateTime, now);
        long hours = ChronoUnit.HOURS.between(dateTime, now);
        long minutes = ChronoUnit.MINUTES.between(dateTime, now);
        
        if (days > 0) {
            return days + "일 전";
        } else if (hours > 0) {
            return hours + "시간 전";
        } else if (minutes > 0) {
            return minutes + "분 전";
        } else {
            return "방금 전";
        }
    }
    
    public static boolean isRecent(LocalDateTime dateTime, int days) {
        if (dateTime == null) {
            return false;
        }
        
        LocalDateTime now = LocalDateTime.now();
        long daysBetween = ChronoUnit.DAYS.between(dateTime, now);
        return daysBetween <= days;
    }
} 