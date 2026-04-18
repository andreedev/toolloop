package com.toolloop.util;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;

public class StringUtils {

    public static String reduceFileName(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return fileName;
        }

        fileName = normalizeAccents(fileName);
        fileName = fileName.replaceAll("[^\\p{ASCII}]", "");
        fileName = fileName.trim();
        fileName = fileName.replaceAll("/+$", "");
        fileName = fileName.toLowerCase();
        fileName = fileName.replaceAll("[\\s\\p{Punct}&&[^._-]]", "_");
        fileName = fileName.replaceAll("_+", "_");
        fileName = fileName.replaceAll("_+\\.", ".");
        fileName = fileName.replaceAll("^_|_$", "");
        fileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8);

        return fileName;
    }

    private static String normalizeAccents(String input) {
        return Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
    }

}
