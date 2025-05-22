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
        Route::get('/AdminControl', [AdminControlController::class, 'Admin'])->name('Admin');
        Route::get('/admin-control/users', [AdminControlController::class, 'getUsers'])->name('admin-control.users');
        Route::get('/admin-control/users/{id}', [AdminControlController::class, 'edit']);
        Route::put('/admin-control/users/{id}', [AdminControlController::class, 'update']);
        Route::get('/Catalogos', [CatalogosController::class, 'Catalogos'])->name('Catalogos');
        Route::get('/mecanicos', [CatalogosController::class, 'getMecanicos']);
        Route::get('/supervisores', [CatalogosController::class, 'getSupervisores']);
    });


});
// Rutas para visitantes (no autenticados)
Route::middleware(['guest'])->group(function () {

});
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


// Rutas para usuarios sin autenticados
    Route::get('/OrdenOT', [OrdenOTController::class, 'OrdenOT']);
    Route::get('/FormGuest', [FormGuestController::class, 'FormGuest']);
    Route::get('/obtener-modulos', [FormGuestController::class, 'ObtenerModulos']);
    Route::post('/ticketsOT', [FormGuestController::class, 'ticketsOT']);
    Route::get('/asignaciones-ot', [AsignationOTController::class, 'getAsignaciones']);
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
