<?php

use App\Http\Controllers\ActiveUsersController;
use App\Http\Controllers\AdminControlController;
use App\Http\Controllers\AtencionOT;
use App\Http\Controllers\CatalogosController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FormGuestController;
use App\Http\Controllers\DocumentarController;
use App\Http\Controllers\OrdenOTController;
use App\Http\Controllers\OTsProgramController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AsignationOTController;
use App\Http\Controllers\FollowAtentionController;
use App\Http\Controllers\FormOTMecaController;
use App\Http\Controllers\InteractionIA;
use App\Http\Controllers\UserAdminController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::redirect('/', 'login');

// Rutas para usuarios autenticados
Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    // Rutas solo para Administradores
    Route::middleware(['role:Administrador'])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/AdminControl', [AdminControlController::class, 'index'])->name('admin.index');
        Route::get('/admin-control/users', [AdminControlController::class, 'getUsers'])->name('admin-control.users');
        Route::post('/admin-control/users', [AdminControlController::class, 'store']);
        Route::get('/admin-control/users/{id}', [AdminControlController::class, 'edit']);
        Route::put('/admin-control/users/{id}', [AdminControlController::class, 'update']);
        Route::delete('/admin-control/users/{id}', [AdminControlController::class, 'destroy'])->name('admin.users.destroy');
        Route::get('/admin-control/puestos', [AdminControlController::class, 'getPuestos']);
        Route::get('/Catalogos', [CatalogosController::class, 'Catalogos'])->name('Catalogos');
        Route::get('/mecanicos', [CatalogosController::class, 'getMecanicos']);
        Route::get('/supervisores', [CatalogosController::class, 'getSupervisores']);
        Route::get('/user-photo/{id}', [UserController::class, 'userPhoto'])->middleware('auth');
        Route::get('/FormOTMeca', [FormOTMecaController::class, 'FormOTMec'])->name('FormOTMeca');
        //nuevo enfoque de rutas para usuarios
        Route::get('/UserAdmin', [UserAdminController::class, 'index'])->name('user.index');
        Route::get('/UserAdmin/puestos', [UserAdminController::class, 'getPuestos']);
        Route::post('/UserAdmin/users', [UserAdminController::class, 'store']);
        Route::get('/UserAdmin/listaUsuarios', [UserAdminController::class, 'getUsers'])->name('users.listaUsuarios');
        Route::get('/UserAdmin/users/{user}', [UserAdminController::class, 'show'])->name('users.show');
        Route::put('/UserAdmin/users/{user}', [UserAdminController::class, 'update'])->name('users.update');
        Route::patch('/UserAdmin/users/{user}/status', [UserAdminController::class, 'updateStatus'])->name('users.updateStatus');
    });
});

// Rutas para visitantes (no autenticados)
Route::middleware(['guest'])->group(function () {});
// Rutas para cualquier usuario autenticado
Route::get('/active-users', [UserController::class, 'getActiveUsers']);
Route::get('/AtencionOT', [AtencionOT::class, 'AtencionOT'])->name('AtencionOT');
Route::get('/cardsAteOTs', [AtencionOT::class, 'cardsAteOTs']);
Route::post('/update-status', [AtencionOT::class, 'updateStatus']);
Route::post('/broadcast-status-ot', [AtencionOT::class, 'broadcastStatusOT']);
Route::get('/events', [EventController::class, 'index']);
Route::get('/responsibles', [EventController::class, 'getResponsibles']);
Route::get('/priorities', [EventController::class, 'getPriorities']);
Route::post('/events', [EventController::class, 'store']);
Route::put('/events/{id}', [EventController::class, 'update']);
Route::get('/OTsProgram', [OTsProgramController::class, 'OTsProgram'])->name('OTsProgram');
Route::get('/Documentar', [DocumentarController::class, 'Documentar'])->name('Documentar');
Route::get('/vinculaciones', [CatalogosController::class, 'getVinculaciones']);
Route::post('/vinculaciones', [CatalogosController::class, 'saveVinculaciones']);
Route::delete('/vinculaciones/{id}', [CatalogosController::class, 'deleteVinculacion'])->name('vinculacion.delete');
Route::post('/reasignar-ot', [AtencionOT::class, 'reasignarOT']);
Route::get('/form-ot-data', [FormOTMecaController::class, 'getData']);


