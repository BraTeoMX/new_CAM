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

use App\Http\Controllers\FormGuestV2Controller;
use App\Http\Controllers\VinculacionV2Controller;
use App\Http\Controllers\FollowAtentionV2Controller;
use App\Http\Controllers\DashboardV2Controller;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\ReportesController;
use App\Http\Controllers\ReasignacionManualController;

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

        // Vinculacion V2
        Route::get('/vinculacion', [VinculacionV2Controller::class, 'index'])->name('vinculacion.index');
        Route::get('/vinculacion/obtenerMecanicos', [VinculacionV2Controller::class, 'obtenerMecanicos']);
        Route::get('/vinculacion/obtenerSupervisores', [VinculacionV2Controller::class, 'obtenerSupervisores']);
        Route::post('/vinculacion/guardar', [VinculacionV2Controller::class, 'guardarVinculacion']);
        Route::get('/vinculacion/mostrarRegistros', [VinculacionV2Controller::class, 'mostrarRegistros']);
        Route::post('/vinculacion/actualizarMasivo', [VinculacionV2Controller::class, 'actualizarMasivo'])->name('vinculacion.actualizarMasivo');

        //segunda version de Dashboard
        Route::get('/dashboardV2', [DashboardV2Controller::class, 'index'])->name('dashboard.index');
        Route::get('/dashboardV2/obtenerMeses', [DashboardV2Controller::class, 'obtenerMeses']);
        Route::get('/dashboardV2/calcularMinutos', [DashboardV2Controller::class, 'calcularMinutos']);
        Route::get('/dashboardV2/obtenerDetallesTickets', [DashboardV2Controller::class, 'obtenerDetallesTickets']);
        Route::get('/dashboardV2/tops', [DashboardV2Controller::class, 'tops']);
        Route::get('/dashboardV2/efectividad', [DashboardV2Controller::class, 'efectividad']);
        Route::get('/dashboardV2/calendarioTickets', [DashboardV2Controller::class, 'calendarioTickets']);
        Route::get('/dashboardV2/obtenerEstatus', [DashboardV2Controller::class, 'obtenerEstatus']);
        Route::get('/dashboardV2/obtenerCreadosCompletados', [DashboardV2Controller::class, 'obtenerCreadosCompletados']);

        //Segunda versuin de reasignacion manual
        Route::get('/reasignacionManual', [ReasignacionManualController::class, 'index'])->name('reasignacionManual.index');
        // Grupo de rutas para la API interna de la sección
        Route::prefix('api/reasignacion')->name('reasignacion.api.')->group(function () {
            // Obtener OTs sin asignar (estado = 6)
            Route::get('/sin-asignar', [ReasignacionManualController::class, 'getOtsSinAsignar'])->name('getOtsSinAsignar');
            // Ruta para el buscador
            Route::get('/buscar', [ReasignacionManualController::class, 'buscarOts'])->name('buscarOts');
            // Obtener el catálogo de mecánicos
            Route::get('/mecanicos', [ReasignacionManualController::class, 'getMecanicos'])->name('getMecanicos');
            // Asignar un mecánico a una OT
            Route::post('/asignar/{id}', [ReasignacionManualController::class, 'asignarMecanico'])->name('asignarMecanico');
            // Revertir el estado de una OT de 'En Proceso' a 'Asignado'
            Route::post('/revertir-a-asignado/{id}', [ReasignacionManualController::class, 'revertirAAsignado'])->name('revertirAAsignado');

        });

        //segunda version de Reportes
        Route::get('/reportesMecanicos', [ReportesController::class, 'index'])->name('reportes.index');
        Route::get('/reportesMecanicos/obtenerDetallesTickets', [ReportesController::class, 'obtenerDetallesTickets']);

    });
});

//ruta para menu
Route::get('/1', [MenuController::class, 'index']);
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

// actualizacion para un segunda version FormGuest
Route::get('/FormGuestV2', [FormGuestV2Controller::class, 'index'])->name('formGuest.index');
Route::get('/FormGuestV2/obtenerAreasModulos', [FormGuestV2Controller::class, 'obtenerAreasModulos']);
Route::get('/FormGuestV2/obtener-operarios', [FormGuestV2Controller::class, 'obtenerOperarios']);
Route::get('/FormGuestV2/catalogo-problemas', [FormGuestV2Controller::class, 'catalogoProblemas']);
Route::post('/FormGuestV2/ticketsOT', [FormGuestV2Controller::class, 'guardarRegistro']);
Route::get('/FormGuestV2/obtenerAreasModulosSeguimiento', [FormGuestV2Controller::class, 'obtenerAreasModulosSeguimiento']);
// segunda version de FollowAtentionController
Route::controller(FollowAtentionV2Controller::class)->group(function () {
    Route::get('/FollowOTV2', 'index')->name('FollowOTV2');
    Route::get('/FollowOTV2/obtenerAreaModulos', 'obtenerAreaModulos');
    Route::get('/FollowOTV2/obtenerResumen/{modulo}', 'obtenerResumen');
    Route::get('/FollowOTV2/obtenerRegistros/{modulo}', 'obtenerRegistros');
    Route::get('/FollowOTV2/obtenerCatalogoEstados', 'obtenerCatalogoEstados');
    Route::get('/FollowOTV2/obtenerClasesMaquina/{maquina}', 'obtenerClasesMaquina');
    Route::post('/FollowOTV2/iniciarAtencion', 'iniciarAtencion');
    Route::get('/FollowOTV2/obtenerFallas', 'obtenerFallas');
    Route::get('/FollowOTV2/obtenerCausas', 'obtenerCausas');
    Route::get('/FollowOTV2/obtenerAcciones', 'obtenerAcciones');
    Route::post('/FollowOTV2/finalizarAtencion', 'finalizarAtencion');
    Route::post('/FollowOTV2/activarBahia', 'activarBahia');
    Route::post('/FollowOTV2/finalizarBahia', 'finalizarBahia');
});

Route::controller(OrdenOTController::class)->group(function () {
    Route::get('/OrdenOT', 'index')->name('OrdenOT.index');
    Route::get('/OrdenOT/obtenerAreaModulos', 'obtenerAreaModulos');
    Route::get('/OrdenOT/obtenerResumen', 'obtenerResumen');
    Route::get('/OrdenOT/obtenerRegistros', 'obtenerRegistros');
    Route::get('/OrdenOT/obtenerCatalogoEstados', 'obtenerCatalogoEstados');
    Route::get('/OrdenOT/obtenerClasesMaquina/{maquina}', 'obtenerClasesMaquina');
    Route::post('/OrdenOT/iniciarAtencion', 'iniciarAtencion');
    Route::get('/OrdenOT/obtenerFallas', 'obtenerFallas');
    Route::get('/OrdenOT/obtenerCausas', 'obtenerCausas');
    Route::get('/OrdenOT/obtenerAcciones', 'obtenerAcciones');
    Route::post('/OrdenOT/finalizarAtencion', 'finalizarAtencion');
    Route::post('/OrdenOT/activarBahia', 'activarBahia');
    Route::post('/OrdenOT/finalizarBahia', 'finalizarBahia');
});


//seccion para colocar rutas a redireccionar FollowOTV2
Route::redirect('/FormGuest', '/FormGuestV2');
Route::redirect('/FollowOT', '/FollowOTV2');