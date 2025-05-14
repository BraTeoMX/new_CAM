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

    // Rutas para cualquier usuario autenticado
    Route::get('/active-users', [UserController::class, 'getActiveUsers']);
    Route::get('/AtencionOT', [AtencionOT::class, 'AtencionOT'])->name('AtencionOT');
    Route::get('/cardsAteOTs', [AtencionOT::class, 'cardsAteOTs']);
    Route::post('/update-status', [AtencionOT::class, 'updateStatus']);
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
});
// Rutas para visitantes (no autenticados)
Route::middleware(['guest'])->group(function () {
    Route::get('/OrdenOT', [OrdenOTController::class, 'OrdenOT']);
    Route::get('/FormGuest', [FormGuestController::class, 'FormGuest']);
    Route::get('/obtener-modulos', [FormGuestController::class, 'ObtenerModulos']);
    Route::post('/ticketsOT', [FormGuestController::class, 'ticketsOT']);
});
