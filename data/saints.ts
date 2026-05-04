export interface Saint {
  name: string;
  quote: string;
  date: string; // "MM-DD"
}

export const saints: Saint[] = [
  { date: "01-01", name: "Maria, Mãe de Deus", quote: "Fazei tudo o que ele vos disser." },
  { date: "01-02", name: "Basílio Magno", quote: "A árvore se conhece pelos frutos; o homem, pelas obras." },
  { date: "01-04", name: "Isabel Ana Seton", quote: "Vivamos simplesmente para que todos possam simplesmente viver." },
  { date: "01-17", name: "Antônio do Deserto", quote: "Não temo mais a Deus — amo-o." },
  { date: "01-21", name: "Inês de Roma", quote: "Escolho guardar para Cristo o que guardo em mim." },
  { date: "01-24", name: "Francisco de Sales", quote: "Seja paciente com tudo, mas antes de tudo, consigo mesmo." },
  { date: "01-28", name: "Tomás de Aquino", quote: "As coisas que amamos revelam quem somos." },
  { date: "01-31", name: "João Bosco", quote: "Corra, pule, brinque à vontade — apenas não peque." },
  { date: "02-14", name: "Cirilo e Metódio", quote: "A fonte da sabedoria e da força está em fazer a vontade de Deus." },
  { date: "02-22", name: "Cátedra de Pedro", quote: "Tu és o Cristo, o Filho de Deus vivo." },
  { date: "03-07", name: "Perpétua e Felicidade", quote: "De pé neste momento, amanhã verei o que Deus quiser." },
  { date: "03-17", name: "Patrício de Irlanda", quote: "Cristo comigo, Cristo à minha frente, Cristo atrás de mim." },
  { date: "03-19", name: "José", quote: "Levantando-se do sono, fez como o anjo do Senhor lhe havia ordenado." },
  { date: "03-25", name: "Nossa Senhora da Anunciação", quote: "Eis a serva do Senhor. Faça-se em mim segundo a tua palavra." },
  { date: "04-29", name: "Catarina de Siena", quote: "Seja quem Deus quis que você fosse e você incendiará o mundo." },
  { date: "05-15", name: "Isidoro Lavrador", quote: "Trabalha a terra com as mãos e o céu com o coração." },
  { date: "05-22", name: "Rita de Cássia", quote: "Nada é impossível para quem confia no Deus amoroso." },
  { date: "05-30", name: "Joana d'Arc", quote: "Aja, e Deus agirá." },
  { date: "06-13", name: "Antônio de Pádua", quote: "Se buscas milagres, olha onde há misericórdia." },
  { date: "06-22", name: "Tomás More", quote: "Morro servo do rei, mas antes de tudo, servo de Deus." },
  { date: "06-24", name: "João Batista", quote: "É preciso que ele cresça e que eu diminua." },
  { date: "06-29", name: "Pedro e Paulo", quote: "Senhor, tu sabes tudo; tu sabes que te amo." },
  { date: "07-03", name: "Tomás Apóstolo", quote: "Meu Senhor e meu Deus!" },
  { date: "07-11", name: "Bento de Núrsia", quote: "Escuta, ó filho, os preceitos do mestre e inclina o ouvido do teu coração." },
  { date: "07-22", name: "Maria Madalena", quote: "Vi o Senhor." },
  { date: "07-31", name: "Inácio de Loyola", quote: "Parte e incendeia o mundo." },
  { date: "08-04", name: "João Maria Vianney", quote: "A oração é o coração voltado para Deus." },
  { date: "08-11", name: "Clara de Assis", quote: "Vai em paz, pois tens seguido o bom caminho." },
  { date: "08-14", name: "Maximiliano Kolbe", quote: "O mais importante é o amor." },
  { date: "08-15", name: "Nossa Senhora da Assunção", quote: "O Senhor fez grandes coisas em mim; santo é o seu nome." },
  { date: "08-27", name: "Mônica", quote: "Nada está longe de Deus." },
  { date: "08-28", name: "Agostinho de Hipona", quote: "Nosso coração é inquieto até que descanse em Ti." },
  { date: "09-03", name: "Gregório Magno", quote: "Não é o trabalho que mata o homem, mas a preocupação." },
  { date: "09-27", name: "Vicente de Paulo", quote: "É mais fácil dar uma esmola do que dar o coração." },
  { date: "09-29", name: "Miguel, Gabriel e Rafael", quote: "Quem como Deus?" },
  { date: "09-30", name: "Jerônimo", quote: "A ignorância das Escrituras é a ignorância de Cristo." },
  { date: "10-01", name: "Teresa do Menino Jesus", quote: "Passarei meu paraíso fazendo o bem na terra." },
  { date: "10-04", name: "Francisco de Assis", quote: "Comece fazendo o que é necessário, depois o possível — e de repente estará fazendo o impossível." },
  { date: "10-15", name: "Teresa d'Ávila", quote: "Que nada te perturbe, que nada te amedronte; tudo passa, Deus não muda." },
  { date: "10-22", name: "João Paulo II", quote: "Não tenhais medo." },
  { date: "11-01", name: "Todos os Santos", quote: "Bem-aventurados os que choram, pois serão consolados." },
  { date: "11-11", name: "Martinho de Tours", quote: "Senhor, se ainda sou necessário ao teu povo, não recuso o trabalho." },
  { date: "11-17", name: "Isabel da Hungria", quote: "Como poderia eu usar uma coroa de ouro se o Senhor usa uma de espinhos?" },
  { date: "11-22", name: "Cecília", quote: "Enquanto os instrumentos tocavam, cantava em meu coração apenas para ti." },
  { date: "12-03", name: "Francisco Xavier", quote: "Não é o esforço que conta, mas o espírito de fé com que a obra é feita." },
  { date: "12-06", name: "Nicolau de Mira", quote: "Dar sem que a mão esquerda saiba o que dá a direita." },
  { date: "12-07", name: "Ambrósio de Milão", quote: "Não dás ao pobre o que é teu; devolveste a ele o que é dele." },
  { date: "12-12", name: "Nossa Senhora de Guadalupe", quote: "Não estou eu aqui, que sou tua mãe?" },
  { date: "12-13", name: "Lúcia de Siracusa", quote: "Preparei em meu coração uma morada onde só Cristo habita." },
  { date: "12-14", name: "João da Cruz", quote: "No fim da vida, seremos julgados pelo amor." },
  { date: "12-27", name: "João Evangelista", quote: "Deus é amor, e quem permanece no amor permanece em Deus." },
  { date: "12-29", name: "Tomás Becket", quote: "Em nome de Jesus e em defesa da Igreja, estou pronto para abraçar a morte." },
];

