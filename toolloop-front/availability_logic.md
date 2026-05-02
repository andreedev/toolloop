# Tool Availability Logic Specification

This document defines the logic for a hybrid rule-and-exception based availability system for a tool rental platform.

## 1. Data Model Overview

The system relies on two primary entities to determine if a tool is available on a specific date.

### A. Tool Availability Rule (`tool_availability_rule`)
Defines the general "pattern" or "regime" of availability.
- **Rule Types**:
    - `Siempre`: Available every day.
    - `Lunes_a_Viernes`: Available Monday through Friday.
    - `Fines_de_semana`: Available Saturday and Sunday.
    - `No_disponible`: Available on no days by default.
    - `Personalizado`: A manual override mode (Blacklist-only).

### B. Tool Availability Exception (`tool_availability_exception`)
Acts as a **Blacklist** for the `Personalizado` rule type.
- **Mechanism**: The existence of a record for a specific `tool_id` and `date` indicates the tool is **Unavailable**.
- **Absence of Record**: If no record exists for the date, the tool follows the default state of the `Personalizado` rule (which is "Available").

---

## 2. Decision Logic (Algorithm)

To determine if a tool is available on `targetDate`:

1.  **Fetch the Rule**: Get the `rule_type` for the tool.
2.  **Evaluate fixed rules**:
    - If `rule_type == 'Siempre'`: Result = **TRUE**.
    - If `rule_type == 'Lunes_a_Viernes'`: Result = **TRUE** if `targetDate` is Mon-Fri, else **FALSE**.
    - If `rule_type == 'Fines_de_semana'`: Result = **TRUE** if `targetDate` is Sat-Sun, else **FALSE**.
    - If `rule_type == 'No_disponible'`: Result = **FALSE**.
3.  **Evaluate Custom Rule (`Personalizado`)**:
    - If `rule_type == 'Personalizado'`:
        - Check `tool_availability_exception` for an entry matching `tool_id` and `targetDate`.
        - If **Record Exists**: Result = **FALSE** (The user manually blocked this day).
        - If **No Record**: Result = **TRUE** (The day remains available by default).

---

## 3. UI/UX Mapping

- **Fixed Rules**: The calendar is read-only.
- **Personalizado Rule**:
    - **Default State**: All days are visually "Selected/Available" (No DB records).
    - **User Action (Unselect)**: The UI triggers an `INSERT` to the exception table to block the day.
    - **User Action (Re-select)**: The UI triggers a `DELETE` from the exception table to restore availability.

---

## 4. Maintenance Constraints

- **Rule Switching**: When a user changes the `rule_type` from `Personalizado` to any fixed rule (e.g., `Siempre`), all existing records in `tool_availability_exception` for that tool **MUST** be deleted to ensure a clean state if they ever return to custom mode.
