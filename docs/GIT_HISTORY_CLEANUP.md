# Limpeza segura do histórico — não executada

## Auditoria de 13/11/2026

`.env` existe localmente, está ignorado e não está no índice atual. Há sete commits relacionados ao arquivo nas referências locais. Uma versão contém uma chave privada Supabase com prefixo `sb_secret_`; nenhum valor foi exibido. Revogar/substituir essa chave caso ainda não tenha ocorrido a rotação, revisar acessos e atualizar consumidores de backend. Não foi testada sua validade. Chaves públicas anon/publishable não precisam ser revogadas apenas por aparecerem no frontend.

A varredura dos blobs alcançáveis pelas refs locais encontrou esse segredo em `.env`. Não encontrou outros arquivos com os padrões pesquisados de chave privada PEM, JWT service_role, token GitHub ou identificador AWS. `.env.example` foi inspecionado. A análise por padrões não garante ausência de outros segredos ou refs existentes somente no servidor. `.env.*` está ignorado, com exceção do exemplo.

Um bundle de todas as refs locais foi criado e verificado em `%TEMP%\FoodRank-backup-20261113-151242\before-cleanup.bundle`. A pasta tem herança de permissões removida e acesso explícito ao usuário atual. Contém histórico sensível: transferir para armazenamento privado durável antes de qualquer limpeza. Não inclui mudanças não commitadas nem refs exclusivas do GitHub.

## Preparação e cópia de segurança

Coordenar uma janela sem pushes, inventariar branches/tags/PRs e salvar mudanças pendentes em commits revisados sem segredos. Revogar a chave antes de limpar. Não alterar o clone de trabalho. Executar manualmente os blocos PowerShell abaixo, parando em qualquer falha.

```powershell
$ErrorActionPreference = 'Stop'
$foodrankSource = 'C:\Users\TRIPA\OneDrive\Documentos\FoodRank'
$foodrankRemote = git -C $foodrankSource remote get-url origin
if ($LASTEXITCODE -ne 0) { throw 'Remoto indisponível' }
$foodrankSafety = Join-Path $env:LOCALAPPDATA ('FoodRank-cleanup-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $foodrankSafety | Out-Null
$foodrankAcl = Get-Acl -LiteralPath $foodrankSafety
$foodrankAcl.SetAccessRuleProtection($true, $false)
$foodrankUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$foodrankRule = New-Object System.Security.AccessControl.FileSystemAccessRule($foodrankUser, 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow')
$foodrankAcl.AddAccessRule($foodrankRule)
Set-Acl -LiteralPath $foodrankSafety -AclObject $foodrankAcl
git -C $foodrankSource bundle create (Join-Path $foodrankSafety 'local-before.bundle') --all
if ($LASTEXITCODE -ne 0) { throw 'Backup local falhou' }
git -C $foodrankSource bundle verify (Join-Path $foodrankSafety 'local-before.bundle')
if ($LASTEXITCODE -ne 0) { throw 'Backup local inválido' }
$foodrankMirror = Join-Path $foodrankSafety 'remote-backup.git'
git clone --mirror $foodrankRemote $foodrankMirror
if ($LASTEXITCODE -ne 0) { throw 'Backup remoto falhou' }
git -C $foodrankMirror fetch origin '+refs/pull/*:refs/pull/*'
if ($LASTEXITCODE -ne 0) { throw 'Verifique a disponibilidade das refs de PR antes de continuar' }
git -C $foodrankMirror bundle create (Join-Path $foodrankSafety 'remote-before.bundle') --all
if ($LASTEXITCODE -ne 0) { throw 'Bundle remoto falhou' }
git -C $foodrankMirror bundle verify (Join-Path $foodrankSafety 'remote-before.bundle')
if ($LASTEXITCODE -ne 0) { throw 'Bundle remoto inválido' }
git -C $foodrankMirror for-each-ref --format='%(refname) %(objectname)' |
  Set-Content -LiteralPath (Join-Path $foodrankSafety 'refs-before.txt')
$foodrankClean = Join-Path $foodrankSafety 'clean.git'
git clone --mirror --no-local $foodrankMirror $foodrankClean
if ($LASTEXITCODE -ne 0) { throw 'Clone descartável falhou' }
```

Manter os bundles e o mirror original privados e intocados. Para testar restauração em uma pasta nova: `git clone (Join-Path $foodrankSafety 'remote-before.bundle') (Join-Path $foodrankSafety 'restore-check')`.

## Reescrita local — somente após aprovação

