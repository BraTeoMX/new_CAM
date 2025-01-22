<?php

use App\Http\Controllers\AtencionOT;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FormGuestController;
use App\Http\Controllers\DeepSeekController;
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
    Route::post('/ticketsOT',[FormGuestController::class, 'ticketsOT']);
    Route::post('/update-ticket-status/{folio}', [FormGuestController::class, 'updateTicketStatus']);
//});

Route::get('/AtencionOT', [AtencionOT::class, 'AtencionOT'])->name('AtencionOT');
Route::get('/cardsAteOTs', [AtencionOT::class, 'cardsAteOTs']);



Route::get('/deepseek', [DeepSeekController::class, 'interactWithAI']);
Route::post('/interact', [DeepSeekController::class, 'interact']);


