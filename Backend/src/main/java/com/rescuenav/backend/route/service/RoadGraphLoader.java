package com.rescuenav.backend.route.service;

import java.util.Optional;

interface RoadGraphLoader {

    Optional<RoadGraphSnapshot> loadActiveGraph();
}
