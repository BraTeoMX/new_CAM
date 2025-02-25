<x-app-layout>
    <style>
        .animation-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: fadeInOut 5s ease-in-out infinite;
        }

        @keyframes fadeInOut {

            0%,
            100% {
                opacity: 0;
            }

            50% {
                opacity: 1;
            }
        }

        /* From Uiverse.io by lukepadiachy */
        .my-loader {
            width: 200px;
            height: 200px;
            perspective: 1000px;
            margin: 100px auto;
        }

        .rubiks-cube {
            width: 100%;
            height: 100%;
            position: relative;
            transform-style: preserve-3d;
            animation: my-rotateCube 5s infinite linear;
        }

        .my-loader .face {
            position: absolute;
            display: flex;
            flex-wrap: wrap;
            width: 100%;
            height: 100%;
        }

        .my-loader .face.front {
            transform: translateZ(100px);
        }

        .my-loader .face.back {
            transform: rotateY(180deg) translateZ(100px);
        }

        .my-loader .face.left {
            transform: rotateY(-90deg) translateZ(100px);
        }

        .my-loader .face.right {
            transform: rotateY(90deg) translateZ(100px);
        }

        .my-loader .face.top {
            transform: rotateX(90deg) translateZ(100px);
        }

        .my-loader .face.bottom {
            transform: rotateX(-90deg) translateZ(100px);
        }

        .my-loader .cube {
            width: calc(100% / 3);
            height: calc(100% / 3);
            box-sizing: border-box;
            border: 1px solid #000;
        }

        @keyframes my-rotateCube {
            0% {
                transform: rotateX(0deg) rotateY(0deg);
            }

            100% {
                transform: rotateX(360deg) rotateY(360deg);
            }
        }
    </style>
    <div class="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <!-- Dashboard actions -->
        <div class="sm:flex sm:justify-between sm:items-center mb-8">
            <!-- Left: Title -->
            <div class="mb-4 sm:mb-0">
                <h1 class="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Dashboard</h1>
            </div>
        </div>
        <div class="relative h-screen flex items-center justify-center bg-gray-200 dark:bg-gray-900">
            <div class="animation-container">
                <h1 class="text-3xl md:text-4xl text-gray-800 dark:text-gray-100 font-bold text-center">
                    Aún seguimos trabajando en el desarrollo del Dashboard de tu sistema
                </h1>
                <div class="my-loader">
                    <div class="rubiks-cube">
                        <div class="face front">
                            <div style="background: #ff3d00;" class="cube"></div>
                            <div style="background: #ffeb3b;" class="cube"></div>
                            <div style="background: #4caf50;" class="cube"></div>
                            <div style="background: #2196f3;" class="cube"></div>
                            <div style="background: #ffffff;" class="cube"></div>
                            <div style="background: #ffeb3b;" class="cube"></div>
                            <div style="background: #4caf50;" class="cube"></div>
                            <div style="background: #2196f3;" class="cube"></div>
                            <div style="background: #ff3d00;" class="cube"></div>
                        </div>

                        <div class="face back">
                            <div style="background: #4caf50;" class="cube"></div>
                            <div style="background: #ff3d00;" class="cube"></div>
                            <div style="background: #ffeb3b;" class="cube"></div>
                            <div style="background: #2196f3;" class="cube"></div>
                            <div style="background: #ffffff;" class="cube"></div>
                            <div style="background: #ff3d00;" class="cube"></div>
                            <div style="background: #ffeb3b;" class="cube"></div>
                            <div style="background: #4caf50;" class="cube"></div>
                            <div style="background: #2196f3;" class="cube"></div>
                        </div>
                        <div class="face left">
                            <div style="background: #ffeb3b;" class="cube"></div>
                            <div style="background: #4caf50;" class="cube"></div>
                            <div style="background: #2196f3;" class="cube"></div>
                            <div style="background: #ff3d00;" class="cube"></div>
                            <div style="background: #ffffff;" class="cube"></div>
                            <div style="background: #4caf50;" class="cube"></div>
                            <div style="background: #2196f3;" class="cube"></div>
                            <div style="background: #ffeb3b;" class="cube"></div>
                            <div style="background: #ff3d00;" class="cube"></div>
                        </div>
                        <div class="face right">
                            <div style="background: #4caf50;" class="cube"></div>
                            <div style="background: #ff3d00;" class="cube"></div>
                            <div style="background: #ffeb3b;" class="cube"></div>
                            <div style="background: #2196f3;" class="cube"></div>
                            <div style="background: #ffffff;" class="cube"></div>
                            <div style="background: #ff3d00;" class="cube"></div>
                            <div style="background: #ffeb3b;" class="cube"></div>
                            <div style="background: #4caf50;" class="cube"></div>
                            <div style="background: #2196f3;" class="cube"></div>
                        </div>
                        <div class="face top">
                            <div style="background: #2196f3;" class="cube"></div>
                            <div style="background: #ffeb3b;" class="cube"></div>
                            <div style="background: #ff3d00;" class="cube"></div>
                            <div style="background: #4caf50;" class="cube"></div>
                            <div style="background: #ffffff;" class="cube"></div>
                            <div style="background: #ffeb3b;" class="cube"></div>
                            <div style="background: #ff3d00;" class="cube"></div>
                            <div style="background: #4caf50;" class="cube"></div>
                            <div style="background: #2196f3;" class="cube"></div>
                        </div>
                        <div class="face bottom">
                            <div style="background: #ffffff;" class="cube"></div>
                            <div style="background: #4caf50;" class="cube"></div>
                            <div style="background: #2196f3;" class="cube"></div>
                            <div style="background: #ff3d00;" class="cube"></div>
                            <div style="background: #ffeb3b;" class="cube"></div>
                            <div style="background: #4caf50;" class="cube"></div>
                            <div style="background: #2196f3;" class="cube"></div>
                            <div style="background: #ffffff;" class="cube"></div>
                            <div style="background: #ff3d00;" class="cube"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
