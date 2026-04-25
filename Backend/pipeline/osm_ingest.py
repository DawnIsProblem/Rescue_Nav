#!/usr/bin/env python3
"""
Minimal OSM -> graph ingestion skeleton for Rescue Nav.

This script intentionally focuses on a small, inspectable pipeline:
1. Read OSM XML
2. Filter routable roads
3. Build graph artifacts
4. Export CSV files that match the Supabase schema
5. Emit a validation report

It is a foundation, not the final production-grade importer.
"""

from __future__ import annotations

import argparse
import csv
import gzip
import json
import math
import re
import sys
import uuid
import xml.etree.ElementTree as element_tree
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import UTC, date, datetime
from pathlib import Path


ALLOWED_HIGHWAYS = {
    "motorway",
    "trunk",
    "primary",
    "secondary",
    "tertiary",
    "unclassified",
    "residential",
    "service",
    "living_street",
    "road",
}

ROAD_TYPE_BASE_SPEED_KPH = {
    "motorway": 90.0,
    "trunk": 70.0,
    "primary": 60.0,
    "secondary": 50.0,
    "tertiary": 40.0,
    "unclassified": 35.0,
    "residential": 30.0,
    "living_street": 20.0,
    "service": 20.0,
    "road": 30.0,
}

FAST_ROAD_TYPES = {"motorway", "trunk", "primary"}
MID_ROAD_TYPES = {"secondary", "tertiary"}
SLOW_ROAD_TYPES = {"residential", "service", "living_street", "road", "unclassified"}
CURVE_KEEP_ANGLE_DEGREES = 35.0
MAX_SEGMENT_LENGTH_METERS = {
    "motorway": 350.0,
    "trunk": 300.0,
    "primary": 250.0,
    "secondary": 220.0,
    "tertiary": 180.0,
    "unclassified": 150.0,
    "residential": 120.0,
    "living_street": 100.0,
    "service": 100.0,
    "road": 120.0,
}


@dataclass(frozen=True)
class OsmNode:
    osm_node_id: int
    lat: float
    lng: float


@dataclass(frozen=True)
class OsmWay:
    osm_way_id: int
    node_refs: list[int]
    tags: dict[str, str]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build minimal graph CSV artifacts from OSM XML.")
    parser.add_argument("--input", required=True, help="Path to .osm XML file.")
    parser.add_argument("--output-dir", required=True, help="Directory for generated CSV/report files.")
    parser.add_argument("--version-name", required=True, help="Graph version name. Example: iksan_osm_2026_04_20_v1")
    parser.add_argument("--region-name", default="Iksan", help="Region label stored in road_graph_version.")
    parser.add_argument("--region-code", default="KR-45-IKSAN", help="Region code stored in road_graph_version.")
    parser.add_argument("--snapshot-date", default=date.today().isoformat(), help="OSM snapshot date in YYYY-MM-DD.")
    parser.add_argument("--source-uri", default="", help="Original OSM source URI for traceability.")
    return parser.parse_args()


def ensure_supported_input(input_path: Path) -> None:
    if input_path.suffix.lower() == ".pbf":
        raise SystemExit("This minimal skeleton supports OSM XML only. Convert .pbf to .osm XML first.")
    if input_path.suffix.lower() != ".osm":
        raise SystemExit("Unsupported input format. Use an .osm XML file.")


