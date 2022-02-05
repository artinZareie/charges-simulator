import { SeperateDigits } from "./tools";

export const coulomb_constant = 1 / (4 * Math.PI * 8.854e-12);
export const epsilon = 1e-15;

export function vec2vec(vec) {
  return [vec.x, vec.y, vec.z];
}

export function sigma(vector) {
  let sum = 0;
  vector.map((e) => (sum += e));
  return sum;
}

export function substract_vectors(v1, v2) {
  let v3 = [];
  for (let i = 0; i < v1.length; i++) {
    v3[i] = v1[i] - v2[i];
    if (Math.abs(v3[i]) < epsilon) {
      console.info("ZEROOOO");
      v3[i] = 0;
    }
  }
  return v3;
}

export function add_vectors(v1, v2) {
  let v3 = [];
  for (let i = 0; i < v1.length; i++) {
    v3[i] = v1[i] + v2[i];
  }
  return v3;
}

export function vector_amplitude(vector) {
  return Math.sqrt(sigma(vector.map((e) => Math.pow(e, 2))));
}

export function scalar_product(x, scalar) {
  return x.map((item) => item * scalar);
}

export function Field(q, r) {
  let r_amp = vector_amplitude(r);
  let r_hat = scalar_product(r, 1 / r_amp);
  let E = scalar_product(
    r_hat,
    coulomb_constant * (Math.abs(q) / Math.pow(r_amp, 2))
  );
  return E;
}

export function Force(q1, q2, r) {
  let r_amp = vector_amplitude(r);
  if (r_amp < epsilon) {
    return [0, 0, 0];
  }
  let r_hat = scalar_product(r, 1 / r_amp);
  let E = scalar_product(
    r_hat,
    coulomb_constant * ((q1 * q2) / Math.pow(r_amp, 2))
  );
  return E;
}
