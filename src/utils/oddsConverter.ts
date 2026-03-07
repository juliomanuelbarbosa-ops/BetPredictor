/**
 * STRATOS.AI - Odds Conversion Utilities
 */

export const decimalToAmerican = (decimal: number): string => {
  if (decimal >= 2.0) {
    const value = Math.round((decimal - 1) * 100);
    return `+${value}`;
  } else {
    const value = Math.round(-100 / (decimal - 1));
    return `${value}`;
  }
};

export const decimalToFractional = (decimal: number): string => {
  const fraction = decimal - 1;
  const tolerance = 1.0e-6;
  let h1 = 1;
  let h2 = 0;
  let k1 = 0;
  let k2 = 1;
  let b = fraction;
  do {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(fraction - h1 / k1) > fraction * tolerance);

  return `${h1}/${k1}`;
};

export const probabilityToDecimal = (prob: number): number => {
  if (prob <= 0) return 100;
  return parseFloat((1 / (prob / 100)).toFixed(2));
};
