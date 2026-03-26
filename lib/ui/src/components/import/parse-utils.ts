export interface ParseResult {
  data: Record<string, any>[];
  columns: string[];
}

function parseCSV(text: string): ParseResult {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return { data: [], columns: [] };

  let delimiter = ",";
  const firstLine = lines[0];
  if (firstLine.split("\t").length > firstLine.split(",").length) {
    delimiter = "\t";
  } else if (firstLine.split(";").length > firstLine.split(",").length) {
    delimiter = ";";
  }

  function splitRow(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = splitRow(lines[0]);
  const data: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitRow(lines[i]);
    const row: Record<string, any> = {};
    for (let j = 0; j < headers.length; j++) {
      const val = values[j] ?? "";
      const num = Number(val);
      row[headers[j]] = val === "" ? null : !isNaN(num) && val.trim() !== "" ? num : val;
    }
    data.push(row);
  }

  return { data, columns: headers };
}

function parseJSON(text: string): ParseResult {
  const parsed = JSON.parse(text);
  let dataArray: any[];

  if (Array.isArray(parsed)) {
    dataArray = parsed;
  } else if (parsed && typeof parsed === "object") {
    const arrayKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
    if (arrayKey) {
      dataArray = parsed[arrayKey];
    } else {
      dataArray = [parsed];
    }
  } else {
    return { data: [], columns: [] };
  }

  if (dataArray.length === 0) return { data: [], columns: [] };

  const columns = new Set<string>();
  for (const item of dataArray.slice(0, 100)) {
    if (item && typeof item === "object") {
      Object.keys(item).forEach((k) => columns.add(k));
    }
  }

  const data = dataArray.map((item) => {
    const row: Record<string, any> = {};
    for (const col of columns) {
      row[col] = item[col] ?? null;
    }
    return row;
  });

  return { data, columns: Array.from(columns) };
}

function parseXML(text: string): ParseResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "text/xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    throw new Error("Invalid XML format");
  }

  const root = doc.documentElement;
  const children = Array.from(root.children);
  if (children.length === 0) return { data: [], columns: [] };

  const columns = new Set<string>();
  const data: Record<string, any>[] = [];

  for (const child of children) {
    const row: Record<string, any> = {};
    for (const field of Array.from(child.children)) {
      const key = field.tagName;
      columns.add(key);
      const val = field.textContent?.trim() ?? null;
      const num = Number(val);
      row[key] = val === null || val === "" ? null : !isNaN(num) && val !== "" ? num : val;
    }
    if (child.children.length === 0 && child.attributes.length > 0) {
      for (const attr of Array.from(child.attributes)) {
        columns.add(attr.name);
        row[attr.name] = attr.value;
      }
    }
    data.push(row);
  }

  return { data, columns: Array.from(columns) };
}

function parseIPYNB(text: string): ParseResult {
  const notebook = JSON.parse(text);
  const cells = notebook.cells || [];
  const data: Record<string, any>[] = [];
  const columns = ["cell_type", "source_preview", "execution_count", "outputs_count"];

  for (const cell of cells) {
    const source = Array.isArray(cell.source) ? cell.source.join("") : cell.source || "";
    data.push({
      cell_type: cell.cell_type,
      source_preview: source.substring(0, 200),
      execution_count: cell.execution_count ?? null,
      outputs_count: cell.outputs?.length ?? 0,
    });
  }

  return { data, columns };
}

export async function parseFileData(file: File): Promise<ParseResult> {
  const text = await file.text();
  const ext = file.name.split(".").pop()?.toLowerCase() || "";

  switch (ext) {
    case "csv":
    case "tsv":
    case "txt":
      return parseCSV(text);
    case "json":
      return parseJSON(text);
    case "xml":
      return parseXML(text);
    case "ipynb":
      return parseIPYNB(text);
    case "yaml":
    case "yml":
      return parseYAML(text);
    case "ics":
      return parseICS(text);
    default:
      try {
        return parseJSON(text);
      } catch {
        return parseCSV(text);
      }
  }
}

function parseYAML(text: string): ParseResult {
  const lines = text.split(/\r?\n/);
  const data: Record<string, any>[] = [];
  let currentObj: Record<string, any> = {};
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    if (trimmed.startsWith("- ")) {
      if (Object.keys(currentObj).length > 0) {
        data.push(currentObj);
      }
      currentObj = {};
      inList = true;
      const rest = trimmed.substring(2);
      if (rest.includes(":")) {
        const [key, ...vals] = rest.split(":");
        currentObj[key.trim()] = vals.join(":").trim();
      }
    } else if (trimmed.includes(":") && inList) {
      const [key, ...vals] = trimmed.split(":");
      currentObj[key.trim()] = vals.join(":").trim();
    }
  }
  if (Object.keys(currentObj).length > 0) {
    data.push(currentObj);
  }

  if (data.length === 0) return { data: [], columns: [] };

  const columns = new Set<string>();
  data.forEach((row) => Object.keys(row).forEach((k) => columns.add(k)));

  return { data, columns: Array.from(columns) };
}

function parseICS(text: string): ParseResult {
  const events: Record<string, any>[] = [];
  const lines = text.split(/\r?\n/);
  let currentEvent: Record<string, any> | null = null;

  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      currentEvent = {};
    } else if (line.startsWith("END:VEVENT") && currentEvent) {
      events.push(currentEvent);
      currentEvent = null;
    } else if (currentEvent && line.includes(":")) {
      const colonIdx = line.indexOf(":");
      let key = line.substring(0, colonIdx).split(";")[0];
      const value = line.substring(colonIdx + 1);
      const keyMap: Record<string, string> = {
        SUMMARY: "title",
        DTSTART: "start",
        DTEND: "end",
        LOCATION: "location",
        DESCRIPTION: "description",
        UID: "uid",
      };
      key = keyMap[key] || key.toLowerCase();
      currentEvent[key] = value;
    }
  }

  const columns = ["title", "start", "end", "location", "description"];
  return { data: events, columns };
}
