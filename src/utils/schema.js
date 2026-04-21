import { Type as T } from '@sinclair/typebox';
const TypeExtensions = {
    NullableString: (options = {}) => T.Transform(T.Union([T.String(options), T.Null(), T.Literal('')]))
        .Decode((v) => (v?.trim() ? v : null))
        .Encode((v) => v),
};
const Type = {
    ...T,
    ...TypeExtensions,
};
export { Type };
