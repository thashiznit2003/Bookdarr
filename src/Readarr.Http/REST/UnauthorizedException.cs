using System.Net;
using Readarr.Http.Exceptions;

namespace Readarr.Http.REST
{
    public class UnauthorizedException : ApiException
    {
        public UnauthorizedException(object content = null)
            : base(HttpStatusCode.Unauthorized, content)
        {
        }
    }
}
