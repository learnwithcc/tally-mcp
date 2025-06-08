interface Env {
    PORT?: string;
    DEBUG?: string;
    TALLY_API_KEY?: string;
    [key: string]: string | undefined;
}
declare function fetch(request: Request, env: Env, _ctx: any): Promise<Response>;
declare const _default: {
    fetch: typeof fetch;
};
export default _default;
//# sourceMappingURL=worker.d.ts.map