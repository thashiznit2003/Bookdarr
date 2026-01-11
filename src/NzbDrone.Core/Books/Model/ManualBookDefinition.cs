using System;
using System.Collections.Generic;

namespace NzbDrone.Core.Books
{
    public class ManualBookDefinition
    {
        public string Title { get; set; }
        public string AuthorName { get; set; }
        public DateTime? ReleaseDate { get; set; }
        public string Overview { get; set; }
        public string Publisher { get; set; }
        public string Language { get; set; }
        public string Format { get; set; }
        public string Isbn13 { get; set; }
        public string Asin { get; set; }
        public string Disambiguation { get; set; }
        public int PageCount { get; set; }
        public bool IsEbook { get; set; }

        public string RootFolderPath { get; set; }
        public MonitorTypes Monitor { get; set; }
        public NewItemMonitorTypes MonitorNewItems { get; set; }
        public int QualityProfileId { get; set; }
        public int MetadataProfileId { get; set; }
        public HashSet<int> Tags { get; set; }
    }
}
