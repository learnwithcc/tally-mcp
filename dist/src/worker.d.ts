interface Env {
    TALLY_API_KEY: string;
    AUTH_TOKEN?: string;
    PORT?: string;
    DEBUG?: string;
    [key: string]: string | undefined;
}
declare function fetch(request: Request, env: Env): Promise<Response>;
declare const _default: {
    fetch: typeof fetch;
};
export default _default;
//# sourceMappingURL=worker.d.ts.map