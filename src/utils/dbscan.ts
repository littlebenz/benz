import { Point } from "../engine/state/utils/point";

interface Data {
  idx: number;
  data: Point;
  label: number;
}
const rangeQuery = (data: Data[], q: Data, eps: number) =>
  data.filter((p) => euclideanDistance(p.data, q.data) <= eps);

function euclideanDistance(a: Point, b: Point) {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2) + Math.pow(b.z - a.z, 2));
}

export function dbscan(inputData: Point[], eps: number, minPts: number) {
  let c = 0;
  const data: Data[] = inputData.map((p, i) => ({
    idx: i,
    data: p,
    label: -1,
  }));

  data.forEach((p) => {
    // Only process unlabelled points
    if (p.label !== -1) return;

    // Get all the points neighbors
    const n = rangeQuery(data, p, eps);

    // Check if point is noise
    if (n.length < minPts) {
      p.label = 0;
      return;
    }

    c += 1; // Next cluster label
    p.label = c; // Label initial point

    // Remove point p from n
    let s = n.filter((q) => q.idx !== p.idx);

    // Process every seed point
    while (s.length > 0) {
      const q = s.pop()!;

      if (q.label === 0) q.label = c; // Change noise to border
      if (q.label === -1) {
        q.label = c; // Label neighbor

        // Find neighbors
        const n = rangeQuery(data, q, eps);

        // Add new neighbors to seed
        if (n.length >= minPts) {
          s = s.concat(n);
        }
      }
    }
  });

  return data.map((d) => d.label - 1);
}
