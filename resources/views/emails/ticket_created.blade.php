<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket Creadso</title>
</head>
<body style="background-color: #F3F4F6; color: #1F2937; font-family: Arial, sans-serif; margin: 0; padding: 0;">

    <div style="max-width: 600px; margin: 20px auto; background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <div style="background-color: #EF4444; color: #FFFFFF; padding: 16px; text-align: center;">
            <h1 style="font-size: 24px; font-weight: bold; margin: 0;"><svg style="vertical-align: middle; width: 24px; height: 24px; margin-right: 8px;" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.293-9.293a1 1 0 011.414 0L10 8.586l1.293-1.293a1 1 0 111.414 1.414L11.414 10l1.293 1.293a1 1 0 01-1.414 1.414L10 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L8.586 10 7.293 8.707a1 1 0 010-1.414z" /></svg> Ticket Creado</h1>
        </div>
        <div style="padding: 16px;">
            <p style="margin: 0 0 8px;"><strong>Folio:</strong> {{ $ticket->Folio }}</p>
            <p style="margin: 0 0 8px;"><strong>Modulo:</strong> {{ $ticket->Modulo }}</p>
            <p style="margin: 0 0 8px;"><strong>Problema:</strong> {{ $ticket->Tip_prob }}</p>
            <p style="margin: 0 0 16px;"><strong>Descripción:</strong> {{ $ticket->Descrip_prob }}</p>
            <p style="color: #6B7280; font-size: 12px; margin: 0;">Este ticket ha sido creado y está en proceso de revisión.</p>
        </div>
        <div style="padding: 16px; background-color: #F9FAFB; text-align: center;">
            <a href="{{ url('/') }}" style="display: inline-block; color: #FFFFFF; background-color: #3B82F6; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px;">Ir al Dashboard</a>
        </div>
    </div>

</body>
</html>
