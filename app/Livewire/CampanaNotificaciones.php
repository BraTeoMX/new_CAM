<?php

namespace App\Livewire;

use Livewire\Component;
use Illuminate\Support\Facades\Auth;

class CampanaNotificaciones extends Component
{
    public $notificaciones = [];
    public $unreadCount = 0;

    public function mount()
    {
        $this->loadNotificaciones();
    }

    public function getListeners()
    {
        return [
            "echo-private:usuarios." . Auth::id() . ",NotificacionEnviada" => 'recibirNotificacion',
        ];
    }

    public function loadNotificaciones()
    {
        if (Auth::check()) {
            $user = Auth::user();
            // Cargar las 15 más recientes
            $this->notificaciones = $user->notificaciones()->take(15)->get()->toArray();
            $this->unreadCount = $user->notificacionesNoLeidas()->count();
        }
    }

    public function recibirNotificacion($event)
    {
        // $event contiene la data enviada por broadcastWith()
        array_unshift($this->notificaciones, [
            'id' => $event['id'],
            'tipo' => $event['tipo'],
            'data' => $event['data'],
            'pivot' => ['leido_at' => null],
            'created_at' => $event['created_at'],
        ]);

        $this->unreadCount++;
        
        // Mantener el array dentro de los límites si es muy grande
        if (count($this->notificaciones) > 15) {
            array_pop($this->notificaciones);
        }
    }

    public function marcarComoLeida($notificacionId)
    {
        if (Auth::check()) {
            Auth::user()->notificaciones()->updateExistingPivot($notificacionId, ['leido_at' => now()]);
            
            // Actualizar localmente la vista sin recargar
            foreach ($this->notificaciones as &$notificacion) {
                if ($notificacion['id'] === $notificacionId && is_null($notificacion['pivot']['leido_at'])) {
                    $notificacion['pivot']['leido_at'] = now()->toISOString();
                    $this->unreadCount = max(0, $this->unreadCount - 1);
                    break;
                }
            }
        }
    }

    public function render()
    {
        return view('livewire.campana-notificaciones');
    }
}
