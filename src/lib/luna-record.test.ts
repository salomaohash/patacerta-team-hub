import { expect, it } from "vitest";
import { todayCare, toggleCare } from "./luna-record";

it("toggles a care item without duplicating completion", () => {
  const id = todayCare[0]?.id;
  if (!id) throw new Error("Care list missing");
  expect(toggleCare([], id)).toEqual([id]);
  expect(toggleCare([id], id)).toEqual([]);
});