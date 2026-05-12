namespace ErrandsManagement.API.Common.Responses
{
    public sealed class ApiResponse<T>
    {
        public bool Success { get; init; }
        public int StatusCode { get; init; }
        public T? Data { get; init; }
        public object? Errors { get; init; }
        public string? TraceId { get; init; }

        private ApiResponse() { }

        public static ApiResponse<T> SuccessResponse(
            T? data,
            int statusCode,
            string traceId)
        {
            return new ApiResponse<T>
            {
                Success = true,
                StatusCode = statusCode,
                Data = data,
                TraceId = traceId
            };
        }

        public static ApiResponse<T> FailureResponse(
            object errors,
            int statusCode,
            string traceId)
        {
            return new ApiResponse<T>
            {
                Success = false,
                StatusCode = statusCode,
                Errors = errors,
                TraceId = traceId
            };
        }
    }
}
