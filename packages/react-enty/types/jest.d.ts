export {};

declare global {
    namespace jest {
        interface Matchers {
            toBeEmpty(): void;
            toBeFetching(): void;
            toBeRefetching(response: any): void;
            toBeSuccess(response: any): void;
            toBeError(error: any): void;
        }
    }
}
