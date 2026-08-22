<!--
SPDX-FileCopyrightText: 2025 The HedgeDoc developers (see AUTHORS file)

SPDX-License-Identifier: AGPL-3.0-only
-->

# nodeBook Extension

The nodeBook extension for HedgeDoc renders **Controlled Natural Language (CNL)** knowledge graphs inline within markdown documents. Users write structured text inside ` ```nodeBook ` code fences and see an interactive graph visualization powered by Cytoscape.js.

## Quick Start

Write a nodeBook block in any HedgeDoc note:

````
```nodeBook
# Socrates [individual]
<member_of> Greek;

# Greek [class]
<is_a> Human;

# Human [class]
<is_a> Mortal;

# Mortal [class]
```
````

This renders a directed graph with four nodes and three labeled edges, laid out automatically with the dagre algorithm.

## CNL Syntax

### Nodes

```
# NodeName                        → individual (default)
# NodeName [Type]                 → typed node (class, Event, Transition, etc.)
# **adjective** NodeName [Type]   → node with adjective
# *quantifier* NodeName [Type]    → node with quantifier
```

### Relations

```
<relation_name> Target;           → directed edge to Target
<relation_name> N Target;         → weighted edge (N = number)
<debit> Cash;                     → alias: mapped to <has post_state>
<credit> Revenue;                 → alias: mapped to <has prior_state>
```

### Attributes

```
attribute: value;                 → basic attribute
has attribute: value;             → "has" prefix is optional
attribute: value *unit*;          → with unit
attribute {abbr}: value;          → with abbreviation
attribute: value ++adverb++;      → with adverb
attribute: value [modality];      → with modality qualifier
```

### Morphs (Polymorphic States)

```
# Water [class]
state: liquid;

## frozen
temperature: 0 *Celsius*;

## boiling
temperature: 100 *Celsius*;
<produces> Steam;
```

Morphs define alternate states for a node. Each morph has its own attributes and relations. The UI provides radio buttons to switch between morphs.

### Mindmap Blocks

```
# Topic <has part>
- Subtopic A
  - Detail A1
  - Detail A2
- Subtopic B
```

A heading with `<relation>` followed by indented list items creates a hierarchical mindmap structure.

### Transitions

Nodes typed `[Transition]` get a "Simulate" button. Define inputs/outputs with `<has prior_state>` and `<has post_state>` relations.

### Queries

```
<relation> what;                  → What is this node related to via <relation>?
who <relation> Target;            → Who has <relation> to Target? (graph-level)
attribute: what;                  → What is the value of this attribute?
what: value;                      → What node has this attribute value? (graph-level)
<how> Target;                     → How does this node relate to Target?
?- relation(X, Y, is_a).         → Raw Prolog query
```

### Graph-Level Directives

```
currency: USD;                    → Set graph currency
expression: a + b * c;           → Add math expression
```

````
```graph-description
Description of the entire graph.
```
````

### Schema Blocks

Custom type schemas can be defined in ` ```nodeBook-schema ` fences:

````
```nodeBook-schema
nodeType: Planet, A celestial body, parent:Celestial
relationType: orbits, domain:Planet, range:Star, transitive:false
attributeType: radius, float, unit:km
```
````

## Architecture

The extension follows HedgeDoc's extension architecture:

```
CNL Text (code fence)
  ↓  getOperationsFromCnl()
CnlOperation[]
  ↓  operationsToGraph()        ← 3-pass: nodes → morphs → relations/attributes
CnlGraphData
  ↓  validateOperations()       ← advisory warnings
  ↓  TransitiveClosureEngine    ← infer transitive edges + membership inheritance
  ↓  PrologInferenceEngine      ← (async) Prolog-based inference + user queries
Rendered Graph (Cytoscape.js)
```

### Key Modules

| Module                      | Purpose                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| `cnl-parser.ts`             | Parses CNL text into an array of operations (addNode, addRelation, addAttribute, addMorph, etc.) |
| `operations-to-graph.ts`    | Converts operations into a `CnlGraphData` structure via 3-pass processing                        |
| `validate-operations.ts`    | Validates operations against schemas; produces advisory warnings                                 |
| `morph-registry.ts`         | O(1) lookup registry for morph→relation/attribute mappings                                       |
| `schema-parser.ts`          | Parses `nodeBook-schema` code blocks into structured type definitions                            |
| `schema-store.ts`           | Merges user schemas with built-in defaults at runtime                                            |
| `inference-engine.ts`       | Derives implicit edges via transitive closure (BFS) and membership inheritance                   |
| `prolog-bridge.ts`          | Tau Prolog integration for full inference and user queries (lazy-loaded)                         |
| `nodebook-evaluator.ts`     | Math expression evaluator using math.js (lazy-loaded)                                            |
| `equation-to-pn.ts`         | Converts math expressions to Petri net graph operations                                          |
| `compute-nodebook-score.ts` | Scores a knowledge graph across 9 categories (max 100 points)                                    |
| `nodebook-graph.tsx`        | React component: renders Cytoscape.js graph with morph switching, transitions, and export        |

### Design Decisions

- **Deterministic IDs**: FNV-1a hash for node/edge IDs (no timestamps or randomness)
- **Client-side only**: All parsing, inference, and rendering happens in the browser; no backend needed
- **Lazy loading**: Heavy dependencies (Tau Prolog, math.js) loaded via dynamic `import()` with webpack code splitting
- **Singularization**: Node names are singularized so "humans", "Human", and "Humans" all resolve to the same node ID

## Testing

247 unit tests across 7 test files. All are pure-function tests requiring no mocking.

```bash
yarn workspace @hedgedoc/frontend jest --testPathPattern='nodebook.*spec'
```

See [TESTING.md](TESTING.md) for the full testing guide, manual test checklists, sample CNL blocks, and the detailed requirements specification derived from the test suite.

## Dependencies

Added to `frontend/package.json`:

- `cytoscape` — graph rendering
- `cytoscape-dagre` — hierarchical layout algorithm
- `cytoscape-svg` — SVG export
