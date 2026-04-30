package com.toolloop.model.enums;

public enum DayStatus {
    AVAILABLE,      // disponible según regla base
    UNAVAILABLE,    // no disponible según regla base o excepción
    RENTED          // bloqueado por Rental Aprobada/En_Uso
}