def parse_osm_xml(input_path: Path) -> tuple[dict[int, OsmNode], list[OsmWay]]:
    nodes: dict[int, OsmNode] = {}
    ways: list[OsmWay] = []

    context = element_tree.iterparse(input_path, events=("start", "end"))
    _, root = next(context)

    current_way_id: int | None = None
    current_way_node_refs: list[int] = []
    current_way_tags: dict[str, str] = {}

    for event, elem in context:
        if event == "end" and elem.tag == "node":
            osm_node_id = int(elem.attrib["id"])
            nodes[osm_node_id] = OsmNode(
                osm_node_id=osm_node_id,
                lat=float(elem.attrib["lat"]),
                lng=float(elem.attrib["lon"]),
            )
            elem.clear()
            root.clear()
            continue

        if event == "start" and elem.tag == "way":
            current_way_id = int(elem.attrib["id"])
            current_way_node_refs = []
            current_way_tags = {}
            continue

        if current_way_id is not None and event == "end" and elem.tag == "nd":
            current_way_node_refs.append(int(elem.attrib["ref"]))
            elem.clear()
            continue

        if current_way_id is not None and event == "end" and elem.tag == "tag":
            current_way_tags[elem.attrib["k"]] = elem.attrib["v"]
            elem.clear()
            continue

        if event == "end" and elem.tag == "way" and current_way_id is not None:
            highway = current_way_tags.get("highway", "")
            if highway in ALLOWED_HIGHWAYS and len(current_way_node_refs) >= 2:
                ways.append(
                    OsmWay(
                        osm_way_id=current_way_id,
                        node_refs=list(current_way_node_refs),
                        tags=dict(current_way_tags),
                    )
                )

            current_way_id = None
            current_way_node_refs = []
            current_way_tags = {}
            elem.clear()
            root.clear()

    return nodes, ways


def parse_maxspeed_kph(raw_value: str | None) -> float | None:
    if not raw_value:
        return None
    match = re.search(r"(\d+(?:\.\d+)?)", raw_value)
    if not match:
        return None
    value = float(match.group(1))
    lowered = raw_value.lower()
    if "mph" in lowered:
        return round(value * 1.60934, 2)
    return value


def base_speed_kph(highway: str, maxspeed: str | None) -> float:
    parsed = parse_maxspeed_kph(maxspeed)
    if parsed is not None and parsed > 0:
        return parsed
    return ROAD_TYPE_BASE_SPEED_KPH.get(highway, 30.0)


def emergency_speed_kph(highway: str, base_speed: float) -> float:
    if highway in FAST_ROAD_TYPES:
        return min(100.0, round(base_speed * 1.20, 2))
    if highway in MID_ROAD_TYPES:
        return min(100.0, round(base_speed * 1.15, 2))
    if highway in SLOW_ROAD_TYPES:
        return min(100.0, round(base_speed * 1.10, 2))
    return min(100.0, round(base_speed * 1.10, 2))


def is_one_way(tags: dict[str, str]) -> tuple[bool, bool]:
    oneway = tags.get("oneway", "").strip().lower()
    if oneway == "yes":
        return True, False
    if oneway == "-1":
        return False, True
    return True, True


def infer_bus_lane(tags: dict[str, str]) -> bool:
    joined = " ".join(tags.get(key, "") for key in ("busway", "bus:lanes", "lanes:bus", "psv"))
    return any(token for token in ("bus", "designated", "lane") if token in joined.lower())


def haversine_meters(start_lat: float, start_lng: float, end_lat: float, end_lng: float) -> float:
    earth_radius_meters = 6_371_000.0
    delta_lat = math.radians(end_lat - start_lat)
    delta_lng = math.radians(end_lng - start_lng)
    start_lat_rad = math.radians(start_lat)
    end_lat_rad = math.radians(end_lat)

    haversine = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(start_lat_rad) * math.cos(end_lat_rad) * math.sin(delta_lng / 2) ** 2
    )
    arc = 2 * math.atan2(math.sqrt(haversine), math.sqrt(1 - haversine))
    return earth_radius_meters * arc


def turn_angle_degrees(previous_node: OsmNode, current_node: OsmNode, next_node: OsmNode) -> float:
    first_vector = (current_node.lng - previous_node.lng, current_node.lat - previous_node.lat)
    second_vector = (next_node.lng - current_node.lng, next_node.lat - current_node.lat)

    first_magnitude = math.hypot(first_vector[0], first_vector[1])
    second_magnitude = math.hypot(second_vector[0], second_vector[1])
    if first_magnitude == 0 or second_magnitude == 0:
        return 0.0

    cosine = ((first_vector[0] * second_vector[0]) + (first_vector[1] * second_vector[1])) / (
        first_magnitude * second_magnitude
    )
    cosine = max(-1.0, min(1.0, cosine))
    return math.degrees(math.acos(cosine))


