import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const proposicoes = pgTable("proposicoes", {
  id: integer("id").primaryKey(),
  siglaTipo: text("sigla_tipo").notNull(),
  numero: integer("numero").notNull(),
  ano: integer("ano").notNull(),
  ementa: text("ementa").notNull(),
  urlInteiroTeor: text("url_inteiro_teor"),
});

export const artigos = pgTable("artigos", {
  id: serial("id").primaryKey(),
  idProposicao: integer("id_proposicao").notNull(),
  titulo: text("titulo").notNull(),
  subtitulo: text("subtitulo").notNull(),
  lide: text("lide").notNull(),
  corpo: text("corpo").notNull(),
  relevante: boolean("relevante").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Artigo = typeof artigos.$inferSelect;
export type Proposicao = typeof proposicoes.$inferSelect;
