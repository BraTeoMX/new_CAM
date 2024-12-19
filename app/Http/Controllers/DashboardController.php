<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DataFeed;
use App\Models\TicketOT;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        return view('pages.dashboard.dashboard');
    }

}
