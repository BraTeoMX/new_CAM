<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de tickets en indicador rojo</title>
</head>
<body style="background-color: #F1F5F9; color: #1F2937; font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0;">
    @php
        $kpis = $reporte['kpis'];
        $resumen = $reporte['resumen'];
        $tickets = $reporte['tickets'];
    @endphp

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F1F5F9; border-collapse: collapse; font-family: Arial, Helvetica, sans-serif;">
        <tr>
            <td align="center" style="padding: 24px 12px;">
                <table width="980" cellpadding="0" cellspacing="0" style="width: 980px; max-width: 100%; background-color: #FFFFFF; border-collapse: collapse; border: 1px solid #CBD5E1;">
                    <tr>
                        <td style="background-color: #111827; padding: 22px 24px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                <tr>
                                    <td style="vertical-align: top;">
                                        <p style="color: #FCA5A5; font-size: 12px; font-weight: bold; letter-spacing: .5px; margin: 0 0 6px; text-transform: uppercase;">
                                            Seguimiento operativo
                                        </p>
                                        <h1 style="color: #FFFFFF; font-size: 24px; line-height: 1.25; margin: 0;">
                                            Reporte de tickets en indicador rojo
                                        </h1>
                                        <p style="color: #CBD5E1; font-size: 13px; line-height: 1.5; margin: 8px 0 0;">
                                            Tickets activos que superan el umbral operativo definido en el monitor.
                                        </p>
                                    </td>
                                    <td align="right" style="vertical-align: top; width: 230px;">
                                        <p style="color: #CBD5E1; font-size: 12px; margin: 0;">Generado</p>
                                        <p style="color: #FFFFFF; font-size: 15px; font-weight: bold; margin: 5px 0 0;">
                                            {{ $reporte['fecha_generacion_formateada'] }}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 22px 24px 8px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 0 0 12px;">
                                        <h2 style="color: #111827; font-size: 18px; margin: 0;">Indicadores principales</h2>
                                    </td>
                                </tr>
                            </table>

                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                <tr>
                                    <td style="background-color: #FEF2F2; border: 1px solid #FECACA; padding: 14px; width: 24%; vertical-align: top;">
                                        <p style="color: #991B1B; font-size: 11px; font-weight: bold; margin: 0; text-transform: uppercase;">Tickets rojos</p>
                                        <p style="color: #7F1D1D; font-size: 30px; font-weight: bold; line-height: 1; margin: 8px 0 0;">{{ $kpis['total_tickets_rojos'] }}</p>
                                    </td>
                                    <td style="width: 1%;"></td>
                                    <td style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px; width: 25%; vertical-align: top;">
                                        <p style="color: #64748B; font-size: 11px; font-weight: bold; margin: 0; text-transform: uppercase;">Mecanico con mas tickets</p>
                                        <p style="color: #111827; font-size: 15px; font-weight: bold; line-height: 1.35; margin: 8px 0 0;">{{ $kpis['mecanico_mas_tickets'] }}</p>
                                        <p style="color: #475569; font-size: 12px; margin: 6px 0 0;">{{ $kpis['mecanico_mas_tickets_total'] }} tickets</p>
                                    </td>
                                    <td style="width: 1%;"></td>
                                    <td style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px; width: 24%; vertical-align: top;">
                                        <p style="color: #64748B; font-size: 11px; font-weight: bold; margin: 0; text-transform: uppercase;">Modulo con mas tickets</p>
                                        <p style="color: #111827; font-size: 15px; font-weight: bold; line-height: 1.35; margin: 8px 0 0;">{{ $kpis['modulo_mas_tickets'] }}</p>
                                        <p style="color: #475569; font-size: 12px; margin: 6px 0 0;">{{ $kpis['modulo_mas_tickets_total'] }} tickets</p>
                                    </td>
                                    <td style="width: 1%;"></td>
                                    <td style="background-color: #FFF7ED; border: 1px solid #FED7AA; padding: 14px; width: 24%; vertical-align: top;">
                                        <p style="color: #9A3412; font-size: 11px; font-weight: bold; margin: 0; text-transform: uppercase;">Mayor tiempo</p>
                                        <p style="color: #111827; font-size: 15px; font-weight: bold; margin: 8px 0 0;">{{ $kpis['ticket_mayor_minutos'] }}</p>
                                        <p style="color: #9A3412; font-size: 12px; margin: 6px 0 0;">{{ $kpis['ticket_mayor_minutos_total'] }} min - {{ $kpis['ticket_mayor_minutos_formateado'] }}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 14px 24px 22px;">
                            @if ($tickets->isEmpty())
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #CBD5E1; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 18px;">
                                            <p style="color: #111827; font-size: 16px; font-weight: bold; margin: 0 0 6px;">Sin tickets en indicador rojo</p>
                                            <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0;">
                                                No se encontraron tickets en indicador rojo al momento de generar este reporte.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            @else
                                <h2 style="color: #111827; font-size: 18px; margin: 0 0 12px;">Resumen ejecutivo</h2>
                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 22px;">
                                    <tr>
                                        <td style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px; width: 50%; vertical-align: top;">
                                            <p style="color: #64748B; font-size: 11px; font-weight: bold; margin: 0 0 8px; text-transform: uppercase;">Estatus operativo</p>
                                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                                <tr>
                                                    <td style="color: #334155; font-size: 13px; padding: 4px 0;">En atencion</td>
                                                    <td align="right" style="color: #111827; font-size: 13px; font-weight: bold; padding: 4px 0;">{{ $resumen['en_atencion'] }}</td>
                                                </tr>
                                                <tr>
                                                    <td style="color: #334155; font-size: 13px; padding: 4px 0;">Asignados sin iniciar</td>
                                                    <td align="right" style="color: #111827; font-size: 13px; font-weight: bold; padding: 4px 0;">{{ $resumen['sin_iniciar'] }}</td>
                                                </tr>
                                            </table>
                                        </td>
                                        <td style="width: 2%;"></td>
                                        <td style="background-color: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px; width: 48%; vertical-align: top;">
                                            <p style="color: #64748B; font-size: 11px; font-weight: bold; margin: 0 0 8px; text-transform: uppercase;">Distribucion por estado</p>
                                            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                                @foreach ($resumen['por_estado'] as $estado => $total)
                                                    <tr>
                                                        <td style="color: #334155; font-size: 13px; padding: 4px 0;">{{ $estado ?: 'N/A' }}</td>
                                                        <td align="right" style="color: #111827; font-size: 13px; font-weight: bold; padding: 4px 0;">{{ $total }}</td>
                                                    </tr>
                                                @endforeach
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <h2 style="color: #111827; font-size: 18px; margin: 0 0 12px;">Detalle ordenado por mayor tiempo</h2>

                                @foreach ($tickets as $index => $ticket)
                                    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border: 1px solid #E2E8F0; margin-bottom: 16px;">
                                        <tr>
                                            <td style="background-color: #991B1B; color: #FFFFFF; padding: 12px 14px;">
                                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                                    <tr>
                                                        <td style="vertical-align: top;">
                                                            <p style="font-size: 12px; font-weight: bold; margin: 0 0 4px;">#{{ $index + 1 }} | {{ $ticket['folio'] }}</p>
                                                            <p style="font-size: 17px; font-weight: bold; line-height: 1.3; margin: 0;">{{ $ticket['mecanico'] }}</p>
                                                            <p style="font-size: 12px; line-height: 1.4; margin: 5px 0 0;">{{ $ticket['tipo_monitor_label'] }} | {{ $ticket['estado'] }} | Indicador rojo</p>
                                                        </td>
                                                        <td align="right" style="vertical-align: top; width: 190px;">
                                                            <p style="font-size: 22px; font-weight: bold; line-height: 1; margin: 0;">{{ $ticket['tiempo_transcurrido_formateado'] }}</p>
                                                            <p style="font-size: 12px; margin: 6px 0 0;">{{ $ticket['tiempo_transcurrido_minutos'] }} minutos</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 0;">
                                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                                    <tr>
                                                        <td style="background-color: #F8FAFC; border-bottom: 1px solid #E2E8F0; color: #64748B; font-size: 11px; font-weight: bold; padding: 8px 10px; text-transform: uppercase; width: 18%;">Ubicacion</td>
                                                        <td style="border-bottom: 1px solid #E2E8F0; color: #111827; font-size: 13px; padding: 8px 10px;">
                                                            Planta {{ $ticket['planta'] ?? 'N/A' }} | Modulo {{ $ticket['modulo'] ?? 'N/A' }} | Maquina {{ $ticket['maquina'] ?? 'N/A' }}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="background-color: #F8FAFC; border-bottom: 1px solid #E2E8F0; color: #64748B; font-size: 11px; font-weight: bold; padding: 8px 10px; text-transform: uppercase;">Responsables</td>
                                                        <td style="border-bottom: 1px solid #E2E8F0; color: #111827; font-size: 13px; padding: 8px 10px;">
                                                            Mecanico: {{ $ticket['mecanico'] }} ({{ $ticket['numero_empleado'] }})<br>
                                                            Supervisor: {{ $ticket['supervisor'] }} ({{ $ticket['numero_empleado_supervisor'] }})
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="background-color: #F8FAFC; border-bottom: 1px solid #E2E8F0; color: #64748B; font-size: 11px; font-weight: bold; padding: 8px 10px; text-transform: uppercase;">Fechas</td>
                                                        <td style="border-bottom: 1px solid #E2E8F0; color: #111827; font-size: 13px; padding: 8px 10px;">
                                                            Creacion: {{ $ticket['fecha_creacion'] ?: 'N/A' }}<br>
                                                            Asignacion: {{ $ticket['fecha_asignacion'] ?: 'N/A' }}<br>
                                                            Inicio: {{ $ticket['fecha_inicio_atencion'] ?: 'N/A' }}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="background-color: #F8FAFC; border-bottom: 1px solid #E2E8F0; color: #64748B; font-size: 11px; font-weight: bold; padding: 8px 10px; text-transform: uppercase;">Problema</td>
                                                        <td style="border-bottom: 1px solid #E2E8F0; color: #111827; font-size: 13px; line-height: 1.5; padding: 8px 10px;">
                                                            <strong>Tipo:</strong> {{ $ticket['tipo_falla'] ?? 'N/A' }}<br>
                                                            <strong>Descripcion:</strong> {{ $ticket['descripcion'] ?? 'N/A' }}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="background-color: #F8FAFC; border-bottom: 1px solid #E2E8F0; color: #64748B; font-size: 11px; font-weight: bold; padding: 8px 10px; text-transform: uppercase;">Diagnostico</td>
                                                        <td style="border-bottom: 1px solid #E2E8F0; color: #111827; font-size: 13px; line-height: 1.5; padding: 8px 10px;">
                                                            Clase: {{ $ticket['clase_maquina'] }} | No. maquina: {{ $ticket['numero_maquina'] }} | Estimado: {{ $ticket['tiempo_estimado_formateado'] }}<br>
                                                            Falla: {{ $ticket['falla'] }} | Causa: {{ $ticket['causa'] }}<br>
                                                            Accion: {{ $ticket['accion_correctiva'] }}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="background-color: #F8FAFC; color: #64748B; font-size: 11px; font-weight: bold; padding: 8px 10px; text-transform: uppercase;">Bahia / notas</td>
                                                        <td style="color: #111827; font-size: 13px; line-height: 1.5; padding: 8px 10px;">
                                                            Bahia: {{ $ticket['tiempo_bahia']['registrado'] ? $ticket['tiempo_bahia']['total_formateado'] : 'N/A' }}
                                                            @if ($ticket['tiempo_bahia']['activo'])
                                                                | Bahia activa: {{ $ticket['tiempo_bahia']['motivo_activo'] }}
                                                            @endif
                                                            <br>
                                                            Comentarios: {{ $ticket['comentarios'] }}
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                @endforeach
                            @endif
                        </td>
                    </tr>

                    <tr>
                        <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 14px 24px;">
                            <p style="color: #64748B; font-size: 12px; line-height: 1.5; margin: 0;">
                                Este correo se genera automaticamente con la misma logica del monitor operativo. Los registros se muestran de mayor a menor tiempo transcurrido.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
