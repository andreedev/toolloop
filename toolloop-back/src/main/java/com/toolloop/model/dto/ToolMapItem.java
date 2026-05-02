package com.toolloop.model.dto;

import com.toolloop.model.entity.Category;
import com.toolloop.model.entity.ToolPhoto;
import com.toolloop.model.entity.User;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@RegisterForReflection
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ToolMapItem {
    public Long toolId;
    public String name;
    public BigDecimal pricePerDay;
    public Boolean isReserved;
    public List<ToolPhoto> photos;
    public Category category;
    public User owner;
    public BigDecimal latitude;
    public BigDecimal longitude;
    public Integer distanceMeters;
}
