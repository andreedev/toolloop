package com.toolloop.util;

import java.math.BigDecimal;
import java.util.stream.Stream;

public class BigDecimalUtils {

    public static BigDecimal sum(Stream<BigDecimal> values) {
       return values.reduce(BigDecimal.ZERO, BigDecimal::add);
    }

}
