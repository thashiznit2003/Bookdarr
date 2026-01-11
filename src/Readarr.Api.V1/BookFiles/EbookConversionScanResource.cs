using NzbDrone.Core.MediaFiles;

namespace Readarr.Api.V1.BookFiles
{
    public class EbookConversionScanResource
    {
        public bool IsPdf { get; set; }
        public int TotalPages { get; set; }
        public int ImageOnlyPages { get; set; }
        public decimal ImageOnlyPercent { get; set; }
        public bool TextReadable { get; set; }
        public bool IsRough { get; set; }
        public string Warning { get; set; }
    }

    public static class EbookConversionScanResourceMapper
    {
        public static EbookConversionScanResource ToResource(this EbookConversionScanResult result)
        {
            if (result == null)
            {
                return null;
            }

            return new EbookConversionScanResource
            {
                IsPdf = result.IsPdf,
                TotalPages = result.TotalPages,
                ImageOnlyPages = result.ImageOnlyPages,
                ImageOnlyPercent = result.ImageOnlyPercent,
                TextReadable = result.TextReadable,
                IsRough = result.IsRough,
                Warning = result.Warning
            };
        }
    }
}
