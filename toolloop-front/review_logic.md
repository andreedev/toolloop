# Review Logic

## Overview

Each rental can produce two reviews — one per party. Reviews share the same DB schema but fields carry different meaning per `review_type`.

## DB Constraint

```sql
UNIQUE KEY unique_rental_reviewer (rental_id, reviewer_id)
```

One review per reviewer per rental. Max 2 reviews per rental (renter + owner).

---

## Review Types

### `RENTER_TO_OWNER` — Renter reviews Owner + Tool

| Field | Meaning |
|---|---|
| `reviewer_id` | Renter (who writes) |
| `reviewee_id` | Owner (who receives) |
| `user_rating` | Owner quality (1–5) |
| `user_tags` | Owner tags: "Muy amable", "Puntual", "Comunicación excelente"... |
| `tool_rating` | Tool condition (1–5) |
| `tool_tags` | Tool tags: "Perfecto estado", "Como en la foto", "Fácil de usar"... |

**UI label for reviewer:** `Arrendatario`
**Rating labels shown:** `Propietario` + `Herramienta`

---

### `OWNER_TO_RENTER` — Owner reviews Renter + Return

| Field | Meaning |
|---|---|
| `reviewer_id` | Owner (who writes) |
| `reviewee_id` | Renter (who receives) |
| `user_rating` | Renter quality (1–5) |
| `user_tags` | Renter tags: "Responsable", "Muy puntual", "La repetiría"... |
| `tool_rating` | How renter returned the tool (1–5) |
| `tool_tags` | Return tags: "Devolvió a tiempo", "Limpia y ordenada", "Devuelta en perfecto estado"... |

**UI label for reviewer:** `Propietario`
**Rating labels shown:** `Arrendatario` + `Devolución`

---

## Where Each Type Appears

### Tool page (`/tools/:id`)
- Shows only `RENTER_TO_OWNER` reviews.
- Query: `review_type = RENTER_TO_OWNER` AND `rental.tool_id = :toolId`
- Rationale: tool page shows renters' experience with the tool and its owner.

### User profile (`/users/:id`)
- Shows ALL reviews where `reviewee_id = :userId` (both types).
- Covers two roles the user can hold:
  - Received as **owner** → `RENTER_TO_OWNER` reviews
  - Received as **renter** → `OWNER_TO_RENTER` reviews
- Differentiated in UI by reviewer badge (`Propietario` vs `Arrendatario`).

---

## Entity Reference

```
Review.java
  reviewId      — PK
  rentalId      — FK → rental
  reviewerId    — FK → user (writer)
  revieweeId    — FK → user (receiver)
  reviewType    — RENTER_TO_OWNER | OWNER_TO_RENTER
  userRating    — 1–5
  userTags      — JSON list
  toolRating    — 1–5  ← repurposed as "return quality" in OWNER_TO_RENTER
  toolTags      — JSON list
  comment       — max 300 chars
```
