package com.toolloop.model.dto;

import com.toolloop.model.entity.Category;
import com.toolloop.model.entity.ToolPhoto;
import com.toolloop.model.entity.User;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@RegisterForReflection
@Data
@NoArgsConstructor
public class ToolDTO {
    public Long toolId;
    public String name;
    public String description;
    public String photoKey;
    public Long ownerId;
    public User owner;
    public Long categoryId;
    public String categoryName;
    public String categoryIcon;
    public String condition;
    public String pricePerDay;
    public String securityDeposit;
    public Category category;
    public List<ToolPhoto> photos;
}