<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Event;

class EventController extends Controller
{
    // Guardar un evento
    public function store(Request $request)
    {
        $event = new Event();
        $event->title = $request->title;
        $event->start = $request->start;
        $event->end = $request->end ?? $request->start; // Fecha de fin opcional
        $event->description = $request->description;
        $event->save();

        return response()->json(['success' => true, 'event' => $event]);
    }

    // Obtener eventos
    public function index()
    {
        $events = Event::all();
        return response()->json($events);
    }
    // Ruta para obtener responsables
    public function getResponsibles()
    {
        $responsibles = Event::whereNotNull('responsible')->distinct()->pluck('responsible');
        return response()->json($responsibles);
    }

    // Ruta para obtener prioridades
    public function getPriorities()
    {
        $priorities = Event::whereNotNull('priority')->distinct()->pluck('priority');
        return response()->json($priorities);
    }

    public function update(Request $request, $id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['error' => 'Evento no encontrado'], 404);
        }

        if ($request->has('start')) {
            $event->start = $request->start;
        }
        if ($request->has('end')) {
            $event->end = $request->end;
        }
        if ($request->has('responsible')) {
            $event->responsible = $request->responsible;
        }
        if ($request->has('priority')) {
            $event->priority = $request->priority;
        }

        $event->save();

        return response()->json(['success' => true]);
    }
}
