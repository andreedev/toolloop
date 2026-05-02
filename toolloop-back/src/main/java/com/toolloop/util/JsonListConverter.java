package com.toolloop.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;
import java.util.List;

@Converter
public class JsonListConverter implements AttributeConverter<List<String>, String> {
    private final static ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<String> list) {
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    @Override
    public List<String> convertToEntityAttribute(String jsonString) {
        try {
            return objectMapper.readValue(jsonString, List.class);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}