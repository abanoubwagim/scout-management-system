package com.scout_system.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.LocalDate;

@Converter(autoApply = true)
public class LocalDateAttributeConverter implements AttributeConverter<LocalDate, String> {

    @Override
    public String convertToDatabaseColumn(LocalDate localDate) {
        return (localDate == null ? null : localDate.toString());
    }

    @Override
    public LocalDate convertToEntityAttribute(String dbData) {
        return (dbData == null ? null : LocalDate.parse(dbData));
    }
}