const fallbackQuotes: Omit<Saint, "date">[] = [
  { name: "Francisco de Sales", quote: "Seja paciente com tudo, mas antes de tudo, consigo mesmo." },
  { name: "Agostinho de Hipona", quote: "Nosso coração é inquieto até que descanse em Ti." },
  { name: "Teresa do Menino Jesus", quote: "Passarei meu paraíso fazendo o bem na terra." },
  { name: "Francisco de Assis", quote: "Onde há ódio, que eu leve o amor; onde há dúvida, a fé." },
  { name: "Teresa d'Ávila", quote: "Que nada te perturbe, que nada te amedronte; tudo passa, Deus não muda." },
  { name: "João Paulo II", quote: "Não tenhais medo." },
  { name: "Tomás de Aquino", quote: "As coisas que amamos revelam quem somos." },
  { name: "Catarina de Siena", quote: "Seja quem Deus quis que você fosse e você incendiará o mundo." },
  { name: "João da Cruz", quote: "No fim da vida, seremos julgados pelo amor." },
  { name: "João Bosco", quote: "Quem tem saúde, tem esperança. Quem tem esperança, tem tudo." },
  { name: "Bento de Núrsia", quote: "Escuta, ó filho, e inclina o ouvido do teu coração." },
  { name: "Inácio de Loyola", quote: "Trabalha como se tudo dependesse de ti; reza como se tudo dependesse de Deus." },
  { name: "Vicente de Paulo", quote: "É mais fácil dar uma esmola do que dar o coração." },
  { name: "Joana d'Arc", quote: "Aja, e Deus agirá." },
  { name: "Maria Madalena", quote: "Vi o Senhor." },
];

export function getSaintOfTheDay(): Saint {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const today = `${month}-${day}`;

  const found = saints.find((s) => s.date === today);
  if (found) return found;

  // Fallback: rotate based on day of year
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  const fallback = fallbackQuotes[dayOfYear % fallbackQuotes.length];

  return { ...fallback, date: today };
}
