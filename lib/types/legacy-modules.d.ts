declare module 'cheerio' {
  function load(html: string): any;
  export = load;
}

declare module 'umzug' {
  class Umzug {
    constructor(options: any);
    up(): Promise<any[]>;
    down(): Promise<any[]>;
    pending(): Promise<any[]>;
    executed(): Promise<any[]>;
  }
  export = Umzug;
}
