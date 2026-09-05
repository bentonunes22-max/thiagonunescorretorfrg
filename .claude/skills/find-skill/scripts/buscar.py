#!/usr/bin/env python3
"""Busca no catálogo local de skills.

Uso:
    python3 buscar.py <termo> [--limite N] [--pagina N] [--tudo]
                              [--agente claude|codex|opencode|cursor|any]
    python3 buscar.py --top 20
    python3 buscar.py --stats
    python3 buscar.py --categoria design

Adaptado de fockus/claude-skill-find-skill (MIT). A lógica de pontuação
(prioridade por fonte + bônus por estrelas) é a do projeto original.
"""
import argparse
import json
import os
import sys

# Prioridade por fonte — proporcional às estrelas no GitHub.
PRIORIDADE_FONTE = {
    "Anthropic": 60,
    "skills.sh": 30,
    "hesreallyhim": 28,
    "ComposioHQ": 25,
    "vercel-labs": 12,
    "VoltAgent-subagents": 8,
    "VoltAgent": 7,
    "travisvn": 5,
    "BehiSecc": 4,
    "alirezarezvani": 4,
    "heilcheng": 3,
    "daymade": 3,
    "mxyhi": 3,
    "SkillsMP": 3,
}

CONFIANCA = {
    "Anthropic": "Oficial",
    "skills.sh": "Catálogo oficial",
    "hesreallyhim": "Lista top",
    "ComposioHQ": "Lista top",
    "vercel-labs": "Curada",
    "VoltAgent-subagents": "Curada",
    "VoltAgent": "Curada",
    "travisvn": "Curada",
    "BehiSecc": "Curada",
    "alirezarezvani": "Comunidade verificada",
    "heilcheng": "Comunidade verificada",
    "daymade": "Comunidade",
    "mxyhi": "Comunidade",
    "SkillsMP": "Marketplace — conferir o repo",
}


def achar_catalogo():
    """Localiza catalogue.json: o do cache atualizado ou o que vem com a skill.

    FIND_SKILL_CATALOGUE, se definido, vence tudo. Fora isso, entre os
    candidatos existentes ganha o mais recente — assim uma atualização feita
    por scripts/atualizar-catalogo.sh substitui o catálogo empacotado.
    """
    env = os.environ.get("FIND_SKILL_CATALOGUE")
    if env and os.path.isfile(env):
        return os.path.normpath(env)

    aqui = os.path.dirname(os.path.abspath(__file__))
    candidatos = [
        os.path.join(aqui, os.pardir, "catalogue.json"),
        os.path.join(aqui, "catalogue.json"),
        os.path.expanduser("~/.claude/skills/find-skill/catalogue.json"),
        os.path.expanduser("~/.claude/skills/find-skill/cache/catalogue.json"),
    ]
    existentes = [os.path.normpath(c) for c in candidatos if os.path.isfile(c)]
    if not existentes:
        sys.exit(
            "catalogue.json não encontrado. Procurei em:\n  "
            + "\n  ".join(os.path.normpath(c) for c in candidatos)
            + "\nRode scripts/atualizar-catalogo.sh ou aponte FIND_SKILL_CATALOGUE."
        )
    return max(existentes, key=os.path.getmtime)


def estrelas(s):
    try:
        return int(str(s.get("stars") or 0).replace(",", "").replace("+", ""))
    except (TypeError, ValueError):
        return 0


def pontuar(s, termo):
    nome = s["name"].lower()
    desc = (s.get("description") or "").lower()
    tags = [t.lower() for t in s.get("tags") or []]
    if termo == nome:
        base = 100
    elif termo in nome:
        base = 50
    elif termo in desc:
        base = 20
    elif any(termo in t for t in tags):
        base = 10
    else:
        return None
    return base + PRIORIDADE_FONTE.get(s.get("source", ""), 0) + min(estrelas(s) / 1000, 20)


def enriquecer(s, score):
    s = dict(s)
    s["_score"] = round(score, 2)
    s["_stars"] = estrelas(s)
    s["_trust"] = CONFIANCA.get(s.get("source", ""), "Desconhecida — conferir o repo")
    return s


def main():
    p = argparse.ArgumentParser(add_help=True)
    p.add_argument("termo", nargs="*", help="termo de busca")
    p.add_argument("--limite", type=int, default=5)
    p.add_argument("--pagina", type=int, default=1)
    p.add_argument("--tudo", action="store_true")
    p.add_argument("--agente", default="claude")
    p.add_argument("--top", type=int)
    p.add_argument("--stats", action="store_true")
    p.add_argument("--categoria")
    args = p.parse_args()

    caminho = achar_catalogo()
    with open(caminho, encoding="utf-8") as f:
        dados = json.load(f)

    if args.stats:
        print(json.dumps({
            "catalogue": caminho,
            "updated_at": dados.get("updated_at"),
            "total": dados.get("total"),
            "por_fonte": dados.get("sources"),
        }, indent=2, ensure_ascii=False))
        return

    skills = dados["skills"]
    if args.agente and args.agente != "any":
        skills = [s for s in skills
                  if args.agente in (s.get("agents") or ["claude", "codex"])]

    if args.top:
        ordenado = sorted(skills, key=lambda s: -estrelas(s))[:args.top]
        resultados = [enriquecer(s, PRIORIDADE_FONTE.get(s.get("source", ""), 0))
                      for s in ordenado]
        total = len(resultados)
    elif args.categoria:
        resultados = [enriquecer(s, 0) for s in skills
                      if (s.get("category") or "").lower() == args.categoria.lower()]
        total = len(resultados)
    else:
        termo = " ".join(args.termo).lower().strip()
        if not termo:
            p.error("informe um termo de busca, --top, --stats ou --categoria")
        pontuados = []
        for s in skills:
            sc = pontuar(s, termo)
            if sc is not None:
                pontuados.append(enriquecer(s, sc))
        pontuados.sort(key=lambda x: (-x["_score"], -x["_stars"]))
        total = len(pontuados)
        if args.tudo:
            resultados = pontuados
        else:
            ini = (args.pagina - 1) * args.limite
            resultados = pontuados[ini:ini + args.limite]

    paginas = 1 if (args.tudo or args.top or args.categoria) else \
        max(1, (total + args.limite - 1) // args.limite)

    print(json.dumps({
        "catalogue": caminho,
        "updated_at": dados.get("updated_at"),
        "total": total,
        "showing": len(resultados),
        "page": 1 if (args.tudo or args.top or args.categoria) else args.pagina,
        "total_pages": paginas,
        "agent_filter": args.agente,
        "results": resultados,
    }, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
