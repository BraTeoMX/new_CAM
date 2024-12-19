<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DataFeedController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FormGuestController;
use Illuminate\Support\Facades\DB;

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

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    // Route for the getting the data feed
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

});
//Route::middleware(['guest'])->group(function () {
    Route::get('/FormGuest', [FormGuestController::class, 'FormGuest']);
    Route::get('/obtener-modulos', [FormGuestController::class, 'ObtenerModulos']);
    Route::get('/obtener-empleados', [FormGuestController::class, 'ObtenerEmpleados']);
    Route::get('/obtener-nombre', [FormGuestController::class, 'ObtenerNombre']);
    Route::post('/ticketsOT',[FormGuestController::class, 'ticketsOT']);
//});