// Rutas para usuarios sin autenticados
Route::get('/OrdenOT', [OrdenOTController::class, 'OrdenOT']);
Route::get('/FormGuest', [FormGuestController::class, 'FormGuest']);
Route::get('/obtener-modulos', [FormGuestController::class, 'ObtenerModulos']);
Route::get('/obtener-operarios', [FormGuestController::class, 'ObtenerOperarios']);
Route::post('/ticketsOT', [FormGuestController::class, 'ticketsOT']);
Route::get('/asignaciones-ot', [AsignationOTController::class, 'getAsignaciones']);
Route::get('/catalogo-problemas', [AsignationOTController::class, 'catalogoProblemas']);
//Otras rutas
Route::get('/FollowOT', [FollowAtentionController::class, 'FollowOT']);
Route::get('/api/clases-maquina/{maquina}', [FollowAtentionController::class, 'getClasesMaquina']);
Route::post('/api/iniciar-atencion', [FollowAtentionController::class, 'iniciarAtencion'])->middleware('web');
Route::get('/cardsAteOTs', [AtencionOT::class, 'cardsAteOTs']);
Route::post('/update-status', [AtencionOT::class, 'updateStatus'])->middleware('web');
Route::post('/broadcast-status-ot', [AtencionOT::class, 'broadcastStatusOT'])->middleware('web');
Route::get('/api/follow-atention/{folio}', [FollowAtentionController::class, 'getFollowAtentionByFolio']);
Route::post('/api/finalizar-atencion', [\App\Http\Controllers\FollowAtentionController::class, 'finalizarAtencion']);
Route::get('/api/fallas', [FollowAtentionController::class, 'getFallas']);
Route::get('/api/causas', [FollowAtentionController::class, 'getCausas']);
Route::get('/api/acciones', [FollowAtentionController::class, 'getAcciones']);
Route::post('/asignaciones-ot/limpiar-comida-break-masivo', [AsignationOTController::class, 'limpiarComidaBreakMasivo']);
Route::get('/dashboard/timeline-data', [DashboardController::class, 'getTimelineData'])->name('dashboard.timeline-data');
Route::get('/dashboard/efectividad', [DashboardController::class, 'getEfectividad']);
Route::get('/dashboard/tops', [DashboardController::class, 'tops']);
Route::get('/api/dashboard/creadas-vs-completadas', [DashboardController::class, 'creadasVsCompletadas']);
Route::get('/dashboard/minmachdesc', [DashboardController::class, 'minutosMaquinasDescompuestas']);
Route::post('/api/bahia', [FollowAtentionController::class, 'guardarBahia']);
Route::get('/api/bahia-info/{folio}', [FollowAtentionController::class, 'getBahiaInfo']);
Route::post('/reasignar-sin-asignar', [\App\Http\Controllers\AtencionOT::class, 'reasignarSinAsignar']);
Route::post('/api/encuesta-satisfaccion', [FollowAtentionController::class, 'guardarEncuestaSatisfaccion']);


Route::get('/InteractionIA', [InteractionIA::class, 'index']);
Route::post('/chatbot/render-user-bubble', [InteractionIA::class, 'renderUserBubble'])->name('chatbot.renderUserBubble');
Route::post('/chatbot/start', [InteractionIA::class, 'startConversation'])->name('chatbot.start');
Route::post('/chatbot/create-ticket-flow', [InteractionIA::class, 'handleCreateTicket'])->name('chatbot.createTicketFlow');
Route::post('/chatbot/track-ticket-flow', [InteractionIA::class, 'handleTrackTicket'])->name('chatbot.trackTicketFlow');

// Ruta para obtener módulos (ahora apunta a getModules)
Route::get('/obtener-modulo', [InteractionIA::class, 'getModules'])->name('chatbot.getModules');
