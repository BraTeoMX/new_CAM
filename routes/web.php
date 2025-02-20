<?php

use App\Http\Controllers\AdminControlController;
use App\Http\Controllers\AtencionOT;
use App\Http\Controllers\CatalogosController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FormGuestController;
use App\Http\Controllers\DeepSeekController;
use App\Http\Controllers\DocumentarController;
use App\Http\Controllers\OrdenOTController;

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
    Route::get('/AdminControl', [AdminControlController::class, 'Admin'])->name('Admin');
    Route::get('/Catalogos', [CatalogosController::class, 'Catalogos'])->name('Catalogos');

});
//Route::middleware(['guest'])->group(function () {
    Route::get('/FormGuest', [FormGuestController::class, 'FormGuest']);
    Route::get('/obtener-modulos', [FormGuestController::class, 'ObtenerModulos']);
    Route::post('/ticketsOT',[FormGuestController::class, 'ticketsOT']);
    Route::post('/update-ticket-status/{folio}', [FormGuestController::class, 'updateTicketStatus']);
//-----------------------
Route::get('/OrdenOT', [OrdenOTController::class, 'OrdenOT']);
//});

Route::get('/Documentar', [DocumentarController::class, 'Documentar'])->name('Documentar');


Route::get('/AtencionOT', [AtencionOT::class, 'AtencionOT'])->name('AtencionOT');
Route::get('/cardsAteOTs', [AtencionOT::class, 'cardsAteOTs']);
Route::post('/update-status', [AtencionOT::class, 'updateStatus']);




Route::get('/interaction-ia', [DeepSeekController::class, 'index']);
Route::post('/interact-with-ai', [DeepSeekController::class, 'interactWithAI']);
Route::post('/chat-with-ai', [DeepSeekController::class, 'chatWithAI'])->name('chat.ai');


