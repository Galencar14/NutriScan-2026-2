/* =====================================================================
   NutriScan Amazônia — componente de RESULTADO (card do alimento + troca)
   ---------------------------------------------------------------------
   Como funciona (o index.html NÃO é alterado na estrutura/layout):
   - Este arquivo é carregado DEPOIS do script principal e apenas
     substitui a função mostrarResultado(a), que já existe no index.
   - Ele desenha tudo dentro da <section id="resultado"> que já existe.
   - Os estilos são injetados por aqui (classes com prefixo "ns-"),
     usando as variáveis de cor que o index já define (--card, --line, --fg).
   ===================================================================== */
(function () {
  "use strict";

  // ---------- 1. MAPEAMENTO DE IMAGENS LOCAIS ----------
  // Uma entrada EXPLÍCITA por alimento (chave do alimentos.json) e por troca
  // (texto exato do campo "troca"). Nada é escolhido por inicial, tamanho do nome
  // ou posição do arquivo. Todas as fotos ficam em "Fotos do modelo/Alimentos/"
  // (nomes sem acento, para funcionar em qualquer servidor/zip).
  //
  // Valor null = AINDA NÃO HÁ foto verificada para esse item. Nesse caso o card
  // aparece só com nome/etiqueta (sem foto, sem inicial, sem foto de outro alimento).
  // Para completar: salve a foto na pasta indicada no comentário e troque null
  // pelo caminho, ex.: { principal: PASTA + "arroz.jpg" }.
  const PASTA = "Fotos do modelo/Alimentos/";

  const FOTOS_ALIMENTOS = {
    farinha:          { principal: PASTA + "farinha.jpg" },
    acucar:           { principal: PASTA + "acucar.jpg" },
    oleo:             { principal: PASTA + "oleo.jpg" },
    castanha_torrada: { principal: PASTA + "castanha_torrada.jpg" },
    sardinha:         { principal: PASTA + "sardinha.jpg" },
    refri:            { principal: PASTA + "refri.jpg" },
    biscoito:         { principal: PASTA + "biscoito.jpg" },
    miojo:            { principal: PASTA + "miojo.jpg" },
    cupuacu:          { principal: PASTA + "cupuacu.jpg", detalhe: PASTA + "cupuacu_detalhe.jpg" },
    castanha:         { principal: PASTA + "castanha.jpg", detalhe: PASTA + "castanha_detalhe.jpg" },
    tapereba:         { principal: PASTA + "tapereba.jpg" },
    arroz:            { principal: PASTA + "arroz.jpg" },
    feijao:           { principal: PASTA + "feijao.jpg" },
    milho_conserva:   { principal: PASTA + "milho_conserva.jpg" },
  };

  // Foto do alimento recomendado, pelo texto exato de "troca" no alimentos.json.
  const FOTOS_TROCAS = {
    "Suco de laranja":            PASTA + "troca_suco_de_laranja.jpg",
    "Pipoca caseira":             PASTA + "troca_pipoca_caseira.jpg",
    "Macarrão com molho caseiro": PASTA + "troca_macarrao_molho_caseiro.jpg",
  };

  function fotosDoAlimento(a) {
    return (a.chave && FOTOS_ALIMENTOS[a.chave]) || null; // só correspondência exata
  }
  function fotosDaTroca(a) {
    const f = a.troca && FOTOS_TROCAS[a.troca];
    return f ? { principal: f } : null;
  }

  // Cria o <img>. Se falhar, NÃO troca por outra foto nem por inicial: avisa quem chamou.
  function criarImg(caminho, alt, aoFalhar) {
    const img = document.createElement("img");
    img.alt = alt || "";
    img.decoding = "async";
    img.onerror = function () { img.onerror = null; if (aoFalhar) aoFalhar(img); };
    img.src = encodeURI(caminho);
    return img;
  }

  // ---------- 2. ESTILOS (injetados uma única vez) ----------
  const CSS = `
  #resultado .ns-wrap{display:flex;flex-direction:column;gap:20px;padding:8px 0 24px;animation:ns-in .45s cubic-bezier(.2,.7,.2,1) both}
  @keyframes ns-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  @media (prefers-reduced-motion:reduce){#resultado .ns-wrap{animation:none}}

  #resultado .ns-grupo{display:flex;flex-direction:column;gap:6px}
  #resultado .ns-kicker{font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;display:flex;align-items:center;gap:8px}
  #resultado .ns-kicker i{width:8px;height:8px;border-radius:50%;display:inline-block}
  #resultado .ns-titulo{margin:0;font-size:1.45rem;line-height:1.2;letter-spacing:-.01em}
  #resultado .ns-def{margin:0;font-size:.92rem;line-height:1.5;opacity:.75}

  #resultado .ns-par{display:grid;grid-template-columns:1fr;gap:12px;align-items:stretch}
  #resultado .ns-par.tem-troca{grid-template-columns:1fr 32px 1fr;gap:8px}
  #resultado .ns-seta{display:flex;align-items:center;justify-content:center;color:#059669}
  #resultado .ns-seta span{width:32px;height:32px;border-radius:50%;background:var(--card);border:1px solid var(--line);
    display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(16,24,16,.10)}
  #resultado .ns-seta svg{width:16px;height:16px}

  #resultado .ns-card{background:var(--card);border:1px solid var(--line);border-radius:20px;overflow:hidden;
    box-shadow:0 1px 2px rgba(16,24,16,.05),0 12px 28px -12px rgba(16,24,16,.18);display:flex;flex-direction:column;min-width:0}
  #resultado .ns-foto{position:relative;aspect-ratio:4/5;background:var(--line);overflow:hidden}
  #resultado .ns-par:not(.tem-troca) .ns-foto{aspect-ratio:16/10}
  #resultado .ns-foto>img{width:100%;height:100%;object-fit:cover;display:block}
  #resultado .ns-detalhe{position:absolute;right:10px;bottom:10px;width:44px;height:44px;border-radius:12px;overflow:hidden;
    border:2px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.25);background:var(--line)}
  #resultado .ns-detalhe img{width:100%;height:100%;object-fit:cover;display:block}
  #resultado .ns-corpo{padding:14px 14px 16px;display:flex;flex-direction:column;gap:8px}
  #resultado .ns-tag{align-self:flex-start;font-size:.7rem;font-weight:700;letter-spacing:.03em;padding:4px 10px;border-radius:999px;line-height:1.3}
  #resultado .ns-tag.atencao{background:rgba(245,158,11,.16);color:#a16207;box-shadow:inset 0 0 0 1px rgba(245,158,11,.35)}
  #resultado .ns-tag.ideal{background:rgba(5,150,105,.14);color:#047857;box-shadow:inset 0 0 0 1px rgba(5,150,105,.35)}
  @media (prefers-color-scheme:dark){
    #resultado .ns-tag.atencao{color:#fcd34d}
    #resultado .ns-tag.ideal{color:#6ee7b7}
  }
  #resultado .ns-nome{margin:0;font-size:1rem;font-weight:650;line-height:1.3;overflow-wrap:anywhere}
  #resultado .ns-troca-card{box-shadow:0 1px 2px rgba(5,150,105,.08),0 14px 30px -12px rgba(5,150,105,.35);border-color:rgba(5,150,105,.35)}

  #resultado .ns-info{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:12px;
    box-shadow:0 1px 2px rgba(16,24,16,.04)}
  #resultado .ns-info p{margin:0;line-height:1.55;font-size:.95rem}
  #resultado .ns-info .ns-msg{opacity:.75}
  #resultado .ns-info hr{border:0;border-top:1px solid var(--line);margin:0}
  #resultado .ns-novo{margin-top:4px}
  `;
  function injetarCSS() {
    if (document.getElementById("ns-resultado-css")) return;
    const s = document.createElement("style");
    s.id = "ns-resultado-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ---------- 3. PEQUENOS AJUDANTES ----------
  function el(tag, cls, texto) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (texto != null) e.textContent = texto; // textContent: seguro contra texto vindo da internet
    return e;
  }

  // Tag do alimento escaneado: verde se for base da alimentação, âmbar se pedir cuidado
  function tagDoGrupo(grupo) {
    const k = String(grupo);
    if (k === "1" || k === "1a" || k === "1b") return { texto: "Boa escolha", tipo: "ideal" };
    if (k === "2") return { texto: "Use em pouca quantidade", tipo: "atencao" };
    if (k === "3") return { texto: "Com moderação", tipo: "atencao" };
    return { texto: "Atenção", tipo: "atencao" };
  }

  function cardAlimento(opcoes) {
    // opcoes: { nome, tag:{texto,tipo}, foto, detalhe, destaque }
    // Sem foto verificada -> o card não tem área de imagem (nada de inicial/bloco colorido).
    const card = el("article", "ns-card" + (opcoes.destaque ? " ns-troca-card" : ""));
    if (opcoes.foto) {
      const foto = el("div", "ns-foto");
      foto.appendChild(criarImg(opcoes.foto, opcoes.nome, () => {
        console.error("NutriScan: imagem não carregou: " + opcoes.foto);
        foto.remove(); // falhou: remove a área, sem substituir por outra imagem
      }));
      if (opcoes.detalhe) {
        const mini = el("div", "ns-detalhe");
        mini.appendChild(criarImg(opcoes.detalhe, "", () => {
          console.error("NutriScan: imagem não carregou: " + opcoes.detalhe);
          mini.remove();
        }));
        foto.appendChild(mini);
      }
      card.appendChild(foto);
    }
    const corpo = el("div", "ns-corpo");
    corpo.appendChild(el("span", "ns-tag " + opcoes.tag.tipo, opcoes.tag.texto));
    corpo.appendChild(el("h3", "ns-nome", opcoes.nome));
    card.appendChild(corpo);
    return card;
  }

  const SETA_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  // ---------- 4. FUNÇÃO PRINCIPAL: renderizarResultado ----------
  function renderizarResultado(a) {
    injetarCSS();
    const g = GRUPOS[a.grupo] || { nome: "Sem classificação", cor: "#607d8b", msg: "" };
    const fotos = fotosDoAlimento(a);
    const temTroca = !!a.troca;

    const raiz = el("div", "ns-wrap");

    // Cabeçalho: grupo NOVA + definição
    const topo = el("header", "ns-grupo");
    const kicker = el("div", "ns-kicker");
    kicker.style.color = g.cor;
    const bolinha = el("i"); bolinha.style.background = g.cor;
    kicker.appendChild(bolinha);
    kicker.appendChild(el("span", null, g.rotulo || ("NOVA " + a.grupo)));
    topo.appendChild(kicker);
    topo.appendChild(el("h2", "ns-titulo", g.nome));
    if (g.definicao) topo.appendChild(el("p", "ns-def", g.definicao));
    raiz.appendChild(topo);

    // Par: alimento escaneado  →  alimento sugerido
    const par = el("div", "ns-par" + (temTroca ? " tem-troca" : ""));
    par.appendChild(cardAlimento({
      nome: a.nome,
      tag: tagDoGrupo(a.grupo),
      foto: fotos && fotos.principal,
      detalhe: fotos && fotos.detalhe,
    }));
    if (temTroca) {
      const seta = el("div", "ns-seta");
      const bola = el("span"); bola.innerHTML = SETA_SVG; // SVG fixo, sem dados externos
      seta.appendChild(bola);
      par.appendChild(seta);
      const fotoTroca = fotosDaTroca(a); // mapeada pelo texto exato da troca
      par.appendChild(cardAlimento({
        nome: a.troca,
        tag: { texto: "Troca ideal", tipo: "ideal" },
        foto: fotoTroca && fotoTroca.principal,
        destaque: true,
      }));
    }
    raiz.appendChild(par);

    // Justificativa + mensagem do grupo
    const info = el("section", "ns-info");
    if (a.justificativa) info.appendChild(el("p", null, a.justificativa));
    if (a.justificativa && g.msg) info.appendChild(el("hr"));
    if (g.msg) info.appendChild(el("p", "ns-msg", g.msg));
    raiz.appendChild(info);

    const novo = el("button", "main ns-novo", "Novo alimento");
    novo.onclick = () => voltar();
    raiz.appendChild(novo);

    const secao = document.getElementById("resultado");
    secao.replaceChildren(raiz);
    mostrar("resultado");
  }

  // ---------- 5. ENCAIXE NO PROJETO ----------
  // Substitui a função do index (mesmo nome, mesmo parâmetro): quem chama
  // (código de barras, foto, modo teste, pergunta) continua funcionando igual.
  window.mostrarResultado = function (a) {
    if (a.pergunta) return fazerPergunta(a);
    renderizarResultado(a);
  };
  window.renderizarResultado = renderizarResultado;
})();