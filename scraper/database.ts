import SQLite from "better-sqlite3";
import { writeFile } from "node:fs/promises";

interface CategoryEnum<T = string> {
  id: number;
  name: T;
}

export type SourceName =
  | "javascriptweekly"
  | "reactstatus"
  | "golangweekly"
  | "nodeweekly"
  | "frontendfocus"
  | "rubyweekly"
  | "postgresweekly"
  | "thisweekinreact"
  | "pycoders"
  | "swiftnews";
type Source = CategoryEnum<SourceName>;

export type StatusName = "success" | "error";
type Status = CategoryEnum<StatusName>;

export interface Content {
  id?: string;
  url: string;
  date: string;
  status_id?: string;
  content?: unknown[] | null;
}

export class Storage extends SQLite {
  status: Map<StatusName, number>;
  source: Map<SourceName, number>;
  constructor() {
    super("database.db");
    this.pragma("foreign_keys = ON");
    this.pragma("journal_mode = WAL");
    this.pragma("synchronous = NORMAL");
    this.exec(`
      CREATE TABLE IF NOT EXISTS status (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );
      INSERT OR IGNORE INTO status (name)
      VALUES ('success'), ('error');

      CREATE TABLE IF NOT EXISTS source (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );
      INSERT OR IGNORE INTO source (name)
      VALUES
      ('javascriptweekly'),
      ('reactstatus'),
      ('golangweekly'),
      ('nodeweekly'),
      ('frontendfocus'),
      ('rubyweekly'),
      ('postgresweekly'),
      ('thisweekinreact'),
      ('pycoders'),
      ('swiftnews');

      CREATE TABLE IF NOT EXISTS newsletter (
        id INTEGER PRIMARY KEY,
        "status_id" INTEGER NOT NULL,
        "source_id" INTEGER NOT NULL,
        url TEXT NOT NULL UNIQUE,
        date TEXT NOT NULL,
        content TEXT,
        FOREIGN KEY (status_id) REFERENCES status (id),
        FOREIGN KEY (source_id) REFERENCES source (id)
      );
      `);

    const statusList = this.prepare("SELECT * from status").all() as Status[];
    this.status = new Map<StatusName, number>();
    for (const it of statusList) this.status.set(it.name, it.id);

    const sourceList = this.prepare("SELECT * from source").all() as Source[];
    this.source = new Map<SourceName, number>();
    for (const it of sourceList) this.source.set(it.name, it.id);
  }

  isSaved(url?: string) {
    const result = this.prepare("SELECT id FROM newsletter WHERE url = ?").get(
      url,
    );

    return result;
  }

  saveContent(source: SourceName, { date, url, content }: Content) {
    const stmt = this.prepare(`INSERT INTO newsletter (status_id, source_id, url, date, content)
      VALUES (@status_id, @source_id, @url, @date, @content)`);

    const hasContent = Array.isArray(content) && content.length > 0;
    const status_id = hasContent
      ? this.status.get("success")
      : this.status.get("error");

    stmt.run({
      url,
      date,
      status_id,
      source_id: this.source.get(source),
      content: JSON.stringify(content),
    });
  }

  updateUrl(url: string, content: unknown[] | null) {
    const stmt = this.prepare(`
      UPDATE newsletter 
      SET 
        content = @content,
        status_id = @status_id
      WHERE url = @url`);

    const hasContent = Array.isArray(content) && content.length > 0;
    const status_id = hasContent
      ? this.status.get("success")
      : this.status.get("error");

    stmt.run({ url, content: JSON.stringify(content), status_id });
  }

  summary() {
    const stmt = this.prepare(
      `SELECT
        source.name AS source,
        SUM(CASE WHEN status.name = 'success' THEN 1 ELSE 0 END) AS success,
        SUM(CASE WHEN status.name = 'error' THEN 1 ELSE 0 END) AS error,
        COUNT (status.name) AS Total
      FROM newsletter n
      LEFT JOIN source ON source.id = n.source_id
      LEFT JOIN status ON status.id = n.status_id
      GROUP BY source
      `,
    );

    console.table(stmt.all());
  }

  async export() {
    const data = this.prepare(
      `SELECT
        n.id,
        n.url AS url,
        n.date AS date,
        n.content AS data,
        source.name AS source
      FROM newsletter n
      LEFT JOIN status ON status.id = n.status_id
      LEFT JOIN source ON source.id = n.source_id
      WHERE status.name = 'success'
      ORDER BY n.date DESC
        `,
    ).all() as {
      id: number;
      url: string;
      source: SourceName;
      date: string;
      data: string;
    }[];

    let uniqueCounter = 0;
    let repeatedCounter = 0;
    const finalData = [];
    const urls = new Set<string>();

    for (const row of data) {
      const issues = JSON.parse(row.data);

      for (const issue of issues) {
        if (!issue.link || !issue.description || issue.isSponsored) continue;
        if (urls.has(issue.link)) {
          repeatedCounter++;
          continue;
        }

        urls.add(issue.link);

        finalData.push({
          id: uniqueCounter++,
          url: issue.link,
          description: issue.description,
          source: row.source,
          date: row.date,
        });
      }
    }

    try {
      await writeFile("../app/public/data.json", JSON.stringify(finalData));

      console.log(`exported ${finalData.length} items`);
      console.log(`skipped ${repeatedCounter} items`);
    } catch (err) {
      console.log(err);
    }
  }
}