def max_segment_length_for_way(highway: str) -> float:
    return MAX_SEGMENT_LENGTH_METERS.get(highway, 120.0)


def should_keep_way_node(
    *,
    index: int,
    node_refs: list[int],
    nodes: dict[int, OsmNode],
    referenced_counts: Counter[int],
    highway: str,
    distance_since_last_kept: float,
) -> bool:
    if index == 0 or index == len(node_refs) - 1:
        return True

    osm_node_id = node_refs[index]
    if referenced_counts[osm_node_id] > 1:
        return True

    previous_node = nodes.get(node_refs[index - 1])
    current_node = nodes.get(osm_node_id)
    next_node = nodes.get(node_refs[index + 1])
    if not previous_node or not current_node or not next_node:
        return False

    angle = turn_angle_degrees(previous_node, current_node, next_node)
    if angle >= CURVE_KEEP_ANGLE_DEGREES:
        return True

    return distance_since_last_kept >= max_segment_length_for_way(highway)


def select_kept_node_refs(
    way: OsmWay,
    nodes: dict[int, OsmNode],
    referenced_counts: Counter[int],
) -> list[int]:
    kept_refs: list[int] = []
    distance_since_last_kept = 0.0
    highway = way.tags.get("highway", "road")

    for index, osm_node_id in enumerate(way.node_refs):
        if index > 0:
            previous_node = nodes.get(way.node_refs[index - 1])
            current_node = nodes.get(osm_node_id)
            if previous_node and current_node:
                distance_since_last_kept += haversine_meters(
                    previous_node.lat,
                    previous_node.lng,
                    current_node.lat,
                    current_node.lng,
                )

        if should_keep_way_node(
            index=index,
            node_refs=way.node_refs,
            nodes=nodes,
            referenced_counts=referenced_counts,
            highway=highway,
            distance_since_last_kept=distance_since_last_kept,
        ):
            if not kept_refs or kept_refs[-1] != osm_node_id:
                kept_refs.append(osm_node_id)
            distance_since_last_kept = 0.0

    if len(kept_refs) < 2 and len(way.node_refs) >= 2:
        return [way.node_refs[0], way.node_refs[-1]]

    return kept_refs


