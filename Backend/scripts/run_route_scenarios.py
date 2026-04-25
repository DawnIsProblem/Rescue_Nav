#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
from pathlib import Path


def call_route_api(base_url: str, scenario: dict) -> dict:
    payload = {
        "origin": scenario["origin"],
        "destination": scenario["destination"],
        "vehicleType": scenario["vehicleType"],
    }
    request = urllib.request.Request(
        url=f"{base_url.rstrip('/')}/api/routes/calculate",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def summarize_result(scenario: dict, response: dict) -> dict:
    data = response["data"]
    standard = data["standardRoute"]
    emergency = data["emergencyRoute"]
    meta = emergency.get("meta", {})
    return {
        "id": scenario["id"],
        "name": scenario["name"],
        "vehicleType": scenario["vehicleType"],
        "success": response.get("success", False),
        "standardDistanceMeters": standard["distanceMeters"],
        "standardEtaSeconds": standard["etaSeconds"],
        "emergencyDistanceMeters": emergency["distanceMeters"],
        "emergencyEtaSeconds": emergency["etaSeconds"],
        "strategy": meta.get("strategy"),
        "fallbackUsed": meta.get("fallbackUsed"),
        "fallbackReason": meta.get("fallbackReason"),
        "confidence": meta.get("confidence"),
        "pathPoints": len(emergency.get("path", [])),
    }


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: run_route_scenarios.py <base_url> <scenario_json>", file=sys.stderr)
        return 1

    base_url = sys.argv[1]
    scenario_path = Path(sys.argv[2])
    scenarios = json.loads(scenario_path.read_text(encoding="utf-8"))

    summaries: list[dict] = []
    for scenario in scenarios:
        try:
            response = call_route_api(base_url, scenario)
            summaries.append(summarize_result(scenario, response))
        except urllib.error.HTTPError as error:
            summaries.append(
                {
                    "id": scenario["id"],
                    "name": scenario["name"],
                    "vehicleType": scenario["vehicleType"],
                    "success": False,
                    "error": f"http {error.code}",
                }
            )
        except Exception as error:  # noqa: BLE001
            summaries.append(
                {
                    "id": scenario["id"],
                    "name": scenario["name"],
                    "vehicleType": scenario["vehicleType"],
                    "success": False,
                    "error": str(error),
                }
            )

    print(json.dumps(summaries, ensure_ascii=True, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
