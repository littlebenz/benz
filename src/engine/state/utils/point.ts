export class Point {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  distance(x: number, y: number, z: number) {
    return math.sqrt(math.pow(this.x - x, 2) + math.pow(this.y - y, 2) + math.pow(this.z - z, 2));
  }

  equals(point: Point | null) {
    if (point === null) {
      return false;
    }
    return this.x === point.x && this.y === point.y && this.z === point.z;
  }
}