def build_graph(
    version_id: str,
    nodes: dict[int, OsmNode],
    ways: list[OsmWay],
) -> tuple[list[dict[str, object]], list[dict[str, object]], list[dict[str, object]], dict[str, object]]:
    referenced_counts: Counter[int] = Counter()
    for way in ways:
        referenced_counts.update(way.node_refs)

    kept_way_node_refs: dict[int, list[int]] = {}
    graph_references: Counter[int] = Counter()
    total_original_way_points = 0
    total_kept_way_points = 0

    for way in ways:
        kept_refs = select_kept_node_refs(way, nodes, referenced_counts)
        kept_way_node_refs[way.osm_way_id] = kept_refs
        graph_references.update(kept_refs)
        total_original_way_points += len(way.node_refs)
        total_kept_way_points += len(kept_refs)

    graph_node_ids: dict[int, str] = {}
    graph_nodes: list[dict[str, object]] = []

    for osm_node_id, count in graph_references.items():
        node = nodes.get(osm_node_id)
        if node is None:
            continue
        node_type = "INTERSECTION" if referenced_counts[osm_node_id] > 1 else "CURVE_POINT"
        graph_node_id = str(uuid.uuid4())
        graph_node_ids[osm_node_id] = graph_node_id
        graph_nodes.append(
            {
                "node_id": graph_node_id,
                "version_id": version_id,
                "osm_node_id": osm_node_id,
                "node_type": node_type,
                "lat": node.lat,
                "lng": node.lng,
                "elevation_meters": "",
                "signalized": "false",
                "u_turn_permitted_emergency": "false",
                "fire_access_entry": "false",
                "metadata": json.dumps({}),
            }
        )

    graph_edges: list[dict[str, object]] = []
    edge_tags: list[dict[str, object]] = []
    road_type_counter: Counter[str] = Counter()

    for way in ways:
        highway = way.tags.get("highway", "road")
        base_speed = base_speed_kph(highway, way.tags.get("maxspeed"))
        emergency_speed = emergency_speed_kph(highway, base_speed)
        bus_lane = infer_bus_lane(way.tags)
        forward_allowed, reverse_allowed = is_one_way(way.tags)
        road_type_counter[highway] += 1

        kept_refs = kept_way_node_refs.get(way.osm_way_id, [])
        if len(kept_refs) < 2:
            continue

        original_index_by_ref = {osm_node_id: index for index, osm_node_id in enumerate(way.node_refs)}

        for index in range(len(kept_refs) - 1):
            start_ref = kept_refs[index]
            end_ref = kept_refs[index + 1]
            start_node = nodes.get(start_ref)
            end_node = nodes.get(end_ref)
            from_node_id = graph_node_ids.get(start_ref)
            to_node_id = graph_node_ids.get(end_ref)

            if not start_node or not end_node or not from_node_id or not to_node_id:
                continue

            segment_start_index = original_index_by_ref[start_ref]
            segment_end_index = original_index_by_ref[end_ref]
            segment_refs = way.node_refs[segment_start_index : segment_end_index + 1]
            segment_nodes = [nodes[ref] for ref in segment_refs if ref in nodes]
            if len(segment_nodes) < 2:
                continue

            length_meters = round(
                sum(
                    haversine_meters(
                        segment_nodes[position].lat,
                        segment_nodes[position].lng,
                        segment_nodes[position + 1].lat,
                        segment_nodes[position + 1].lng,
                    )
                    for position in range(len(segment_nodes) - 1)
                ),
                3,
            )
            if length_meters <= 0:
                continue

            geometry = json.dumps(
                [{"lat": node.lat, "lng": node.lng} for node in segment_nodes],
                ensure_ascii=True,
            )

            if forward_allowed:
                graph_edges.append(
                    build_edge_row(
                        version_id=version_id,
                        from_node_id=from_node_id,
                        to_node_id=to_node_id,
                        osm_way_id=way.osm_way_id,
                        edge_name=way.tags.get("name", ""),
                        road_type=highway,
                        length_meters=length_meters,
                        base_speed=base_speed,
                        emergency_speed=emergency_speed,
                        one_way=not reverse_allowed,
                        bus_lane=bus_lane,
                        geometry=geometry,
                    )
                )

            if reverse_allowed:
                graph_edges.append(
                    build_edge_row(
                        version_id=version_id,
                        from_node_id=to_node_id,
                        to_node_id=from_node_id,
                        osm_way_id=way.osm_way_id,
                        edge_name=way.tags.get("name", ""),
                        road_type=highway,
                        length_meters=length_meters,
                        base_speed=base_speed,
                        emergency_speed=emergency_speed,
                        one_way=not forward_allowed,
                        bus_lane=bus_lane,
                        geometry=json.dumps(
                            list(reversed([{"lat": node.lat, "lng": node.lng} for node in segment_nodes])),
                            ensure_ascii=True,
                        ),
                    )
                )

        for tag_key, tag_value in sorted(way.tags.items()):
            if not tag_value:
                continue
            edge_tags.append(
                {
                    "edge_tag_id": str(uuid.uuid4()),
                    "version_id": version_id,
                    "edge_id": "",
                    "osm_way_id": way.osm_way_id,
                    "tag_key": tag_key,
                    "tag_value": tag_value,
                    "source": "OSM",
                }
            )

    validation_report = {
        "generated_at": datetime.now(UTC).isoformat(),
        "node_count": len(graph_nodes),
        "edge_count": len(graph_edges),
        "tag_count": len(edge_tags),
        "original_way_point_count": total_original_way_points,
        "kept_way_point_count": total_kept_way_points,
        "removed_way_point_count": total_original_way_points - total_kept_way_points,
        "simplification_ratio": round(
            ((total_original_way_points - total_kept_way_points) / total_original_way_points),
            4,
        )
        if total_original_way_points
        else 0.0,
        "road_type_distribution": dict(road_type_counter),
        "warnings": build_validation_warnings(graph_nodes, graph_edges),
    }

    return graph_nodes, graph_edges, edge_tags, validation_report


