import { describe, expect, it } from "vitest";
import { formatDistance, haversineKm } from "./geo";

describe("haversineKm", () => {
  it("devolve zero para o mesmo ponto", () => {
    expect(haversineKm({ lat: 38.7223, lng: -9.1393 }, { lat: 38.7223, lng: -9.1393 })).toBe(0);
  });

  it("calcula a distância Lisboa-Porto com margem razoável", () => {
    const km = haversineKm({ lat: 38.7223, lng: -9.1393 }, { lat: 41.1579, lng: -8.6291 });
    expect(km).toBeGreaterThan(260);
    expect(km).toBeLessThan(290);
  });
});

describe("formatDistance", () => {
  it("usa metros abaixo de 1 km", () => {
    expect(formatDistance(0.8)).toBe("800 m");
  });

  it("usa quilómetros com vírgula decimal", () => {
    expect(formatDistance(2.12)).toBe("2,1 km");
  });
});
