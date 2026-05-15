package com.toolloop.util;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class EmailTemplates {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("d 'de' MMMM 'de' yyyy", new Locale("es", "ES"));

    public static String subjectConfirmation() {
        return "Confirma tu dirección de email — ToolLoop";
    }

    public static String subjectWelcome() {
        return "¡Bienvenido a ToolLoop!";
    }

    public static String subjectNewRentalRequest(String toolName) {
        return "Nueva solicitud de alquiler para \"" + toolName + "\"";
    }

    public static String subjectRequestConfirmed(String toolName) {
        return "Tu solicitud de alquiler ha sido aceptada: " + toolName;
    }

    public static String subjectRequestRejected(String toolName) {
        return "Tu solicitud de alquiler ha sido rechazada: " + toolName;
    }

    public static String subjectReturnReminder(String toolName) {
        return "Recordatorio: devolución de \"" + toolName + "\" próxima";
    }

    public static String subjectNewReview(String reviewerName) {
        return reviewerName + " te ha dejado una reseña";
    }

    public static String confirmation(String recipientName, String verificationUrl) {
        return wrap(recipientName,
            "<h2 style='margin:0 0 16px;font-size:20px;color:#111827;'>Confirma tu email</h2>" +
            "<p style='margin:0 0 24px;'>Para activar tu cuenta en ToolLoop, haz clic en el botón:</p>" +
            "<div style='margin:0 0 24px;text-align:center;'>" +
              "<a href='" + verificationUrl + "' style='display:inline-block;padding:12px 28px;background:#16a34a;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;'>Verificar mi email</a>" +
            "</div>" +
            "<p style='margin:0;color:#6b7280;font-size:13px;'>El enlace expira en 24 horas. Si no creaste una cuenta en ToolLoop, ignora este mensaje.</p>"
        );
    }

    public static String welcome(String recipientName) {
        return wrap(recipientName,
            "<h2 style='margin:0 0 16px;font-size:20px;color:#111827;'>¡Bienvenido a ToolLoop!</h2>" +
            "<p style='margin:0 0 12px;'>Tu cuenta está lista. Ya puedes:</p>" +
            "<ul style='margin:0 0 16px;padding-left:20px;line-height:1.8;color:#374151;'>" +
              "<li>Publicar tus herramientas para alquilarlas</li>" +
              "<li>Alquilar herramientas de otros usuarios</li>" +
              "<li>Chatear directamente con propietarios e inquilinos</li>" +
            "</ul>" +
            "<p style='margin:0;color:#6b7280;font-size:13px;'>Comparte · Crea · Cuida</p>"
        );
    }

    public static String newRentalRequest(
        String ownerName,
        String renterName,
        String toolName,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal totalAmount
    ) {
        return wrap(ownerName,
            "<h2 style='margin:0 0 16px;font-size:20px;color:#111827;'>Nueva solicitud de alquiler</h2>" +
            "<p style='margin:0 0 12px;'><strong>" + renterName + "</strong> quiere alquilar tu herramienta:</p>" +
            infoTable(new String[][]{
                {"Herramienta", toolName},
                {"Fecha de inicio", startDate.format(DATE_FMT)},
                {"Fecha de fin", endDate.format(DATE_FMT)},
                {"Total", formatEur(totalAmount)}
            }) +
            "<p style='margin:16px 0 0;color:#6b7280;font-size:13px;'>Accede a ToolLoop para aceptar o rechazar la solicitud.</p>"
        );
    }

    public static String requestConfirmed(
        String renterName,
        String ownerName,
        String toolName,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal totalAmount
    ) {
        return wrap(renterName,
            "<h2 style='margin:0 0 16px;font-size:20px;color:#111827;'>¡Solicitud aceptada!</h2>" +
            "<p style='margin:0 0 12px;'><strong>" + ownerName + "</strong> ha aceptado tu solicitud de alquiler:</p>" +
            infoTable(new String[][]{
                {"Herramienta", toolName},
                {"Fecha de inicio", startDate.format(DATE_FMT)},
                {"Fecha de fin", endDate.format(DATE_FMT)},
                {"Total", formatEur(totalAmount)}
            }) +
            "<p style='margin:16px 0 0;color:#6b7280;font-size:13px;'>Accede a ToolLoop para ver los detalles y coordinar la entrega.</p>"
        );
    }

    public static String requestRejected(
        String renterName,
        String ownerName,
        String toolName,
        LocalDate startDate,
        LocalDate endDate
    ) {
        return wrap(renterName,
            "<h2 style='margin:0 0 16px;font-size:20px;color:#111827;'>Solicitud no aceptada</h2>" +
            "<p style='margin:0 0 12px;'><strong>" + ownerName + "</strong> no ha podido aceptar tu solicitud:</p>" +
            infoTable(new String[][]{
                {"Herramienta", toolName},
                {"Fechas solicitadas", startDate.format(DATE_FMT) + " – " + endDate.format(DATE_FMT)}
            }) +
            "<p style='margin:16px 0 0;color:#6b7280;font-size:13px;'>Puedes buscar otras herramientas similares disponibles en ToolLoop.</p>"
        );
    }

    public static String returnReminder(
        String renterName,
        String toolName,
        LocalDate returnDate,
        long daysRemaining
    ) {
        String dayText = daysRemaining == 1 ? "mañana" : "en " + daysRemaining + " días";
        return wrap(renterName,
            "<h2 style='margin:0 0 16px;font-size:20px;color:#111827;'>Recordatorio de devolución</h2>" +
            "<p style='margin:0 0 12px;'>Recuerda devolver la herramienta <strong>" + dayText + "</strong>:</p>" +
            infoTable(new String[][]{
                {"Herramienta", toolName},
                {"Fecha límite", returnDate.format(DATE_FMT)}
            }) +
            "<p style='margin:16px 0 0;color:#6b7280;font-size:13px;'>Devuélvela en las condiciones acordadas para evitar cargos adicionales.</p>"
        );
    }

    public static String reviewReceived(
        String recipientName,
        String reviewerName,
        int rating,
        String comment
    ) {
        String stars = "★".repeat(Math.max(0, Math.min(rating, 5))) +
                       "☆".repeat(Math.max(0, 5 - Math.min(rating, 5)));
        String commentBlock = (comment != null && !comment.isBlank())
            ? "<blockquote style='margin:12px 0;padding:12px 16px;background:#f9fafb;border-left:4px solid #16a34a;color:#374151;font-style:italic;'>" + comment + "</blockquote>"
            : "";
        return wrap(recipientName,
            "<h2 style='margin:0 0 16px;font-size:20px;color:#111827;'>Has recibido una reseña</h2>" +
            "<p style='margin:0 0 8px;'><strong>" + reviewerName + "</strong> te ha valorado:</p>" +
            "<p style='margin:0 0 8px;font-size:26px;color:#facc15;letter-spacing:3px;'>" + stars + "</p>" +
            commentBlock +
            "<p style='margin:16px 0 0;color:#6b7280;font-size:13px;'>Accede a ToolLoop para ver tu perfil actualizado.</p>"
        );
    }

    private static String wrap(String recipientName, String content) {
        return """
            <!DOCTYPE html>
            <html lang="es">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
            <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#374151;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
                <tr><td align="center">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
                    <tr>
                      <td style="background:#16a34a;padding:20px 32px;">
                        <span style="font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:-0.5px;">ToolLoop</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:32px;">
                        <p style="margin:0 0 20px;color:#6b7280;">Hola, <strong style="color:#111827;">%s</strong></p>
                        %s
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af;text-align:center;">
                        ToolLoop · Comparte · Crea · Cuida<br>
                        Si no esperabas este correo, puedes ignorarlo.
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(recipientName, content);
    }

    private static String infoTable(String[][] rows) {
        StringBuilder sb = new StringBuilder(
            "<table cellpadding='0' cellspacing='0' style='width:100%;border-collapse:collapse;margin:0 0 8px;'>");
        for (String[] row : rows) {
            sb.append("<tr>")
              .append("<td style='padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;width:40%;'>")
              .append(row[0]).append("</td>")
              .append("<td style='padding:8px 12px;border:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;'>")
              .append(row[1]).append("</td>")
              .append("</tr>");
        }
        sb.append("</table>");
        return sb.toString();
    }

    private static String formatEur(BigDecimal amount) {
        return String.format(new Locale("es", "ES"), "%.2f €", amount);
    }
}
