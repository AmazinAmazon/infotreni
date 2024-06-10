<!DOCTYPE html>
<html lang="en">

<head>
    <title>Mappa</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="./favicon.ico">

    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
</head>

<?php require "includes/dbh.inc.php" ?>

<body>
    <header>
        <!-- Navbar -->
        <nav class="navbar px-2 bg-dark justify-content-between row-1 w-100 flex-nowrap text-nowrap">
            <div class="p-0 navbar-brand text-light col-2 align-items-start">
                <a href="./index.html" class="d-inline-block text-decoration-none">
                    <img src="./favicon.ico" alt="InfoTreni logo" style="width: 36px; height: auto;" class="h-100">
                    <b style="font-size: 16px;" class="text-white">InfoTreni</b>
                </a>
            </div>
            <div class="text-white text-center col-auto">
                <a href="./map.php" class="text-white-50 text-decoration-none mx-1"><b>Mappa</b></a>
                <a href="./about-me" class="text-white text-decoration-none mx-1"><b>Chi siamo?</b></a>
            </div>
            <div class="col-2 text-white text-end align-items-start d-none d-sm-block" style="font-size: 10px;">
                <div class="refresh bg-success d-inline" style="padding: 3px;">
                    1
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-arrow-repeat" viewBox="0 1 16 16">
                        <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9" />
                        <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z" />
                    </svg>
                </div>
            </div>
        </nav>
    </header>


    <div class="container-fluid px-1">
        <div class="row gx-1 mt-1">
            <div class="col-lg-8">
                <div class="container-fluid p-0" style="height: 60vh;">
                    <div id="map" class="h-100 w-auto rounded-2"></div>
                </div>
            </div>
            <div class="col-lg-4">
                <hr class="m-1 d-lg-none"> <!-- Separator -->
                <!-- Forn -->
                <form id="segnalaTreno" onsubmit="return false;">
                    <label class="font-monospace">Segnalare:</label>
                    <div class="input-group">
                        <input type="search" class="form-control" id="SearchStn" placeholder="Cerca una stazione" onkeydown="onReturnSearch(event, this)">
                        <button type="button" class="btn btn-outline-secondary" onclick="refreshSearch(document.getElementById('SearchStn').value);" style="border-color: var(--bs-border-color);">
                            Cerca
                            <!-- Hidden loading icon -->
                            <span class="spinner-border spinner-border-sm visually-hidden" aria-hidden="true" id="searchLoading"></span>
                            <span class="visually-hidden" role="status">Loading...</span>
                        </button>
                    </div>
                    <div class="results m-1 rounded-2 text-center" id="searchInfo"></div>
                    <div class="input-group">
                        <textarea class="form-control" placeholder="Aggiungi informazioni sul convoglio" maxlength="100"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary mt-1" onclick="inviaSegn(previousElementSibling.firstElementChild.value)">Invia la
                        segnalazione</button>
                    <span id="finalError"></span>
                </form>
            </div>
        </div>

        <div class="alert alert-danger d-flex align-items-center p-2 my-1 <?php if ($pdo) echo 'visually-hidden' ?>" role="alert">
            <svg class="bi flex-shrink-0 me-2" viewBox="0 0 16 16" width="16" height="16" role="img" aria-label="Danger:">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
            <div>
                Database non connessa
            </div>
        </div>

        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th scope="col">Orario</th>
                        <th scope="col">Localizzazione</th>
                        <th scope="col">Informazione</th>
                    </tr>
                </thead>
                <tbody class="table-group-divider" id="tableTest">
                </tbody>
            </table>
        </div>



        <div class="text-center bg-dark-subtle rounded-4 mt-2">
            <p>Questo sito non è affiliato con Trenitalia</p>
        </div>

    </div>


    <!-- Footer -->


    <!-- Scripts -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <script src="main.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
</body>

</html>