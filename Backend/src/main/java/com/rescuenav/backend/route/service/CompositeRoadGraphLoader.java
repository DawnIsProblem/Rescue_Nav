package com.rescuenav.backend.route.service;

import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
@RequiredArgsConstructor
class CompositeRoadGraphLoader implements RoadGraphLoader {

    private final SupabaseRoadGraphLoader supabaseRoadGraphLoader;
    private final LocalRoadGraphLoader localRoadGraphLoader;
    private final SnapshotRoadGraphLoader snapshotRoadGraphLoader;

    @Override
    public Optional<RoadGraphSnapshot> loadActiveGraph() {
        return snapshotRoadGraphLoader.loadActiveGraph()
                .or(() -> supabaseRoadGraphLoader.loadActiveGraph())
                .or(() -> localRoadGraphLoader.loadActiveGraph());
    }
}
