package com.toolloop.model.entity;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.math.BigDecimal;

@RegisterForReflection
@Data
@NoArgsConstructor
@Entity
@Table(name = "postal_code_geo")
public class PostalCodeGeo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "postal_code", nullable = false, length = 20)
    public String postalCode;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 8)
    public BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 11, scale = 8)
    public BigDecimal longitude;

    @Column(name = "city")
    public String city;

    @Column(name = "province")
    public String province;

    @Column(name = "community")
    public String community;
}
