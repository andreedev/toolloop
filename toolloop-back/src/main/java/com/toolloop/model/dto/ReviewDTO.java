package com.toolloop.model.dto;

import com.toolloop.model.entity.Rental;
import com.toolloop.model.entity.User;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.Data;
import lombok.NoArgsConstructor;

@RegisterForReflection
@Data
@NoArgsConstructor
public class ReviewDTO {
    public Long reviewId;
    public Long rentalId;
    public Long reviewerId;
    public Long revieweeId;
    public Byte rating;
    public String comment;
    public Rental rental;
    public User reviewer;
    public User reviewee;
}