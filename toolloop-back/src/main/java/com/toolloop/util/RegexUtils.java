package com.toolloop.util;

public class RegexUtils {

    public static String diacriticSensitiveRegex(String input) {
        if (input == null) {
            return "";
        }

        return input
                .replace("a", "[a,á,à,ä,â]")
                .replace("A", "[A,a,á,à,ä,â]")
                .replace("e", "[e,é,ë,è]")
                .replace("E", "[E,e,é,ë,è]")
                .replace("i", "[i,í,ï,ì]")
                .replace("I", "[I,i,í,ï,ì]")
                .replace("o", "[o,ó,ö,ò]")
                .replace("O", "[O,o,ó,ö,ò]")
                .replace("u", "[u,ü,ú,ù]")
                .replace("U", "[U,u,ü,ú,ù]");
    }
}
