<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de tickets en indicador rojo</title>
</head>
<body style="background-color: #F3F4F6; color: #1F2937; font-family: Arial, sans-serif; margin: 0; padding: 0;">
    @php
        $kpis = $reporte['kpis'];
        $resumen = $reporte['resumen'];
        $tickets = $reporte['tickets'];
    @endphp

    <div style="max-width: 980px; margin: 20px auto; background-color: #FFFFFF; border: 1px solid #E5E7EB;">
        <div style="background-color: #B91C1C; color: #FFFFFF; padding: 20px;">
            <h1 style="font-size: 22px; line-height: 1.3; margin: 0;">Reporte de tickets en indicador rojo</h1>
            <p style="font-size: 13px; line-height: 1.5; margin: 8px 0 0;">
                Generado: {{ $reporte['fecha_generacion_formateada'] }}
            </p>
        </div>

        <div style="padding: 18px;">
            <h2 style="font-size: 18px; margin: 0 0 12px; color: #111827;">KPIs</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 18px;">
                <tr>
                    <td style="border: 1px solid #E5E7EB; padding: 12px; width: 25%; vertical-align: top;">
                        <p style="font-size: 12px; color: #6B7280; margin: 0;">Total tickets rojos</p>
                        <p style="font-size: 22px; font-weight: bold; margin: 6px 0 0;">{{ $kpis['total_tickets_rojos'] }}</p>
                    </td>
                    <td style="border: 1px solid #E5E7EB; padding: 12px; width: 25%; vertical-align: top;">
                        <p style="font-size: 12px; color: #6B7280; margin: 0;">Mecanico con mas tickets</p>
                        <p style="font-size: 15px; font-weight: bold; margin: 6px 0 0;">{{ $kpis['mecanico_mas_tickets'] }}</p>
                        <p style="font-size: 12px; margin: 4px 0 0;">{{ $kpis['mecanico_mas_tickets_total'] }} tickets</p>
                    </td>
                    <td style="border: 1px solid #E5E7EB; padding: 12px; width: 25%; vertical-align: top;">
                        <p style="font-size: 12px; color: #6B7280; margin: 0;">Modulo con mas tickets</p>
                        <p style="font-size: 15px; font-weight: bold; margin: 6px 0 0;">{{ $kpis['modulo_mas_tickets'] }}</p>
                        <p style="font-size: 12px; margin: 4px 0 0;">{{ $kpis['modulo_mas_tickets_total'] }} tickets</p>
                    </td>
                    <td style="border: 1px solid #E5E7EB; padding: 12px; width: 25%; vertical-align: top;">
                        <p style="font-size: 12px; color: #6B7280; margin: 0;">Ticket con mas minutos</p>
                        <p style="font-size: 15px; font-weight: bold; margin: 6px 0 0;">{{ $kpis['ticket_mayor_minutos'] }}</p>
                        <p style="font-size: 12px; margin: 4px 0 0;">
                            {{ $kpis['ticket_mayor_minutos_total'] }} min ({{ $kpis['ticket_mayor_minutos_formateado'] }})
                        </p>
                    </td>
                </tr>
            </table>

            @if ($tickets->isEmpty())
                <div style="border: 1px solid #D1D5DB; background-color: #F9FAFB; padding: 16px; margin-bottom: 18px;">
                    <p style="font-size: 15px; margin: 0;">
                        No se encontraron tickets en indicador rojo al momento de generar este reporte.
                    </p>
                </div>
            @else
                <h2 style="font-size: 18px; margin: 0 0 12px; color: #111827;">Resumen</h2>
                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 18px;">
                    <tr>
                        <td style="border: 1px solid #E5E7EB; padding: 10px;">
                            <strong>En atencion:</strong> {{ $resumen['en_atencion'] }}
                        </td>
                        <td style="border: 1px solid #E5E7EB; padding: 10px;">
                            <strong>Asignados sin iniciar:</strong> {{ $resumen['sin_iniciar'] }}
                        </td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #E5E7EB; padding: 10px; vertical-align: top;">
                            <strong>Por planta:</strong>
                            <ul style="margin: 8px 0 0; padding-left: 18px;">
                                @foreach ($resumen['por_planta'] as $planta => $total)
                                    <li>Planta {{ $planta ?: 'N/A' }}: {{ $total }}</li>
                                @endforeach
                            </ul>
                        </td>
                        <td style="border: 1px solid #E5E7EB; padding: 10px; vertical-align: top;">
                            <strong>Por estado:</strong>
                            <ul style="margin: 8px 0 0; padding-left: 18px;">
                                @foreach ($resumen['por_estado'] as $estado => $total)
                                    <li>{{ $estado ?: 'N/A' }}: {{ $total }}</li>
                                @endforeach
                            </ul>
                        </td>
                    </tr>
                </table>

                <h2 style="font-size: 18px; margin: 0 0 12px; color: #111827;">Detalle de tickets rojos</h2>

                @foreach ($tickets as $ticket)
                    <div style="border: 1px solid #FCA5A5; border-left: 6px solid #B91C1C; margin-bottom: 14px;">
                        <div style="background-color: #FEF2F2; padding: 12px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                <tr>
                                    <td style="vertical-align: top;">
                                        <p style="font-size: 16px; font-weight: bold; margin: 0;">
                                            {{ $ticket['folio'] }} - {{ $ticket['mecanico'] }}
                                        </p>
                                        <p style="font-size: 12px; color: #4B5563; margin: 4px 0 0;">
                                            {{ $ticket['tipo_monitor_label'] }} | Estado: {{ $ticket['estado'] }} | Indicador: rojo
                                        </p>
                                    </td>
                                    <td style="text-align: right; vertical-align: top;">
                                        <p style="font-size: 18px; font-weight: bold; color: #B91C1C; margin: 0;">
                                            {{ $ticket['tiempo_transcurrido_formateado'] }}
                                        </p>
                                        <p style="font-size: 12px; margin: 4px 0 0;">
                                            {{ $ticket['tiempo_transcurrido_minutos'] }} minutos
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                            <tr>
                                <td style="border-top: 1px solid #FEE2E2; padding: 8px; width: 25%;"><strong>ID:</strong> {{ $ticket['id'] }}</td>
                                <td style="border-top: 1px solid #FEE2E2; padding: 8px; width: 25%;"><strong>Planta:</strong> {{ $ticket['planta'] ?? 'N/A' }}</td>
                                <td style="border-top: 1px solid #FEE2E2; padding: 8px; width: 25%;"><strong>Modulo:</strong> {{ $ticket['modulo'] ?? 'N/A' }}</td>
                                <td style="border-top: 1px solid #FEE2E2; padding: 8px; width: 25%;"><strong>Maquina:</strong> {{ $ticket['maquina'] ?? 'N/A' }}</td>
                            </tr>
                            <tr>
                                <td style="border-top: 1px solid #FEE2E2; padding: 8px;"><strong>Empleado:</strong> {{ $ticket['numero_empleado'] }}</td>
                                <td style="border-top: 1px solid #FEE2E2; padding: 8px;"><strong>Supervisor:</strong> {{ $ticket['supervisor'] }}</td>
                                <td style="border-top: 1px solid #FEE2E2; padding: 8px;"><strong>No. supervisor:</strong> {{ $ticket['numero_empleado_supervisor'] }}</td>
                                <td style="border-top: 1px solid #FEE2E2; padding: 8px;"><strong>Clase:</strong> {{ $ticket['clase_maquina'] }}</td>
                            </tr>
                            <tr>
                                <td style="border-top: 1px solid #FEE2E2; padding: 8px;"><strong>Creacion:</strong> {{ $ticket['fecha_creacion'] ?: 'N/A' }}</td>
                                <td style="border-top: 1px solid #FEE2E2; padding: 8px;"><strong>Asignacion:</strong> {{ $ticket['fecha_asignacion'] ?: 'N/A' }}</td>
                                <td style="border-top: 1px solid #FEE2E2; padding: 8px;"><strong>Inicio:</strong> {{ $ticket['fecha_inicio_atencion'] ?: 'N/A' }}</td>
                                <td style="border-top: 1px solid #FEE2E2; padding: 8px;"><strong>Estimado:</strong> {{ $ticket['tiempo_estimado_formateado'] }}</td>
                            </tr>
                            <tr>
                                <td colspan="2" style="border-top: 1px solid #FEE2E2; padding: 8px;"><strong>Tipo de falla:</strong> {{ $ticket['tipo_falla'] ?? 'N/A' }}</td>
                                <td colspan="2" style="border-top: 1px solid #FEE2E2; padding: 8px;"><strong>Bahia:</strong> {{ $ticket['tiempo_bahia']['registrado'] ? $ticket['tiempo_bahia']['total_formateado'] : 'N/A' }}</td>
                            </tr>
                            <tr>
                                <td colspan="4" style="border-top: 1px solid #FEE2E2; padding: 8px;"><strong>Descripcion:</strong> {{ $ticket['descripcion'] ?? 'N/A' }}</td>
                            </tr>
                            <tr>
                                <td colspan="2" style="border-top: 1px solid #FEE2E2; padding: 8px;"><strong>Falla:</strong> {{ $ticket['falla'] }}</td>
                                <td colspan="2" style="border-top: 1px solid #FEE2E2; padding: 8px;"><strong>Causa:</strong> {{ $ticket['causa'] }}</td>
                            </tr>
                            <tr>
                                <td colspan="2" style="border-top: 1px solid #FEE2E2; padding: 8px;"><strong>Accion:</strong> {{ $ticket['accion_correctiva'] }}</td>
                                <td colspan="2" style="border-top: 1px solid #FEE2E2; padding: 8px;"><strong>Comentarios:</strong> {{ $ticket['comentarios'] }}</td>
                            </tr>
                            @if ($ticket['tiempo_bahia']['activo'])
                                <tr>
                                    <td colspan="4" style="border-top: 1px solid #FEE2E2; padding: 8px; color: #6D28D9;">
                                        <strong>Bahia activa:</strong> {{ $ticket['tiempo_bahia']['motivo_activo'] }}
                                    </td>
                                </tr>
                            @endif
                        </table>
                    </div>
                @endforeach
            @endif
        </div>
    </div>
</body>
</html>
