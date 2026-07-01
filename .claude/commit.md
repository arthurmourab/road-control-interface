\---

name: commit-message

description: Gera mensagens de commit formatadas em Markdown a partir de um git diff ou descrição de mudanças. Use esta skill sempre que o usuário pedir para escrever, gerar ou sugerir uma mensagem de commit, ou quando colar uma saída de git diff pedindo ajuda para commitar. Também dispara quando o usuário mencionar "commit", "git commit", "mensagem de commit" ou variações.

\---



\# Commit Message



Gera mensagens de commit padronizadas em Markdown, em português, seguindo o padrão Conventional Commits.



\## Formato de saída



A mensagem de commit deve sempre seguir este formato:



```

\## <tipo>(<escopo opcional>): <título curto e imperativo>



\- <mudança 1>

\- <mudança 2>

\- <mudança 3 — opcional>

```



\### Regras



\- \*\*Título\*\*: usar `##` como heading. Seguir o padrão Conventional Commits: `tipo(escopo): descrição`.

\- \*\*Itens\*\*: no mínimo 1, no máximo 3 bullets com `-`. Cada item deve descrever uma mudança concreta e objetiva.

\- \*\*Idioma\*\*: português em tudo — título e itens.

\- \*\*Tom\*\*: imperativo e direto. Ex: "Adiciona", "Corrige", "Remove", "Refatora".

\- \*\*Sem prefixo de bloco de código\*\* no output final — entregar o markdown puro para o usuário copiar.



\### Tipos Conventional Commits válidos



| Tipo | Quando usar |

|------|-------------|

| `feat` | Nova funcionalidade |

| `fix` | Correção de bug |

| `refactor` | Refatoração sem mudança de comportamento |

| `chore` | Tarefas de manutenção, configs, dependências |

| `docs` | Documentação |

| `test` | Adição ou correção de testes |

| `style` | Formatação, espaçamento (sem lógica) |

| `perf` | Melhoria de performance |

| `ci` | Configuração de CI/CD |

| `revert` | Reverter commit anterior |



\## Processo



1\. \*\*Analisar o input\*\*: se for um `git diff`, identificar os arquivos modificados, o que foi adicionado/removido/alterado. Se for descrição textual, usar diretamente.

2\. \*\*Inferir o tipo\*\*: baseado na natureza das mudanças (ex: novo endpoint → `feat`, bug fix → `fix`).

3\. \*\*Inferir o escopo\*\* (opcional): nome do módulo, serviço ou domínio afetado (ex: `pagamentos`, `auth`, `kaptor`). Omitir se ambíguo ou muito genérico.

4\. \*\*Escrever o título\*\*: curto, imperativo, sem ponto final.

5\. \*\*Listar os itens\*\*: máximo 3, do mais importante ao menos importante. Cada item deve ser autoexplicativo.

6\. \*\*Entregar o markdown puro\*\*.



\## Exemplo de output esperado



Para um diff que adiciona validação de CPF em um endpoint de cadastro:



```

\## feat(cadastro): adiciona validação de CPF no endpoint de criação de usuário



\- Implementa validação de formato e dígitos verificadores do CPF

\- Retorna erro 422 com mensagem descritiva quando o CPF é inválido

\- Adiciona testes unitários para os casos de CPF nulo, vazio e malformado

```

