<?php

$indicadorRojoMails = array_values(array_filter(array_map(
    'trim',
    explode(',', (string) env('REPORTE_INDICADOR_ROJO_MAILS', ''))
)));

return [
    'indicador_rojo' => [
        'mails' => $indicadorRojoMails,
    ],
];
