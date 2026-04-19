package com.toolloop.util;

public class FileUtils {

    public static String getContentTypeFromExtension(String filename) {
        if (filename == null) return "application/octet-stream";
        String ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        return switch (ext) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png"         -> "image/png";
            case "webp"        -> "image/webp";
            case "gif"         -> "image/gif";
            case "jfif"        -> "image/jfif";
            default            -> "application/octet-stream";
        };
    }
}
