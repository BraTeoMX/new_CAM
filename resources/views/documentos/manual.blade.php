<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Manual de Usuario - Sistema CAM (Centro de Atención de Mantenimiento)">
    <title>Manual de Usuario | Sistema CAM</title>
    <style>
        /* Reset total para viewport completo */
        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        html, body {
            height: 100%;
            width: 100%;
            overflow: hidden;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background-color: #1e1e2e;
        }

        /* Barra superior compacta */
        .top-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 44px;
            background: linear-gradient(90deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            padding: 0 16px;
            border-bottom: 1px solid rgba(99, 179, 237, 0.2);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
            position: relative;
            z-index: 10;
        }

        .top-bar__brand {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .top-bar__icon {
            width: 28px;
            height: 28px;
            background: linear-gradient(135deg, #63b3ed, #4299e1);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .top-bar__icon svg {
            width: 16px;
            height: 16px;
            fill: #fff;
        }

        .top-bar__title {
            font-size: 13px;
            font-weight: 600;
            color: #e2e8f0;
            letter-spacing: 0.02em;
            white-space: nowrap;
        }

        .top-bar__subtitle {
            font-size: 11px;
            color: #718096;
            white-space: nowrap;
        }

        .top-bar__actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn-download {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 5px 12px;
            background: linear-gradient(135deg, #4299e1, #3182ce);
            color: #fff;
            font-size: 12px;
            font-weight: 500;
            border-radius: 6px;
            text-decoration: none;
            border: none;
            cursor: pointer;
            transition: opacity 0.2s ease, transform 0.1s ease;
        }

        .btn-download:hover {
            opacity: 0.88;
            transform: translateY(-1px);
        }

        .btn-download:active {
            transform: translateY(0);
        }

        .btn-download svg {
            width: 13px;
            height: 13px;
            fill: currentColor;
        }

        /* Contenedor del PDF ocupa el resto del viewport */
        .pdf-wrapper {
            position: fixed;
            top: 44px;
            left: 0;
            right: 0;
            bottom: 0;
            background: #525659;
        }

        .pdf-wrapper iframe {
            width: 100%;
            height: 100%;
            border: none;
            display: block;
        }

        /* Fallback si el iframe no carga */
        .pdf-fallback {
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            gap: 16px;
            color: #a0aec0;
        }

        .pdf-fallback svg {
            width: 64px;
            height: 64px;
            opacity: 0.4;
        }

        .pdf-fallback p {
            font-size: 14px;
        }

        .pdf-fallback a {
            color: #63b3ed;
            text-decoration: underline;
        }
    </style>
</head>
<body>

    {{-- ── Barra superior ── --}}
    <header class="top-bar" role="banner">
        <div class="top-bar__brand">
            {{-- Icono PDF --}}
            <div class="top-bar__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1
                             1.5L18.5 9H13V3.5zM8 17h8v1H8v-1zm0-3h8v1H8v-1zm0-3h5v1H8v-1z"/>
                </svg>
            </div>
            <div>
                <div class="top-bar__title">Manual de Usuario — Sistema CAM</div>
                <div class="top-bar__subtitle">Centro de Atención de Mantenimiento</div>
            </div>
        </div>

        <div class="top-bar__actions">
            {{-- Botón de descarga --}}
            <a class="btn-download"
               href="{{ asset('documentos/manual de usuario Sistema CAM.pdf') }}"
               download="Manual_Usuario_CAM.pdf"
               title="Descargar manual en PDF">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20h14v-2H5v2zm7-18v10.17l3.59-3.58L17 10l-5 5-5-5
                             1.41-1.41L13 12.17V2h-1z"/>
                </svg>
                Descargar
            </a>
        </div>
    </header>

    {{-- ── Visor PDF fullscreen ── --}}
    <main class="pdf-wrapper" role="main" aria-label="Visor del manual de usuario">
        <iframe
            id="pdf-viewer"
            src="{{ asset('documentos/manual de usuario Sistema CAM.pdf') }}#toolbar=1&navpanes=1&scrollbar=1&view=FitH"
            title="Manual de Usuario Sistema CAM"
            loading="lazy"
            allowfullscreen>
            {{-- Fallback para navegadores que no soporten iframe con PDF --}}
            <div class="pdf-fallback">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0
                             2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z"/>
                </svg>
                <p>Tu navegador no puede mostrar el PDF directamente.</p>
                <a href="{{ asset('documentos/manual de usuario Sistema CAM.pdf') }}" target="_blank">
                    Haz clic aquí para abrirlo o descargarlo
                </a>
            </div>
        </iframe>
    </main>

</body>
</html>
