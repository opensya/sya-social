import { BadRequestException } from "@nestjs/common";
import { Options } from "@tarico/form";
import { SelectQueryBuilder } from "typeorm";

const keyTypeArray = [
  "text",
  "longtext",
  "number",
  "checkbox",
  "email",
  "url",
  "date",
  "time",
  "intervaltime",
  "rating",
  "phone",
  "select",
] as const;
type KeyType = (typeof keyTypeArray)[number];

type OperatorType =
  | "="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "LIKE"
  | "ILIKE"
  | "IN"
  | "NOT IN"
  | "BETWEEN"
  | "NOT BETWEEN"
  | "IS NULL"
  | "IS NOT NULL"
  | "@>"
  | "?"
  | "?|"
  | "?&";

type LogicalOperator = "AND" | "OR";

interface SingleFilter {
  key: string;
  operator: OperatorType;
  value: any;
}

interface FilterGroup {
  logicalOperator: LogicalOperator;
  conditions: (SingleFilter | FilterGroup)[];
}

type FilterExpression = SingleFilter | FilterGroup;

function getKeyType(
  key: string,
  schema: Record<string, KeyType>,
): KeyType | null {
  return schema[key] || null;
}

const allowedOperators: Record<KeyType, OperatorType[]> = {
  text: ["=", "!=", "LIKE", "ILIKE", "IS NULL", "IS NOT NULL", "?", "?|", "?&"],
  longtext: ["=", "!=", "LIKE", "ILIKE", "IS NULL", "IS NOT NULL"],
  number: [
    "=",
    "!=",
    ">",
    "<",
    ">=",
    "<=",
    "BETWEEN",
    "NOT BETWEEN",
    "IN",
    "NOT IN",
    "IS NULL",
    "IS NOT NULL",
  ],
  checkbox: ["=", "!=", "IS NULL", "IS NOT NULL"],
  email: ["=", "!=", "LIKE", "ILIKE", "IS NULL", "IS NOT NULL"],
  url: ["=", "!=", "LIKE", "ILIKE", "IS NULL", "IS NOT NULL"],
  date: [
    "=",
    "!=",
    ">",
    "<",
    ">=",
    "<=",
    "BETWEEN",
    "NOT BETWEEN",
    "IS NULL",
    "IS NOT NULL",
  ],
  time: [
    "=",
    "!=",
    ">",
    "<",
    ">=",
    "<=",
    "BETWEEN",
    "NOT BETWEEN",
    "IS NULL",
    "IS NOT NULL",
  ],
  intervaltime: [
    "=",
    "!=",
    ">",
    "<",
    ">=",
    "<=",
    "BETWEEN",
    "NOT BETWEEN",
    "IS NULL",
    "IS NOT NULL",
  ],
  rating: [
    "=",
    "!=",
    ">",
    "<",
    ">=",
    "<=",
    "BETWEEN",
    "NOT BETWEEN",
    "IN",
    "NOT IN",
    "IS NULL",
    "IS NOT NULL",
  ],
  phone: ["=", "!=", "LIKE", "ILIKE", "IS NULL", "IS NOT NULL"],
  select: ["=", "!=", "IN", "NOT IN", "IS NULL", "IS NOT NULL", "@>"],
};

function isValidFilter(
  filter: FilterExpression,
  schema: Record<string, KeyType>,
): boolean {
  if ("logicalOperator" in filter) {
    return filter.conditions.every((f) => isValidFilter(f, schema));
  } else {
    const keyType = getKeyType(filter.key, schema);
    return keyType
      ? allowedOperators[keyType].includes(filter.operator)
      : false;
  }
}

function generateSQLWhereClause(
  filter: FilterExpression,
  schema: Record<string, KeyType>,
  tableName: string,
  queryBuilder: SelectQueryBuilder<any>,
  paramIndex: { value: number },
): void {
  if ("logicalOperator" in filter) {
    // Traitement des groupes logiques
    for (const subFilter of filter.conditions) {
      generateSQLWhereClause(
        subFilter,
        schema,
        tableName,
        queryBuilder,
        paramIndex,
      );
    }
  } else {
    const keyType = getKeyType(filter.key, schema);
    if (!keyType) throw new Error(`Clé inconnue: ${filter.key}`);

    const jsonPath = `${tableName}.data ->> '${filter.key}'`;

    switch (filter.operator) {
      case "IN":
      case "NOT IN":
        // Gestion de l'opérateur IN / NOT IN
        queryBuilder.andWhere(
          `${jsonPath} ${filter.operator} (:...${filter.key})`,
          {
            [`${filter.key}`]: filter.value,
          },
        );
        break;

      case "BETWEEN":
      case "NOT BETWEEN":
        // Gestion de l'opérateur BETWEEN / NOT BETWEEN
        queryBuilder.andWhere(
          `${jsonPath} ${filter.operator} :${filter.key}1 AND :${filter.key}2`,
          {
            [`${filter.key}1`]: filter.value[0],
            [`${filter.key}2`]: filter.value[1],
          },
        );
        break;

      case "IS NULL":
        // Gestion de l'opérateur IS NULL
        queryBuilder.andWhere(
          `NOT (${tableName}.data ? '${filter.key}') OR ${jsonPath} IS NULL`,
        );
        break;

      case "IS NOT NULL":
        // Gestion de l'opérateur IS NOT NULL
        queryBuilder.andWhere(
          `${tableName}.data ? '${filter.key}' AND ${jsonPath} IS NOT NULL`,
        );
        break;

      case "@>":
        // Gestion de l'opérateur @>
        queryBuilder.andWhere(`${tableName}.data @> :${filter.key}`, {
          [`${filter.key}`]: JSON.stringify(filter.value),
        });
        break;

      case "?":
      case "?|":
      case "?&":
        // Gestion des opérateurs de recherche JSONB
        queryBuilder.andWhere(
          `${tableName}.data ${filter.operator} :${filter.key}`,
          {
            [`${filter.key}`]: filter.value,
          },
        );
        break;

      default:
        // Gestion des autres opérateurs (égalité, LIKE, etc.)
        queryBuilder.andWhere(`${jsonPath} ${filter.operator} :${filter.key}`, {
          [`${filter.key}`]: filter.value,
        });
        break;
    }
  }
}

function buildFilter(
  filter: FilterExpression,
  options: Options,
  tableName: string,
  queryBuilder: SelectQueryBuilder<any>,
) {
  const schema: Record<string, KeyType> = {};

  options.schemaOptions.forEach((sc) => {
    if (keyTypeArray.includes(sc.interface.type as KeyType)) {
      schema[sc.key] = sc.interface.type as KeyType;
    }
  });

  if (!isValidFilter(filter, schema)) {
    throw new BadRequestException("invalid_filter");
  }

  const paramIndex = { value: 1 };
  generateSQLWhereClause(filter, schema, tableName, queryBuilder, paramIndex);
}

// 🔹 Exemple d'utilisation
const complexFilter: FilterExpression = {
  logicalOperator: "AND",
  conditions: [
    { key: "name", operator: "LIKE", value: "%John%" },
    { key: "age", operator: ">", value: 30 },
    {
      logicalOperator: "OR",
      conditions: [
        { key: "created_at", operator: "IS NOT NULL", value: null },
        { key: "category", operator: "@>", value: { type: "premium" } },
      ],
    },
  ],
};

export {
  FilterExpression,
  SingleFilter,
  FilterGroup,
  LogicalOperator,
  getKeyType,
  isValidFilter,
  generateSQLWhereClause,
  buildFilter,
};
