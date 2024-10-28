export type CoordBox = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type DetectionBox = {
  label: string;
  prob: number;
  coordinates: CoordBox;
};
