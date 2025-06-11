declare const _default: {
    create: import("jest-mock").Mock<() => {
        get: import("jest-mock").Mock<import("jest-mock").UnknownFunction>;
        post: import("jest-mock").Mock<import("jest-mock").UnknownFunction>;
        put: import("jest-mock").Mock<import("jest-mock").UnknownFunction>;
        delete: import("jest-mock").Mock<import("jest-mock").UnknownFunction>;
        patch: import("jest-mock").Mock<import("jest-mock").UnknownFunction>;
        interceptors: {
            request: {
                use: import("jest-mock").Mock<import("jest-mock").UnknownFunction>;
            };
            response: {
                use: import("jest-mock").Mock<import("jest-mock").UnknownFunction>;
            };
        };
        defaults: {
            headers: {
                common: {};
            };
        };
    }>;
};
export default _default;
//# sourceMappingURL=axios.d.ts.map