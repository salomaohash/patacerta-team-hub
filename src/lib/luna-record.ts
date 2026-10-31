export const lunaRecord = [
  { title: "Identificação", entries: [
    ["Nome", "Luna"], ["Espécie", "Cão"], ["Sexo", "Fêmea"],
    ["Data de nascimento", "14 de março de 2024"], ["Idade", "2 anos"],
    ["Raça", "Sem raça definida, porte pequeno"], ["Cor", "Branco e castanho"],
    ["Peso atual", "8,4 kg"], ["Microchip", "Registado"], ["Estado de esterilização", "Esterilizada"],
  ] },
  { title: "História de vida", entries: [
    ["Resgatada", "10 de maio de 2024"], ["Local de resgate", "Lisboa"],
    ["Entrada na instituição", "12 de maio de 2024"], ["Tempo na instituição", "1 ano e 5 meses"],
    ["Contexto anterior", "Encontrada sem identificação, acompanhada pela instituição até recuperação e socialização"],
    ["Perfil comportamental", "Sociável, calma em casa, gosta de companhia e de passeios tranquilos"],
    ["Compatibilidade", "Adequada para apartamento e para famílias tranquilas"],
  ] },
  { title: "Vacinação", entries: [
    ["Vacina múltipla", "15 de novembro de 2025 — Administrada"],
    ["Vacina da raiva", "15 de novembro de 2025 — Administrada"],
    ["Reforço anual", "15 de novembro de 2026 — Agendada"],
  ] },
  { title: "Desparasitação e prevenção", entries: [
    ["Desparasitação interna", "15 de outubro de 2026 — Concluída"],
    ["Desparasitação externa", "15 de outubro de 2026 — Concluída"],
    ["Próxima administração", "15 de novembro de 2026"],
  ] },
  { title: "Consultas e intervenções", entries: [
    ["Consulta geral", "15 de outubro de 2026 — Sem alterações"],
    ["Esterilização", "20 de agosto de 2025 — Recuperação concluída"],
    ["Check-up dentário", "15 de outubro de 2026 — Sem alterações"],
    ["Próxima consulta anual", "15 de novembro de 2026"],
  ] },
  { title: "Cuidados e necessidades", entries: [
    ["Alimentação", "Ração para cão adulto, de manhã e à noite"],
    ["Passeios", "Dois por dia, entre 20 e 30 minutos"], ["Higiene", "Escovagem semanal"],
    ["Sono", "Cama num local calmo"], ["Saúde", "Sem alergias conhecidas"],
    ["Medicação atual", "Nenhuma"], ["Veterinário de referência", "Clínica Veterinária Alfama"],
  ] },
];

export const todayCare = [
  { id: "morning-food", label: "Ração da manhã", time: "08:00" },
  { id: "morning-walk", label: "Passeio da manhã · 20–30 min", time: "09:00" },
  { id: "evening-walk", label: "Passeio da tarde · 20–30 min", time: "18:00" },
  { id: "evening-food", label: "Ração da noite", time: "19:00" },
];

export function toggleCare(completed: string[], id: string): string[] {
  return completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id];
}
