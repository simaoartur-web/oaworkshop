# Modelos 3D Demonstrativos — O+A Workspace (Fase 04B)

Estes activos binários `.glb` (glTF 2.0) foram gerados proceduralmente de raiz para fins exclusivos de demonstração técnica do **O+A Workspace** (Fase 04B — *Interactive Architectural 3D Viewer*).

> **Aviso de Demonstração:** Nenhum destes ficheiros representa uma obra real construída, um levantamento topográfico oficial ou um projecto confidencial de cliente da O+A Arquitectos e Planeadores.

## Activos Incluídos

| Ficheiro | Código | Projecto Demo Associado | Unidades Declaradas (`asset.extras`) | Escala de Referência | Licença / Origem |
|---|---|---|---|---|---|
| `oa-ponta-vermelha-pavilion-demo.glb` | `MOD-OA-101-V3` | `OA-26-101` — *Galeria Cívica & Pátio da Ponta Vermelha* | `m` (metros) | `1:100` | **CC0-1.0 / Original O+A Demo Asset** (geometria procedural gerada por código para o O+A Workspace) |
| `oa-costa-terraces-massing-demo.glb` | `MOD-OA-108-V2` | `OA-26-108` — *Corredor Pedonal & Terrários da Costa* | `m` (metros) | `1:250` | **CC0-1.0 / Original O+A Demo Asset** (geometria procedural gerada por código para o O+A Workspace) |

## Estrutura Técnica

- **Formato:** Binary glTF 2.0 (`.glb`) com cabeçalho `0x46546C67` (`glTF`), chunk JSON estruturado e chunk binário `BIN\0` alinhado a 4 bytes.
- **Geometria e Materiais:** Malhas indexadas (`POSITION`, `NORMAL`, `INDICES`) com materiais PBR (`pbrMetallicRoughness`) calibrados para leitura arquitectónica neutra (taipa pigmentada `#A65D4A`, betão cofrado escuro, pedra travertino, madeira de brise-soleil e lâmina de água).
- **Carregamento:** Carregados em tempo de execução através do `GLTFLoader` do Three.js.
