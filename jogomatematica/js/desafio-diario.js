import { estado } from './estado.js';

export function dataDesafio() {
  return new Date().toISOString().slice(0, 10);
}

export function iniciarDesafioDiario() {
  estado.desafioDiario.ativo = estado.modoJogo === 'diario';
  estado.desafioDiario.restantes = 5;
  estado.desafioDiario.data = dataDesafio();
}

export function registrarPerguntaDiaria() {
  if (!estado.desafioDiario.ativo) return false;
  estado.desafioDiario.restantes--;
  return estado.desafioDiario.restantes <= 0;
}