def build_edge_row(
    *,
    version_id: str,
    from_node_id: str,
    to_node_id: str,
    osm_way_id: int,
    edge_name: str,
    road_type: str,
    length_meters: float,
    base_speed: float,
    emergency_speed: float,
    one_way: bool,
    bus_lane: bool,
    geometry: str,
) -> dict[str, object]:
    return {
        "edge_id": str(uuid.uuid4()),
        "version_id": version_id,
        "from_node_id": from_node_id,
        "to_node_id": to_node_id,
        "osm_way_id": osm_way_id,
        "edge_name": edge_name,
        "road_type": road_type,
        "road_class": road_type,
        "length_meters": f"{length_meters:.3f}",
        "base_speed_kph": f"{base_speed:.2f}",
        "emergency_speed_kph": f"{emergency_speed:.2f}",
        "lane_count": "",
        "one_way": str(one_way).lower(),
        "turn_type": "STRAIGHT",
        "turn_penalty_seconds": "0",
        "signal_penalty_seconds": "0",
        "bus_lane": str(bus_lane).lower(),
        "bus_lane_allowed_emergency": "false",
        "fire_access_road": "false",
        "u_turn_edge": "false",
        "u_turn_allowed_emergency": "false",
        "blocked_for_fire_truck": "false",
        "blocked_for_ambulance": "false",
        "is_emergency_preferred": "false",
        "access_restricted": "false",
        "geometry": geometry,
        "metadata": json.dumps({}),
    }


def build_validation_warnings(graph_nodes: list[dict[str, object]], graph_edges: list[dict[str, object]]) -> list[str]:
    warnings: list[str] = []
    if not graph_nodes:
        warnings.append("No graph nodes were generated.")
    if not graph_edges:
        warnings.append("No graph edges were generated.")

    self_loop_count = sum(1 for edge in graph_edges if edge["from_node_id"] == edge["to_node_id"])
    if self_loop_count > 0:
        warnings.append(f"Detected {self_loop_count} self-loop edges.")

    bus_lane_edges = sum(1 for edge in graph_edges if edge["bus_lane"] == "true")
    if bus_lane_edges == 0:
        warnings.append("No bus-lane edges were inferred. Manual overrides may be required.")

    return warnings


