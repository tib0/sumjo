import { DetectionBox } from "@/types/Sumjo";

export function getColor(label: string) {
  switch (label) {
    case '0':
      return "lightblue";

    case 'n1':
    case 'n2':
      return "blue";

    case '1':
    case '2':
    case '3':
      return "green";

    case '10':
    case '11':
    case '12':
      return "red";

    default:
      return "yellow";
  }
}

export function sum(results: DetectionBox[]) {
  'worklet'
  let sum = 0;
  results.map((res: any) => { sum += Number.parseInt(res.label.replace('n', '-')) });
  return sum;
}