Usar git-filter-repo 2.47 ou posterior. O comando abaixo percorre todas as refs do mirror, incluindo branches, tags e refs de PR disponíveis, sem restringir `--refs`. Não remove branches/tags deliberadamente, mas commits vazios podem ser eliminados; revisar os mapas gerados e os nomes das referências antes/depois.

```powershell
py -m pip install 'git-filter-repo>=2.47'
if ($LASTEXITCODE -ne 0) { throw 'Instalação falhou' }
git filter-repo --version
if ($LASTEXITCODE -ne 0) { throw 'Inclua o diretório Scripts do Python no PATH' }
git -C $foodrankClean filter-repo --sensitive-data-removal --invert-paths --path .env --path-glob '*/.env'
if ($LASTEXITCODE -ne 0) { throw 'Reescrita falhou; preserve os backups' }
$foodrankRemaining = git -C $foodrankClean log --all --format='%H' -- .env ':(glob)**/.env'
if ($LASTEXITCODE -ne 0 -or $foodrankRemaining) { throw 'Arquivo ainda alcançável' }
git -C $foodrankClean fsck --full
if ($LASTEXITCODE -ne 0) { throw 'Integridade inválida' }
git -C $foodrankClean for-each-ref --format='%(refname) %(objectname)' |
  Set-Content -LiteralPath (Join-Path $foodrankSafety 'refs-after.txt')
```

Se a análise identificar nomes anteriores, variantes como `.env.production` ou segredos copiados, acrescentar cada caminho com `--path` e repetir em um clone descartável novo. A remoção não acompanha renomes automaticamente. Não imprimir conteúdos sensíveis. Repetir a varredura de segredos, revisar `filter-repo/changed-refs`, `commit-map` e PRs afetados, comparar nomes das refs e testar o código em um clone limpo antes da publicação.

## Publicação — exige autorização separada

Não usar `push --mirror`: pode apagar ou publicar refs indesejadas. O exemplo abaixo atualiza somente uma ref previamente analisada e aprovada, com proteção contra pushes posteriores ao backup. Repetir apenas para cada branch/tag afetada aprovada. Não enviar refs de PR, agentes, Codex ou backups.

```powershell
# Exemplo para main: selecionar a referência aprovada.
$foodrankRef = 'refs/heads/main'
$foodrankOld = git -C $foodrankMirror rev-parse $foodrankRef
if ($LASTEXITCODE -ne 0) { throw 'Ref anterior ausente' }
git -C $foodrankClean show-ref --verify --quiet $foodrankRef
if ($LASTEXITCODE -ne 0) { throw 'Ref limpa ausente; analisar sem apagar a ref remota' }
git -C $foodrankClean push --dry-run "--force-with-lease=${foodrankRef}:${foodrankOld}" $foodrankRemote "${foodrankRef}:${foodrankRef}"
if ($LASTEXITCODE -ne 0) { throw 'Simulação falhou ou o remoto mudou' }
# SOMENTE COM AUTORIZAÇÃO EXPLÍCITA PARA ESSA REF:
git -C $foodrankClean push "--force-with-lease=${foodrankRef}:${foodrankOld}" $foodrankRemote "${foodrankRef}:${foodrankRef}"
if ($LASTEXITCODE -ne 0) { throw 'Push falhou; não relaxar proteções automaticamente' }
```

Não desabilitar proteções nem apagar branches/tags automaticamente. Se houver atualização remota, refazer backup e análise. Limpeza parcial deixa o segredo alcançável: revisar todas as refs afetadas antes de declarar conclusão.

## Impactos e referências remanescentes

Hashes posteriores ao arquivo mudam; assinaturas de commits/tags podem deixar de ser válidas. PRs podem perder comparações, comentários ou referências. Colaboradores devem salvar trabalho pendente, reclonar e reaplicar somente alterações revisadas; mesclar histórico antigo pode reintroduzir segredos. Forks e outros clones exigem coordenação.

Refs internas de PR e caches do GitHub podem manter commits antigos. Solicitar ao GitHub Support a remoção aplicável usando os identificadores da ferramenta, sem enviar segredos. Checkpoints locais também conservam histórico no clone original: após aprovação, usar clone limpo e manter o original somente como backup privado. Nenhuma ref ou cópia foi apagada. Validar um clone novo do GitHub e confirmar rotação antes de encerrar o incidente.

Referências: [GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository), [manual git-filter-repo](https://github.com/newren/git-filter-repo/blob/main/Documentation/git-filter-repo.txt).