def write_csv(path: Path, rows: list[dict[str, object]], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def write_json(path: Path, payload: dict[str, object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=True, indent=2), encoding="utf-8")


def write_snapshot(
    path: Path,
    *,
    version_id: str,
    version_name: str,
    graph_nodes: list[dict[str, object]],
    graph_edges: list[dict[str, object]],
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "format": "rescue-nav-road-graph-snapshot-v1",
        "versionId": version_id,
        "versionName": version_name,
        "generatedAt": datetime.now(UTC).isoformat(),
        "nodeCount": len(graph_nodes),
        "edgeCount": len(graph_edges),
        "nodes": [
            {
                "id": node["node_id"],
                "lat": float(node["lat"]),
                "lng": float(node["lng"]),
                "type": node["node_type"],
                "signalized": node["signalized"] == "true",
                "emergencyUTurnPermitted": node["u_turn_permitted_emergency"] == "true",
                "fireAccessEntry": node["fire_access_entry"] == "true",
            }
            for node in graph_nodes
        ],
        "edges": [
            {
                "id": edge["edge_id"],
                "from": edge["from_node_id"],
                "to": edge["to_node_id"],
                "lengthMeters": float(edge["length_meters"]),
                "baseSpeedKph": float(edge["base_speed_kph"]),
                "emergencySpeedKph": float(edge["emergency_speed_kph"]),
                "turnPenaltySeconds": float(edge["turn_penalty_seconds"]),
                "signalPenaltySeconds": float(edge["signal_penalty_seconds"]),
                "busLane": edge["bus_lane"] == "true",
                "busLaneAllowedEmergency": edge["bus_lane_allowed_emergency"] == "true",
                "fireAccessRoad": edge["fire_access_road"] == "true",
                "uTurnEdge": edge["u_turn_edge"] == "true",
                "uTurnAllowedEmergency": edge["u_turn_allowed_emergency"] == "true",
                "blockedForFireTruck": edge["blocked_for_fire_truck"] == "true",
                "blockedForAmbulance": edge["blocked_for_ambulance"] == "true",
                "emergencyPreferred": edge["is_emergency_preferred"] == "true",
                "roadType": edge["road_type"],
            }
            for edge in graph_edges
        ],
    }
    with gzip.open(path, "wt", encoding="utf-8") as file:
        json.dump(payload, file, ensure_ascii=True, separators=(",", ":"))


def main() -> int:
    args = parse_args()
    input_path = Path(args.input)
    output_dir = Path(args.output_dir)
    ensure_supported_input(input_path)

    if not input_path.exists():
        raise SystemExit(f"Input file not found: {input_path}")

    version_id = str(uuid.uuid4())
    snapshot_date = date.fromisoformat(args.snapshot_date)

    nodes, ways = parse_osm_xml(input_path)
    graph_nodes, graph_edges, edge_tags, validation_report = build_graph(version_id, nodes, ways)

    version_row = {
        "version_id": version_id,
        "version_name": args.version_name,
        "region_name": args.region_name,
        "region_code": args.region_code,
        "source": "OSM",
        "source_snapshot_date": snapshot_date.isoformat(),
        "source_uri": args.source_uri,
        "import_status": "PROCESSING",
        "is_active": "false",
        "node_count": len(graph_nodes),
        "edge_count": len(graph_edges),
        "tag_count": len(edge_tags),
        "metadata": json.dumps(
            {
                "input_file": str(input_path),
                "generated_at": datetime.now(UTC).isoformat(),
                "skeleton": True,
                "notes": [
                    "This is a minimal importer skeleton.",
                    "Edge tags export is keyed by osm_way_id and still needs edge-level expansion during production hardening.",
                    "PBF support and direct Supabase loading should be added later.",
                ],
            },
            ensure_ascii=True,
        ),
    }

    write_csv(
        output_dir / "road_graph_version.csv",
        [version_row],
        list(version_row.keys()),
    )
    write_csv(
        output_dir / "road_graph_nodes.csv",
        graph_nodes,
        [
            "node_id",
            "version_id",
            "osm_node_id",
            "node_type",
            "lat",
            "lng",
            "elevation_meters",
            "signalized",
            "u_turn_permitted_emergency",
            "fire_access_entry",
            "metadata",
        ],
    )
    write_csv(
        output_dir / "road_graph_edges.csv",
        graph_edges,
        [
            "edge_id",
            "version_id",
            "from_node_id",
            "to_node_id",
            "osm_way_id",
            "edge_name",
            "road_type",
            "road_class",
            "length_meters",
            "base_speed_kph",
            "emergency_speed_kph",
            "lane_count",
            "one_way",
            "turn_type",
            "turn_penalty_seconds",
            "signal_penalty_seconds",
            "bus_lane",
            "bus_lane_allowed_emergency",
            "fire_access_road",
            "u_turn_edge",
            "u_turn_allowed_emergency",
            "blocked_for_fire_truck",
            "blocked_for_ambulance",
            "is_emergency_preferred",
            "access_restricted",
            "geometry",
            "metadata",
        ],
    )
    write_csv(
        output_dir / "road_graph_edge_tags.csv",
        edge_tags,
        [
            "edge_tag_id",
            "version_id",
            "edge_id",
            "osm_way_id",
            "tag_key",
            "tag_value",
            "source",
        ],
    )
    write_json(output_dir / "validation_report.json", validation_report)
    write_snapshot(
        output_dir / "road_graph_snapshot.json.gz",
        version_id=version_id,
        version_name=args.version_name,
        graph_nodes=graph_nodes,
        graph_edges=graph_edges,
    )

    print(json.dumps(
        {
            "status": "ok",
            "version_id": version_id,
            "version_name": args.version_name,
            "output_dir": str(output_dir),
            "node_count": len(graph_nodes),
            "edge_count": len(graph_edges),
            "tag_count": len(edge_tags),
            "snapshot_path": str(output_dir / "road_graph_snapshot.json.gz"),
        },
        ensure_ascii=True,
    ))
    return 0


if __name__ == "__main__":
    sys.exit(main())
